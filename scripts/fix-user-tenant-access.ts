#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function fixUserTenantAccess() {
  console.log('Starting user-tenant access fix...');

  try {
    // Find the default development tenant
    let defaultTenant = await prisma.tenant.findUnique({
      where: { slug: 'development' },
    });

    if (!defaultTenant) {
      console.error('Default development tenant not found!');
      console.log('Creating development tenant...');

      defaultTenant = await prisma.tenant.create({
        data: {
          name: 'Development',
          slug: 'development',
          description: 'Default development tenant',
        },
      });

      console.log('Created development tenant:', defaultTenant.id);
    }

    // Find all users without a UserTenant entry
    const users = await prisma.user.findMany({
      include: {
        tenants: true,
      },
    });

    let fixedCount = 0;

    for (const user of users) {
      // Check if user has any tenant relationships
      if (user.tenants.length === 0) {
        console.log(`User ${user.email} (${user.id}) has no tenant access`);

        // Create UserTenant entry
        await prisma.userTenant.create({
          data: {
            userId: user.id,
            tenantId: defaultTenant.id,
            role: 'USER',
          },
        });

        console.log(
          `✓ Granted access to development tenant for user ${user.email}`
        );
        fixedCount++;
      } else {
        // Check if user has proper role set
        const userTenant = await prisma.userTenant.findFirst({
          where: {
            userId: user.id,
            tenantId: defaultTenant.id,
          },
        });

        if (userTenant && !userTenant.role) {
          await prisma.userTenant.update({
            where: {
              id: userTenant.id,
            },
            data: {
              role: 'USER',
            },
          });

          console.log(`✓ Updated role for user ${user.email}`);
          fixedCount++;
        }
      }
    }

    console.log(`\nFixed ${fixedCount} user-tenant relationships`);
    console.log('User-tenant access fix completed successfully!');
  } catch (error) {
    console.error('Error fixing user-tenant access:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixUserTenantAccess().catch(console.error);
