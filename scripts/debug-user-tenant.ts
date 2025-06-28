#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function debugUserTenantAccess() {
  console.log('Debugging user-tenant access...\n');

  try {
    // Find all users
    const users = await prisma.user.findMany({
      include: {
        tenants: {
          include: {
            tenant: true,
          },
        },
      },
    });

    console.log(`Found ${users.length} users:\n`);

    for (const user of users) {
      console.log(`User: ${user.email} (${user.id})`);
      console.log(`  Base role: ${user.role}`);
      console.log(`  Tenant relationships:`);

      if (user.tenants.length === 0) {
        console.log('    ❌ No tenant relationships found!');
      } else {
        for (const userTenant of user.tenants) {
          console.log(
            `    - Tenant: ${userTenant.tenant.name} (${userTenant.tenant.slug})`
          );
          console.log(`      Role: ${userTenant.role || '❌ NO ROLE SET'}`);
          console.log(`      Tenant ID: ${userTenant.tenantId}`);
        }
      }
      console.log('');
    }

    // Find or create development tenant
    let devTenant = await prisma.tenant.findUnique({
      where: { slug: 'development' },
    });

    if (!devTenant) {
      console.log('Creating development tenant...');
      devTenant = await prisma.tenant.create({
        data: {
          name: 'Development',
          slug: 'development',
          description: 'Default development tenant',
        },
      });
      console.log('✓ Created development tenant\n');
    }

    // Fix any issues
    console.log('\nFixing any issues...\n');
    let fixCount = 0;

    for (const user of users) {
      // Check if user has access to development tenant
      const userTenant = await prisma.userTenant.findUnique({
        where: {
          userId_tenantId: {
            userId: user.id,
            tenantId: devTenant.id,
          },
        },
      });

      if (!userTenant) {
        // Create UserTenant entry
        await prisma.userTenant.create({
          data: {
            userId: user.id,
            tenantId: devTenant.id,
            role: 'USER',
          },
        });
        console.log(`✓ Created tenant access for ${user.email}`);
        fixCount++;
      } else if (!userTenant.role || userTenant.role === '') {
        // Update role if missing
        await prisma.userTenant.update({
          where: {
            id: userTenant.id,
          },
          data: {
            role: 'USER',
          },
        });
        console.log(`✓ Fixed role for ${user.email}`);
        fixCount++;
      } else {
        console.log(
          `✓ ${user.email} already has proper access (role: ${userTenant.role})`
        );
      }
    }

    console.log(`\nFixed ${fixCount} issues`);
    console.log('\nDebug complete!');
  } catch (error) {
    console.error('Error during debug:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
debugUserTenantAccess().catch(console.error);
