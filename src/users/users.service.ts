import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
      omit: {
        password: true,
      },
    });
    return user;
  }

  findAll() {
    return this.prisma.user.findMany({
      include: {
        role: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      omit: {
        password: true,
      },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            slug: true,
            permissions: true,
          },
        },
      },
      omit: {
        password: true,
      },
    });
    return user;
  }

  async findOneByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            slug: true,
            permissions: true,
          },
        },
      },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      omit: {
        password: true,
      },
    });
    return updatedUser;
  }

  async remove(id: number) {
    const user = await this.prisma.user.delete({
      where: { id },
      omit: {
        password: true,
      },
    });
    return user;
  }
}
