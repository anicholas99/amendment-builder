import { apiFetch } from '@/lib/api/apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/lib/monitoring/logger';

export class DebugApiService {
  static async checkCitationJobStatus(jobId: string): Promise<any> {
    try {
      const response = await apiFetch(
        `${API_ROUTES.DEBUG.CITATION}?jobId=${jobId}`
      );

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          `Failed to check citation job status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      logger.error('[DebugApiService] Error checking citation job status', {
        jobId,
        error,
      });
      throw error;
    }
  }

  static async resetCitationExtraction(jobId: number): Promise<any> {
    try {
      const response = await apiFetch(API_ROUTES.DEBUG.CITATION, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId, action: 'reset' }),
      });

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          `Failed to reset citation extraction: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      logger.error('[DebugApiService] Error resetting citation extraction', {
        jobId,
        error,
      });
      throw error;
    }
  }

  static async getDebugInfo(): Promise<any> {
    try {
      const response = await apiFetch(
        `${API_ROUTES.DEBUG.CITATION}?action=info`
      );

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          `Failed to get debug info: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      logger.error('[DebugApiService] Error getting debug info', { error });
      throw error;
    }
  }
}
