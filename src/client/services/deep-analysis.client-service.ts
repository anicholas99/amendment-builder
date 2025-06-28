import { apiFetch } from '@/lib/api/apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/lib/monitoring/logger';

export class DeepAnalysisApiService {
  static async findJobForDeepAnalysis(
    reference: string,
    searchId: string,
    versionId?: string | null
  ): Promise<any> {
    try {
      const params = new URLSearchParams({
        reference,
        searchId,
        ...(versionId && { versionId }),
      });

      const response = await apiFetch(
        `${API_ROUTES.DEBUG.TOOLS.FIND_JOB}?${params.toString()}`
      );

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          `Failed to find job for deep analysis: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      logger.error(
        '[DeepAnalysisApiService] Error finding job for deep analysis',
        {
          reference,
          searchId,
          versionId,
          error,
        }
      );
      throw error;
    }
  }

  static async runDeepAnalysis(jobId: string): Promise<{ success: boolean }> {
    try {
      const response = await apiFetch(
        API_ROUTES.CITATION_JOBS.DEEP_ANALYSIS(jobId),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          `Failed to run deep analysis: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      logger.error('[DeepAnalysisApiService] Error running deep analysis', {
        jobId,
        error,
      });
      throw error;
    }
  }
}
