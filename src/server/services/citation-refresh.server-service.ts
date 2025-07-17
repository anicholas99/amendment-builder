/**
 * Citation Refresh Service
 *
 * Handles refreshing citation extractions and deep analyses when claims have changed.
 * This is used by combined analysis to ensure all analyses are up-to-date.
 */

import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { prisma } from '@/lib/prisma';
import {
  generateClaimHash,
  CURRENT_PARSER_VERSION,
  isCitationJobStale,
} from '@/utils/claimVersioning';
import { CitationsServerService } from './citations.server.service';
import { processCitationExtractionInline } from './citation-extraction-inline.server.service';
import { processDeepAnalysisInline } from './deep-analysis-inline.server.service';
import { ClaimsServerService } from './claims.server.service';
import * as citationJobRepository from '@/repositories/citationJobRepository';

interface RefreshCitationParams {
  citationJobId: string;
  searchHistoryId: string;
  referenceNumber: string;
  currentClaim1Text: string;
  parsedElements: string[];
}

export class CitationRefreshService {
  /**
   * Refresh a citation job by re-running extraction and deep analysis
   */
  static async refreshCitation({
    citationJobId,
    searchHistoryId,
    referenceNumber,
    currentClaim1Text,
    parsedElements,
  }: RefreshCitationParams): Promise<string> {
    logger.info('[CitationRefresh] Starting citation refresh', {
      citationJobId,
      referenceNumber,
      elementsCount: parsedElements.length,
    });

    try {
      // Generate current claim hash
      const currentClaimHash = generateClaimHash(currentClaim1Text);

      // Create a new citation job for the refresh
      const newJob = await CitationsServerService.createCitationJob({
        searchHistoryId,
        searchInputs: parsedElements,
        filterReferenceNumber: referenceNumber,
        threshold: 0.85, // Use default threshold
      });

      logger.info('[CitationRefresh] Created new citation job', {
        oldJobId: citationJobId,
        newJobId: newJob.id,
        referenceNumber,
      });

      // Process extraction inline (synchronously)
      await processCitationExtractionInline({
        jobId: newJob.id,
        searchInputs: parsedElements,
        referenceNumber,
        threshold: 0.85,
      });

      // Wait for extraction to complete
      const maxWaitTime = 60000; // 60 seconds
      const pollInterval = 2000; // 2 seconds
      let elapsed = 0;

      while (elapsed < maxWaitTime) {
        const job = await citationJobRepository.findById(newJob.id);
        if (!job) {
          throw new ApplicationError(
            ErrorCode.DB_RECORD_NOT_FOUND,
            'Citation job not found during refresh'
          );
        }

        if (job.status === 'COMPLETED') {
          logger.info('[CitationRefresh] Extraction completed', {
            jobId: newJob.id,
            referenceNumber,
          });

          // Now run deep analysis
          await processDeepAnalysisInline({
            jobId: newJob.id,
          });

          // Wait for deep analysis to complete
          let deepAnalysisElapsed = 0;
          while (deepAnalysisElapsed < maxWaitTime) {
            const updatedJob = await citationJobRepository.findById(newJob.id);
            if (updatedJob?.deepAnalysisJson) {
              logger.info('[CitationRefresh] Deep analysis completed', {
                jobId: newJob.id,
                referenceNumber,
              });
              return newJob.id;
            }

            await new Promise(resolve => setTimeout(resolve, pollInterval));
            deepAnalysisElapsed += pollInterval;
          }

          throw new ApplicationError(
            ErrorCode.API_TIMEOUT,
            'Deep analysis timed out during refresh'
          );
        }

        if (job.status === 'ERROR_PROCESSING' || job.status === 'FAILED') {
          throw new ApplicationError(
            ErrorCode.CITATION_EXTERNAL_API_ERROR,
            `Citation refresh failed: ${job.errorMessage || 'Unknown error'}`
          );
        }

        await new Promise(resolve => setTimeout(resolve, pollInterval));
        elapsed += pollInterval;
      }

      throw new ApplicationError(
        ErrorCode.API_TIMEOUT,
        'Citation extraction timed out during refresh'
      );
    } catch (error) {
      logger.error('[CitationRefresh] Failed to refresh citation', {
        error,
        citationJobId,
        referenceNumber,
      });
      throw error;
    }
  }

  /**
   * Check which citations need refreshing and refresh them
   */
  static async refreshStaleAnalyses(
    citationJobs: Array<{
      id: string;
      referenceNumber: string | null;
      claim1Hash?: string | null;
      parserVersionUsed?: string | null;
      searchHistoryId: string;
    }>,
    currentClaim1Text: string,
    existingParsedElements: string[],
    projectId?: string
  ): Promise<Map<string, string>> {
    const currentClaimHash = generateClaimHash(currentClaim1Text);
    const refreshedJobMap = new Map<string, string>(); // old job ID -> new job ID

    // Find stale jobs
    const staleJobs = citationJobs.filter(job =>
      isCitationJobStale(
        job.claim1Hash,
        currentClaimHash,
        job.parserVersionUsed
      )
    );

    if (staleJobs.length === 0) {
      logger.info('[CitationRefresh] No stale jobs found');
      return refreshedJobMap;
    }

    logger.info('[CitationRefresh] Found stale jobs to refresh', {
      staleCount: staleJobs.length,
      staleRefs: staleJobs.map(j => j.referenceNumber),
    });

    // Check if we need to reparse the claim
    let parsedElements = existingParsedElements;
    let needsReparsing = false;

    // If any job has a different claim hash or no parsed elements, we need to reparse
    if (
      staleJobs.some(job => job.claim1Hash !== currentClaimHash) ||
      existingParsedElements.length === 0
    ) {
      needsReparsing = true;
    }

    if (needsReparsing) {
      logger.info('[CitationRefresh] Reparsing claim due to changes', {
        currentClaimHash,
        existingElementsCount: existingParsedElements.length,
      });

      try {
        // Reparse the claim to get new elements
        parsedElements =
          await ClaimsServerService.extractClaimElementsV2(currentClaim1Text);

        logger.info('[CitationRefresh] Successfully reparsed claim', {
          oldElementsCount: existingParsedElements.length,
          newElementsCount: parsedElements.length,
        });

        // Update the invention with new parsed elements if we have a projectId
        if (projectId && prisma) {
          try {
            const invention = await prisma.invention.findUnique({
              where: { projectId },
              select: { id: true },
            });

            if (invention) {
              await prisma.invention.update({
                where: { id: invention.id },
                data: {
                  parsedClaimElementsJson: JSON.stringify(parsedElements),
                  // @ts-ignore - Fields exist after migration 20250714182540
                  claim1Hash: currentClaimHash,
                  // @ts-ignore - Fields exist after migration 20250714182540
                  claim1ParsedAt: new Date(),
                  // @ts-ignore - Fields exist after migration 20250714182540
                  parserVersion: CURRENT_PARSER_VERSION,
                },
              });

              logger.info(
                '[CitationRefresh] Updated invention with new parsed elements',
                {
                  inventionId: invention.id,
                  elementCount: parsedElements.length,
                }
              );
            }
          } catch (error) {
            logger.warn(
              '[CitationRefresh] Failed to update invention with parsed elements',
              {
                error,
                projectId,
              }
            );
            // Continue with refresh even if update fails
          }
        }
      } catch (error) {
        logger.error('[CitationRefresh] Failed to reparse claim', {
          error,
          claimLength: currentClaim1Text.length,
        });
        // Fall back to existing parsed elements if reparsing fails
        parsedElements = existingParsedElements;
      }
    }

    // Refresh each stale job with the (potentially new) parsed elements
    const refreshPromises = staleJobs.map(async job => {
      if (!job.referenceNumber) {
        logger.warn('[CitationRefresh] Skipping job without reference number', {
          jobId: job.id,
        });
        return;
      }

      try {
        const newJobId = await CitationRefreshService.refreshCitation({
          citationJobId: job.id,
          searchHistoryId: job.searchHistoryId,
          referenceNumber: job.referenceNumber,
          currentClaim1Text,
          parsedElements, // Use the (potentially reparsed) elements
        });

        refreshedJobMap.set(job.id, newJobId);
      } catch (error) {
        logger.error('[CitationRefresh] Failed to refresh job', {
          jobId: job.id,
          referenceNumber: job.referenceNumber,
          error,
        });
        // Continue with other refreshes even if one fails
      }
    });

    await Promise.all(refreshPromises);

    logger.info('[CitationRefresh] Completed refreshing stale analyses', {
      refreshedCount: refreshedJobMap.size,
      totalStale: staleJobs.length,
      claimWasReparsed: needsReparsing,
    });

    return refreshedJobMap;
  }
}
