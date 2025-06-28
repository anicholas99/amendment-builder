import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  documentClientService,
  DocumentUpdate,
} from '@/client/services/document.client-service';
import { versionQueryKeys } from '@/lib/queryKeys/versionQueryKeys';
import { logger } from '@/lib/monitoring/logger';

export const useBatchUpdateDocumentsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: DocumentUpdate[]) =>
      documentClientService.batchUpdate(updates),
    onMutate: async updates => {
      // Optimistically update the cache immediately
      // This ensures your edits are visible when navigating back
      updates.forEach(update => {
        // Find and update all version queries that contain this document
        queryClient.setQueriesData(
          { queryKey: ['versions'], exact: false },
          (oldData: any) => {
            if (!oldData) return oldData;

            // Update documents in the version data
            if (oldData.documents) {
              return {
                ...oldData,
                documents: oldData.documents.map((doc: any) =>
                  doc.id === update.documentId
                    ? { ...doc, content: update.content }
                    : doc
                ),
              };
            }

            return oldData;
          }
        );
      });

      logger.debug(
        '[useBatchUpdateDocumentsMutation] Optimistic update applied',
        {
          count: updates.length,
        }
      );
    },
    onSuccess: (data, variables) => {
      logger.debug('[useBatchUpdateDocumentsMutation] Documents updated', {
        count: variables.length,
      });
    },
    onError: (error, variables, context) => {
      logger.error('[useBatchUpdateDocumentsMutation] Update failed', {
        error,
      });

      // Revert optimistic updates on error
      queryClient.invalidateQueries({
        queryKey: ['versions'],
      });
    },
  });
};
