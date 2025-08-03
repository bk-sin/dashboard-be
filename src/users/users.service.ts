import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Prisma } from 'generated/prisma';
import * as bcrypt from 'bcrypt';
import { isSuperAdmin } from '../auth/utils/permissions.utils';

const userInclude = {
  role: {
    include: {
      rolePermissions: {
        include: {
          permission: true,
        },
        where: {
          isActive: true,
        },
      },
    },
  },
};

export type UserResponse = Prisma.UserGetPayload<{
  include: typeof userInclude;
  omit: { password: true };
}>;

export type UserResponseWithPassword = Prisma.UserGetPayload<{
  include: typeof userInclude;
}>;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponse> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
      include: userInclude,
      omit: {
        password: true,
      },
    });
    return user;
  }

  async findAll(): Promise<UserResponse[]> {
    return this.prisma.user.findMany({
      include: userInclude,
      omit: { password: true },
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number): Promise<UserResponse | null> {
    const user = this.prisma.user.findUnique({
      where: { id },
      include: userInclude,
      omit: { password: true },
    });
    return user;
  }

  async findOneByEmail(
    email: string,
  ): Promise<UserResponseWithPassword | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: userInclude,
    });
    return user;
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponse> {
    return await this.prisma.user.update({
      where: { id },
      data: {
        firstName: updateUserDto?.firstName,
        lastName: updateUserDto?.lastName,
        phone: updateUserDto?.phone,
      },
      include: userInclude,
      omit: { password: true },
    });
  }

  async remove(id: number): Promise<boolean> {
    const userToDelete = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
      },
    });

    if (!userToDelete) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (isSuperAdmin(userToDelete)) {
      throw new ForbiddenException(
        'Cannot delete superadmin user for security reasons',
      );
    }

    await this.prisma.user.delete({
      where: { id },
    });
    return true;
  }
}
