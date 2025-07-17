import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToastWrapper';
import { useApiQuery, useApiMutation } from '@/lib/api/queryClient';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { InventionData } from '@/types';
import { logger } from '@/utils/clientLogger';
import { API_ROUTES } from '@/constants/apiRoutes';
import { inventionQueryKeys } from '@/lib/queryKeys/inventionKeys';
import { STALE_TIME, GC_TIME } from '@/constants/time';
import { keepPreviousData } from '@tanstack/react-query';

/**
 * Custom hook to fetch invention data for a project
 */
export function useInventionData(projectId: string | undefined) {
  const queryKey = inventionQueryKeys.detail(projectId || '');

  return useApiQuery<InventionData | null>([...queryKey], {
    url: API_ROUTES.PROJECTS.INVENTION(projectId || ''),
    enabled: !!projectId,
    staleTime: STALE_TIME.DEFAULT,
    gcTime: GC_TIME.DEFAULT,
    refetchOnWindowFocus: false, // Prevent refetch on window focus
    placeholderData: keepPreviousData, // Keep showing previous data while fetching
  });
}

/**
 * Custom hook to update invention data
 */
export function useUpdateInventionData(projectId: string | undefined) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const queryKey = inventionQueryKeys.detail(projectId || '');

  return useApiMutation<InventionData, Partial<InventionData>>({
    url: API_ROUTES.PROJECTS.INVENTION(projectId || ''),
    method: 'PUT',
    onMutate: async updates => {
      if (!projectId)
        throw new ApplicationError(
          ErrorCode.VALIDATION_REQUIRED_FIELD,
          'Project ID is required'
        );

      // Cancel any outgoing refetches to prevent overwriting optimistic update
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<InventionData>(queryKey);

      // Optimistically update the cache
      if (previousData) {
        queryClient.setQueryData(queryKey, {
          ...previousData,
          ...updates,
        });
      }

      // Return a context object with the snapshotted value
      return { previousData };
    },
    onError: (error, updates, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      const typedContext = context as
        | { previousData?: InventionData }
        | undefined;
      if (typedContext?.previousData) {
        queryClient.setQueryData(queryKey, typedContext.previousData);
      }

      logger.error('[useUpdateInventionData] Failed to update invention data', {
        projectId,
        error,
      });

      // Note: Global error handler in useApiMutation will show a toast automatically
    },
    onSuccess: data => {
      // Update the cache with the server response
      queryClient.setQueryData(queryKey, data);

      logger.info(
        '[useUpdateInventionData] Successfully updated invention data',
        {
          projectId,
        }
      );

      toast({
        title: 'Saved',
        status: 'success',
        duration: 1500,
        isClosable: true,
        position: 'bottom-right',
      });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      // But this happens in the background and won't affect the UI
      queryClient.invalidateQueries({
        queryKey,
        refetchType: 'none', // Don't force an immediate refetch
      });
    },
  });
}

/**
 * Custom hook to get a specific field from invention data
 */
export function useInventionField<K extends keyof InventionData>(
  projectId: string | undefined,
  fieldName: K
): InventionData[K] | undefined {
  const { data } = useInventionData(projectId);
  return data?.[fieldName];
}

/**
 * Hook to check if invention data has meaningful content
 */
export function useHasInventionContent(projectId: string | undefined): boolean {
  const { data } = useInventionData(projectId);

  if (!data) return false;

  // Check if it has meaningful content (not just empty structure)
  return !!(
    data.title ||
    data.abstract ||
    data.summary ||
    (data.features && data.features.length > 0) ||
    (data.claims && Object.keys(data.claims).length > 0)
  );
}
