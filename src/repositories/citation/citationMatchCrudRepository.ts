/**
 * Citation Match CRUD Repository
 *
 * Handles basic CRUD (Create, Read, Update, Delete) operations for citation matches.
 * Provides core data access functionality for citation match records.
 */

import { prisma } from '@/lib/prisma';
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { ProcessedCitationMatch } from '@/types/domain/citation';
import { processCitationMatchArray } from '@/features/citation-extraction/utils/citation';
import { Prisma } from '@prisma/client';

/**
 * Count citation matches by job ID
 */
export async function countCitationMatchesByJobId(
  citationJobId: string
): Promise<number> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  try {
    logger.debug(`[CitationMatch] Counting matches for job ${citationJobId}`);
    return await prisma.citationMatch.count({
      where: { citationJobId },
    });
  } catch (error) {
    logger.error(
      `[CitationMatch] Error counting matches for job ${citationJobId}`,
      { error }
    );
    throw error;
  }
}

/**
 * Find matches by search history
 */
export async function findBySearchHistory(
  searchHistoryId: string
): Promise<ProcessedCitationMatch[]> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  try {
    logger.debug(
      `[CitationMatch] Finding matches for search history ${searchHistoryId}`
    );
    const where: Prisma.CitationMatchWhereInput = {
      searchHistoryId: searchHistoryId,
    };

    const matches = await prisma.citationMatch.findMany({
      where,
      orderBy: [
        { elementOrder: 'asc' }, // Primary sort by element order
        { score: 'desc' }, // Secondary sort by score within each element
        { id: 'asc' }, // Tertiary sort by ID for consistency
      ],
    });

    return processCitationMatchArray(matches);
  } catch (error) {
    logger.error(
      `[CitationMatch] Error finding matches by search history ${searchHistoryId}`,
      { error }
    );
    throw error;
  }
}

/**
 * Get citation match with tenant info
 */
export async function getCitationMatchWithTenantInfo(citationMatchId: string) {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  try {
    logger.debug(`[CitationMatch] Getting tenant info for ${citationMatchId}`);
    return await prisma.citationMatch.findUnique({
      where: { id: citationMatchId },
      include: {
        searchHistory: {
          include: {
            project: {
              include: {
                tenant: true,
              },
            },
          },
        },
      },
    });
  } catch (error) {
    logger.error(
      `[CitationMatch] Error getting tenant info for ${citationMatchId}`,
      { error }
    );
    throw error;
  }
}

/**
 * Validate citation match exists
 */
export async function validateCitationMatchExists(
  citationMatchId: string
): Promise<boolean> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  try {
    logger.debug(`[CitationMatch] Validating existence of ${citationMatchId}`);
    const match = await prisma.citationMatch.findUnique({
      where: { id: citationMatchId },
      select: { id: true },
    });
    return !!match;
  } catch (error) {
    logger.error(
      `[CitationMatch] Error validating existence of ${citationMatchId}`,
      { error }
    );
    throw error;
  }
}

/**
 * Finds all citation matches for a specific citation job ID.
 * This is a simplified version for service layer usage that doesn't require a transaction client.
 * @param jobId - The ID of the citation job.
 * @returns A promise that resolves to an array of citation matches.
 */
export async function findMatchesByJobId(jobId: string) {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  try {
    logger.debug(`[CitationMatch] Finding matches for job ID: ${jobId}`);
    return await prisma.citationMatch.findMany({
      where: { citationJobId: jobId },
      select: {
        id: true,
        citation: true,
        parsedElementText: true,
        referenceNumber: true,
        searchHistoryId: true,
        referenceTitle: true,
        referenceApplicant: true,
        referenceAssignee: true,
        referencePublicationDate: true,
      },
    });
  } catch (error) {
    logger.error(`[CitationMatch] Error finding matches by job ID ${jobId}`, {
      error,
    });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to retrieve matches for job ${jobId}`
    );
  }
}

/**
 * Delete citation matches by job ID
 */
export async function deleteCitationMatchesByJobAndVersion(
  citationJobId: string
): Promise<number> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  try {
    logger.debug(`[CitationMatch] Deleting matches for job ${citationJobId}`);
    const { count } = await prisma.citationMatch.deleteMany({
      where: {
        citationJobId,
      },
    });
    logger.info(
      `[CitationMatch] Deleted ${count} matches for job ${citationJobId}`
    );
    return count;
  } catch (error) {
    logger.error(
      `[CitationMatch] Error deleting matches for job ${citationJobId}`,
      { error }
    );
    throw error;
  }
}
