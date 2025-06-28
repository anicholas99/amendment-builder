import { UseQueryResult } from '@tanstack/react-query';
import { useApiQuery } from '@/lib/api/queryClient';
import { SerializedCitationJob } from '@/types/domain/citation';
import { citationJobKeys } from '@/lib/queryKeys/citationKeys';
import { API_ROUTES } from '@/constants/apiRoutes';
import { STALE_TIME } from '@/constants/time';

/**
 * Hook to fetch a specific citation job
 *
 * @param jobId The ID of the citation job to fetch
 * @param additionalOptions Additional query options
 * @returns Query result containing the citation job data
 */
export function useCitationJobDetails(
  jobId: string | null,
  additionalOptions?: Record<string, any>
): UseQueryResult<SerializedCitationJob, Error> {
  const isOptimisticId = jobId?.startsWith('optimistic-');
  const queryKey = citationJobKeys.detail(jobId || 'none');

  return useApiQuery<SerializedCitationJob>([...queryKey], {
    url: API_ROUTES.CITATIONS.JOB_DETAIL(jobId || ''),
    enabled: !!jobId && !isOptimisticId,
    staleTime: STALE_TIME.SHORT,
    placeholderData:
      isOptimisticId && jobId
        ? ({
            id: jobId,
            searchHistoryId: '',
            status: 'PROCESSING',
            externalJobId: null,
            referenceNumber: jobId.replace('optimistic-', ''),
            createdAt: new Date().toISOString(),
            startedAt: null,
            completedAt: null,
            error: null,
            deepAnalysisJson: null,
            examinerAnalysisJson: null,
            hasResults: false,
            hasDeepAnalysis: false,
            hasExaminerAnalysis: false,
            rawResultData: null,
            errorMessage: null,
            lastCheckedAt: null,
            claimSetVersionId: null,
            resultsData: null,
            isComplete: false,
          } as unknown as SerializedCitationJob)
        : undefined,
    ...additionalOptions,
  }) as UseQueryResult<SerializedCitationJob, Error>;
}
