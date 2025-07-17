/**
 * Centralized hook for fetching search history.
 * This hook encapsulates all logic for retrieving and managing
 * search history data via React Query.
 */
import { useApiQuery, useApiMutation } from '@/lib/api/queryClient';
import { logger } from '@/utils/clientLogger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { ProcessedSearchHistoryEntry } from '@/types/search';
import { SearchHistoryApiService } from '@/client/services/search-history.client-service';
import { SearchApiService } from '@/client/services/search.client-service';
import { API_ROUTES } from '@/constants/apiRoutes';
import { STALE_TIME } from '@/constants/time';
import { searchHistoryKeys } from '@/lib/queryKeys/projectKeys';
import { getCurrentTenant } from '@/lib/queryKeys/tenant';

/**
 * Hook to fetch search history for a project
 */
export function useSearchHistory(projectId: string | undefined | null) {
  const apiUrl = projectId ? API_ROUTES.PROJECTS.SEARCH_HISTORY(projectId) : '';

  const result = useApiQuery<
    ProcessedSearchHistoryEntry[],
    ProcessedSearchHistoryEntry[]
  >([...searchHistoryKeys.all(projectId || '')], {
    url: apiUrl,
    params: {
      limit: 100,
    },
    enabled: !!projectId,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    // Poll while any search is processing
    refetchInterval: query => {
      if (!projectId) return false;
      const data = (query as any).state?.data as
        | ProcessedSearchHistoryEntry[]
        | undefined;
      if (!data || !Array.isArray(data)) return false;

      // Check if any search is currently processing
      const hasInProgress = data.some(entry => {
        return entry.citationExtractionStatus === 'processing';
      });

      // Poll every 1 second while processing, otherwise no polling
      return hasInProgress ? 1000 : false;
    },
    // Force refetch on reconnect
    refetchOnReconnect: true,
    select: (data: ProcessedSearchHistoryEntry[] | undefined) => {
      if (!data || !Array.isArray(data)) {
        logger.warn('[useSearchHistory] Received invalid data', {
          dataType: typeof data,
          isArray: Array.isArray(data),
        });
        return [];
      }

      // Simple pass-through with basic logging
      logger.debug('[useSearchHistory] Data updated', {
        projectId,
        count: data.length,
        firstEntry: data[0]
          ? {
              id: data[0].id,
              status: data[0].citationExtractionStatus,
            }
          : null,
      });

      return data;
    },
  });

  return result;
}

/**
 * Hook to fetch a single search history entry
 */
export function useSearchHistoryDetail(searchId: string | null) {
  // For detail queries, we need to use a different pattern since searchHistory detail
  // isn't project-scoped in the centralized keys
  const queryKey = searchId
    ? [getCurrentTenant(), 'searchHistory', 'detail', searchId]
    : [getCurrentTenant(), 'searchHistory', 'detail', 'none'];

  return useApiQuery<ProcessedSearchHistoryEntry>(queryKey, {
    url: searchId ? `${API_ROUTES.SEARCH_HISTORY.BASE}/${searchId}` : '',
    enabled: !!searchId,
  });
}

/**
 * Hook to update search history
 */
export function useUpdateSearchHistory() {
  return useApiMutation<
    ProcessedSearchHistoryEntry,
    { id: string; data: Partial<ProcessedSearchHistoryEntry> }
  >({
    mutationFn: ({ id, data }) =>
      SearchHistoryApiService.updateSearchHistory(id, data),
  });
}

/**
 * Hook to delete search history
 */
export function useDeleteSearchHistory() {
  return useApiMutation<void, string>({
    mutationFn: async id => {
      const success =
        await SearchHistoryApiService.deleteSearchHistoryEntry(id);
      if (!success) {
        throw new ApplicationError(
          ErrorCode.INTERNAL_ERROR,
          'Failed to delete search history'
        );
      }
    },
  });
}

export const useSemanticSearchMutation = () => {
  return useApiMutation({
    mutationFn: ({ queries, options }: { queries: string[]; options?: any }) =>
      SearchApiService.startAsyncSearch({
        projectId: options?.projectId || '',
        searchQueries: queries,
        searchType: 'semantic',
        ...options,
      }),
  });
};

export const useCitationMatchesQuery = (searchId: string | null) => {
  // Citation matches are search-specific, not project-specific
  const queryKey = searchId
    ? [getCurrentTenant(), 'citationMatches', 'bySearch', searchId]
    : [getCurrentTenant(), 'citationMatches', 'bySearch', 'none'];

  return useApiQuery<any, any>(queryKey, {
    url: searchId ? `${API_ROUTES.CITATION_MATCHES.BY_SEARCH}/${searchId}` : '',
    enabled: !!searchId,
    // Dynamic stale time: immediate for active processing
    staleTime: query => {
      const data = (query as any).state?.data;
      // If we don't have data yet or have empty results, use immediate stale time
      if (!data || !data.groupedResults || data.groupedResults.length === 0) {
        return STALE_TIME.IMMEDIATE; // 1 second
      }
      // Otherwise use short stale time for citation data
      return STALE_TIME.SHORT; // 30 seconds
    },
  });
};

export const useCitationMatchesPollingQuery = (
  searchId: string | null,
  pollingInterval?: number
) => {
  // Citation matches are search-specific, not project-specific
  const queryKey = searchId
    ? [getCurrentTenant(), 'citationMatches', 'bySearch', searchId]
    : [getCurrentTenant(), 'citationMatches', 'bySearch', 'none'];

  return useApiQuery<any, any>(queryKey, {
    url: searchId ? `${API_ROUTES.CITATION_MATCHES.BY_SEARCH}/${searchId}` : '',
    enabled: !!searchId,
    refetchInterval: pollingInterval || 3000, // Default to 3 seconds
    // Dynamic stale time: immediate for active processing
    staleTime: query => {
      const data = (query as any).state?.data;
      // If we don't have data yet or have empty results, use immediate stale time
      if (!data || !data.groupedResults || data.groupedResults.length === 0) {
        return STALE_TIME.IMMEDIATE; // 1 second
      }
      // Otherwise use short stale time for citation data
      return STALE_TIME.SHORT; // 30 seconds
    },
  });
};

export const useClearCitationMatchesMutation = () => {
  return useApiMutation<void, string>({
    mutationFn: (searchId: string) =>
      SearchHistoryApiService.clearCitationMatches(searchId),
  });
};
