/**
 * Quick script to mark all existing Office Actions as COMPLETED
 * Run this once to fix the immediate issue
 */

import { prisma } from '../src/lib/prisma';

async function fixOAStatuses() {
  console.log('Marking all Office Actions as COMPLETED...');
  
  try {
    const result = await prisma.officeAction.updateMany({
      where: {
        status: {
          not: 'PENDING_RESPONSE'
        }
      },
      data: {
        status: 'COMPLETED'
      }
    });
    
    console.log(`Updated ${result.count} Office Actions to COMPLETED status`);
    
    // Now mark any OAs without responses as PENDING_RESPONSE if created in last 90 days
    const recentOAs = await prisma.officeAction.findMany({
      where: {
        dateIssued: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
        },
        deletedAt: null,
      },
      include: {
        amendmentProjects: {
          where: {
            status: 'FILED',
            deletedAt: null,
          }
        }
      }
    });
    
    let pendingCount = 0;
    for (const oa of recentOAs) {
      // If no filed amendment projects, mark as pending
      if (oa.amendmentProjects.length === 0) {
        await prisma.officeAction.update({
          where: { id: oa.id },
          data: { status: 'PENDING_RESPONSE' }
        });
        pendingCount++;
      }
    }
    
    console.log(`Marked ${pendingCount} recent Office Actions as PENDING_RESPONSE`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixOAStatuses();