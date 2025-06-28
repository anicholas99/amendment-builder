/**
 * Centralized hook for Search-related API mutations.
 */
import { useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { useToast } from '@chakra-ui/react';
import {
  SearchApiService,
  SearchHistoryEntry,
} from '@/client/services/search.client-service';
// import { ProcessedSearchHistoryEntry } from '@/types/search';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { showSuccessToast, showErrorToast } from '@/utils/toast';
import { searchHistoryKeys } from '@/lib/queryKeys/projectKeys';
import { getCurrentTenant } from '@/lib/queryKeys/tenant';
import { useApiMutation, useApiQuery } from '@/lib/api/queryClient';
import { logger } from '@/lib/monitoring/logger';
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
}

/**
 * Interface for async search response
 */
export interface StartAsyncSearchResponse {
  message: string;
  success: boolean;
  searchHistoryId?: string;
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
      });

      try {
        const response = await SearchApiService.startAsyncSearch({
          projectId: params.projectId,
          searchQueries: params.searchQueries,
          parsedElements: params.parsedElements,
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

    onSuccess: (data, variables) => {
      logger.info('[useStartAsyncSearch] Success', {
        searchHistoryId: data.searchHistoryId,
      });

      // Invalidate search history queries
      queryClient.invalidateQueries({
        queryKey: searchHistoryKeys.all(variables.projectId),
      });

      // Show success message
      showSuccessToast(
        toast,
        'Search started - Analyzing claims and searching for prior art'
      );

      // Navigate to claim refinement view where search results are displayed
      if (data.searchHistoryId) {
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
      showErrorToast(
        toast,
        error instanceof ApplicationError
          ? error.message
          : 'Failed to start search'
      );
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

      showSuccessToast(toast, 'Search history deleted successfully');
    },

    onError: error => {
      logger.error('[useDeleteSearchHistory] Failed to delete search', error);
      showErrorToast(
        toast,
        error instanceof ApplicationError
          ? error.message
          : 'Failed to delete search history'
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
      showSuccessToast(toast, 'Search history created.');
      queryClient.invalidateQueries({
        queryKey: searchHistoryKeys.all(variables.projectId),
      });
    },
    ...options,
  });
}
