import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEndpointDto } from './dto/create-endpoint.dto';
import { UpdateEndpointDto } from './dto/update-endpoint.dto';

@Injectable()
export class EndpointsService {
  constructor(private prisma: PrismaService) {}

  async create(createEndpointDto: CreateEndpointDto) {
    return this.prisma.endpoint.create({
      data: createEndpointDto,
    });
  }

  async findAll() {
    return this.prisma.endpoint.findMany({
      orderBy: [{ controller: 'asc' }, { path: 'asc' }, { method: 'asc' }],
    });
  }

  async findByController(controller: string) {
    return this.prisma.endpoint.findMany({
      where: { controller },
      orderBy: [{ path: 'asc' }, { method: 'asc' }],
    });
  }

  async findActive() {
    return this.prisma.endpoint.findMany({
      where: { isActive: true },
      orderBy: [{ controller: 'asc' }, { path: 'asc' }, { method: 'asc' }],
    });
  }

  async findOne(id: number) {
    return this.prisma.endpoint.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateEndpointDto: UpdateEndpointDto) {
    return this.prisma.endpoint.update({
      where: { id },
      data: updateEndpointDto,
    });
  }

  async toggleStatus(id: number) {
    const endpoint = await this.prisma.endpoint.findUnique({
      where: { id },
    });

    if (!endpoint) {
      throw new Error('Endpoint not found');
    }

    return this.prisma.endpoint.update({
      where: { id },
      data: { isActive: !endpoint.isActive },
    });
  }

  async updatePermissions(id: number, permissions: string[]) {
    return this.prisma.endpoint.update({
      where: { id },
      data: { permissions },
    });
  }

  async remove(id: number) {
    return this.prisma.endpoint.delete({
      where: { id },
    });
  }

  async getControllers() {
    const endpoints = await this.prisma.endpoint.findMany({
      select: { controller: true },
      distinct: ['controller'],
      orderBy: { controller: 'asc' },
    });

    return endpoints.map((e) => e.controller);
  }

  async isEndpointActive(path: string, method: string): Promise<boolean> {
    const endpoint = await this.prisma.endpoint.findUnique({
      where: {
        path_method: {
          path,
          method,
        },
      },
    });

    return endpoint?.isActive ?? true; // Default to active if not found
  }

  async getEndpointPermissions(
    path: string,
    method: string,
  ): Promise<string[]> {
    const endpoint = await this.prisma.endpoint.findUnique({
      where: {
        path_method: {
          path,
          method,
        },
      },
    });

    return (endpoint?.permissions as string[]) ?? [];
  }
}
