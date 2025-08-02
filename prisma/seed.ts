import { PrismaClient } from '../generated/prisma';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed process...');

  // 1. Crear roles básicos
  console.log('Creating roles...');

  const customerRole = await prisma.role.upsert({
    where: { slug: 'customer' },
    update: {},
    create: {
      name: 'Customer',
      slug: 'customer',
      permissions: {
        'dashboard.access': false,
        'profile.read': true,
        'profile.update': true,
      },
    },
  });

  const employeeRole = await prisma.role.upsert({
    where: { slug: 'employee' },
    update: {},
    create: {
      name: 'Employee',
      slug: 'employee',
      permissions: {
        'dashboard.access': true,
        'users.read': true,
        'profile.read': true,
        'profile.update': true,
      },
    },
  });

  const managerRole = await prisma.role.upsert({
    where: { slug: 'manager' },
    update: {},
    create: {
      name: 'Manager',
      slug: 'manager',
      permissions: {
        'dashboard.access': true,
        'users.read': true,
        'users.create': true,
        'users.update': true,
        'roles.read': true,
        'endpoints.read': true,
        'profile.read': true,
        'profile.update': true,
      },
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { slug: 'admin' },
    update: {},
    create: {
      name: 'Admin',
      slug: 'admin',
      permissions: {
        'dashboard.access': true,
        'users.read': true,
        'users.create': true,
        'users.update': true,
        'users.delete': true,
        'roles.read': true,
        'roles.create': true,
        'roles.update': true,
        'roles.delete': true,
        'endpoints.read': true,
        'endpoints.update': true,
        'permissions.manage': true,
        'profile.read': true,
        'profile.update': true,
      },
    },
  });

  const superadminRole = await prisma.role.upsert({
    where: { slug: 'superadmin' },
    update: {},
    create: {
      name: 'Super Admin',
      slug: 'superadmin',
      permissions: {
        'dashboard.access': true,
        'users.read': true,
        'users.create': true,
        'users.update': true,
        'users.delete': true,
        'roles.read': true,
        'roles.create': true,
        'roles.update': true,
        'roles.delete': true,
        'endpoints.read': true,
        'endpoints.update': true,
        'permissions.manage': true,
        'profile.read': true,
        'profile.update': true,
        'system.admin': true,
      },
    },
  });

  console.log('Roles created:', {
    customerRole: customerRole.name,
    employeeRole: employeeRole.name,
    managerRole: managerRole.name,
    adminRole: adminRole.name,
    superadminRole: superadminRole.name,
  });

  // 2. Crear permisos en la tabla Permission
  console.log('Creating permissions...');

  const permissions = [
    {
      name: 'dashboard.access',
      description: 'Acceso al dashboard administrativo',
      category: 'dashboard',
    },
    {
      name: 'users.read',
      description: 'Leer usuarios',
      category: 'users',
    },
    {
      name: 'users.create',
      description: 'Crear usuarios',
      category: 'users',
    },
    {
      name: 'users.update',
      description: 'Actualizar usuarios',
      category: 'users',
    },
    {
      name: 'users.delete',
      description: 'Eliminar usuarios',
      category: 'users',
    },
    {
      name: 'roles.read',
      description: 'Leer roles',
      category: 'roles',
    },
    {
      name: 'roles.create',
      description: 'Crear roles',
      category: 'roles',
    },
    {
      name: 'roles.update',
      description: 'Actualizar roles',
      category: 'roles',
    },
    {
      name: 'roles.delete',
      description: 'Eliminar roles',
      category: 'roles',
    },
    {
      name: 'endpoints.read',
      description: 'Leer endpoints',
      category: 'endpoints',
    },
    {
      name: 'endpoints.update',
      description: 'Actualizar endpoints',
      category: 'endpoints',
    },
    {
      name: 'permissions.manage',
      description: 'Gestionar permisos',
      category: 'permissions',
    },
    {
      name: 'profile.read',
      description: 'Leer perfil propio',
      category: 'profile',
    },
    {
      name: 'profile.update',
      description: 'Actualizar perfil propio',
      category: 'profile',
    },
    {
      name: 'system.admin',
      description: 'Administración del sistema',
      category: 'system',
    },
  ];

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: {},
      create: permission,
    });
  }

  console.log(`Created ${permissions.length} permissions`);

  // 3. Crear relaciones RolePermission para todos los roles
  console.log('Creating role permissions...');

  const allPermissions = await prisma.permission.findMany();

  // Admin permissions: dashboard, users, roles, endpoints, permissions
  const adminPermissionNames = [
    'dashboard.access',
    'users.read',
    'users.create',
    'users.update',
    'users.delete',
    'roles.read',
    'roles.create',
    'roles.update',
    'roles.delete',
    'endpoints.read',
    'endpoints.update',
    'permissions.manage',
  ];

  // SuperAdmin permissions: todo lo del admin + system.admin
  const superadminPermissionNames = [...adminPermissionNames, 'system.admin'];

  // Manager permissions: dashboard, users (read/create/update), roles (read), endpoints (read)
  const managerPermissionNames = [
    'dashboard.access',
    'users.read',
    'users.create',
    'users.update',
    'roles.read',
    'endpoints.read',
  ];

  // Employee permissions: dashboard, users (read)
  const employeePermissionNames = ['dashboard.access', 'users.read'];

  // Customer permissions: profile only
  const customerPermissionNames = ['profile.read', 'profile.update'];

  // Asignar permisos a SuperAdmin
  for (const permissionName of superadminPermissionNames) {
    const permission = allPermissions.find((p) => p.name === permissionName);
    if (permission) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: superadminRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: superadminRole.id,
          permissionId: permission.id,
        },
      });
    }
  }

  // Asignar permisos a Admin
  for (const permissionName of adminPermissionNames) {
    const permission = allPermissions.find((p) => p.name === permissionName);
    if (permission) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      });
    }
  }

  // Asignar permisos a Manager
  for (const permissionName of managerPermissionNames) {
    const permission = allPermissions.find((p) => p.name === permissionName);
    if (permission) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: managerRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: managerRole.id,
          permissionId: permission.id,
        },
      });
    }
  }

  // Asignar permisos a Employee
  for (const permissionName of employeePermissionNames) {
    const permission = allPermissions.find((p) => p.name === permissionName);
    if (permission) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: employeeRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: employeeRole.id,
          permissionId: permission.id,
        },
      });
    }
  }

  // Asignar permisos a Customer
  for (const permissionName of customerPermissionNames) {
    const permission = allPermissions.find((p) => p.name === permissionName);
    if (permission) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: customerRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: customerRole.id,
          permissionId: permission.id,
        },
      });
    }
  }

  console.log('Role permissions created');

  // 4. Crear usuarios de prueba
  console.log('Creating users...');

  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@test.com' },
    update: {},
    create: {
      email: 'customer@test.com',
      password: await bcrypt.hash('customer123', 10),
      firstName: 'Customer',
      lastName: 'User',
      isActive: true,
      roleId: customerRole.id,
    },
  });

  const employeeUser = await prisma.user.upsert({
    where: { email: 'employee@test.com' },
    update: {},
    create: {
      email: 'employee@test.com',
      password: await bcrypt.hash('employee123', 10),
      firstName: 'Employee',
      lastName: 'User',
      isActive: true,
      roleId: employeeRole.id,
    },
  });

  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@test.com' },
    update: {},
    create: {
      email: 'manager@test.com',
      password: await bcrypt.hash('manager123', 10),
      firstName: 'Manager',
      lastName: 'User',
      isActive: true,
      roleId: managerRole.id,
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      password: await bcrypt.hash('admin123', 10),
      firstName: 'Admin',
      lastName: 'User',
      isActive: true,
      roleId: adminRole.id,
    },
  });

  const superadminUser = await prisma.user.upsert({
    where: { email: 'superadmin@test.com' },
    update: {},
    create: {
      email: 'superadmin@test.com',
      password: await bcrypt.hash('superadmin123', 10),
      firstName: 'Super Admin',
      lastName: 'User',
      isActive: true,
      roleId: superadminRole.id,
    },
  });

  console.log('Users created:', {
    customer: customerUser.email,
    employee: employeeUser.email,
    manager: managerUser.email,
    admin: adminUser.email,
    superadmin: superadminUser.email,
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
