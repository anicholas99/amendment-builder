import { apiFetch } from '@/lib/api/apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/utils/clientLogger';
import {
  CombinedAnalysisParams,
  CombinedAnalysisResult,
  GenerateSuggestionsParams,
  GenerateSuggestionsResult,
} from '@/types/api/responses';

export class AiApiService {
  static async getCombinedAnalysis(
    params: CombinedAnalysisParams
  ): Promise<CombinedAnalysisResult> {
    try {
      const response = await apiFetch(API_ROUTES.AI.COMBINED_ANALYSIS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApplicationError(
          ErrorCode.AI_GENERATION_FAILED,
          `Failed to run combined analysis: ${errorData.message || response.statusText}`
        );
      }

      const result = await response.json();

      // Handle wrapped response format - API returns { data: { analysis: ... } }
      const unwrappedResult = result.data || result;

      // The API returns the result directly, not wrapped in an analysis property
      // So we need to wrap it to match our type definition
      if (unwrappedResult.analysis) {
        return unwrappedResult;
      }

      // If the result is the analysis itself, wrap it
      return { analysis: unwrappedResult };
    } catch (error) {
      logger.error('Failed to run combined analysis:', { error });
      if (error instanceof ApplicationError) {
        throw error;
      }
      throw new ApplicationError(
        ErrorCode.AI_GENERATION_FAILED,
        'An unexpected error occurred during combined analysis.'
      );
    }
  }

  static async generateSuggestions(
    params: GenerateSuggestionsParams
  ): Promise<GenerateSuggestionsResult> {
    try {
      const response = await apiFetch(API_ROUTES.CLAIMS.GENERATE_SUGGESTIONS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApplicationError(
          ErrorCode.AI_GENERATION_FAILED,
          `Failed to generate suggestions: ${errorData.message || response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      logger.error('Failed to generate suggestions:', { error });
      if (error instanceof ApplicationError) {
        throw error;
      }
      throw new ApplicationError(
        ErrorCode.AI_GENERATION_FAILED,
        'An unexpected error occurred while generating suggestions.'
      );
    }
  }
}
