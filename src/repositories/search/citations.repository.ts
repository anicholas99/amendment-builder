/**
 * Citation Operations
 *
 * This module contains operations related to citations and citation matches.
 */

import { prisma } from '../../lib/prisma';
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import {
  CitationResults,
  SearchHistoryResponse,
} from '../../types/searchTypes';
import { safeJsonParse } from '@/utils/jsonUtils';
import { ProcessedCitationMatch } from '@/types/domain/citation';
import { processCitationMatchArray } from '@/features/citation-extraction/utils/citation';
import { Prisma } from '@prisma/client';

/**
 * Get citation results for a specific search history entry.
 * Uses a raw SQL query to avoid potential Prisma type issues with JSON fields.
 *
 * @param searchId - The ID of the search history record
 * @returns A promise resolving to a SearchHistoryResponse or null if not found
 */
export async function getCitationResultsBySearchId(
  searchId: string
): Promise<SearchHistoryResponse | null> {
  try {
    logger.debug(
      `Repository: Getting citation results for search ID: ${searchId}`
    );

    // SECURITY FIX: Use Prisma.sql for safe parameterized query
    const searchHistory = await prisma!.$queryRaw(
      Prisma.sql`
        SELECT id, query, citationJobIds, citationResults 
        FROM search_history 
        WHERE id = ${searchId}
      `
    );

    // Check if we found a result
    if (
      !searchHistory ||
      !Array.isArray(searchHistory) ||
      searchHistory.length === 0
    ) {
      logger.debug(`Repository: No search history found for ID ${searchId}`);
      return null;
    }

    const search = searchHistory[0];

    // Parse citation results if they exist
    let parsedResults = null;
    if (search.citationResults) {
      try {
        parsedResults = safeJsonParse<CitationResults>(
          search.citationResults.toString()
        );
        if (parsedResults !== undefined) {
          logger.debug(
            `Repository: Successfully parsed citation results for search ${searchId}`
          );
        } else {
          logger.warn(
            `Repository: Failed to parse citation results as JSON for search ${searchId}`
          );
        }
      } catch (error) {
        logger.error(
          `Repository: Error parsing citation results for search ${searchId}:`,
          error
        );
      }
    }

    const response: SearchHistoryResponse = {
      searchId: search.id,
      query: search.query,
      citationJobId: search.citationJobIds,
      citationResults: parsedResults,
    };

    logger.debug(
      `Repository: Retrieved citation results for search ${searchId}`
    );
    return response;
  } catch (error) {
    logger.error(
      `Repository: Error getting citation results for search ${searchId}:`,
      error
    );
    // Return null on error for graceful degradation
    return null;
  }
}

/**
 * Save citation results for a specific search history entry.
 * Uses raw SQL to update citation results to avoid potential Prisma type issues with JSON fields.
 *
 * @param searchId - The ID of the search history record
 * @param citationResults - The citation results to save
 * @returns A promise resolving to a boolean indicating success
 */
export async function saveCitationResultsForSearchId(
  searchId: string,
  citationResults: CitationResults
): Promise<boolean> {
  try {
    logger.debug(
      `Repository: Saving citation results for search ID: ${searchId}`
    );

    // Check if the search exists first
    const searchCheck = await prisma!.searchHistory.findUnique({
      where: {
        id: searchId,
      },
      select: { id: true },
    });

    if (!searchCheck) {
      logger.warn(
        `Repository: Cannot save citation results - search ${searchId} not found`
      );
      return false;
    }

    // Add timestamp to citation results
    const resultsWithTimestamp = {
      ...citationResults,
      timestamp: citationResults.timestamp || new Date().toISOString(),
    };

    // SECURITY FIX: Use Prisma.sql for safe parameterized query
    await prisma!.$executeRaw(
      Prisma.sql`
        UPDATE search_history 
        SET citationResults = ${JSON.stringify(resultsWithTimestamp)}
        WHERE id = ${searchId}
      `
    );

    logger.info(
      `Repository: Successfully saved citation results for search ${searchId}`
    );
    return true;
  } catch (error) {
    logger.error(
      `Repository: Error saving citation results for search ${searchId}:`,
      error
    );
    return false;
  }
}

/**
 * Find citation matches by search history ID with authorization
 * @param searchHistoryId The search history ID
 * @param userId The user ID for authorization
 * @returns Array of citation matches
 */
export async function findCitationMatchesBySearchHistoryWithAuth(
  searchHistoryId: string,
  userId: string
): Promise<ProcessedCitationMatch[]> {
  try {
    logger.debug(
      `Repository: Finding citation matches for search history: ${searchHistoryId}, user: ${userId}`
    );

    // Import the function from authorization module to avoid circular dependency
    const { findSearchHistoryWithProjectAccess } = await import(
      './authorization.repository'
    );

    // First check authorization
    const searchHistory = await findSearchHistoryWithProjectAccess(
      searchHistoryId,
      userId
    );
    if (!searchHistory) {
      logger.debug(
        `Repository: User ${userId} not authorized for search history ${searchHistoryId}`
      );
      return [];
    }

    // Build where clause - no longer filtering by claimSetVersionId
    const whereClause = {
      searchHistoryId: searchHistoryId,
    };

    const citationMatches = await prisma!.citationMatch.findMany({
      where: whereClause,
      orderBy: [{ score: 'desc' }, { referenceNumber: 'asc' }],
      include: {
        citationJob: {
          select: {
            id: true,
            status: true,
            externalJobId: true,
            referenceNumber: true,
            completedAt: true,
          },
        },
      },
    });

    logger.debug(
      `Repository: Found ${citationMatches.length} citation matches for search history: ${searchHistoryId}`
    );

    // Process the matches to parse JSON fields
    return processCitationMatchArray(citationMatches as any);
  } catch (error) {
    logger.error('Failed to find citation matches by search history', {
      error,
      searchHistoryId,
      userId,
    });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to find citation matches: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
