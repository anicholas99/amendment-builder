import { apiFetch } from '@/lib/api/apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/utils/clientLogger';

interface LookupResult {
  patentNumber: string;
  referenceNumber?: string;
  found: boolean;
  title?: string;
  abstract?: string;
  CPCs?: string[];
  fullTextUrl?: string;
  publicationDate?: string;
  assignee?: string;
  metadata?: Record<string, unknown>;
  error?: string;
}

export class PatbaseApiService {
  static async enhanceReferences(
    references: string[]
  ): Promise<{ results: LookupResult[] }> {
    try {
      const response = await apiFetch(API_ROUTES.PATBASE.SEARCH.ENHANCE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ references }),
      });

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          `Failed to enhance references: ${response.status}`
        );
      }

      const result = await response.json();

      // Handle wrapped response format - API returns { data: { results } }
      const unwrappedResult = result.data || result;

      return unwrappedResult;
    } catch (error) {
      logger.error('[PatbaseApiService] Error enhancing references', {
        references,
        error,
      });
      throw error;
    }
  }
}
