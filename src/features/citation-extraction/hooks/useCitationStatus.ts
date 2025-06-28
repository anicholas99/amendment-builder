import { useApiQuery } from '@/lib/api/queryClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import { citationJobKeys } from '@/lib/queryKeys/citationKeys';
import { CitationJob } from '@/features/search/hooks/useCitationJobs';
import { STALE_TIME } from '@/constants/time';

interface UseCitationStatusOptions {
  searchHistoryId: string | null;
  enabled?: boolean;
  refetchInterval?: number | false;
}

/**
 * Hook to fetch citation job status for a specific search history.
 * @param options Configuration options including searchHistoryId and refetch settings.
 * @returns Query results with citation jobs and their statuses.
 */
export function useCitationStatus({
  searchHistoryId,
  enabled = true,
  refetchInterval,
}: UseCitationStatusOptions) {
  const queryKey = citationJobKeys.list(searchHistoryId || 'no-search');

  return useApiQuery<{ jobs: CitationJob[] }>([...queryKey], {
    url: API_ROUTES.CITATION_JOBS.LIST,
    params: searchHistoryId ? { searchHistoryId } : undefined,
    enabled: !!searchHistoryId && enabled,
    refetchInterval: refetchInterval || 3000, // Default to 3 seconds
    // Dynamic stale time based on job status
    staleTime: query => {
      const data = (query as any).state?.data;
      if (!data || !data.jobs) return STALE_TIME.IMMEDIATE;

      // Check if any jobs are still processing
      const hasProcessingJobs = data.jobs.some(
        (job: CitationJob) =>
          job.status === 'PENDING' ||
          job.status === 'PROCESSING' ||
          job.status === 'CREATED'
      );

      // Use immediate stale time when jobs are processing, short otherwise
      return hasProcessingJobs ? STALE_TIME.IMMEDIATE : STALE_TIME.SHORT;
    },
  });
}
