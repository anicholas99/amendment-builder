/**
 * Citation Match Reasoning Repository
 *
 * Handles reasoning operations for citation matches.
 * Manages reasoning status, scores, summaries, and related data access.
 */

import { prisma } from '@/lib/prisma';
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { ProcessedCitationMatch } from '@/types/domain/citation';
import { processCitationMatchArray } from '@/features/citation-extraction/utils/citation';
import { Prisma } from '@prisma/client';

/**
 * Update citation match reasoning success
 */
export async function updateCitationMatchReasoningSuccess(
  matchId: string,
  score: number,
  summary: string
): Promise<void> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  logger.debug(
    `[CitationMatch] Updating reasoning success for match ${matchId}`
  );

  try {
    await prisma.citationMatch.update({
      where: { id: matchId },
      data: {
        reasoningStatus: 'COMPLETED',
        reasoningScore: score,
        reasoningSummary: summary,
        reasoningErrorMessage: null,
      },
    });
    logger.info(`[CitationMatch] Updated reasoning for match ${matchId}`);
  } catch (error) {
    logger.error(
      `[CitationMatch] Error updating reasoning success for match ${matchId}`,
      { error }
    );
    throw error;
  }
}

/**
 * Update citation match reasoning failure
 */
export async function updateCitationMatchReasoningFailure(
  matchId: string,
  errorMessage: string
): Promise<void> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  logger.debug(
    `[CitationMatch] Updating reasoning failure for match ${matchId}`
  );

  try {
    await prisma.citationMatch.update({
      where: { id: matchId },
      data: {
        reasoningStatus: 'FAILED',
        reasoningErrorMessage: errorMessage,
      },
    });
    logger.info(
      `[CitationMatch] Updated reasoning failure for match ${matchId}`
    );
  } catch (error) {
    logger.error(
      `[CitationMatch] Error updating reasoning failure for match ${matchId}`,
      { error }
    );
    throw error;
  }
}

/**
 * Update citation match reasoning status
 */
export async function updateCitationMatchReasoningStatus(
  matchId: string,
  status: string
): Promise<void> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  logger.debug(
    `[CitationMatch] Updating reasoning status to ${status} for match ${matchId}`
  );

  try {
    await prisma.citationMatch.update({
      where: { id: matchId },
      data: {
        reasoningStatus: status,
      },
    });
    logger.info(
      `[CitationMatch] Updated reasoning status for match ${matchId}`
    );
  } catch (error) {
    logger.error(
      `[CitationMatch] Error updating reasoning status for match ${matchId}`,
      { error }
    );
    throw error;
  }
}

/**
 * Find matches with reasoning
 */
export async function findMatchesWithReasoning(
  searchHistoryId?: string,
  matchIds?: string[]
): Promise<ProcessedCitationMatch[]> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  try {
    logger.debug('[CitationMatch] Finding matches with reasoning details', {
      searchHistoryId,
      matchIds,
    });
    const where: Prisma.CitationMatchWhereInput = {};
    if (searchHistoryId) {
      where.searchHistoryId = searchHistoryId;
    }
    if (matchIds && matchIds.length > 0) {
      where.id = { in: matchIds };
    }

    const matches = await prisma.citationMatch.findMany({
      where,
      orderBy: {
        createdAt: 'asc',
      },
    });
    return processCitationMatchArray(matches);
  } catch (error) {
    logger.error('[CitationMatch] Error finding matches with reasoning', {
      error,
      searchHistoryId,
    });
    throw error;
  }
}

/**
 * Get citation match for reasoning
 */
export async function getCitationMatchForReasoning(citationMatchId: string) {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  try {
    logger.debug(
      `[CitationMatch] Getting match for reasoning: ${citationMatchId}`
    );
    const match = await prisma.citationMatch.findUnique({
      where: { id: citationMatchId },
      include: {
        searchHistory: {
          include: {
            project: {
              select: {
                id: true,
                invention: true,
              },
            },
          },
        },
      },
    });
    return match;
  } catch (error) {
    logger.error(
      `[CitationMatch] Error getting match for reasoning: ${citationMatchId}`,
      { error }
    );
    throw error;
  }
}

/**
 * Find top citation matches for reasoning
 */
export async function findTopCitationMatchesForReasoning(
  searchHistoryId: string,
  referenceNumber: string,
  parsedElementText: string,
  limit: number = 3
) {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  try {
    logger.debug('[CitationMatch] Finding top matches for reasoning', {
      searchHistoryId,
      referenceNumber,
    });
    return await prisma.citationMatch.findMany({
      where: {
        searchHistoryId,
        referenceNumber,
        parsedElementText,
      },
      orderBy: {
        score: 'desc',
      },
      take: limit,
    });
  } catch (error) {
    logger.error('[CitationMatch] Error finding top matches for reasoning', {
      error,
    });
    throw error;
  }
}

/**
 * Mark citation matches as failed
 */
export async function markCitationMatchesAsFailed(
  citationMatchIds: string[],
  errorMessage: string
): Promise<number> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  try {
    logger.debug('[CitationMatch] Marking matches as failed', {
      citationMatchIds,
    });
    const { count } = await prisma.citationMatch.updateMany({
      where: { id: { in: citationMatchIds } },
      data: {
        reasoningStatus: 'FAILED',
        reasoningErrorMessage: errorMessage,
      },
    });
    logger.info(`[CitationMatch] Marked ${count} matches as failed`);
    return count;
  } catch (error) {
    logger.error('[CitationMatch] Error marking matches as failed', { error });
    throw error;
  }
}

/**
 * Get search history for reasoning
 * Retrieves search history data needed for citation reasoning operations.
 *
 * @param searchHistoryId The ID of the search history
 * @returns The search history with project and results data
 */
export async function getSearchHistoryForReasoning(searchHistoryId: string) {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  try {
    const searchHistory = await prisma.searchHistory.findUnique({
      where: { id: searchHistoryId },
      select: {
        id: true,
        projectId: true,
        results: true,
      },
    });

    return searchHistory;
  } catch (error) {
    logger.error(
      `[CitationMatch] Error getting search history ${searchHistoryId}`,
      {
        error,
      }
    );
    throw error;
  }
}

/**
 * Get project for reasoning
 * Retrieves project data needed for citation reasoning operations.
 *
 * @param projectId The ID of the project
 * @returns The project data or null if not found
 */
export async function getProjectForReasoning(projectId: string) {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
      },
    });

    return project;
  } catch (error) {
    logger.error(`[CitationMatch] Error getting project ${projectId}`, {
      error,
    });
    throw error;
  }
}
