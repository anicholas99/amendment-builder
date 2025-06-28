/* eslint-disable local/no-direct-react-query-hooks */
/**
 * Citation Jobs Hook
 *
 * React Query hook for fetching and managing citation jobs.
 * This is the ONLY place where citation job queries should be defined.
 */

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { CitationClientService } from '@/client/services/citation.client-service';
import { CitationJob } from '@/types/citation';
import { logger } from '@/lib/monitoring/logger';
import { useToast } from '@chakra-ui/react';
import { showSuccessToast, showErrorToast } from '@/utils/toast';
import { ApplicationError } from '@/lib/error';
import { citationKeys } from '@/lib/queryKeys';
import { STALE_TIME } from '@/constants/time';

/**
 * Hook to fetch citation jobs for a specific search history entry
 */
export function useCitationJobs(options: {
  searchHistoryId?: string;
  initialData?: CitationJob[];
}) {
  return useQuery<CitationJob[], ApplicationError>({
    queryKey: citationKeys.bySearchHistory(options.searchHistoryId || ''),
    queryFn: () => {
      if (!options.searchHistoryId) {
        logger.warn('[useCitationJobs] No searchHistoryId provided');
        return [];
      }
      return CitationClientService.getCitationJobsBySearchHistoryId(
        options.searchHistoryId
      );
    },
    enabled: !!options.searchHistoryId,
    initialData: options.initialData,
  });
}

/**
 * Hook to fetch citation jobs for multiple search history entries
 * Returns a map of searchHistoryId -> CitationJob[]
 */
export function useCitationJobsMultiple(options: {
  searchHistoryIds: string[];
  initialData?: Record<string, CitationJob[]>;
}) {
  return useQuery<Record<string, CitationJob[]>, ApplicationError>({
    queryKey: citationKeys.forMultipleSearches(options.searchHistoryIds),
    queryFn: () => {
      if (options.searchHistoryIds.length === 0) {
        logger.warn('[useCitationJobsMultiple] No searchHistoryIds provided');
        return {};
      }
      return CitationClientService.getCitationJobsForMultipleSearches(
        options.searchHistoryIds
      );
    },
    enabled: options.searchHistoryIds.length > 0,
    initialData: options.initialData,
  });
}

/**
 * Hook to fetch citation jobs for expanded search history entries
 * This is optimized for the SearchHistoryTab use case
 */
export function useCitationJobsForExpandedSearches(
  searchHistory: Array<{ id?: string | null }>,
  expandedSearchId: string | null,
  projectId: string | undefined,
  isActive: boolean = true
) {
  // Only fetch for the expanded entry
  const searchIds = expandedSearchId ? [expandedSearchId] : [];

  return useQuery({
    queryKey: citationKeys.forMultipleSearches(searchIds),
    queryFn: async () => {
      if (!expandedSearchId) {
        logger.debug('[useCitationJobsForExpandedSearches] No expanded search');
        return {};
      }

      logger.debug(
        '[useCitationJobsForExpandedSearches] Fetching citation jobs',
        {
          expandedSearchId,
        }
      );

      const result =
        await CitationClientService.getCitationJobsForMultipleSearches([
          expandedSearchId,
        ]);

      return result;
    },
    enabled: isActive && !!projectId && !!expandedSearchId,
    staleTime: STALE_TIME.SHORT,
    refetchInterval: isActive && expandedSearchId ? STALE_TIME.SHORT : false,
  });
}

/**
 * Hook to trigger a sync of a job's status from the external service.
 */
export function useSyncJobStatus() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (jobId: string | number) =>
      CitationClientService.syncJobStatus(jobId),
    onSuccess: (data, jobId) => {
      if (data.success) {
        showSuccessToast(toast, `Job ${jobId} status synced.`);
        queryClient.invalidateQueries({ queryKey: citationKeys.jobs.all() });
      } else {
        showErrorToast(toast, `Failed to sync job ${jobId}.`);
      }
    },
    onError: (error: ApplicationError, jobId) => {
      showErrorToast(toast, `Error syncing job ${jobId}: ${error.message}`);
    },
  });
}

/**
 * Hook to pre-populate the citation jobs cache for a given search history entry.
 * This prevents a fetch flash by setting initial data.
 */
export function useWarmCitationJobCache() {
  const queryClient = useQueryClient();
  return (searchId: string) => {
    queryClient.setQueryData(
      citationKeys.bySearchHistory(searchId),
      [] // Set initial data to an empty array
    );
  };
}

export function usePrefetchCitationJobsForMultipleSearches() {
  const queryClient = useQueryClient();

  const prefetchCitationJobs = (searchHistoryIds: string[]) => {
    if (searchHistoryIds.length > 0) {
      queryClient.prefetchQuery({
        queryKey: citationKeys.forMultipleSearches(searchHistoryIds),
        queryFn: () =>
          CitationClientService.getCitationJobsForMultipleSearches(
            searchHistoryIds
          ),
      });
    }
  };

  return prefetchCitationJobs;
}
