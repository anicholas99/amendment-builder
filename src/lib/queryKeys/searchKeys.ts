/**
 * @fileoverview Centralized query key factory for search-related data.
 * This ensures consistency and prevents string literal duplication.
 */

import { getCurrentTenant } from './tenant';

export const searchKeys = {
  /**
   * Base key for all search queries.
   */
  all: ['search'] as const,

  /**
   * Query key for search history.
   */
  history: {
    all: () => [getCurrentTenant(), 'searchHistory'] as const,

    /**
     * Query key for search history of a specific project.
     * @param projectId The ID of the project.
     */
    list: (projectId: string) =>
      [...searchKeys.history.all(), 'project', projectId] as const,

    /**
     * Query key for a specific search history entry.
     * @param historyId The ID of the search history.
     */
    detail: (id: string) =>
      [...searchKeys.history.all(), 'detail', id] as const,

    /**
     * Query key for search history of a specific project.
     * @param projectId The ID of the project.
     */
    byProject: (projectId: string) => searchKeys.history.list(projectId),
  },

  /**
   * Query key for search results.
   */
  results: {
    all: () => [getCurrentTenant(), 'searchResults'] as const,

    /**
     * Query key for search results of a specific query.
     * @param queryId The ID of the query.
     */
    byQuery: (queryId: string) =>
      [...searchKeys.results.all(), 'query', queryId] as const,

    /**
     * Query key for search results of a specific history.
     * @param searchHistoryId The ID of the search history.
     */
    byHistory: (searchHistoryId: string) =>
      [...searchKeys.results.all(), searchHistoryId] as const,

    /**
     * Query key for a specific search result.
     * @param resultId The ID of the search result.
     */
    detail: (resultId: string) =>
      [...searchKeys.results.all(), 'detail', resultId] as const,
  },

  /**
   * Query keys for expanded search inputs
   */
  expandedInputs: {
    all: () => [getCurrentTenant(), 'expandedSearchInputs'] as const,
    byProject: (projectId: string) =>
      [...searchKeys.expandedInputs.all(), 'project', projectId] as const,
    byHistory: (searchHistoryId: string) =>
      [...searchKeys.expandedInputs.all(), 'history', searchHistoryId] as const,
  },
} as const;

// Re-export history keys for backward compatibility
export const searchHistoryKeys = searchKeys.history;
