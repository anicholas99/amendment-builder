import { logger } from '@/utils/clientLogger';
import { CitationJob } from '@prisma/client';
import {
  generateClaimHash,
  getStaleCitationJobs,
} from '@/utils/claimVersioning';
import { API_ROUTES } from '@/constants/apiRoutes';
import { apiFetch } from '@/lib/api/apiClient';
import { ApplicationError, ErrorCode } from '@/lib/error';

export interface CitationFreshnessCheck {
  projectId: string;
  currentClaim1Text: string;
  citationJobs: Array<{
    id: string;
    claim1Hash?: string | null;
    parserVersionUsed?: string | null;
    referenceNumber?: string | null;
    status?: string;
  }>;
}

export interface CitationFreshnessResult {
  isAllFresh: boolean;
  staleJobIds: string[];
  staleReferences: string[];
  currentClaimHash: string;
  message?: string;
}

export class CitationFreshnessService {
  /**
   * Check if all citation jobs are fresh based on current claim 1 text
   */
  static async checkFreshness(
    params: CitationFreshnessCheck
  ): Promise<CitationFreshnessResult> {
    const { projectId, currentClaim1Text, citationJobs } = params;

    if (!currentClaim1Text || currentClaim1Text.trim() === '') {
      logger.warn('[CitationFreshnessService] No claim 1 text provided');
      return {
        isAllFresh: false,
        staleJobIds: [],
        staleReferences: [],
        currentClaimHash: '',
        message: 'No claim 1 text available',
      };
    }

    // Generate hash for current claim
    const currentClaimHash = generateClaimHash(currentClaim1Text);

    // Check which jobs are stale
    const staleJobIds = getStaleCitationJobs(citationJobs, currentClaimHash);

    const staleJobs = citationJobs.filter(job => staleJobIds.includes(job.id));
    const staleReferences = staleJobs
      .map(job => job.referenceNumber)
      .filter((ref): ref is string => ref !== null && ref !== undefined);

    const isAllFresh = staleJobIds.length === 0;

    logger.info('[CitationFreshnessService] Freshness check completed', {
      projectId,
      totalJobs: citationJobs.length,
      staleCount: staleJobIds.length,
      isAllFresh,
    });

    return {
      isAllFresh,
      staleJobIds,
      staleReferences,
      currentClaimHash,
      message: isAllFresh
        ? 'All citations are up to date'
        : `${staleJobIds.length} citation(s) need to be refreshed`,
    };
  }

  /**
   * Request re-analysis of stale citation jobs
   */
  static async refreshStaleJobs(
    projectId: string,
    staleJobIds: string[]
  ): Promise<{ queuedCount: number; failedCount: number }> {
    logger.info(
      '[CitationFreshnessService] Requesting refresh for stale jobs',
      {
        projectId,
        jobCount: staleJobIds.length,
      }
    );

    let queuedCount = 0;
    let failedCount = 0;

    // Request re-analysis for each stale job
    for (const jobId of staleJobIds) {
      try {
        const response = await apiFetch(
          API_ROUTES.CITATION_JOBS.REFRESH(jobId),
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              reason: 'claim_updated',
              projectId,
            }),
          }
        );

        if (response.ok) {
          queuedCount++;
        } else {
          failedCount++;
          logger.error(
            '[CitationFreshnessService] Failed to queue job refresh',
            {
              jobId,
              status: response.status,
            }
          );
        }
      } catch (error) {
        failedCount++;
        logger.error('[CitationFreshnessService] Error refreshing job', {
          jobId,
          error,
        });
      }
    }

    logger.info('[CitationFreshnessService] Refresh request completed', {
      requested: staleJobIds.length,
      queued: queuedCount,
      failed: failedCount,
    });

    return { queuedCount, failedCount };
  }

  /**
   * Get the current claim 1 hash for a project
   */
  static async getCurrentClaimHash(projectId: string): Promise<string | null> {
    try {
      const response = await apiFetch(
        API_ROUTES.PROJECTS.CLAIM_HASH(projectId)
      );

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_NETWORK_ERROR,
          'Failed to fetch claim hash'
        );
      }

      const data = await response.json();
      return data.claim1Hash || null;
    } catch (error) {
      logger.error('[CitationFreshnessService] Failed to get claim hash', {
        projectId,
        error,
      });
      return null;
    }
  }
}
