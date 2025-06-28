import React, { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { logger } from '@/lib/monitoring/logger';
import { useToast } from '@chakra-ui/react';
import { InventionData } from '@/types/invention';
import { useProcessInventionMutation } from '@/hooks/api/useProjects';
import { useProjectData } from '@/contexts/ProjectDataContext';
import { inventionQueryKeys } from '@/lib/queryKeys/inventionKeys';

/**
 * Custom hook to handle invention text analysis using React Query
 */
export const useInventionAnalysis = (
  textInput: string | null,
  updateInventionData?: React.Dispatch<
    React.SetStateAction<InventionData | null>
  >
) => {
  const toast = useToast();
  const { activeProjectId } = useProjectData();
  const queryClient = useQueryClient();
  const analysisMutation = useProcessInventionMutation({
    onSuccess: async (result, variables) => {
      // The mutation already handles cache invalidation and updates
      // We just need to show success message and emit the event
      
      toast({
        title: 'Analysis Complete',
        description: 'Your invention has been analyzed and saved.',
        status: 'success',
        position: 'bottom-right',
      });

      logger.info('[useInventionAnalysis] Analysis successful', {
        projectId: variables.projectId,
      });
      
      // Invalidate the invention query to trigger a refetch
      if (activeProjectId) {
        await queryClient.invalidateQueries({
          queryKey: inventionQueryKeys.detail(activeProjectId),
          refetchType: 'active',
        });
        
        // Also invalidate the local query key used by useInventionQuery
        await queryClient.invalidateQueries({
          queryKey: ['invention', activeProjectId],
          refetchType: 'active',
        });
      }
      
      // Fetch the updated invention data from cache after mutation completes
      if (updateInventionData && activeProjectId) {
        // Give React Query time to update the cache
        setTimeout(() => {
          const inventionData = queryClient.getQueryData(inventionQueryKeys.detail(activeProjectId)) as InventionData | undefined;
          if (inventionData) {
            updateInventionData(inventionData);
          }
        }, 500);
      }
    },
  });

  const analyzeInventionText = useCallback(async () => {
    if (!textInput || textInput.trim().length < 10) {
      toast({
        title: 'Empty Input',
        description:
          'Please enter a description of your invention before processing.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'bottom-right',
      });
      return false;
    }

    if (!activeProjectId) {
      toast({
        title: 'Error',
        description: 'No active project selected.',
        status: 'error',
        position: 'bottom-right',
      });
      return false;
    }

    try {
      await analysisMutation.mutateAsync({
        text: textInput,
        projectId: activeProjectId,
      });
      return true;
    } catch {
      return false;
    }
  }, [
    textInput,
    toast,
    analysisMutation,
    activeProjectId,
  ]);

  return {
    isProcessing: analysisMutation.isPending,
    analyzeInventionText,
  };
};
