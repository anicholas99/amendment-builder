import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DraftApiService, DraftDocument, UpdateDraftDocumentRequest } from '@/services/api/draftApiService';
import { logger } from '@/lib/monitoring/logger';
import { draftQueryKeys } from '@/lib/queryKeys/draftQueryKeys';

/**
 * Hook to fetch draft documents for a project
 */
export const useDraftDocuments = (
  projectId: string, 
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: draftQueryKeys.all(projectId),
    queryFn: () => DraftApiService.getDraftDocuments(projectId),
    enabled: options?.enabled !== undefined ? options.enabled : !!projectId,
    staleTime: 30 * 1000, // 30 seconds - prevent immediate refetch
    gcTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
    refetchOnMount: false, // Don't refetch on mount if data exists
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: false, // Don't refetch on reconnect
  });
};

/**
 * Hook to get a specific draft document by type
 */
export const useDraftDocumentByType = (projectId: string, type: string) => {
  return useQuery({
    queryKey: draftQueryKeys.byType(projectId, type),
    queryFn: () => DraftApiService.getDraftDocumentByType(projectId, type),
    enabled: !!projectId && !!type,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to update a single draft document
 */
export const useUpdateDraftDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      type,
      content,
    }: {
      projectId: string;
      type: string;
      content: string;
    }) => DraftApiService.updateDraftDocument(projectId, type, content),
    onSuccess: (data, variables) => {
      // Update the specific document in cache
      queryClient.setQueryData(
        draftQueryKeys.byType(variables.projectId, variables.type),
        data
      );

      // Update the list of documents
      queryClient.setQueryData(
        draftQueryKeys.all(variables.projectId),
        (old: DraftDocument[] = []) => {
          const index = old.findIndex(doc => doc.type === variables.type);
          if (index >= 0) {
            const updated = [...old];
            updated[index] = data;
            return updated;
          }
          return [...old, data];
        }
      );

      logger.info('Draft document updated', {
        projectId: variables.projectId,
        type: variables.type,
      });
    },
    onError: (error, variables) => {
      logger.error('Failed to update draft document', {
        error,
        projectId: variables.projectId,
        type: variables.type,
      });
    },
  });
};

/**
 * Hook to batch update draft documents
 */
export const useBatchUpdateDraftDocuments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      updates,
    }: {
      projectId: string;
      updates: UpdateDraftDocumentRequest[];
    }) => DraftApiService.batchUpdateDraftDocuments(projectId, updates),
    onMutate: async ({ projectId, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: draftQueryKeys.all(projectId) });
      
      // Snapshot previous value
      const previousDocuments = queryClient.getQueryData<DraftDocument[]>(
        draftQueryKeys.all(projectId)
      );
      
      // Optimistically update cache
      if (previousDocuments) {
        const updatedDocuments = [...previousDocuments];
        
        updates.forEach(update => {
          const index = updatedDocuments.findIndex(doc => doc.type === update.type);
          if (index >= 0) {
            // Update existing document
            updatedDocuments[index] = {
              ...updatedDocuments[index],
              content: update.content,
              updatedAt: new Date(),
            };
          } else {
            // Add new document (with temporary data)
            updatedDocuments.push({
              id: `temp-${update.type}`,
              projectId,
              type: update.type,
              content: update.content,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
        });
        
        queryClient.setQueryData(draftQueryKeys.all(projectId), updatedDocuments);
      }
      
      return { previousDocuments };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousDocuments) {
        queryClient.setQueryData(
          draftQueryKeys.all(variables.projectId),
          context.previousDocuments
        );
      }
      
      logger.error('Failed to batch update draft documents', {
        error,
        projectId: variables.projectId,
        updateCount: variables.updates.length,
      });
    },
    onSuccess: (data, variables) => {
      // Success! The optimistic update is already in place from onMutate.
      // We don't immediately invalidate to prevent race conditions when switching views.
      // Instead, schedule a background sync after a delay.
      
      logger.info('Draft documents batch updated', {
        projectId: variables.projectId,
        count: data?.count,
      });
      
      // Schedule a background refetch after 5 seconds
      // This ensures eventual consistency without disrupting the user experience
      setTimeout(() => {
        // Only invalidate if the component is still mounted
        // This won't force an immediate refetch, just marks as stale for next access
        queryClient.invalidateQueries({
          queryKey: draftQueryKeys.all(variables.projectId),
          refetchType: 'none', // Don't force immediate refetch
        });
      }, 5000);
    },
    // Remove onSettled to prevent immediate invalidation
  });
};

/**
 * Hook to check if project has draft documents
 */
export const useHasDraftDocuments = (projectId: string) => {
  return useQuery({
    queryKey: draftQueryKeys.exists(projectId),
    queryFn: () => DraftApiService.hasDraftDocuments(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}; 