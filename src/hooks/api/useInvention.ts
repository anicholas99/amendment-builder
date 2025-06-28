/* eslint-disable local/no-direct-react-query-hooks */
/**
 * React Query hooks for invention/technology details operations
 * Centralized data fetching logic for invention management
 */
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import {
  inventionClientService,
  InventionClientService,
} from '@/client/services/invention.client-service';
import { InventionData } from '@/types/invention';
import { STALE_TIME, GC_TIME } from '@/constants/time';
import { logger } from '@/lib/monitoring/logger';

// Query key factory for invention queries
export const inventionQueryKeys = {
  all: ['invention'] as const,
  byProject: (projectId: string) => ['invention', projectId] as const,
  extraction: ['invention', 'extraction'] as const,
  processing: ['invention', 'processing'] as const,
};

/**
 * Query hook for fetching invention data by project ID
 */
export const useInventionQuery = (projectId: string) => {
  const queryResult = useQuery({
    queryKey: inventionQueryKeys.byProject(projectId),
    queryFn: async () => {
      const result = await inventionClientService.getInvention(projectId);
      return result;
    },
    enabled: !!projectId,
    staleTime: STALE_TIME.LONG,
    gcTime: GC_TIME.LONG,
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Changed from true - trust the cache
    refetchOnReconnect: false,
    // Keep the data in cache and don't refetch if we already have it
    // This preserves optimistic updates when navigating
    placeholderData: keepPreviousData,
    retry: (failureCount, error: any) => {
      // Don't retry for 404 errors as they're expected for new projects
      if (error?.code === 'DB_RECORD_NOT_FOUND' || error?.status === 404) {
        return false;
      }
      // Only retry once for other errors
      return failureCount < 1;
    },
    // Important: Reset error state when projectId changes
    throwOnError: false,
    // Return null for 404s to skip loading state for new projects
    select: (data) => data === undefined ? null : data,
  });

  return queryResult;
};

/**
 * Mutation hook for updating invention data
 */
export const useUpdateInventionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      updates,
    }: {
      projectId: string;
      updates: Partial<InventionData>;
    }) => {
      // IMPORTANT: Filter out claims from updates to prevent ID regeneration
      // Claims should only be updated through dedicated claim endpoints
      const { claims, ...safeUpdates } = updates;
      if (claims !== undefined) {
        logger.warn(
          '[useUpdateInventionMutation] Attempted to update claims through invention endpoint - this would regenerate all claim IDs. Update ignored.',
          { projectId }
        );
      }
      return inventionClientService.updateInvention(projectId, safeUpdates);
    },
    onMutate: async ({ projectId, updates }) => {
      // Cancel any in-flight queries
      await queryClient.cancelQueries({
        queryKey: inventionQueryKeys.byProject(projectId),
      });

      // Get the current data
      const previousData = queryClient.getQueryData<InventionData>(
        inventionQueryKeys.byProject(projectId)
      );

      // Create optimistic updates with field name transformations
      // Filter out claims to prevent issues
      const { claims, ...filteredUpdates } = updates;
      const optimisticUpdates = { ...filteredUpdates };

      // Handle field name mappings for UI
      if ('noveltyStatement' in filteredUpdates) {
        optimisticUpdates.novelty = filteredUpdates.noveltyStatement;
      }

      // Optimistically update the cache
      queryClient.setQueryData<InventionData>(
        inventionQueryKeys.byProject(projectId),
        oldData => ({ ...(oldData || {}), ...optimisticUpdates })
      );

      return { previousData };
    },
    onError: (_error, variables, context) => {
      // Revert the optimistic update on error
      if (context?.previousData) {
        queryClient.setQueryData(
          inventionQueryKeys.byProject(variables.projectId),
          context.previousData
        );
      }
    },
    onSuccess: (data, variables) => {
      // Update the cache with the server response
      if (data) {
        queryClient.setQueryData(
          inventionQueryKeys.byProject(variables.projectId),
          data
        );
      }

      // Schedule a background refetch to sync with server
      // This won't interrupt the user or overwrite optimistic updates
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: inventionQueryKeys.byProject(variables.projectId),
          refetchType: 'none', // Don't force immediate refetch
        });
      }, 3000); // Wait 3 seconds before marking as stale
    },
    onSettled: undefined, // Remove the immediate invalidation
  });
};

/**
 * Mutation hook for extracting text from files
 */
export const useExtractTextMutation = () => {
  return useMutation({
    mutationFn: (file: File) => InventionClientService.extractText(file),
  });
};

/**
 * Mutation hook for uploading documents
 */
export const useUploadDocumentMutation = () => {
  return useMutation({
    mutationFn: (file: File) => InventionClientService.uploadDocument(file),
  });
};

/**
 * Mutation hook for processing document files (extract + structure)
 */
export const useProcessDocumentMutation = () => {
  return useMutation({
    mutationFn: (file: File) =>
      InventionClientService.processDocumentFile(file),
  });
};

/**
 * Mutation hook for uploading figures
 */
export const useUploadFigureMutation = () => {
  return useMutation({
    mutationFn: ({ projectId, file }: { projectId: string; file: File }) =>
      InventionClientService.uploadFigure(projectId, file),
  });
};

/**
 * Mutation hook for deleting figures
 */
export const useDeleteFigureMutation = () => {
  return useMutation({
    mutationFn: ({
      projectId,
      figureId,
    }: {
      projectId: string;
      figureId: string;
    }) => InventionClientService.deleteFigure(projectId, figureId),
  });
};

export const useGenerateFigureDetailsMutation = () => {
  return useMutation({
    mutationFn: (payload: { description: string; inventionContext?: string }) =>
      InventionClientService.generateFigureDetails(payload),
  });
};

/**
 * Mutation hook for updating figure details
 */
export const useUpdateFigureMutation = () => {
  return useMutation({
    mutationFn: ({ figureId, updates }: { figureId: string; updates: any }) =>
      InventionClientService.updateFigure(figureId, updates),
  });
};
