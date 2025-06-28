/**
 * Patentability Score Operations
 *
 * This module contains operations related to patentability scores.
 */

import { prisma } from '../../lib/prisma';
import { logger } from '../../lib/monitoring/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';

/**
 * Delete patentability scores by search history IDs
 * @param searchHistoryIds Array of search history IDs
 * @returns Batch delete result
 */
export async function deletePatentabilityScoresBySearchHistoryIds(
  searchHistoryIds: string[]
): Promise<{ count: number }> {
  try {
    logger.debug(
      `Repository: Deleting patentability scores for ${searchHistoryIds.length} search histories`
    );

    const result = await prisma!.patentabilityScore.deleteMany({
      where: {
        searchHistoryId: {
          in: searchHistoryIds,
        },
      },
    });

    logger.info(`Repository: Deleted ${result.count} patentability scores`);
    return result;
  } catch (error) {
    logger.error('Failed to delete patentability scores', {
      error,
      searchHistoryIds,
    });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to delete patentability scores: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
