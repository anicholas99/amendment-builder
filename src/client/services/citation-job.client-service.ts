import { apiFetch } from '@/lib/api/apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/lib/monitoring/logger';
import { ExaminerAnalysisResult } from '@/types/domain/citation';

export class CitationJobApiService {
  static async getExaminerAnalysis(
    jobId: string
  ): Promise<ExaminerAnalysisResult | null> {
    try {
      const response = await apiFetch(
        `${API_ROUTES.CITATION_JOBS.BY_ID(jobId)}/examiner-analysis`
      );

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          `Failed to fetch examiner analysis: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      logger.error('[CitationJobApiService] Error fetching examiner analysis', {
        jobId,
        error,
      });
      throw error;
    }
  }

  static async runExaminerAnalysis(
    jobId: string
  ): Promise<{ success: boolean }> {
    try {
      const response = await apiFetch(
        API_ROUTES.CITATION_JOBS.EXAMINER_ANALYSIS,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ jobId }),
        }
      );

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          `Failed to run examiner analysis: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      logger.error('[CitationJobApiService] Error running examiner analysis', {
        jobId,
        error,
      });
      throw error;
    }
  }
}
