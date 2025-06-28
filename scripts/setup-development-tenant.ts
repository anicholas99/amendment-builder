import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating Development tenant...');

  // Create the Development tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Development',
      slug: 'development',
      settings: JSON.stringify({
        isDefault: true,
      }),
    },
  });

  console.log('Development tenant created:', tenant);

  // Get all existing users
  const users = await prisma.user.findMany();

  console.log(`Adding ${users.length} existing users to Development tenant...`);

  // Add all users to the Development tenant
  for (const user of users) {
    await prisma.userTenant.create({
      data: {
        userId: user.id,
        tenantId: tenant.id,
      },
    });
  }

  console.log('Setup complete!');
}

main()
  .catch(e => {
    console.error('Error during setup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
