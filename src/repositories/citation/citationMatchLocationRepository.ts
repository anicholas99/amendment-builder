/**
 * Citation Match Location Repository
 *
 * Handles location job management operations for citation matches.
 * Manages location extraction status, job IDs, and location data updates.
 */

import { prisma } from '@/lib/prisma';
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { processCitationMatch } from '@/features/citation-extraction/utils/citation';
import { ProcessedCitationMatch } from '@/types/domain/citation';

/**
 * Update citation match location job ID
 */
export async function updateCitationMatchLocationJob(
  matchId: string,
  locationJobId: number
): Promise<void> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  logger.debug(
    `[CitationMatch] Setting location job ${locationJobId} for match ${matchId}`
  );

  try {
    await prisma.citationMatch.update({
      where: { id: matchId },
      data: {
        locationJobId,
        locationStatus: 'IN_PROGRESS',
      },
    });
    logger.info(`[CitationMatch] Updated location job for match ${matchId}`);
  } catch (error) {
    logger.error(
      `[CitationMatch] Error updating location job for match ${matchId}`,
      { error }
    );
    throw error;
  }
}

/**
 * Update citation match location success
 */
export async function updateCitationMatchLocationSuccess(
  locationJobId: number,
  locationData: string
): Promise<void> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  logger.debug(
    `[CitationMatch] Updating location success for job ${locationJobId}`
  );

  try {
    const result = await prisma.citationMatch.updateMany({
      where: { locationJobId },
      data: {
        locationData,
        locationStatus: 'COMPLETED',
        locationErrorMessage: null,
      },
    });

    if (result.count === 0) {
      logger.warn(
        `[CitationMatch] No matches found with location job ${locationJobId}`
      );
    } else {
      logger.info(
        `[CitationMatch] Updated ${result.count} matches with location data`
      );
    }
  } catch (error) {
    logger.error(
      `[CitationMatch] Error updating location success for job ${locationJobId}`,
      { error }
    );
    throw error;
  }
}

/**
 * Update citation match location failure
 */
export async function updateCitationMatchLocationFailure(
  locationJobId: number,
  errorMessage: string
): Promise<void> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  logger.debug(
    `[CitationMatch] Updating location failure for job ${locationJobId}`
  );

  try {
    const result = await prisma.citationMatch.updateMany({
      where: { locationJobId },
      data: {
        locationStatus: 'FAILED',
        locationErrorMessage: errorMessage,
      },
    });

    if (result.count === 0) {
      logger.warn(
        `[CitationMatch] No matches found with location job ${locationJobId}`
      );
    } else {
      logger.info(
        `[CitationMatch] Updated ${result.count} matches with location error`
      );
    }
  } catch (error) {
    logger.error(
      `[CitationMatch] Error updating location failure for job ${locationJobId}`,
      { error }
    );
    throw error;
  }
}

/**
 * Get citation match by location job ID
 */
export async function getCitationMatchByLocationJobId(
  locationJobId: number
): Promise<ProcessedCitationMatch | null> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  try {
    logger.debug(
      `[CitationMatch] Getting match by location job ID ${locationJobId}`
    );
    const match = await prisma.citationMatch.findFirst({
      where: { locationJobId },
    });
    return match ? processCitationMatch(match) : null;
  } catch (error) {
    logger.error(
      `[CitationMatch] Error getting match by location job ID ${locationJobId}`,
      { error }
    );
    throw error;
  }
}

/**
 * Get a full citation match record by location job ID, including tenant information.
 * This is primarily used for tenant security resolution.
 * @param locationJobId The external location job ID.
 * @returns The full citation match object with nested relations, or null.
 */
export async function getFullCitationMatchByLocationJobId(
  locationJobId: number
) {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  try {
    logger.debug(
      `[CitationMatch] Getting full match by location job ID ${locationJobId} for security resolution`
    );
    const match = await prisma.citationMatch.findFirst({
      where: { locationJobId },
      include: {
        searchHistory: {
          include: {
            project: {
              select: {
                tenantId: true,
              },
            },
          },
        },
      },
    });
    return match;
  } catch (error) {
    logger.error(
      `[CitationMatch] Error getting full match by location job ID ${locationJobId}`,
      { error }
    );
    throw error;
  }
}
