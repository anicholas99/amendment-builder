/**
 * Citation Match Repository
 *
 * Handles all data access operations related to citation matches.
 * Extracted from citationRepository.ts for better separation of concerns.
 */

import { prisma } from '../lib/prisma';
import { logger } from '@/lib/monitoring/logger';
import { Prisma, CitationMatch } from '@prisma/client';
import { ApplicationError, ErrorCode } from '@/lib/error';
import {
  processCitationMatch,
  processCitationMatchArray,
} from '@/features/citation-extraction/utils/citation';
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

// ===== CONSOLIDATED CORE FUNCTIONS =====
// Functions consolidated from citationCoreRepository.ts

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

// ===== CONSOLIDATED QUERY FUNCTIONS =====
// Functions consolidated from citationQueryRepository.ts

// Types needed for complex queries
interface CitationMatchWithJob {
  id: string;
  searchHistoryId: string;
  citationJobId: string;
  referenceNumber: string;
  citation: string;
  paragraph: string | null;
  score: number | null;
  parsedElementText: string | null;
  locationStatus: string | null;
  locationJobId: number | null;
  locationData: string | null;
  locationErrorMessage: string | null;
  reasoningStatus: string | null;
  reasoningJobId: number | null;
  reasoningScore: number | null;
  reasoningSummary: string | null;
  reasoningErrorMessage: string | null;
  referenceTitle: string | null;
  referenceApplicant: string | null;
  referenceAssignee: string | null;
  referencePublicationDate: string | null;
  createdAt: Date;
  citationJob: {
    id: string;
    status: string;
    externalJobId: number | null;
    referenceNumber: string | null;
    completedAt: Date | null;
  };
}

interface PlaceholderMatch {
  id: string;
  referenceNumber: string | null;
  isPlaceholder: boolean;
  jobStatus: string;
}

/**
 * Find citation matches by search with options
 * Provides a flexible query for citation matches with support for:
 * - Including metadata for all references
 * - Creating placeholder matches for jobs without matches
 *
 * @param searchHistoryId The ID of the search history
 * @param includeMetadataForAllReferences Whether to include metadata for all references
 * @returns Object containing citation matches and optional placeholder matches
 */
export async function findCitationMatchesBySearchWithOptions(
  searchHistoryId: string,
  includeMetadataForAllReferences: boolean = false
): Promise<{
  citationMatches: Array<CitationMatchWithJob>;
  placeholderMatches?: Array<PlaceholderMatch>;
}> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  try {
    const where: Prisma.CitationMatchWhereInput = {
      searchHistoryId,
    };

    // Query citation matches
    const citationMatches = await prisma.citationMatch.findMany({
      where,
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
      orderBy: [{ createdAt: 'asc' }, { score: 'desc' }],
    });

    // If we need metadata for all references, fetch it
    if (includeMetadataForAllReferences && citationMatches.length > 0) {
      /* const uniqueReferences = */
      Array.from(
        new Set(
          citationMatches
            .map((m: CitationMatch) => m.referenceNumber)
            .filter(Boolean)
        )
      );

      // In a real implementation, you might batch fetch metadata here
      // For now, the metadata should already be on the citation matches
    }

    // Create placeholder matches - always check for jobs without matches
    let placeholderMatches: PlaceholderMatch[] = [];

    // Get all jobs for this search history
    const allJobs = await prisma.citationJob.findMany({
      where: { searchHistoryId },
      select: {
        id: true,
        referenceNumber: true,
        status: true,
      },
    });

    // Find jobs without matches
    const jobsWithMatches = new Set(
      citationMatches.map((m: CitationMatch) => m.citationJobId)
    );
    const jobsWithoutMatches = allJobs.filter(
      job => !jobsWithMatches.has(job.id)
    );

    placeholderMatches = jobsWithoutMatches.map(job => ({
      id: `placeholder-${job.id}`,
      referenceNumber: job.referenceNumber,
      isPlaceholder: true,
      jobStatus: job.status,
    }));

    logger.debug(
      `[CitationMatch] Found ${citationMatches.length} matches and ${placeholderMatches.length} placeholders`
    );

    return {
      citationMatches: citationMatches as CitationMatchWithJob[],
      placeholderMatches:
        placeholderMatches.length > 0 ? placeholderMatches : undefined,
    };
  } catch (error) {
    logger.error(
      '[CitationMatch] Error finding citation matches with options',
      {
        error,
      }
    );
    throw error;
  }
}

// ===== CONSOLIDATED REASONING SUPPORT FUNCTIONS =====
// Functions consolidated from citationReasoningRepository.ts

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

/**
 * Create citation matches from enhanced deep analysis results
 * This function parses the deep analysis and creates high-quality citation matches
 */
export async function createCitationMatchesFromDeepAnalysis(
  analysisResult: any, // Will be typed as EnhancedDeepAnalysisResult
  citationJob: {
    id: string;
    searchHistoryId: string;
    referenceNumber?: string | null;
  },
  claimElements: string[],
  referenceMetadata?: {
    title?: string | null;
    applicant?: string | null;
    assignee?: string | null;
    publicationDate?: string | null;
  }
): Promise<void> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    logger.info('[CitationMatch] Creating matches from deep analysis', {
      jobId: citationJob.id,
      elementsCount: claimElements.length,
    });

    // First, delete any existing matches for this job that were created from deep analysis
    await prisma.citationMatch.deleteMany({
      where: {
        citationJobId: citationJob.id,
        analysisSource: 'DEEP_ANALYSIS',
      } as any, // Type assertion until Prisma types are updated
    });

    const matchesToCreate: Prisma.CitationMatchCreateManyInput[] = [];

    // Iterate through each element in the analysis
    for (let i = 0; i < claimElements.length; i++) {
      const elementText = claimElements[i];
      const elementAnalysis = analysisResult.elementAnalysis?.[elementText];

      if (!elementAnalysis || !elementAnalysis.primaryCitations) {
        logger.warn('[CitationMatch] No analysis found for element', {
          elementText,
          jobId: citationJob.id,
        });
        continue;
      }

      // Create a match for each primary citation identified by the AI
      for (const primaryCitation of elementAnalysis.primaryCitations) {
        const matchData = {
          searchHistoryId: citationJob.searchHistoryId,
          citationJobId: citationJob.id,
          referenceNumber: citationJob.referenceNumber || 'UNKNOWN',
          citation: primaryCitation.citationText || 'N/A',
          paragraph: primaryCitation.paragraphContext || null,
          score: elementAnalysis.relevanceScore, // Use the element's overall relevance score
          parsedElementText: elementText,
          elementOrder: i, // Set the order based on position in claimElements array

          // Set the reasoning from deep analysis
          reasoningStatus: 'COMPLETED',
          reasoningScore: elementAnalysis.relevanceScore,
          reasoningSummary: primaryCitation.reasoning,

          // Include reference metadata
          referenceTitle: referenceMetadata?.title || null,
          referenceApplicant: referenceMetadata?.applicant || null,
          referenceAssignee: referenceMetadata?.assignee || null,
          referencePublicationDate: referenceMetadata?.publicationDate || null,

          // Mark as coming from deep analysis
          analysisSource: 'DEEP_ANALYSIS',
          isTopResult: true,

          // Store location from the citation
          locationStatus: primaryCitation.location ? 'COMPLETED' : 'PENDING',
          locationData: primaryCitation.location || null,
        } as Prisma.CitationMatchCreateManyInput;

        matchesToCreate.push(matchData);
      }
    }

    if (matchesToCreate.length > 0) {
      const result = await prisma.citationMatch.createMany({
        data: matchesToCreate,
      });

      logger.info(
        '[CitationMatch] Created citation matches from deep analysis',
        {
          jobId: citationJob.id,
          matchesCreated: result.count,
        }
      );
    } else {
      logger.warn('[CitationMatch] No matches to create from deep analysis', {
        jobId: citationJob.id,
      });
    }
  } catch (error) {
    logger.error('[CitationMatch] Error creating matches from deep analysis', {
      error,
      jobId: citationJob.id,
    });
    throw error;
  }
}

/**
 * Find top citation matches from deep analysis
 * Fetches only matches where isTopResult=true and analysisSource='DEEP_ANALYSIS'
 */
export async function findTopCitationMatches(
  searchHistoryId: string,
  referenceNumber?: string
): Promise<any[]> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    logger.debug('[CitationMatch] Finding top citation matches', {
      searchHistoryId,
      referenceNumber,
    });

    const where: any = {
      searchHistoryId,
      isTopResult: true,
      analysisSource: 'DEEP_ANALYSIS',
    };

    if (referenceNumber) {
      where.referenceNumber = referenceNumber;
    }

    const matches = await prisma.citationMatch.findMany({
      where,
      include: {
        citationJob: {
          select: {
            id: true,
            status: true,
            externalJobId: true,
            referenceNumber: true,
            completedAt: true,
            deepAnalysisJson: true,
          },
        },
      },
      orderBy: [
        { referenceNumber: 'asc' },
        { parsedElementText: 'asc' },
        { reasoningScore: 'desc' },
      ],
    });

    logger.info('[CitationMatch] Found top citation matches', {
      searchHistoryId,
      matchCount: matches.length,
    });

    return matches;
  } catch (error) {
    logger.error('[CitationMatch] Error finding top citation matches', {
      error,
      searchHistoryId,
    });
    throw error;
  }
}
