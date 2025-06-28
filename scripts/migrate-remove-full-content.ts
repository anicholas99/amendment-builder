#!/usr/bin/env tsx
/**
 * Migration script to remove all FULL_CONTENT documents
 * This is part of the architecture change to store only sections
 */

import { prisma } from '../src/lib/prisma';
import { logger } from '../src/lib/monitoring/logger';

async function main() {
  logger.info('Starting migration: Remove FULL_CONTENT documents');

  if (!prisma) {
    logger.error('Prisma client not initialized');
    process.exit(1);
  }

  try {
    // Count existing FULL_CONTENT documents in draft documents
    const draftFullContentCount = await prisma.draftDocument.count({
      where: { type: 'FULL_CONTENT' }
    });

    logger.info(`Found ${draftFullContentCount} FULL_CONTENT draft documents to remove`);

    if (draftFullContentCount > 0) {
      // Delete all FULL_CONTENT draft documents
      const deletedDrafts = await prisma.draftDocument.deleteMany({
        where: { type: 'FULL_CONTENT' }
      });

      logger.info(`Deleted ${deletedDrafts.count} FULL_CONTENT draft documents`);
    }

    // Count existing FULL_CONTENT documents in versioned documents
    const versionedFullContentCount = await prisma.document.count({
      where: { type: 'FULL_CONTENT' }
    });

    logger.info(`Found ${versionedFullContentCount} FULL_CONTENT versioned documents to remove`);

    if (versionedFullContentCount > 0) {
      // Delete all FULL_CONTENT versioned documents
      const deletedVersioned = await prisma.document.deleteMany({
        where: { type: 'FULL_CONTENT' }
      });

      logger.info(`Deleted ${deletedVersioned.count} FULL_CONTENT versioned documents`);
    }

    logger.info('Migration completed successfully');
    logger.info('Summary:');
    logger.info(`- Draft documents cleaned: ${draftFullContentCount}`);
    logger.info(`- Versioned documents cleaned: ${versionedFullContentCount}`);
    
  } catch (error) {
    logger.error('Migration failed', { error });
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  logger.error('Unhandled error in migration', { error });
  process.exit(1);
}); 