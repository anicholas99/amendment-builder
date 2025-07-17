/**
 * Service for search history API interactions
 *
 * Handles HTTP communication with search history endpoints.
 * Returns ProcessedSearchHistoryEntry for type safety.
 */
import { ProcessedSearchHistoryEntry } from '@/types/domain/searchHistory';
import { DetailedSearchHistoryEntry } from '@/features/citation-extraction/hooks/useCitationsTabLogic';
import { logger } from '@/utils/clientLogger';

import { apiFetch } from '@/lib/api/apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import { ApplicationError, ErrorCode } from '@/lib/error';

export class SearchHistoryApiService {
  /**
   * Get a single search history entry
   */
  static async getSearchHistoryEntry(
    entryId: string
  ): Promise<DetailedSearchHistoryEntry | null> {
    try {
      const response = await apiFetch(API_ROUTES.SEARCH_HISTORY.BY_ID(entryId));
      if (!response.ok) {
        return null;
      }
      return (await response.json()) as DetailedSearchHistoryEntry;
    } catch (error) {
      logger.error('[SearchHistory API] Error fetching search history entry', {
        error,
      });
      return null;
    }
  }

  /**
   * Delete a single search history entry
   */
  static async deleteSearchHistoryEntry(entryId: string): Promise<boolean> {
    try {
      await apiFetch(API_ROUTES.SEARCH_HISTORY.DELETE(entryId), {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      logger.error('[SearchHistory API] Error deleting search history entry', {
        error,
      });
      return false;
    }
  }

  /**
   * Clear all search history for a project
   */
  static async clearSearchHistory(
    projectId: string
  ): Promise<{ success: boolean; count?: number }> {
    try {
      const response = await apiFetch(
        `${API_ROUTES.SEARCH_HISTORY.LIST}?projectId=${projectId}`,
        {
          method: 'DELETE',
        }
      );
      const result = await response.json();
      return { success: true, count: result.count };
    } catch (error) {
      logger.error('[SearchHistory API] Error clearing search history', {
        error,
      });
      return { success: false };
    }
  }

  /**
   * Save parsed elements to search history
   */
  static async saveParsedElements(
    projectId: string,
    parsedElements: string[],
    documentId?: string
  ): Promise<string | null> {
    try {
      const response = await apiFetch(API_ROUTES.MISC.PARSED_ELEMENTS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          documentId,
          parsedElements,
        }),
      });
      const result = await response.json();
      return result.searchHistoryId || null;
    } catch (error) {
      logger.error('[SearchHistory API] Error saving parsed elements', {
        error,
      });
      return null;
    }
  }

  /**
   * Get search history for a project
   * The API should return ProcessedSearchHistoryEntry[] with all JSON fields parsed
   */
  static async getSearchHistory(
    projectId: string
  ): Promise<ProcessedSearchHistoryEntry[]> {
    try {
      const response = await apiFetch(
        `${API_ROUTES.SEARCH_HISTORY.LIST}?projectId=${projectId}`
      );
      const data = await response.json();

      if (!Array.isArray(data)) {
        logger.warn(
          '[SearchHistory API] Unexpected response format, expected array'
        );
        return [];
      }

      return data as ProcessedSearchHistoryEntry[];
    } catch (error) {
      logger.error('[SearchHistory API] Error fetching search history', {
        error,
      });
      return [];
    }
  }

  /**
   * Update a search history entry
   */
  static async updateSearchHistory(
    id: string,
    data: Partial<ProcessedSearchHistoryEntry>
  ): Promise<ProcessedSearchHistoryEntry> {
    const response = await apiFetch(`${API_ROUTES.SEARCH_HISTORY.BASE}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new ApplicationError(
        ErrorCode.API_INVALID_RESPONSE,
        'Failed to update search history'
      );
    }

    return response.json();
  }

  /**
   * Clear citation matches for a search
   */
  static async clearCitationMatches(searchId: string): Promise<void> {
    const response = await apiFetch(
      `/api/citation-matches/by-search/${searchId}/clear`,
      {
        method: 'POST',
      }
    );

    if (!response.ok) {
      throw new ApplicationError(
        ErrorCode.INTERNAL_ERROR,
        'Failed to clear citation matches'
      );
    }
  }
}

class SearchHistoryClientService {
  /**
   * Get a single search history entry by its ID.
   */
  async getSearchHistoryById(id: string): Promise<any> {
    try {
      const response = await apiFetch(`/api/search-history/${id}`);
      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          'Failed to fetch search history entry.'
        );
      }
      return await response.json();
    } catch (error) {
      logger.error(
        '[SearchHistoryClientService] Failed to get search history by ID',
        { id, error }
      );
      throw error;
    }
  }

  /**
   * Create a new search history entry.
   */
  async createSearchHistory(data: any): Promise<any> {
    try {
      const response = await apiFetch('/api/search-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          'Failed to create search history entry.'
        );
      }
      return await response.json();
    } catch (error) {
      logger.error(
        '[SearchHistoryClientService] Failed to create search history',
        { data, error }
      );
      throw error;
    }
  }
}

// Export the class for context-based instantiation
export { SearchHistoryClientService };

// REMOVED: Singleton export that could cause session isolation issues
