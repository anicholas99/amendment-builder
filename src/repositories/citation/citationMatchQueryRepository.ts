/**
 * Citation Match Query Repository
 *
 * Handles complex query operations for citation matches.
 * Provides advanced search and filtering capabilities with support for metadata and placeholders.
 */

import { prisma } from '@/lib/prisma';
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { Prisma, CitationMatch } from '@prisma/client';

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
