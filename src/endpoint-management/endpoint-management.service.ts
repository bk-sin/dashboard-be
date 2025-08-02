import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EndpointManagementService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    // Sincronizar endpoints predefinidos al iniciar la aplicación
    await this.syncPredefinedEndpoints();
  }

  private async syncPredefinedEndpoints() {
    const predefinedEndpoints = [
      // Auth endpoints
      {
        path: '/auth/login',
        method: 'POST',
        controller: 'AuthController',
        action: 'login',
        permissions: [],
        description: 'User login',
        isActive: true,
      },
      {
        path: '/auth/register',
        method: 'POST',
        controller: 'AuthController',
        action: 'register',
        permissions: [],
        description: 'User registration',
        isActive: true,
      },

      // Users endpoints
      {
        path: '/users',
        method: 'GET',
        controller: 'UsersController',
        action: 'findAll',
        permissions: ['users.read'],
        description: 'Get all users',
        isActive: true,
      },
      {
        path: '/users/:id',
        method: 'GET',
        controller: 'UsersController',
        action: 'findOne',
        permissions: ['users.read'],
        description: 'Get user by ID',
        isActive: true,
      },
      {
        path: '/users/:id',
        method: 'PATCH',
        controller: 'UsersController',
        action: 'update',
        permissions: ['users.update'],
        description: 'Update user',
        isActive: true,
      },
      {
        path: '/users/:id',
        method: 'DELETE',
        controller: 'UsersController',
        action: 'remove',
        permissions: ['users.delete'],
        description: 'Delete user',
        isActive: true,
      },

      // Roles endpoints
      {
        path: '/roles',
        method: 'GET',
        controller: 'RolesController',
        action: 'findAll',
        permissions: ['roles.read'],
        description: 'Get all roles',
        isActive: true,
      },
      {
        path: '/roles',
        method: 'POST',
        controller: 'RolesController',
        action: 'create',
        permissions: ['roles.create'],
        description: 'Create new role',
        isActive: true,
      },
      {
        path: '/roles/:id',
        method: 'GET',
        controller: 'RolesController',
        action: 'findOne',
        permissions: ['roles.read'],
        description: 'Get role by ID',
        isActive: true,
      },
      {
        path: '/roles/:id',
        method: 'PATCH',
        controller: 'RolesController',
        action: 'update',
        permissions: ['roles.update'],
        description: 'Update role',
        isActive: true,
      },
      {
        path: '/roles/:id',
        method: 'DELETE',
        controller: 'RolesController',
        action: 'remove',
        permissions: ['roles.delete'],
        description: 'Delete role',
        isActive: true,
      },
      {
        path: '/roles/slug/:slug',
        method: 'GET',
        controller: 'RolesController',
        action: 'findBySlug',
        permissions: ['roles.read'],
        description: 'Get role by slug',
        isActive: true,
      },
      {
        path: '/roles/:id/toggle-status',
        method: 'PATCH',
        controller: 'RolesController',
        action: 'toggleStatus',
        permissions: ['roles.update'],
        description: 'Toggle role status',
        isActive: true,
      },
    ];

    for (const endpoint of predefinedEndpoints) {
      await this.prisma.endpoint.upsert({
        where: {
          path_method: {
            path: endpoint.path,
            method: endpoint.method,
          },
        },
        create: endpoint,
        update: {
          controller: endpoint.controller,
          action: endpoint.action,
          description: endpoint.description,
          // No actualizar permissions y isActive si ya existen
        },
      });
    }

    console.log(`Synchronized ${predefinedEndpoints.length} endpoints`);
  }

  async findAll() {
    return this.prisma.endpoint.findMany({
      orderBy: [
        { controller: 'asc' },
        { path: 'asc' },
        { method: 'asc' },
      ],
    });
  }

  async findByController(controller: string) {
    return this.prisma.endpoint.findMany({
      where: { controller },
      orderBy: [
        { path: 'asc' },
        { method: 'asc' },
      ],
    });
  }

  async findOne(id: number) {
    return this.prisma.endpoint.findUnique({
      where: { id },
    });
  }

  async updateEndpointPermissions(id: number, permissions: string[]) {
    return this.prisma.endpoint.update({
      where: { id },
      data: { permissions },
    });
  }

  async toggleEndpointStatus(id: number) {
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

  async getEndpointByPathAndMethod(path: string, method: string) {
    return this.prisma.endpoint.findUnique({
      where: {
        path_method: {
          path,
          method: method.toUpperCase(),
        },
      },
    });
  }

  async resyncEndpoints() {
    await this.syncPredefinedEndpoints();
    return { message: 'Endpoints synchronized successfully' };
  }

  async getActiveEndpoints() {
    return this.prisma.endpoint.findMany({
      where: { isActive: true },
    });
  }

  async getEndpointStats() {
    const total = await this.prisma.endpoint.count();
    const active = await this.prisma.endpoint.count({
      where: { isActive: true },
    });
    const inactive = total - active;

    const byController = await this.prisma.endpoint.groupBy({
      by: ['controller'],
      _count: {
        id: true,
      },
    });

    return {
      total,
      active,
      inactive,
      byController,
    };
  }
}
