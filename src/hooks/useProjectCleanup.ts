import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCitationStore } from '@/features/citation-extraction/store';
import { logger } from '@/utils/clientLogger';
import { getCurrentTenant } from '@/lib/queryKeys/tenant';
import { useNonBlockingOperation } from './useNonBlockingOperation';

/**
 * Hook that cleans up all project-specific data when switching projects
 * This prevents data leakage between projects for security
 */
export function useProjectCleanup(projectId: string | null) {
  const queryClient = useQueryClient();
  const clearCitationState = useCitationStore(state => state.clearAllState);
  const previousProjectIdRef = useRef<string | null>(null);
  const deferOperation = useNonBlockingOperation();

  useEffect(() => {
    // Only run cleanup if project actually changed
    if (
      previousProjectIdRef.current &&
      previousProjectIdRef.current !== projectId
    ) {
      const tenant = getCurrentTenant();

      logger.info('[ProjectCleanup] Cleaning up data for project switch', {
        from: previousProjectIdRef.current,
        to: projectId,
        tenant,
      });

      // 1. Clear citation store state immediately (lightweight operation)
      clearCitationState();

      // 2. Defer heavy cache invalidation to prevent UI blocking
      deferOperation(() => {
        // Invalidate all project-specific React Query caches
        // Citation related
        queryClient.invalidateQueries({ queryKey: [tenant, 'citationJobs'] });
        queryClient.invalidateQueries({ queryKey: [tenant, 'citationMatches'] });
        queryClient.invalidateQueries({ queryKey: [tenant, 'citations'] });
        queryClient.invalidateQueries({
          queryKey: [tenant, 'citationTopMatches'],
        });
        queryClient.invalidateQueries({ queryKey: [tenant, 'examinerAnalysis'] });
        queryClient.invalidateQueries({ queryKey: [tenant, 'deepAnalysis'] });

        // Chat related
        queryClient.invalidateQueries({ queryKey: [tenant, 'chat'] });
        queryClient.invalidateQueries({ queryKey: [tenant, 'chatHistory'] });

        // Search history
        queryClient.invalidateQueries({ queryKey: [tenant, 'searchHistory'] });

        // Prior art
        queryClient.invalidateQueries({ queryKey: [tenant, 'priorArt'] });
        queryClient.invalidateQueries({ queryKey: [tenant, 'savedPriorArt'] });

        // Documents
        queryClient.invalidateQueries({ queryKey: [tenant, 'documents'] });
        queryClient.invalidateQueries({ queryKey: [tenant, 'draftDocuments'] });

        // Figures
        queryClient.invalidateQueries({ queryKey: [tenant, 'figures'] });

        // Invention data
        queryClient.invalidateQueries({
          queryKey: [tenant, 'invention', previousProjectIdRef.current],
        });

        // Claims
        queryClient.invalidateQueries({
          queryKey: [tenant, 'claims', previousProjectIdRef.current],
        });

        logger.info('[ProjectCleanup] Cache invalidation complete');
      }, 'project-cache-cleanup');
    }

    // Update the ref for next comparison
    previousProjectIdRef.current = projectId;
  }, [projectId, queryClient, clearCitationState, deferOperation]);
}
