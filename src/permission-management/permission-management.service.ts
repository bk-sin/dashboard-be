import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PermissionManagementService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    // Inicializar permisos por defecto al iniciar la aplicación
    await this.initializeDefaultPermissions();
  }

  async findAll() {
    return this.prisma.permission.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
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

  async getPermissionCategories() {
    const permissions = await this.prisma.permission.groupBy({
      by: ['category'],
      _count: {
        id: true,
      },
      orderBy: {
        category: 'asc',
      },
    });

    return permissions.map((p) => ({
      category: p.category,
      count: p._count.id,
    }));
  }

  async getAllAvailablePermissions() {
    const permissions = await this.prisma.permission.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    // Group by category
    const grouped = permissions.reduce(
      (acc, permission) => {
        if (!acc[permission.category]) {
          acc[permission.category] = [];
        }
        acc[permission.category].push(permission);
        return acc;
      },
      {} as Record<string, typeof permissions>,
    );

    return grouped;
  }

  private async initializeDefaultPermissions() {
    const defaultPermissions = [
      // Dashboard access
      {
        name: 'dashboard.access',
        description: 'Access to dashboard',
        category: 'dashboard',
      },

      // Users permissions
      {
        name: 'users.read',
        description: 'View users',
        category: 'users',
      },
      {
        name: 'users.create',
        description: 'Create users',
        category: 'users',
      },
      {
        name: 'users.update',
        description: 'Update users',
        category: 'users',
      },
      {
        name: 'users.delete',
        description: 'Delete users',
        category: 'users',
      },

      // Roles permissions
      {
        name: 'roles.read',
        description: 'View roles',
        category: 'roles',
      },
      {
        name: 'roles.create',
        description: 'Create roles',
        category: 'roles',
      },
      {
        name: 'roles.update',
        description: 'Update roles',
        category: 'roles',
      },
      {
        name: 'roles.delete',
        description: 'Delete roles',
        category: 'roles',
      },

      // Endpoints permissions
      {
        name: 'endpoints.read',
        description: 'View endpoints',
        category: 'endpoints',
      },
      {
        name: 'endpoints.update',
        description: 'Update endpoint permissions and status',
        category: 'endpoints',
      },
      {
        name: 'endpoints.manage',
        description: 'Full endpoint management including resync',
        category: 'endpoints',
      },

      // Products permissions
      {
        name: 'products.read',
        description: 'View products',
        category: 'products',
      },
      {
        name: 'products.create',
        description: 'Create products',
        category: 'products',
      },
      {
        name: 'products.update',
        description: 'Update products',
        category: 'products',
      },
      {
        name: 'products.delete',
        description: 'Delete products',
        category: 'products',
      },

      // Orders permissions
      {
        name: 'orders.read',
        description: 'View orders',
        category: 'orders',
      },
      {
        name: 'orders.create',
        description: 'Create orders',
        category: 'orders',
      },
      {
        name: 'orders.update',
        description: 'Update orders',
        category: 'orders',
      },
      {
        name: 'orders.delete',
        description: 'Delete orders',
        category: 'orders',
      },

      // Categories permissions
      {
        name: 'categories.read',
        description: 'View categories',
        category: 'categories',
      },
      {
        name: 'categories.create',
        description: 'Create categories',
        category: 'categories',
      },
      {
        name: 'categories.update',
        description: 'Update categories',
        category: 'categories',
      },
      {
        name: 'categories.delete',
        description: 'Delete categories',
        category: 'categories',
      },

      // Settings permissions
      {
        name: 'settings.manage',
        description: 'Manage system settings',
        category: 'settings',
      },

      // Profile permissions
      {
        name: 'profile.read',
        description: 'View own profile',
        category: 'profile',
      },
      {
        name: 'profile.update',
        description: 'Update own profile',
        category: 'profile',
      },
    ];

    for (const permission of defaultPermissions) {
      await this.prisma.permission.upsert({
        where: { name: permission.name },
        create: permission,
        update: {
          description: permission.description,
          category: permission.category,
        },
      });
    }

    console.log(`Initialized ${defaultPermissions.length} permissions`);
  }
}
