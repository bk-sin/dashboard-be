import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  async create(createPermissionDto: CreatePermissionDto) {
    return this.prisma.permission.create({
      data: createPermissionDto,
    });
  }

  async findAll() {
    return this.prisma.permission.findMany({
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
    });
  }

  async findByCategory(category: string) {
    return this.prisma.permission.findMany({
      where: { category },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.permission.findUnique({
      where: { id },
    });
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto) {
    return this.prisma.permission.update({
      where: { id },
      data: updatePermissionDto,
    });
  }

  async toggleStatus(id: number) {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
    });

    if (!permission) {
      throw new Error('Permission not found');
    }

    return this.prisma.permission.update({
      where: { id },
      data: { isActive: !permission.isActive },
    });
  }

  async remove(id: number) {
    return this.prisma.permission.delete({
      where: { id },
    });
  }

  async getCategories() {
    const permissions = await this.prisma.permission.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });

    return permissions.map(p => p.category);
  }
}
