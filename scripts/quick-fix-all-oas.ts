/**
 * Emergency fix: Mark ALL Office Actions as COMPLETED
 * This will immediately stop showing them as overdue
 */

import { prisma } from '../src/lib/prisma';

async function quickFix() {
  console.log('Emergency fix: Marking ALL Office Actions as COMPLETED...');
  
  try {
    // First, mark ALL as COMPLETED
    const result = await prisma.officeAction.updateMany({
      where: {
        deletedAt: null
      },
      data: {
        status: 'COMPLETED'
      }
    });
    
    console.log(`Updated ${result.count} Office Actions to COMPLETED`);
    
    // Show current status
    const pending = await prisma.officeAction.count({
      where: { status: 'PENDING_RESPONSE' }
    });
    
    const completed = await prisma.officeAction.count({
      where: { status: 'COMPLETED' }
    });
    
    console.log(`\nCurrent status:`);
    console.log(`- PENDING_RESPONSE: ${pending}`);
    console.log(`- COMPLETED: ${completed}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

quickFix();