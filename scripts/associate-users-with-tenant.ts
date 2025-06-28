import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function associateUsersWithTenant() {
  try {
    // Get the development tenant
    const tenant = await prisma.tenant.findFirst({
      where: { slug: 'development' },
    });

    if (!tenant) {
      console.error('Development tenant not found');
      return;
    }

    // Get all users
    const users = await prisma.user.findMany();

    // Associate each user with the development tenant if they aren't already
    for (const user of users) {
      const existingAssociation = await prisma.userTenant.findFirst({
        where: {
          userId: user.id,
          tenantId: tenant.id,
        },
      });

      if (!existingAssociation) {
        await prisma.userTenant.create({
          data: {
            userId: user.id,
            tenantId: tenant.id,
          },
        });
        console.log(`Associated user ${user.email} with development tenant`);
      } else {
        console.log(
          `User ${user.email} already associated with development tenant`
        );
      }
    }

    console.log('Finished associating users with development tenant');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

associateUsersWithTenant();
