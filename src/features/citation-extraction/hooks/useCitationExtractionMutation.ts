import { useQueryClient } from '@tanstack/react-query';
import { useApiMutation } from '@/lib/api/queryClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import { useCitationStore } from '../store';
import { citationJobKeys, citationKeys } from '@/lib/queryKeys/citationKeys';
import { logger } from '@/utils/clientLogger';
import { CitationClientService } from '@/client/services/citation.client-service';

export function useCitationExtractionMutation() {
  const queryClient = useQueryClient();
  const activeSearchId = useCitationStore(state => state.activeSearchId);
  const addOptimisticRefs = useCitationStore(state => state.addOptimisticRefs);
  const clearSpecificOptimisticRefs = useCitationStore(state => state.clearSpecificOptimisticRefs);

  return useApiMutation({
    mutationFn: async (reference: string) => {
      if (!activeSearchId) {
        throw new Error('No active search selected');
      }

      logger.debug('[useCitationExtractionMutation] Starting extraction', {
        reference,
        activeSearchId,
      });

      return CitationClientService.createCitationJob(activeSearchId, reference);
    },
    onMutate: async reference => {
      // Add to optimistic refs immediately
      if (activeSearchId) {
        addOptimisticRefs(activeSearchId, [reference]);
      }

      // Invalidate the query to trigger a refetch
      if (activeSearchId) {
        await queryClient.invalidateQueries({
          queryKey: citationKeys.matches.bySearchHistory(activeSearchId),
          exact: false, // This will match all queries that start with this key
        });
      }
    },
    onSuccess: (data, variables) => {
      logger.debug(
        '[useCitationExtractionMutation] Extraction started successfully',
        {
          reference: variables,
          result: data,
        }
      );

      // Invalidate citation jobs to show the new job
      if (activeSearchId) {
        queryClient.invalidateQueries({
          queryKey: citationJobKeys.list(activeSearchId),
        });
      }
    },
    onError: (error, variables) => {
      logger.error(
        '[useCitationExtractionMutation] Extraction failed',
        {
          reference: variables,
          error: error.message,
        }
      );

      // Clear the optimistic ref for the failed extraction
      if (activeSearchId) {
        clearSpecificOptimisticRefs(activeSearchId, [variables]);
        logger.debug(
          '[useCitationExtractionMutation] Cleared optimistic ref for failed extraction',
          {
            reference: variables,
            activeSearchId,
          }
        );
      }
    },
  });
}
