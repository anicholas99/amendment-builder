import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CitationFreshnessService,
  CitationFreshnessCheck,
  CitationFreshnessResult,
} from '@/services/api/citation-freshness.service';
import { logger } from '@/utils/clientLogger';

/**
 * Hook to check citation job freshness
 */
export function useCitationFreshness(
  check: CitationFreshnessCheck | null,
  enabled: boolean = true
) {
  return useQuery<CitationFreshnessResult>({
    queryKey: ['citationFreshness', check?.projectId, check?.currentClaim1Text],
    queryFn: async () => {
      if (!check) {
        throw new Error('No freshness check parameters provided');
      }

      return CitationFreshnessService.checkFreshness(check);
    },
    enabled: enabled && !!check,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to refresh stale citation jobs
 */
export function useRefreshStaleCitations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      staleJobIds,
    }: {
      projectId: string;
      staleJobIds: string[];
    }) => {
      return CitationFreshnessService.refreshStaleJobs(projectId, staleJobIds);
    },
    onSuccess: (data, variables) => {
      logger.info(
        '[useRefreshStaleCitations] Successfully queued refresh',
        data
      );

      // Invalidate citation jobs queries to trigger refetch
      queryClient.invalidateQueries({
        queryKey: ['citationJobs', variables.projectId],
      });

      // Invalidate freshness check
      queryClient.invalidateQueries({
        queryKey: ['citationFreshness', variables.projectId],
      });
    },
    onError: error => {
      logger.error(
        '[useRefreshStaleCitations] Failed to refresh citations',
        error
      );
    },
  });
}

/**
 * Hook to get current claim hash for a project
 */
export function useProjectClaimHash(projectId: string | null) {
  return useQuery<string | null>({
    queryKey: ['projectClaimHash', projectId],
    queryFn: async () => {
      if (!projectId) {
        return null;
      }

      return CitationFreshnessService.getCurrentClaimHash(projectId);
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
