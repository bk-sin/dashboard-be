import { PrismaClient } from '../generated/prisma';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed process...');

  // 1. Crear permisos primero
  console.log('📋 Creating permissions...');

  const permissions = [
    // Dashboard
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

    // Roles
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

    // Permissions
    {
      name: 'permissions.read',
      description: 'Leer permisos',
      category: 'permissions',
    },
    {
      name: 'permissions.create',
      description: 'Crear permisos',
      category: 'permissions',
    },
    {
      name: 'permissions.update',
      description: 'Actualizar permisos',
      category: 'permissions',
    },
    {
      name: 'permissions.delete',
      description: 'Eliminar permisos',
      category: 'permissions',
    },

    // Profile
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
  ];

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: {},
      create: permission,
    });
  }

  console.log(`✅ Created ${permissions.length} permissions`);

  // 2. Crear roles
  console.log('👥 Creating roles...');

  const customerRole = await prisma.role.upsert({
    where: { slug: 'customer' },
    update: {},
    create: {
      name: 'Customer',
      slug: 'customer',
      description: 'Usuario cliente básico',
      permissions: {
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
      description: 'Empleado con acceso básico al dashboard',
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
      description: 'Gerente con permisos de gestión',
      permissions: {
        'dashboard.access': true,
        'users.read': true,
        'users.create': true,
        'users.update': true,
        'roles.read': true,
        'permissions.read': true,
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
      description: 'Administrador con permisos completos',
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
        'permissions.read': true,
        'permissions.create': true,
        'permissions.update': true,
        'permissions.delete': true,
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
      description: 'Super administrador con acceso total',
      permissions: {},
    },
  });

  console.log('✅ Roles created:', {
    customer: customerRole.name,
    employee: employeeRole.name,
    manager: managerRole.name,
    admin: adminRole.name,
    superadmin: superadminRole.name,
  });

  // 3. Asignar permisos a roles usando RolePermission
  console.log('🔗 Creating role permissions...');

  const allPermissions = await prisma.permission.findMany();

  // Definir permisos por rol
  const rolePermissionsMap = {
    [customerRole.id]: ['profile.read', 'profile.update'],
    [employeeRole.id]: [
      'dashboard.access',
      'users.read',
      'profile.read',
      'profile.update',
    ],
    [managerRole.id]: [
      'dashboard.access',
      'users.read',
      'users.create',
      'users.update',
      'roles.read',
      'permissions.read',
      'profile.read',
      'profile.update',
    ],
    [adminRole.id]: [
      'dashboard.access',
      'users.read',
      'users.create',
      'users.update',
      'users.delete',
      'roles.read',
      'roles.create',
      'roles.update',
      'roles.delete',
      'permissions.read',
      'permissions.create',
      'permissions.update',
      'permissions.delete',
      'profile.read',
      'profile.update',
    ],
    [superadminRole.id]: [],
  };

  for (const [roleIdStr, permissionNames] of Object.entries(
    rolePermissionsMap,
  )) {
    const roleId = parseInt(roleIdStr);
    for (const permissionName of permissionNames) {
      const permission = allPermissions.find((p) => p.name === permissionName);
      if (permission) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            roleId,
            permissionId: permission.id,
          },
        });
      }
    }
  }

  console.log('✅ Role permissions created');

  // 4. Crear usuarios
  console.log('👤 Creating users...');

  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@test.com' },
    update: {},
    create: {
      email: 'customer@test.com',
      password: await bcrypt.hash('customer123', 10),
      firstName: 'Customer',
      lastName: 'User',
      isActive: true,
      isVerified: true,
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
      isVerified: true,
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
      isVerified: true,
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
      isVerified: true,
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
      isVerified: true,
      roleId: superadminRole.id,
    },
  });

  console.log('✅ Users created:', {
    customer: customerUser.email,
    employee: employeeUser.email,
    manager: managerUser.email,
    admin: adminUser.email,
    superadmin: superadminUser.email,
  });

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📝 Test accounts:');
  console.log('- Customer: customer@test.com / customer123');
  console.log('- Employee: employee@test.com / employee123');
  console.log('- Manager: manager@test.com / manager123');
  console.log('- Admin: admin@test.com / admin123');
  console.log('- Super Admin: superadmin@test.com / superadmin123');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
