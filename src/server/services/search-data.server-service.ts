import { SearchApiService } from '@/client/services/search.client-service';
import { ClaimsClientService } from '@/client/services/claims.client-service';
import { logger } from '@/lib/monitoring/logger';
import { safeJsonParse } from '@/utils/json-utils';
import { findSearchHistoryById } from '@/repositories/search/searchHistory.repository';

/**
 * Centralized service for retrieving search-related data
 * This service handles retrieving parsed elements from search history.
 *
 * Note: ClaimSetVersion has been removed from the codebase.
 * Parsed elements are now stored directly in search results if needed.
 */
export class SearchDataService {
  /**
   * Get search inputs (parsed elements) from search history
   * @param searchHistoryId - ID of the search history entry
   * @param citationJobId - ID of the citation job
   * @returns Array of parsed element strings
   */
  static async getSearchInputs(
    searchHistoryId?: string,
    citationJobId?: string
  ): Promise<string[]> {
    let searchInputs: string[] = [];
    let dataSource = 'none';

    try {
      // Note: claimSetVersionId parameter is deprecated and ignored

      // Get from SearchHistory results if available
      if (searchHistoryId) {
        const searchHistory = await findSearchHistoryById(searchHistoryId);

        if (searchHistory?.results) {
          try {
            // Try to parse results to extract parsed elements
            const results =
              typeof searchHistory.results === 'string'
                ? safeJsonParse(searchHistory.results)
                : searchHistory.results;

            if (
              results &&
              typeof results === 'object' &&
              'parsedElements' in results
            ) {
              const parsed = results.parsedElements as string[];
              if (Array.isArray(parsed) && parsed.length > 0) {
                searchInputs = parsed;
                dataSource = 'SearchHistory.results.parsedElements';
              }
            }
          } catch (error) {
            logger.debug(
              '[SearchDataService] Could not extract parsed elements from results',
              {
                searchHistoryId,
                error,
              }
            );
          }
        }
      }

      // Log data source for monitoring
      if (searchInputs.length > 0) {
        logger.info('[SearchDataService] Retrieved search inputs', {
          source: dataSource,
          count: searchInputs.length,
          searchHistoryId,
          citationJobId,
        });
      } else {
        logger.debug('[SearchDataService] No search inputs found', {
          searchHistoryId,
          citationJobId,
        });
      }

      // Ensure all elements are strings
      return searchInputs
        .map(element => {
          if (typeof element === 'string') {
            return element;
          }
          // Handle legacy format if needed
          if (
            typeof element === 'object' &&
            element !== null &&
            'text' in element
          ) {
            return (element as any).text || '';
          }
          return String(element);
        })
        .filter(text => text.length > 0);
    } catch (error) {
      logger.error('[SearchDataService] Error retrieving search inputs', {
        error,
        searchHistoryId,
        citationJobId,
      });
      return [];
    }
  }
}
