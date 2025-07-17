/**
 * Server Service for the External AI API
 *
 * This service is the single, centralized point for all interactions
 * with the external Cardinal AI API for citation processing. It encapsulates
 * API key management, request construction, and standardized error handling.
 */
import { logger } from '@/server/logger';
import environment from '@/config/environment';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { serverFetch } from '@/lib/api/serverFetch';

const AI_API_BASE_URL =
  'https://aiapi.qa.cardinal-holdings.com/semantic-search/citation/result/';
const AI_API_KEY = environment.aiapi.apiKey;

export class ExternalAiApiServerService {
  /**
   * Fetches the status and result of an external citation job.
   *
   * @param externalJobId - The ID of the job on the external service.
   * @returns The data from the external API, including status and result.
   */
  static async getJobResult(externalJobId: string): Promise<any> {
    if (!AI_API_KEY) {
      throw new ApplicationError(
        ErrorCode.ENV_VAR_MISSING,
        'External AI API key (AIAPI_API_KEY) is not configured.'
      );
    }

    const requestUrl = `${AI_API_BASE_URL}${externalJobId}`;
    logger.debug(
      `[ExternalAiApiService] Calling external API for job ${externalJobId}: ${requestUrl}`
    );

    try {
      const response = await serverFetch(requestUrl, {
        headers: {
          ApiKey: AI_API_KEY,
        },
      });

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_SERVICE_UNAVAILABLE,
          `External AI API error: HTTP status ${response.status}`
        );
      }

      const data = await response.json();
      logger.info(
        `[ExternalAiApiService] Successfully fetched result for job ${externalJobId}.`
      );
      return data;
    } catch (error) {
      logger.error(
        `[ExternalAiApiService] Error fetching job result for ${externalJobId}`,
        {
          error: error instanceof Error ? error.message : String(error),
        }
      );

      if (error instanceof ApplicationError) {
        throw error;
      }

      throw new ApplicationError(
        ErrorCode.API_NETWORK_ERROR,
        'A network error occurred while communicating with the external AI API.'
      );
    }
  }
}
