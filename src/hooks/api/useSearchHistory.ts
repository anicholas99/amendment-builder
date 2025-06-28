/**
 * Centralized hook for fetching search history.
 * This hook encapsulates all logic for retrieving and managing
 * search history data via React Query.
 */
import { useApiQuery, useApiMutation } from '@/lib/api/queryClient';
import { logger } from '@/lib/monitoring/logger';
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
export function useSearchHistory(projectId: string | null) {
  const apiUrl = projectId ? API_ROUTES.PROJECTS.SEARCH_HISTORY(projectId) : '';

  const result = useApiQuery<
    ProcessedSearchHistoryEntry[],
    ProcessedSearchHistoryEntry[]
  >([...searchHistoryKeys.all(projectId || '')], {
    url: apiUrl,
    params: { limit: 100 },
    enabled: !!projectId,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    // Dynamically poll every 5 s while any entry is still being processed (no results yet)
    refetchInterval: query => {
      if (!projectId) return false;
      const raw = (query as any).state?.data as
        | ProcessedSearchHistoryEntry[]
        | undefined;
      if (!raw || !Array.isArray(raw)) return false;
      const hasInProgress = raw.some(entry => {
        // Primary check: explicit processing status
        if (entry.citationExtractionStatus === 'processing') {
          return true;
        }
        // Secondary check: no results and not completed/failed
        return (
          (!entry.results || entry.resultCount === 0) &&
          entry.citationExtractionStatus !== 'failed' &&
          entry.citationExtractionStatus !== 'completed'
        );
      });
      return hasInProgress ? 3000 : false; // Reduced to 3-second polling for faster updates
    },
    // Dynamic stale time: short when polling, normal otherwise
    staleTime: query => {
      if (!projectId) return STALE_TIME.ONE_MINUTE;
      const raw = (query as any).state?.data as
        | ProcessedSearchHistoryEntry[]
        | undefined;
      if (!raw || !Array.isArray(raw)) return STALE_TIME.ONE_MINUTE;
      const hasInProgress = raw.some(entry => {
        // Primary check: explicit processing status
        if (entry.citationExtractionStatus === 'processing') {
          return true;
        }
        // Secondary check: no results and not completed/failed
        return (
          (!entry.results || entry.resultCount === 0) &&
          entry.citationExtractionStatus !== 'failed' &&
          entry.citationExtractionStatus !== 'completed'
        );
      });
      // Use 1 second stale time when searches are in progress for immediate updates
      return hasInProgress ? 1000 : STALE_TIME.ONE_MINUTE;
    },
    select: (
      data: ProcessedSearchHistoryEntry[] | undefined
    ): ProcessedSearchHistoryEntry[] => {
      if (!data || !Array.isArray(data)) {
        logger.debug('[useSearchHistory] No data or invalid data format', {
          projectId,
          dataType: typeof data,
          isArray: Array.isArray(data),
        });
        return [];
      }

      // The data is already processed by the backend, so just ensure proper types
      return data.map(entry => {
        // If the entry already has the correct structure, use it directly
        const processedEntry: ProcessedSearchHistoryEntry = {
          ...entry,
          // Ensure timestamp is a Date object
          timestamp:
            typeof entry.timestamp === 'string'
              ? new Date(entry.timestamp)
              : entry.timestamp,
          // Use existing fields from the processed entry
          parsedElements: entry.parsedElements || [],
          searchData: entry.searchData || {
            numberOfResults: entry.resultCount || 0,
            searchEngineUsed: 'Google',
          },
          // Ensure results is an array
          results: entry.results || [],
          resultCount: entry.resultCount || 0,
          priorArtReferences: Array.isArray(entry.results) ? entry.results : [],
          projectId: entry.projectId || '',
          userId: entry.userId || null,
          citationJobId: entry.citationJobId || null,
          citationExtractionStatus: entry.citationExtractionStatus || undefined,
          hasCitationJobs: entry.hasCitationJobs || false,
          citationJobCount: entry.citationJobCount || 0,
        };

        return processedEntry;
      });
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
