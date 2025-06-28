/**
 * Citation Processing Service
 *
 * Orchestrates the complex workflow of processing citation results.
 * This service layer properly separates business logic from data access.
 */

import { logger } from '@/lib/monitoring/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
// Import from consolidated repositories
import {
  saveCitationResult,
  update as updateCitationJob,
  findById as getCitationJobById,
} from '@/repositories/citationJobRepository';
import {
  deleteCitationMatchesByJobId,
  createCitationMatches,
  findMatchesByJobId,
} from '@/repositories/citationMatchRepository';
import { getPatentDetails } from '@/lib/clients/patbase/patbaseClient';
import {
  parseCitationResults,
  extractCitationMatches,
  normalizeCitationScore,
  CitationMatchData,
  PatentMetadata,
} from '@/repositories/citationUtils';
import { QueueService } from '@/lib/queue/queueService';
import { Prisma } from '@prisma/client';
import { environment } from '@/config/environment';

const queueService = new QueueService();

type ProcessResultsParams = {
  jobId: string;
  resultsData: string | null;
  searchInputs: string[];
  jobStatus: string;
  errorMessage?: string;
};

export class CitationProcessingService {
  /**
   * Main orchestration method for processing citation results
   */
  async processCitationResults({
    jobId,
    resultsData,
    searchInputs,
    jobStatus,
    errorMessage,
  }: ProcessResultsParams): Promise<{ success: boolean; error?: string }> {
    logger.info(
      `[CitationProcessingService] Processing results for job ${jobId}`,
      {
        jobId,
        jobStatus,
        hasResults: !!resultsData,
      }
    );

    try {
      // 1. Fetch job details using repository
      const job = await getCitationJobById(jobId);

      if (!job) {
        logger.error(
          `[CitationProcessing] CitationJob not found with ID: ${jobId}`
        );
        return { success: false, error: `CitationJob not found: ${jobId}` };
      }

      if (!job.searchHistoryId) {
        logger.error(
          `[CitationProcessing] CitationJob ${jobId} is missing searchHistoryId`
        );
        return {
          success: false,
          error: `CitationJob ${jobId} has no associated SearchHistory`,
        };
      }

      // 2. Fetch patent metadata if available
      let fetchedMetadata: PatentMetadata | null = null;
      if (job.referenceNumber) {
        try {
          // First try to get metadata from search history results
          const { findSearchHistoryById } = await import(
            '@/repositories/search/searchHistory.repository'
          );
          const searchHistory = await findSearchHistoryById(
            job.searchHistoryId
          );

          if (searchHistory?.results && Array.isArray(searchHistory.results)) {
            const reference = searchHistory.results.find(
              (ref: { number: string }) => ref.number === job.referenceNumber
            );

            if (reference) {
              fetchedMetadata = {
                title:
                  typeof reference.title === 'string' ? reference.title : null,
                applicant: Array.isArray(reference.authors)
                  ? reference.authors.join(', ')
                  : typeof reference.authors === 'string'
                    ? reference.authors
                    : null,
                assignee:
                  typeof reference.assignee === 'string'
                    ? reference.assignee
                    : null,
                publicationDate:
                  typeof reference.publicationDate === 'string'
                    ? reference.publicationDate
                    : null,
                abstract:
                  typeof reference.abstract === 'string'
                    ? reference.abstract
                    : null,
              };
              logger.debug(
                `[CitationProcessing] Extracted metadata from search history for ${job.referenceNumber}`
              );
            }
          }

          // Fallback to PatBase if no metadata found in search history
          if (!fetchedMetadata) {
            fetchedMetadata = await getPatentDetails(job.referenceNumber);
            logger.debug(
              `[CitationProcessing] Fetched metadata from PatBase for ${job.referenceNumber}`
            );
          }
        } catch (metadataError) {
          logger.warn(
            `[CitationProcessing] Failed to fetch metadata: ${metadataError}`
          );
        }
      }

      // 3. Process the citation results
      // Note: In a proper implementation, the repository layer should handle transactions
      // For now, we'll call repository functions sequentially

      try {
        // Process matches if job completed successfully
        if (jobStatus.toUpperCase() === 'COMPLETED' && resultsData) {
          // Check if deep analysis is enabled
          const ENABLE_DEEP_ANALYSIS =
            environment.features.enableDeepAnalysis || false;

          if (!ENABLE_DEEP_ANALYSIS) {
            // Only create matches if deep analysis is disabled (legacy flow)
            await this.processAndSaveMatches(
              jobId,
              job.searchHistoryId,
              resultsData,
              searchInputs,
              job.referenceNumber || 'UNKNOWN',
              fetchedMetadata
            );
          }
          // If deep analysis is enabled, matches will be created after deep analysis completes
        }

        // Update job status
        await updateCitationJob(jobId, {
          status: jobStatus.toUpperCase(),
          completedAt:
            jobStatus.toUpperCase() === 'COMPLETED' ? new Date() : undefined,
          errorMessage: errorMessage || null,
          rawResultData: resultsData,
        });

        // 4. Queue analysis jobs if enabled
        if (jobStatus.toUpperCase() === 'COMPLETED' && resultsData) {
          await this.queueAnalysisJobs(jobId);
        }

        return { success: true };
      } catch (innerError) {
        logger.error(
          `[CitationProcessing] Failed to process results for job ${jobId}:`,
          { error: innerError }
        );
        throw innerError;
      }
    } catch (error) {
      logger.error(
        `[CitationProcessing] Error processing results for job ${jobId}:`,
        { error }
      );
      return {
        success: false,
        error: `Failed to process citation results: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Process and save citation matches
   */
  private async processAndSaveMatches(
    jobId: string,
    searchHistoryId: string,
    resultsData: string,
    searchInputs: string[],
    referenceNumber: string,
    metadata: PatentMetadata | null
  ): Promise<void> {
    const parsedResults = parseCitationResults(resultsData);
    const actualMatches = extractCitationMatches(parsedResults);

    logger.debug(
      `[CitationProcessing] Processing ${actualMatches.length} matches for job ${jobId}`
    );

    const TOP_N_MATCHES = 2;
    const matchesToCreate: Prisma.CitationMatchCreateManyInput[] = [];

    // Process each search input
    for (let i = 0; i < searchInputs.length; i++) {
      const elementText = searchInputs[i];
      if (!elementText) continue;

      const elementMatches =
        Array.isArray(parsedResults) && Array.isArray(parsedResults[i])
          ? (parsedResults as CitationMatchData[][])[i]
          : [];

      const topMatches = Array.isArray(elementMatches)
        ? elementMatches.slice(0, TOP_N_MATCHES)
        : [];

      for (const match of topMatches) {
        const score = normalizeCitationScore(match);

        const matchData = {
          searchHistoryId,
          citationJobId: jobId,
          referenceNumber,
          citation: match.citation || 'N/A',
          paragraph: match.paragraph || null,
          score,
          parsedElementText: elementText,
          elementOrder: i, // Set the order based on position in searchInputs array
          locationStatus: 'PENDING',
          reasoningStatus: 'PENDING',
          referenceTitle: metadata?.title || null,
          referenceApplicant: metadata?.applicant || null,
          referenceAssignee: metadata?.assignee || null,
          referencePublicationDate: metadata?.publicationDate || null,
          // Mark as legacy extraction
          analysisSource: 'RAW_EXTRACTION',
          isTopResult: false,
        } as Prisma.CitationMatchCreateManyInput;

        matchesToCreate.push(matchData);
      }
    }

    // Delete existing matches and create new ones
    if (matchesToCreate.length > 0) {
      await deleteCitationMatchesByJobId(null, jobId);
      const result = await createCitationMatches(null, matchesToCreate);
      logger.info(
        `[CitationProcessing] Created ${result.count} citation matches for job ${jobId}`
      );
    }
  }

  /**
   * Queue background analysis jobs
   */
  private async queueAnalysisJobs(citationJobId: string): Promise<void> {
    // Queue deep analysis first (if enabled)
    await this.queueDeepAnalysis(citationJobId);

    // Check if deep analysis is enabled - if so, skip individual reasoning
    const ENABLE_DEEP_ANALYSIS =
      environment.features.enableDeepAnalysis || false;

    if (ENABLE_DEEP_ANALYSIS) {
      logger.info(
        `[CitationProcessing] Skipping individual reasoning analysis - deep analysis will handle it`
      );
      return;
    }

    // Legacy flow: Process individual reasoning if deep analysis is disabled
    const citationMatches = await findMatchesByJobId(citationJobId);

    // Queue unique reasoning jobs (one per element)
    const uniqueElements = new Map<string, any>();
    citationMatches.forEach((match: { id: string; elementText?: string; citationText?: string }) => {
      if (
        match.parsedElementText &&
        !uniqueElements.has(match.parsedElementText)
      ) {
        uniqueElements.set(match.parsedElementText, match);
      }
    });

    logger.info(
      `[CitationProcessing] Processing ${uniqueElements.size} reasoning analysis jobs`
    );

    logger.debug('[CitationJobService] Processing reasoning inline');
    // Process reasoning inline since there's no worker for the reasoning queue
    const { AIAnalysisService } = await import('@/server/ai/reasoningService');

    const entries = Array.from(uniqueElements.entries());
    for (const [elementText, match] of entries) {
      try {
        // Process reasoning directly instead of queuing
        setImmediate(async () => {
          try {
            await AIAnalysisService.processReasoningJobDirect({
              id: match.id,
              citation: match.citation || '',
              parsedElementText: match.parsedElementText || '',
              referenceNumber: match.referenceNumber || '',
              searchHistoryId: match.searchHistoryId,
              referenceTitle: match.referenceTitle || null,
              referenceApplicant: match.referenceApplicant || null,
              referenceAssignee: match.referenceAssignee || null,
              referencePublicationDate: match.referencePublicationDate || null,
            });
            logger.info(
              `[CitationProcessing] Completed reasoning for match ${match.id}`
            );
          } catch (error) {
            logger.error(
              `[CitationProcessing] Failed reasoning for match ${match.id}:`,
              { error }
            );
          }
        });
      } catch (error) {
        logger.error(`[CitationProcessing] Error starting reasoning job:`, {
          error,
        });
      }
    }

    logger.info(
      `[CitationProcessing] Started all reasoning analysis jobs for job ${citationJobId}`
    );
  }

  /**
   * Queue deep analysis if enabled
   */
  async queueDeepAnalysis(jobId: string): Promise<void> {
    const ENABLE_DEEP_ANALYSIS =
      environment.features.enableDeepAnalysis || false;

    if (!ENABLE_DEEP_ANALYSIS) {
      logger.debug('[CitationProcessing] Deep analysis is disabled');
      return;
    }

    try {
      // Use inline processing instead of queue
      const { queueDeepAnalysisInline } = await import(
        './deep-analysis-inline.server.service'
      );
      await queueDeepAnalysisInline({ jobId });
      logger.info(`[CitationProcessing] Queued deep analysis for job ${jobId}`);
    } catch (error) {
      logger.error(`[CitationProcessing] Error queuing deep analysis:`, {
        error,
      });
    }
  }

  /**
   * Queue examiner analysis if enabled
   */
  async queueExaminerAnalysis(jobId: string): Promise<void> {
    const ENABLE_EXAMINER_ANALYSIS =
      environment.features.enableExaminerAnalysis || false;

    if (!ENABLE_EXAMINER_ANALYSIS) {
      logger.debug('[CitationProcessing] Examiner analysis is disabled');
      return;
    }

    try {
      await queueService.enqueue('citation-examiner-analysis', { jobId });
      logger.info(
        `[CitationProcessing] Queued examiner analysis for job ${jobId}`
      );
    } catch (error) {
      logger.error(`[CitationProcessing] Error queuing examiner analysis:`, {
        error,
      });
    }
  }

  /**
   * Save results and consolidate matches
   */
  private async saveResultsAndConsolidate(
    jobId: string,
    searchHistoryId: string,
    resultsData: string,
    searchInputs: string[],
    jobStatus: string,
    errorMessage?: string
  ) {
    // 1. Save raw results
    // Note: saveCitationResult expects a transaction client as first parameter
    // Since we're not in a transaction here, we need to update this logic
    logger.warn(
      '[CitationProcessingService] saveResultsAndConsolidate needs to be updated to use proper transaction handling'
    );

    // Placeholder for actual job queuing logic for location and reasoning
  }
}

// Export singleton instance
export const citationProcessingService = new CitationProcessingService();
