import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create your user
  const user = await prisma.user.create({
    data: {
      id: 'auth0|67e389d0d7b925eb06f56fa0',
      email: 'anicholas719@gmail.com',
      name: 'Anthony Nicholas',
      isVerified: true,
      role: 'user',
    },
  });

  console.log('User created:', user);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
