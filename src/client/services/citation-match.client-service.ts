import { apiFetch } from '@/lib/api/apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/utils/clientLogger';
import { ProcessedCitationMatch } from '@/types/domain/citation';

export interface CitationMatchResponse {
  matches: ProcessedCitationMatch[];
  groupedByReference?: Record<string, ProcessedCitationMatch[]>;
  totalCount: number;
}

export class CitationMatchApiService {
  static async getGroupedCitationMatches(
    searchHistoryId: string
  ): Promise<CitationMatchResponse | null> {
    try {
      const params = new URLSearchParams({
        searchHistoryId,
      });

      const response = await apiFetch(
        `${API_ROUTES.CITATION_MATCHES.BY_SEARCH}?${params.toString()}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          `Failed to fetch citation matches: ${response.status}`
        );
      }

      const result = await response.json();

      // Handle wrapped response format - API returns { data: matches }
      const unwrappedResult = result.data || result;

      return unwrappedResult;
    } catch (error) {
      logger.error(
        '[CitationMatchApiService] Error fetching grouped citation matches',
        {
          searchHistoryId,
          error,
        }
      );
      throw error;
    }
  }
}
