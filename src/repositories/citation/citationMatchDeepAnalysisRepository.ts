/**
 * Citation Match Deep Analysis Repository
 *
 * Handles operations related to deep analysis of citation matches.
 * Creates and manages citation matches from AI-powered deep analysis results.
 */

import { prisma } from '@/lib/prisma';
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { Prisma } from '@prisma/client';

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
