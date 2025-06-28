import { prisma } from '../src/lib/prisma';
import { logger } from '../src/lib/monitoring/logger';

async function testClaimHistory() {
  if (!prisma) {
    logger.error('Prisma client not initialized');
    process.exit(1);
  }

  try {
    logger.info('Starting claim history test...');

    // Test 1: Check if ClaimHistory table exists
    const tableExists = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'claim_history'
    `;
    logger.info('ClaimHistory table check:', { result: tableExists });

    // Test 2: Try to find any existing history entries
    const historyCount = await prisma.claimHistory.count();
    logger.info(`Found ${historyCount} existing history entries`);

    // Test 3: Get a sample claim
    const sampleClaim = await prisma.claim.findFirst({
      select: { id: true, inventionId: true, text: true },
    });

    if (!sampleClaim) {
      logger.warn('No claims found in database');
      return;
    }

    logger.info('Found sample claim:', {
      claimId: sampleClaim.id,
      textLength: sampleClaim.text.length,
    });

    // Test 4: Try to manually create a history entry
    const testUserId = 'test-user-id';
    try {
      const historyEntry = await prisma.claimHistory.create({
        data: {
          claimId: sampleClaim.id,
          userId: testUserId,
          previousText: sampleClaim.text,
          newText: sampleClaim.text + ' (test)',
        },
      });

      logger.info('Successfully created test history entry:', {
        id: historyEntry.id,
        claimId: historyEntry.claimId,
        timestamp: historyEntry.timestamp,
      });

      // Clean up test entry
      await prisma.claimHistory.delete({
        where: { id: historyEntry.id },
      });
      logger.info('Cleaned up test history entry');
    } catch (error) {
      logger.error('Failed to create history entry:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // Test 5: Check foreign key constraints
    const foreignKeys = await prisma.$queryRaw`
      SELECT 
        CONSTRAINT_NAME,
        TABLE_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_NAME = 'claim_history'
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `;
    logger.info('Foreign key constraints:', { constraints: foreignKeys });

  } catch (error) {
    logger.error('Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testClaimHistory(); 