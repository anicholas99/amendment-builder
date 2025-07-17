/**
 * Centralized hook for Examiner Analysis API operations.
 */
import { useApiQuery, useApiMutation } from '@/lib/api/queryClient';
import {
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import { useToast } from '@/utils/toast';
import { CitationJobApiService } from '@/client/services/citation-job.client-service';
import { ApplicationError } from '@/lib/error';

import { ExaminerAnalysisResult } from '@/types/domain/citation';
import { STALE_TIME } from '@/constants/time';
import { API_ROUTES } from '@/constants/apiRoutes';

/**
 * Query key factory for examiner analysis queries.
 */
export const examinerAnalysisQueryKeys = {
  all: ['examinerAnalysis'] as const,
  byJob: (jobId: string) =>
    [...examinerAnalysisQueryKeys.all, 'job', jobId] as const,
};

/**
 * Hook to fetch the examiner analysis for a citation job.
 */
export function useGetExaminerAnalysis(
  jobId: string | null,
  options?: Omit<
    UseQueryOptions<ExaminerAnalysisResult | null, ApplicationError>,
    'queryKey' | 'queryFn'
  >
) {
  return useApiQuery<ExaminerAnalysisResult | null>(
    [...examinerAnalysisQueryKeys.byJob(jobId || '')],
    {
      url: jobId
        ? `${API_ROUTES.CITATION_JOBS.BY_ID(jobId)}/examiner-analysis`
        : '',
      enabled: !!jobId && options?.enabled !== false,
      staleTime: STALE_TIME.DEFAULT,
      ...options,
    }
  );
}

/**
 * Hook to run an examiner analysis on a citation job.
 */
export function useRunExaminerAnalysis(
  options?: UseMutationOptions<{ success: boolean }, ApplicationError, string>
) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useApiMutation<{ success: boolean }, string>({
    mutationFn: (jobId: string) =>
      CitationJobApiService.runExaminerAnalysis(jobId),
    onSuccess: (data, jobId) => {
      if (data.success) {
        toast.success('Examiner analysis started.');
        // Invalidate queries that depend on this
        queryClient.invalidateQueries({
          queryKey: examinerAnalysisQueryKeys.byJob(jobId),
        });
        queryClient.invalidateQueries({ queryKey: ['citationJob', jobId] });
      } else {
        toast.error('Failed to start examiner analysis.');
      }
    },
    onError: error => {
      toast.error(
        error.message || 'Failed to start examiner analysis. Please try again.'
      );
    },
    ...options,
  });
}
