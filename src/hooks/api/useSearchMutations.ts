/**
 * Centralized hook for Search-related API mutations.
 */
import { useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { useToast } from '@/utils/toast';
import {
  SearchApiService,
  SearchHistoryEntry,
} from '@/client/services/search.client-service';
import { ProcessedSearchHistoryEntry } from '@/types/search';
import { ApplicationError } from '@/lib/error';

import { searchHistoryKeys } from '@/lib/queryKeys/projectKeys';
import { getCurrentTenant } from '@/lib/queryKeys/tenant';
import { useApiMutation, useApiQuery } from '@/lib/api/queryClient';
import { logger } from '@/utils/clientLogger';
import { useProjectData } from '@/contexts/ProjectDataContext';
import { useRouter } from 'next/router';
import { API_ROUTES } from '@/constants/apiRoutes';
import { apiFetch } from '@/lib/api/apiClient';

// type StartAsyncSearchRequest = Parameters<
//   typeof SearchApiService.startAsyncSearch
// >[0];
// type StartAsyncSearchApiResponse = Awaited<
//   ReturnType<typeof SearchApiService.startAsyncSearch>
// >;

type CreateSearchHistoryRequest = Parameters<
  typeof SearchApiService.createSearchHistory
>[0];

type ParseClaimRequest = Parameters<typeof SearchApiService.parseClaim>[0];
type ParseClaimResponse = Awaited<
  ReturnType<typeof SearchApiService.parseClaim>
>;

type GenerateQueriesRequest = Parameters<
  typeof SearchApiService.generateQueries
>[0];
type GenerateQueriesResponse = Awaited<
  ReturnType<typeof SearchApiService.generateQueries>
>;

/**
 * Interface for starting an async search
 */
export interface StartAsyncSearchParams {
  projectId: string;
  searchQueries: string[];
  parsedElements?: string[]; // V2 format - string array
  correlationId?: string; // Add correlation ID for tracking
}

/**
 * Interface for async search response
 */
export interface StartAsyncSearchResponse {
  message: string;
  success: boolean;
  searchHistoryId?: string;
  searchId?: string;
  searchHistory?: ProcessedSearchHistoryEntry;
}

/**
 * Hook for starting async search operations
 */
export function useStartAsyncSearch() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const router = useRouter();
  const { activeProjectId: _activeProjectId } = useProjectData();

  return useApiMutation({
    mutationFn: async (params: StartAsyncSearchParams) => {
      logger.info('[useStartAsyncSearch] Starting async search', {
        projectId: params.projectId,
        queryCount: params.searchQueries.length,
        hasParsedElements: !!params.parsedElements,
        parsedElementsCount: params.parsedElements?.length,
        correlationId: params.correlationId,
      });

      try {
        const response = await SearchApiService.startAsyncSearch({
          projectId: params.projectId,
          searchQueries: params.searchQueries,
          parsedElements: params.parsedElements,
          metadata: params.correlationId
            ? { correlationId: params.correlationId }
            : undefined,
        });

        logger.info('[useStartAsyncSearch] Async search started successfully', {
          response,
        });

        return {
          message: 'Search started successfully',
          success: true,
          searchHistoryId: response.searchId,
        } as StartAsyncSearchResponse;
      } catch (error) {
        logger.error(
          '[useStartAsyncSearch] Failed to start async search',
          error
        );
        throw error;
      }
    },

    onSuccess: async (data, variables) => {
      const projectIdForInvalidate = variables.projectId;

      // If the server returned the full search history entry, add it directly to the cache
      if (data.searchHistory) {
        logger.info(
          '[useStartAsyncSearch] Server returned full search entry, updating cache directly',
          {
            searchId: data.searchHistory.id,
            projectId: projectIdForInvalidate,
          }
        );

        // Get the current cache data
        const currentData =
          queryClient.getQueryData<ProcessedSearchHistoryEntry[]>(
            searchHistoryKeys.all(projectIdForInvalidate)
          ) || [];

        // Add the new entry at the beginning
        const updatedData = [data.searchHistory, ...currentData];

        // Update the cache immediately
        queryClient.setQueryData(
          searchHistoryKeys.all(projectIdForInvalidate),
          updatedData
        );

        logger.info(
          '[useStartAsyncSearch] Cache updated with new search entry',
          {
            searchId: data.searchHistory.id,
            projectId: projectIdForInvalidate,
            cacheSize: updatedData.length,
          }
        );
      } else {
        // Fallback for old API response format - just invalidate and let React Query refetch
        logger.info(
          '[useStartAsyncSearch] Using fallback - invalidating queries',
          {
            searchId: data.searchId,
            projectId: projectIdForInvalidate,
          }
        );

        await queryClient.invalidateQueries({
          queryKey: searchHistoryKeys.all(projectIdForInvalidate),
        });
      }

      // Show success message
      toast.success(
        'Search started - Analyzing claims and searching for prior art',
        {
          description:
            'New citations have been found and added to your results.',
        }
      );

      // Navigate to claim refinement view where search results are displayed
      if (data.searchId) {
        const tenant = router.query.tenant as string;
        if (tenant && variables.projectId) {
          router.push(
            `/${tenant}/projects/${variables.projectId}/claim-refinement`
          );
        }
      }
    },

    onError: error => {
      logger.error('[useStartAsyncSearch] Mutation error', error);
      toast.error(error.message || 'Failed to start search. Please try again.');
    },
  });
}

/**
 * Hook to poll async search status
 */
export function useAsyncSearchStatus(
  projectId: string | undefined,
  searchId: string | undefined,
  enabled: boolean = true
) {
  return useApiQuery(
    [getCurrentTenant(), 'asyncSearch', projectId || '', searchId || ''],
    {
      url:
        projectId && searchId
          ? `${API_ROUTES.PROJECTS.BY_ID(projectId)}/async-search/${searchId}`
          : '',
      enabled: enabled && !!projectId && !!searchId,
      refetchInterval: (query: any) => {
        const data = query.state.data;
        // Stop polling if search is complete or failed
        if (data?.status === 'completed' || data?.status === 'failed') {
          return false;
        }
        // Otherwise poll every 2 seconds
        return 2000;
      },
    }
  );
}

/**
 * Hook for deleting search history entries
 */
export function useDeleteSearchHistory() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useApiMutation({
    mutationFn: async (searchId: string) => {
      await SearchApiService.deleteSearch(searchId);
    },

    onSuccess: (_: any, searchId: string) => {
      logger.info('[useDeleteSearchHistory] Successfully deleted search', {
        searchId,
      });

      // Invalidate search history queries
      queryClient.invalidateQueries({
        queryKey: [getCurrentTenant(), 'searchHistory'],
      });

      toast.success('Search history deleted successfully');
    },

    onError: error => {
      logger.error('[useDeleteSearchHistory] Failed to delete search', error);
      toast.error(
        error.message || 'Failed to delete search history. Please try again.'
      );
    },
  });
}

/**
 * Hook to parse a claim.
 */
export function useParseClaim(
  options?: UseMutationOptions<
    ParseClaimResponse,
    ApplicationError,
    ParseClaimRequest
  >
) {
  return useApiMutation({
    mutationFn: request => SearchApiService.parseClaim(request),
    ...options,
  });
}

/**
 * Hook to generate search queries from parsed elements.
 */
export function useGenerateQueries(
  options?: UseMutationOptions<
    GenerateQueriesResponse,
    ApplicationError,
    GenerateQueriesRequest
  >
) {
  return useApiMutation({
    mutationFn: request => SearchApiService.generateQueries(request),
    ...options,
  });
}

/**
 * Hook to create a new search history entry.
 */
export function useCreateSearchHistory(
  options?: UseMutationOptions<
    SearchHistoryEntry,
    ApplicationError,
    CreateSearchHistoryRequest
  >
) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useApiMutation({
    mutationFn: request => SearchApiService.createSearchHistory(request),
    onSuccess: (data, variables) => {
      toast.success('Search history created.');
      queryClient.invalidateQueries({
        queryKey: searchHistoryKeys.all(variables.projectId),
      });
    },
    ...options,
  });
}
