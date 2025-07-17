import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToastWrapper';
import { useApiMutation } from '@/lib/api/queryClient';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { inventionQueryKeys } from '@/lib/queryKeys/inventionKeys';
import { useInventionService } from '@/contexts/ClientServicesContext';
import { logger } from '@/utils/clientLogger';
import { InventionData } from '@/types';

/**
 * A dedicated hook to update only the summary of an invention.
 * @param projectId The ID of the project.
 */
export function useUpdateInventionSummary(projectId: string | undefined) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const inventionDetailKey = inventionQueryKeys.detail(projectId || '');
  const inventionService = useInventionService();

  return useApiMutation<{ message: string }, { summary: string }>({
    mutationFn: async ({ summary }) => {
      if (!projectId) {
        throw new ApplicationError(
          ErrorCode.VALIDATION_REQUIRED_FIELD,
          'Project ID is required'
        );
      }
      await inventionService.updateInvention(projectId, { summary });
      return { message: 'Summary updated successfully' };
    },
    onMutate: async ({ summary }) => {
      // Optimistically update the summary in the cache
      await queryClient.cancelQueries({ queryKey: inventionDetailKey });

      const previousData =
        queryClient.getQueryData<InventionData>(inventionDetailKey);

      if (previousData) {
        queryClient.setQueryData(inventionDetailKey, {
          ...previousData,
          summary: summary,
        });
      }

      return { previousData };
    },
    onError: (err, variables, context: any) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(inventionDetailKey, context.previousData);
      }
      toast({
        title: 'Error updating summary',
        description:
          err instanceof Error ? err.message : 'An unknown error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Summary Saved',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    },
    onSettled: () => {
      // Invalidate the query to refetch fresh data from the server
      queryClient.invalidateQueries({ queryKey: inventionDetailKey });
    },
  });
}
