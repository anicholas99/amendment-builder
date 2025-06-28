/**
 * Test script to verify chat context loading
 * Run with: npx tsx scripts/test-chat-context.ts
 */

import { getInventionContextForChat } from '@/repositories/chatRepository';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/monitoring/logger';

async function testChatContext() {
  if (!prisma) {
    logger.error('Prisma client not initialized');
    return;
  }
  
  try {
    // Find a test project (you'll need to update these IDs)
    const testProject = await prisma.project.findFirst({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        tenantId: true,
        name: true,
      }
    });

    if (!testProject) {
      logger.error('No projects found in database');
      return;
    }

    logger.info('Testing with project:', testProject);

    // Test context loading
    const context = await getInventionContextForChat(
      testProject.id,
      testProject.tenantId
    );

    if (!context) {
      logger.error('Failed to load context');
      return;
    }

    // Log what we got
    logger.info('Successfully loaded context:');
    logger.info('Project:', {
      id: context.project.id,
      name: context.project.name,
      status: context.project.status,
    });

    if (context.invention) {
      logger.info('Invention:', {
        title: context.invention.title,
        hasClaimElements: context.invention.parsedClaimElements?.length > 0,
        claimElementCount: context.invention.parsedClaimElements?.length || 0,
        hasAdvantages: context.invention.advantages?.length > 0,
        hasFeatures: context.invention.features?.length > 0,
      });
    } else {
      logger.info('No invention data found');
    }

    logger.info('Claims:', {
      count: context.claims.length,
      claims: context.claims.map(c => ({
        number: c.number,
        textLength: c.text.length,
      }))
    });

    logger.info('Prior Art:', {
      count: context.savedPriorArt.length,
      titles: context.savedPriorArt.map(art => art.title || 'Untitled')
    });

    // Test wrong tenant ID (should return null)
    const wrongContext = await getInventionContextForChat(
      testProject.id,
      'wrong-tenant-id'
    );

    if (wrongContext === null) {
      logger.info('✅ Security check passed: Wrong tenant returns null');
    } else {
      logger.error('❌ Security check failed: Wrong tenant returned data!');
    }

  } catch (error) {
    logger.error('Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testChatContext(); 