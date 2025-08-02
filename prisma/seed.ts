import { PrismaClient } from 'generated/prisma';

const prisma = new PrismaClient();

async function main() {
  const roles = [
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
      name: 'Employee',
      slug: 'employee',
      description: 'Basic employee access',
      permissions: ['products.read', 'orders.read', 'dashboard.access'],
    },
    {
      name: 'Customer',
      slug: 'customer',
      description: 'Standard customer account',
      permissions: ['profile.read', 'profile.update', 'orders.read'],
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
