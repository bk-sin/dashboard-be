import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const roles = [
    {
      name: 'Customer',
      slug: 'customer',
      description: 'Standard customer account',
      permissions: ['profile.read', 'profile.update', 'orders.read'],
    },
    {
      name: 'Employee',
      slug: 'employee',
      description: 'Basic employee access',
      permissions: ['products.read', 'orders.read', 'dashboard.access'],
    },
    {
      name: 'Manager',
      slug: 'manager',
      description: 'Management access for products and orders',
      permissions: [
        'products.create',
        'products.read',
        'products.update',
        'orders.read',
        'orders.update',
        'dashboard.access',
      ],
    },
    {
      name: 'Admin',
      slug: 'admin',
      description: 'Administrative access with most permissions',
      permissions: [
        'users.read',
        'users.update',
        'categories.create',
        'categories.read',
        'categories.update',
        'categories.delete',
        'products.create',
        'products.read',
        'products.update',
        'products.delete',
        'orders.read',
        'orders.update',
        'dashboard.access',
      ],
    },
    {
      name: 'Super Admin',
      slug: 'super-admin',
      description: 'Complete system access with all permissions',
      permissions: [
        'users.create',
        'users.read',
        'users.update',
        'users.delete',
        'roles.create',
        'roles.read',
        'roles.update',
        'roles.delete',
        'categories.create',
        'categories.read',
        'categories.update',
        'categories.delete',
        'products.create',
        'products.read',
        'products.update',
        'products.delete',
        'orders.create',
        'orders.read',
        'orders.update',
        'orders.delete',
        'dashboard.access',
        'settings.manage',
      ],
    },
  ];

  console.log('Creating roles...');
  for (const roleData of roles) {
    const role = await prisma.role.upsert({
      where: { slug: roleData.slug },
      update: {},
      create: roleData,
    });
    console.log(`Created role: ${role.name}`);
  }

  const categories = [
    {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Electronic devices and accessories',
    },
    {
      name: 'Clothing',
      slug: 'clothing',
      description: 'Fashion and apparel',
    },
    {
      name: 'Home & Garden',
      slug: 'home-garden',
      description: 'Home improvement and garden items',
    },
    {
      name: 'Books',
      slug: 'books',
      description: 'Books and literature',
    },
  ];

  console.log('Creating categories...');
  for (const categoryData of categories) {
    const category = await prisma.category.upsert({
      where: { slug: categoryData.slug },
      update: {},
      create: categoryData,
    });
    console.log(`Created category: ${category.name}`);
  }

  // Create users for each role
  const usersData = [
    {
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'customer@test.com',
      phone: '+1234567890',
      password: 'customer123',
      roleId: 1, // Customer
    },
    {
      firstName: 'María',
      lastName: 'González',
      email: 'employee@test.com',
      phone: '+1234567891',
      password: 'employee123',
      roleId: 2, // Employee
    },
    {
      firstName: 'Carlos',
      lastName: 'Rodríguez',
      email: 'manager@test.com',
      phone: '+1234567892',
      password: 'manager123',
      roleId: 3, // Manager
    },
    {
      firstName: 'Ana',
      lastName: 'Martínez',
      email: 'admin@test.com',
      phone: '+1234567893',
      password: 'admin123',
      roleId: 4, // Admin
    },
    {
      firstName: 'Luis',
      lastName: 'García',
      email: 'superadmin@test.com',
      phone: '+1234567894',
      password: 'superadmin123',
      roleId: 5, // Super Admin
    },
  ];

  console.log('Creating users...');
  for (const userData of usersData) {
    // Hash the password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        ...userData,
        password: hashedPassword,
      },
    });
    console.log(
      `Created user: ${user.firstName} ${user.lastName} (${user.email}) - Role ID: ${user.roleId}`,
    );
  }

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
