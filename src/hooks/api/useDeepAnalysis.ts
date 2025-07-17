/**
 * Centralized hook for Deep Analysis API operations.
 */
import { useApiQuery, useApiMutation } from '@/lib/api/queryClient';
import {
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import { useToast } from '@/utils/toast';
import { DeepAnalysisApiService } from '@/client/services/deep-analysis.client-service';
import { ApplicationError } from '@/lib/error';

import { STALE_TIME } from '@/constants/time';
import { API_ROUTES } from '@/constants/apiRoutes';

/**
 * Query key factory for deep analysis queries.
 */
export const deepAnalysisQueryKeys = {
  all: ['deepAnalysis'] as const,
  byJob: (jobId: string) =>
    [...deepAnalysisQueryKeys.all, 'job', jobId] as const,
  find: (reference: string, searchId: string, versionId?: string | null) => {
    const baseKey = [...deepAnalysisQueryKeys.all, 'find', reference, searchId];
    return versionId ? [...baseKey, versionId] : baseKey;
  },
};

/**
 * Hook to find a job for deep analysis.
 */
export function useFindJobForDeepAnalysis(
  params: { reference: string; searchId: string; versionId?: string | null },
  options?: Omit<UseQueryOptions<any, ApplicationError>, 'queryKey' | 'queryFn'>
) {
  const { reference, searchId, versionId } = params;

  return useApiQuery(
    deepAnalysisQueryKeys.find(reference, searchId, versionId),
    {
      url: '', // Empty URL to prevent API call
      enabled: false, // Disable this hook - we'll use the citationJobs passed in instead
      staleTime: STALE_TIME.DEFAULT,
      ...options,
    }
  );
}

/**
 * Hook to run a deep analysis on a citation job.
 */
export function useRunDeepAnalysis(
  options?: UseMutationOptions<{ success: boolean }, ApplicationError, string>
) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useApiMutation<{ success: boolean }, string>({
    mutationFn: (jobId: string) =>
      DeepAnalysisApiService.runDeepAnalysis(jobId),
    onSuccess: (data, jobId) => {
      if (data.success) {
        toast.success('Deep analysis started!', {
          description:
            'This may take up to a minute to complete. The panel will update automatically when ready.',
        });
        // Invalidate queries that depend on this, like the job details
        queryClient.invalidateQueries({ queryKey: ['citationJob', jobId] });
        queryClient.invalidateQueries({ queryKey: deepAnalysisQueryKeys.all });
      } else {
        toast.error('Failed to start deep analysis.');
      }
    },
    onError: error => {
      toast.error(
        error.message || 'Failed to start deep analysis. Please try again.'
      );
    },
    ...options,
  });
}
