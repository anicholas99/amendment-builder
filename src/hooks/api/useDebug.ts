/* eslint-disable local/no-direct-react-query-hooks */
/**
 * Debug Hook
 *
 * React Query hooks for debug operations.
 * This is the ONLY place where debug queries should be defined.
 */

import { useQuery, useMutation } from '@tanstack/react-query';
import { DebugApiService } from '@/client/services/debug.client-service';
import { ApplicationError } from '@/lib/error';
import { logger } from '@/utils/clientLogger';
import { useToast } from '@/utils/toast';
import { debugKeys } from '@/lib/queryKeys';

/**
 * Hook to check citation job status
 */
export function useCheckCitationJobStatus(jobId: string) {
  return useQuery<any, ApplicationError>({
    queryKey: debugKeys.citation.status(jobId),
    queryFn: () => DebugApiService.checkCitationJobStatus(jobId),
    enabled: !!jobId,
  });
}

/**
 * Hook to reset citation extraction
 */
export function useResetCitationExtraction() {
  const toast = useToast();

  return useMutation<any, ApplicationError, number>({
    mutationFn: (jobId: number) =>
      DebugApiService.resetCitationExtraction(jobId),
    onSuccess: () => {
      toast.success('UI Reset Requested', {
        description: 'You can now return to the main app and try again',
      });
    },
    onError: (error: ApplicationError) => {
      logger.error(
        '[useResetCitationExtraction] Error resetting extraction:',
        error
      );
      toast.error('Failed to reset extraction');
    },
  });
}

/**
 * Hook to get debug info
 */
export function useGetDebugInfo() {
  return useQuery<any, ApplicationError>({
    queryKey: debugKeys.citation.info(),
    queryFn: () => DebugApiService.getDebugInfo(),
    enabled: false, // Manual trigger only
  });
}
