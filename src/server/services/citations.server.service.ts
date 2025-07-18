import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import {
  processCitationJob,
  processCitationJobs,
} from '@/features/citation-extraction/utils/citationJob';
import { EnhancedProcessedCitationJob } from '@/types/domain/citation';
import * as CitationJobRepository from '@/repositories/citationJobRepository';
import { CreateCitationJobBody } from '@/types/api/citations';
import { queueCitationExtractionInline } from '@/server/services/citation-extraction-inline.server.service';
import { QueueServerService } from '@/server/services/queue.server.service';
import { environment } from '@/config/environment';
import { CITATION_THRESHOLDS } from '@/config/citationExtractionConfig';
import {
  generateClaimHash,
  CURRENT_PARSER_VERSION,
} from '@/utils/claimVersioning';
import { prisma } from '@/lib/prisma';

/**
 * Server-side service for managing citation jobs.
 * This service orchestrates the creation of jobs in the database
 * and the queuing of background work.
 */
export class CitationsServerService {
  /**
   * Create a new citation job with validation
   */
  static async createCitationJob(
    data: CreateCitationJobBody
  ): Promise<EnhancedProcessedCitationJob> {
    logger.debug('[CitationJobService] Creating new citation job', { data });

    try {
      // Get current claim 1 hash if available
      let claim1Hash: string | null = null;
      let parsedElementsUsed: string[] | null = null;

      try {
        // Get project ID from search history
        const searchHistory = await prisma?.searchHistory.findUnique({
          where: { id: data.searchHistoryId },
          select: {
            projectId: true,
          },
        });

        if (searchHistory?.projectId && prisma) {
          // Get invention and claim 1
          const invention = await prisma.invention.findUnique({
            where: { projectId: searchHistory.projectId },
            select: {
              id: true,
              parsedClaimElementsJson: true,
            },
          });

          if (invention) {
            const claim1 = await prisma.claim.findFirst({
              where: {
                inventionId: invention.id,
                number: 1,
              },
              select: { text: true },
            });

            if (claim1) {
              claim1Hash = generateClaimHash(claim1.text);
              logger.debug('[CitationJobService] Generated claim 1 hash', {
                projectId: searchHistory.projectId,
                hashLength: claim1Hash.length,
              });
            }

            // Get parsed elements from invention if available
            if (invention.parsedClaimElementsJson) {
              try {
                parsedElementsUsed = JSON.parse(
                  invention.parsedClaimElementsJson
                );
              } catch (e) {
                logger.warn('[CitationJobService] Failed to parse elements', {
                  error: e,
                });
              }
            }
          }
        }
      } catch (error) {
        logger.warn('[CitationJobService] Could not get claim hash', { error });
        // Continue without hash - don't fail job creation
      }

      // Create job data with tracking fields
      const jobData: any = {
        searchHistoryId: data.searchHistoryId,
        referenceNumber: data.filterReferenceNumber,
        status: 'PENDING',
      };

      // Add tracking fields if migration has been applied
      if (claim1Hash && prisma) {
        try {
          const jobId = require('crypto').randomUUID();
          await prisma.$executeRaw`
            INSERT INTO citation_jobs (
              id, searchHistoryId, referenceNumber, status, createdAt,
              claim1Hash, parserVersionUsed, parsedElementsUsed
            ) VALUES (
              ${jobId},
              ${data.searchHistoryId},
              ${data.filterReferenceNumber || null},
              'PENDING',
              ${new Date()},
              ${claim1Hash},
              ${CURRENT_PARSER_VERSION},
              ${JSON.stringify(parsedElementsUsed || [])}
            )
          `;

          // Get the created job
          const job = await prisma.citationJob.findUnique({
            where: { id: jobId },
          });

          if (!job) {
            throw new Error('Failed to create citation job');
          }

          logger.info(
            `[CitationJobService] Created job ${job.id} with claim tracking`
          );

          // Continue with the rest of the method using the created job...
          // Check feature flag for processing mode
          if (environment.features.useCitationWorker) {
            // Create service instance for server-side usage
            const queueService = new QueueServerService();

            // Use external worker via Azure queue
            await queueService.sendMessage({
              type: 'CITATION_EXTRACTION',
              payload: {
                jobId: job.id,
                searchInputs: data.searchInputs,
              },
            });
            logger.info('Citation job sent to external processing queue', {
              jobId: job.id,
            });
          } else {
            // Log the parameters being passed to inline processing
            logger.debug('[CitationJobService] Passing to inline processing', {
              jobId: job.id,
              referenceNumber: data.filterReferenceNumber,
              hasReferenceNumber: !!data.filterReferenceNumber,
              threshold: data.threshold || CITATION_THRESHOLDS.default,
              searchInputsCount: data.searchInputs?.length || 0,
            });

            // Process job inline without external workers
            await queueCitationExtractionInline({
              jobId: job.id,
              searchInputs: data.searchInputs,
              referenceNumber: data.filterReferenceNumber,
              threshold: data.threshold || CITATION_THRESHOLDS.default,
            });
            logger.info('Citation job queued for inline processing', {
              jobId: job.id,
            });
          }

          return processCitationJob(job);
        } catch (rawError) {
          logger.warn(
            '[CitationJobService] Could not create job with tracking fields',
            { error: rawError }
          );
          // Fall back to regular creation
        }
      }

      // Fallback: Delegate to repository for data creation without tracking
      const job = await CitationJobRepository.create(jobData);

      logger.info(`[CitationJobService] Created job ${job.id}`);

      // Check feature flag for processing mode
      if (environment.features.useCitationWorker) {
        // Create service instance for server-side usage
        const queueService = new QueueServerService();

        // Use external worker via Azure queue
        await queueService.sendMessage({
          type: 'CITATION_EXTRACTION',
          payload: {
            jobId: job.id,
            searchInputs: data.searchInputs,
          },
        });
        logger.info('Citation job sent to external processing queue', {
          jobId: job.id,
        });
      } else {
        // Log the parameters being passed to inline processing
        logger.debug('[CitationJobService] Passing to inline processing', {
          jobId: job.id,
          referenceNumber: data.filterReferenceNumber,
          hasReferenceNumber: !!data.filterReferenceNumber,
          threshold: data.threshold || CITATION_THRESHOLDS.default,
          searchInputsCount: data.searchInputs?.length || 0,
        });

        // Process job inline without external workers
        await queueCitationExtractionInline({
          jobId: job.id,
          searchInputs: data.searchInputs,
          referenceNumber: data.filterReferenceNumber,
          threshold: data.threshold || CITATION_THRESHOLDS.default,
        });
        logger.info('Citation job queued for inline processing', {
          jobId: job.id,
        });
      }

      return processCitationJob(job);
    } catch (error) {
      logger.error('[CitationJobService] Error creating citation job', {
        error,
        data,
      });

      if (error instanceof Error && 'code' in error) {
        const prismaError = error as any;
        if (prismaError.code === 'P2002') {
          throw new ApplicationError(
            ErrorCode.DB_DUPLICATE_ENTRY,
            'A citation job with this external ID already exists'
          );
        }
        if (prismaError.code === 'P2003') {
          throw new ApplicationError(
            ErrorCode.DB_CONSTRAINT_VIOLATION,
            'Invalid searchHistoryId reference'
          );
        }
      }
      throw error;
    }
  }

  /**
   * Update citation job with business logic for status transitions
   */
  static async updateCitationJobWithResults(
    jobId: string,
    status: string,
    resultsData?: string | { error?: string } | undefined
  ): Promise<EnhancedProcessedCitationJob> {
    logger.debug(
      `[CitationJobService] Updating job ${jobId} with status: ${status}`
    );

    // Business logic: Build update data based on status
    const updateData: any = {
      status,
      lastCheckedAt: new Date(),
    };

    // Business logic: Set startedAt for in-progress jobs
    if (status === 'IN_PROGRESS' && !updateData.startedAt) {
      updateData.startedAt = new Date();
    }

    // Business logic: Set completedAt for terminal statuses
    if (status === 'COMPLETED' || status === 'FAILED') {
      updateData.completedAt = new Date();
    }

    // Business logic: Handle error data for failed jobs
    if (status === 'FAILED' && resultsData) {
      const errorMessage =
        typeof resultsData === 'string'
          ? resultsData
          : resultsData.error || 'Unknown error';
      updateData.error = errorMessage;
      updateData.errorMessage = errorMessage;
    }

    // Business logic: Handle results data for completed jobs
    if (
      status === 'COMPLETED' &&
      resultsData &&
      typeof resultsData === 'string'
    ) {
      updateData.rawResultData = resultsData;
    }

    try {
      // Delegate to repository for data update
      const updatedJob = await CitationJobRepository.update(
        jobId,
        updateData,
        true
      );
      logger.info(
        `[CitationJobService] Updated job ${jobId} to status ${status}`
      );
      return processCitationJob(updatedJob);
    } catch (error) {
      logger.error(`[CitationJobService] Error updating job ${jobId}`, {
        error,
      });
      if (error instanceof Error && 'code' in error) {
        const prismaError = error as any;
        if (prismaError.code === 'P2025') {
          throw new ApplicationError(
            ErrorCode.DB_RECORD_NOT_FOUND,
            `Citation job ${jobId} not found`
          );
        }
      }
      throw error;
    }
  }

  /**
   * Get citation jobs by search history with business logic filtering
   */
  static async getCitationJobsBySearchHistoryId(
    searchHistoryId: string,
    status: string = 'completed'
  ): Promise<EnhancedProcessedCitationJob[]> {
    logger.debug(
      `[CitationJobService] Getting jobs for search history ${searchHistoryId} with status ${status}`
    );

    // Business logic: Map status filter to database values
    const statusFilter =
      status === 'completed'
        ? { in: ['COMPLETED', 'completed', 'COMPLETED_EXTERNAL'] }
        : status;

    try {
      const jobs = await CitationJobRepository.findManyBySearchHistory(
        searchHistoryId,
        statusFilter
      );
      logger.debug(
        `[CitationJobService] Found ${jobs.length} jobs for search history ${searchHistoryId}`
      );

      return processCitationJobs(jobs);
    } catch (error) {
      logger.error(
        `[CitationJobService] Error getting jobs for search history ${searchHistoryId}`,
        { error }
      );
      throw error;
    }
  }

  /**
   * Get citation job statistics with business aggregation
   */
  static async getCitationJobStatistics() {
    logger.debug('[CitationJobService] Getting job statistics');

    try {
      const stats = await CitationJobRepository.getStatistics();
      return stats;
    } catch (error) {
      logger.error('[CitationJobService] Error getting job statistics', {
        error,
      });
      throw error;
    }
  }

  /**
   * Get citation job counts by status with business logic aggregation
   */
  static async getCitationJobCountsByStatus(
    searchHistoryIds: string[]
  ): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    failed: number;
  }> {
    logger.debug(
      `[CitationJobService] Getting job counts for ${searchHistoryIds.length} search histories`
    );

    try {
      // Business logic: Aggregate counts across multiple statuses
      const [total, pending, inProgress, completed, failed] = await Promise.all(
        [
          CitationJobRepository.countBySearchHistories(searchHistoryIds),
          CitationJobRepository.countBySearchHistoriesAndStatus(
            searchHistoryIds,
            ['PENDING', 'pending']
          ),
          CitationJobRepository.countBySearchHistoriesAndStatus(
            searchHistoryIds,
            ['IN_PROGRESS', 'in_progress', 'PROCESSING', 'processing']
          ),
          CitationJobRepository.countBySearchHistoriesAndStatus(
            searchHistoryIds,
            ['COMPLETED', 'completed']
          ),
          CitationJobRepository.countBySearchHistoriesAndStatus(
            searchHistoryIds,
            ['FAILED', 'failed', 'ERROR', 'error']
          ),
        ]
      );

      logger.debug(`[CitationJobService] Retrieved job counts`, {
        total,
        pending,
        inProgress,
        completed,
        failed,
      });

      return { total, pending, inProgress, completed, failed };
    } catch (error) {
      logger.error(`[CitationJobService] Error getting job counts`, { error });
      throw error;
    }
  }

  /**
   * Update citation job deep analysis data
   */
  static async updateDeepAnalysis(jobId: string, deepAnalysisJson: string) {
    logger.debug(
      `[CitationJobService] Updating job ${jobId} with deep analysis data`
    );

    try {
      return await CitationJobRepository.update(jobId, { deepAnalysisJson });
    } catch (error) {
      logger.error(
        `[CitationJobService] Error updating deep analysis for ${jobId}`,
        { error }
      );
      throw error;
    }
  }

  /**
   * Update citation job examiner analysis data
   */
  static async updateExaminerAnalysis(
    jobId: string,
    examinerAnalysisJson: string
  ) {
    logger.debug(
      `[CitationJobService] Updating job ${jobId} with examiner analysis data`
    );

    try {
      return await CitationJobRepository.update(jobId, {
        examinerAnalysisJson,
      });
    } catch (error) {
      logger.error(
        `[CitationJobService] Error updating examiner analysis for ${jobId}`,
        { error }
      );
      throw error;
    }
  }

  /**
   * Find citation jobs with examiner analysis by criteria
   */
  static async findJobWithExaminerAnalysis(
    referenceNumber: string,
    searchHistoryId: string
  ): Promise<{
    id: string;
    examinerAnalysisJson?: string | null;
    status: string;
  } | null> {
    logger.debug(
      `[CitationJobService] Finding job with examiner analysis by reference ${referenceNumber}, search ${searchHistoryId}`
    );

    try {
      return await CitationJobRepository.findWithExaminerAnalysis(
        referenceNumber,
        searchHistoryId
      );
    } catch (error) {
      logger.error(
        `[CitationJobService] Error finding job with examiner analysis`,
        { error }
      );
      throw error;
    }
  }

  /**
   * Get jobs with completed deep analysis
   */
  static async getJobsWithDeepAnalysis(limit: number = 10) {
    logger.debug(
      '[CitationJobService] Getting jobs with completed deep analysis',
      { limit }
    );

    try {
      return await CitationJobRepository.findWithDeepAnalysis(limit);
    } catch (error) {
      logger.error(
        `[CitationJobService] Error getting jobs with deep analysis`,
        { error }
      );
      throw error;
    }
  }

  // Delegate simple getters to repository (no business logic needed)
  static async getById(jobId: string) {
    return CitationJobRepository.findById(jobId);
  }

  static async getByExternalId(externalJobId: number) {
    return CitationJobRepository.findByExternalId(externalJobId);
  }

  static async getWithResult(jobId: string) {
    return CitationJobRepository.findWithResult(jobId);
  }

  static async getWithTenantInfo(jobId: string) {
    return CitationJobRepository.findWithTenantInfo(jobId);
  }

  static async getDetailsForRetry(jobId: string) {
    return CitationJobRepository.findById(jobId);
  }

  static async getWithFullDetailsForExaminerAnalysis(jobId: string) {
    return CitationJobRepository.findWithFullDetailsForExaminerAnalysis(jobId);
  }

  static async getDeepAnalysisByIds(jobIds: string[]) {
    return CitationJobRepository.findDeepAnalysisByIds(jobIds);
  }

  static async findByReferenceAndSearch(
    referenceNumber: string,
    searchHistoryId: string
  ) {
    return CitationJobRepository.findByReferenceAndSearch(
      referenceNumber,
      searchHistoryId
    );
  }

  static async getWithVerifiedAccess(
    jobIds: string[],
    tenantId: string,
    userId: string
  ) {
    return CitationJobRepository.findWithVerifiedAccess(
      jobIds,
      tenantId,
      userId
    );
  }
}
