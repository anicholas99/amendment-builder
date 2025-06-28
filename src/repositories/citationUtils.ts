/**
 * Citation Utilities
 *
 * Handles all citation data transformations, type definitions, and consolidation logic.
 * This utility module acts as a bridge between raw database data and domain models.
 */

import { prisma as prismaClient } from '../lib/prisma';
import { logger } from '@/lib/monitoring/logger';
import { Prisma } from '@prisma/client';
import { safeJsonParse } from '@/utils/json-utils';
import { CitationResults } from '../types/searchTypes';
import { ApplicationError, ErrorCode } from '@/lib/error';

// Transaction client type
export type TransactionClient = Prisma.TransactionClient;

// Define types for citation match data
export interface CitationMatchData {
  citation?: string;
  paragraph?: string | null;
  score?: number;
  rankPercentage?: number;
  [key: string]: unknown; // For other fields that might be present
}

// Define type for patent metadata
export interface PatentMetadata {
  title?: string | null;
  applicant?: string | null;
  assignee?: string | null;
  publicationDate?: string | null;
  abstract?: string | null;
  [key: string]: unknown;
}

// Define type for deep analysis input
export interface DeepAnalysisInput {
  rawData: string;
  claimElements: string[];
  claimText: string;
  referenceNumber: string;
  priorArtAbstract: string | null;
  referenceTitle: string | null;
}

// Type for citation match with job information
export interface CitationMatchWithJob {
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

// Type for placeholder matches (jobs without matches)
export interface PlaceholderMatch {
  id: string;
  referenceNumber: string | null;
  isPlaceholder: boolean;
  jobStatus: string;
}

// Result type for consolidation operations
export interface ConsolidationResult {
  success: boolean;
  data: string | null;
  count: number;
}

/**
 * Consolidates citation results from multiple jobs for a search history.
 * This function aggregates results from all completed citation jobs
 * associated with a search history into a unified structure.
 *
 * @param searchHistoryId The ID of the search history to consolidate
 * @param tx Optional transaction client for database operations
 * @returns Promise resolving to consolidation result with success status and data
 */
export async function consolidateCitationResults(
  searchHistoryId: string,
  tx?: TransactionClient
): Promise<ConsolidationResult> {
  const prisma = tx || prismaClient;
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    const relatedJobs = await prisma.citationJob.findMany({
      where: {
        searchHistoryId,
        status: { in: ['COMPLETED', 'completed'] },
      },
      include: {
        results: true,
      },
    });

    if (relatedJobs.length === 0) {
      logger.debug(
        `[Consolidation] No completed jobs found for SearchHistory ${searchHistoryId}`
      );
      return { success: true, data: null, count: 0 };
    }

    const allResults: CitationResults[] = [];
    for (const job of relatedJobs) {
      if (job.results?.resultsData) {
        try {
          const parsed = safeJsonParse(job.results.resultsData);
          // Check if parsed data has the structure of CitationResults
          if (
            parsed &&
            typeof parsed === 'object' &&
            'results' in parsed &&
            'reference' in parsed
          ) {
            allResults.push(parsed as CitationResults);
          }
        } catch (e) {
          logger.error(
            `[Consolidation] Failed to parse results for job ${job.id}`,
            { error: e instanceof Error ? e : undefined }
          );
        }
      }
    }

    const consolidatedData = JSON.stringify({
      searchHistoryId,
      totalJobs: relatedJobs.length,
      consolidatedAt: new Date().toISOString(),
      results: allResults,
    });

    logger.info(
      `[Consolidation] Consolidated ${allResults.length} results for SearchHistory ${searchHistoryId}`
    );

    return {
      success: true,
      data: consolidatedData,
      count: allResults.length,
    };
  } catch (error) {
    logger.error(
      `[Consolidation] Error consolidating results for SearchHistory ${searchHistoryId}:`,
      { error: error instanceof Error ? error : undefined }
    );
    return {
      success: false,
      data: `Consolidation error: ${error instanceof Error ? error.message : String(error)}`,
      count: 0,
    };
  }
}

/**
 * Parses citation results data and extracts citation matches.
 * Handles various data structures that might be returned by the external API.
 *
 * @param resultsData The raw JSON string containing citation results
 * @returns Array of parsed citation match data
 */
export function parseCitationResults(
  resultsData: string
): CitationMatchData[][] | CitationMatchData[] {
  try {
    const parsed = safeJsonParse(resultsData, []);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    logger.error('Failed to parse citation results', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return [];
  }
}

/**
 * Extracts actual matches from parsed citation results.
 * Handles both nested array structure [[...]] and flat array structure [...].
 *
 * @param parsedResults The parsed citation results
 * @returns Array of citation matches
 */
export function extractCitationMatches(
  parsedResults: CitationMatchData[][] | CitationMatchData[]
): CitationMatchData[] {
  if (!Array.isArray(parsedResults) || parsedResults.length === 0) {
    return [];
  }

  // Check if it's a nested array structure
  if (Array.isArray(parsedResults[0])) {
    // Return the first inner array
    return (parsedResults as CitationMatchData[][])[0];
  }

  // Check if it's a flat array of objects
  if (
    typeof parsedResults[0] === 'object' &&
    !Array.isArray(parsedResults[0])
  ) {
    return parsedResults as CitationMatchData[];
  }

  return [];
}

/**
 * Normalizes the score from various possible fields in the citation match data.
 *
 * @param match The citation match data
 * @returns The normalized score or null
 */
export function normalizeCitationScore(
  match: CitationMatchData
): number | null {
  if (typeof match?.score === 'number') {
    return match.score;
  }
  if (typeof match?.rankPercentage === 'number') {
    return match.rankPercentage;
  }
  return null;
}

/**
 * Get claim elements for a search history
 */
export async function getClaimElements(
  searchHistoryId: string
): Promise<string[]> {
  if (!prismaClient) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    const searchHistory = await prismaClient.searchHistory.findUnique({
      where: { id: searchHistoryId },
      select: {
        query: true,
        project: {
          select: {
            invention: {
              select: {
                parsedClaimElementsJson: true,
              },
            },
          },
        },
      },
    });

    if (!searchHistory) {
      return [];
    }

    // First try to get parsed claim elements from invention
    if (searchHistory.project?.invention?.parsedClaimElementsJson) {
      const elements = safeJsonParse<string[]>(
        searchHistory.project.invention.parsedClaimElementsJson,
        []
      );
      if (Array.isArray(elements) && elements.length > 0) {
        return elements;
      }
    }

    // Fallback: parse from query if it contains elements
    if (searchHistory.query) {
      try {
        const queryData = safeJsonParse<{ elements?: string[] }>(
          searchHistory.query,
          {}
        );
        if (queryData?.elements && Array.isArray(queryData.elements)) {
          return queryData.elements;
        }
      } catch {
        // If query is not JSON, return empty array
      }
    }

    return [];
  } catch (error) {
    logger.error('[CitationUtils] Error getting claim elements', {
      searchHistoryId,
      error,
    });
    return [];
  }
}

/**
 * Get claim text for a search history
 */
export async function getClaimText(
  searchHistoryId: string
): Promise<string | null> {
  if (!prismaClient) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    // Get the project ID from search history
    const searchHistory = await prismaClient.searchHistory.findUnique({
      where: { id: searchHistoryId },
      select: {
        projectId: true,
      },
    });

    if (!searchHistory?.projectId) {
      return null;
    }

    // Fetch claim 1 from the Claim model
    const claim = await prismaClient.claim.findFirst({
      where: {
        invention: {
          projectId: searchHistory.projectId,
        },
        number: 1,
      },
      select: {
        text: true,
      },
    });

    return claim?.text || null;
  } catch (error) {
    logger.error('[CitationUtils] Error getting claim text', {
      searchHistoryId,
      error,
    });
    return null;
  }
}

/**
 * Get prior art abstract for a specific reference
 */
export async function getPriorArtAbstract(
  searchHistoryId: string,
  referenceNumber: string
): Promise<string | null> {
  if (!prismaClient) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    const searchHistory = await prismaClient.searchHistory.findUnique({
      where: { id: searchHistoryId },
      select: { results: true },
    });

    if (!searchHistory?.results) {
      return null;
    }

    // Parse results to find the specific reference
    const results = safeJsonParse<
      Array<{
        number?: string;
        abstract?: string;
        [key: string]: unknown;
      }>
    >(searchHistory.results, []);

    if (!Array.isArray(results)) {
      return null;
    }

    // Find the matching reference
    const reference = results.find(ref => ref.number === referenceNumber);
    return reference?.abstract || null;
  } catch (error) {
    logger.error('[CitationUtils] Error getting prior art abstract', {
      searchHistoryId,
      referenceNumber,
      error,
    });
    return null;
  }
}
