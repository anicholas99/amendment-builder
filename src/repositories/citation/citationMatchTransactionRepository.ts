/**
 * Citation Match Transaction Repository
 *
 * Handles transaction-based operations for citation matches.
 * Ensures data consistency when performing multiple related database operations.
 */

import { prisma } from '@/lib/prisma';
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { Prisma } from '@prisma/client';

/**
 * Delete all citation matches for a job
 */
export async function deleteCitationMatchesByJobId(
  tx: Prisma.TransactionClient | null, // Transaction client or null to use main client
  citationJobId: string
) {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  try {
    logger.debug(
      `[CitationMatch] Deleting matches for job ${citationJobId} in transaction`
    );

    // Use transaction client if provided, otherwise use main prisma client
    const client = tx || prisma;

    return await client.citationMatch.deleteMany({
      where: { citationJobId },
    });
  } catch (error) {
    logger.error(
      `[CitationMatch] Error deleting matches for job ${citationJobId}`,
      { error }
    );
    throw error;
  }
}

/**
 * Create multiple citation matches
 */
export async function createCitationMatches(
  tx: Prisma.TransactionClient | null, // Transaction client or null to use main client
  data: Prisma.CitationMatchCreateManyInput[]
) {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  try {
    logger.debug(
      `[CitationMatch] Creating ${data.length} matches in transaction`
    );

    // Use transaction client if provided, otherwise use main prisma client
    const client = tx || prisma;

    return await client.citationMatch.createMany({
      data,
    });
  } catch (error) {
    logger.error(`[CitationMatch] Error creating matches`, { error });
    throw error;
  }
}

/**
 * Get citation matches by job ID
 */
export async function getCitationMatchesByJobId(
  tx: Prisma.TransactionClient, // Transaction client
  jobId: string
) {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  try {
    logger.debug(`[CitationMatch] Getting matches for job ${jobId}`);
    return await tx.citationMatch.findMany({
      where: { citationJobId: jobId },
    });
  } catch (error) {
    logger.error(`[CitationMatch] Error getting matches for job ${jobId}`, {
      error,
    });
    throw error;
  }
}
