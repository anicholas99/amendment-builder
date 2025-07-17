/**
 * React Query hooks for figure-related operations
 * Demonstrates the migration pattern for technology details feature
 */
import { useToast } from '@/utils/toast';
import { logger } from '@/utils/clientLogger';
import {
  useGenerateFigureDetailsMutation,
  useUpdateFigureMutation,
  useDeleteFigureMutation,
} from '@/hooks/api/useInvention';

/**
 * Consolidated hook for all figure operations
 * Provides a single interface for components to use
 */
export const useFigureOperations = () => {
  const generateDetails = useGenerateFigureDetailsMutation();
  const updateFigure = useUpdateFigureMutation();
  const deleteFigure = useDeleteFigureMutation();
  const toast = useToast();

  const generate = (payload: {
    description: string;
    inventionContext?: string;
  }) => {
    return generateDetails.mutate(payload, {
      onSuccess: (data: any) => {
        toast.success('Figure details generated successfully');
        logger.info('Figure details generated', {
          figureId: data.figureDetails.id,
        });
      },
    });
  };

  const update = (payload: { figureId: string; updates: any }) => {
    return updateFigure.mutate(payload, {
      onSuccess: (data: any, variables) => {
        toast.success('Figure updated successfully');
        logger.info('Figure updated', { figureId: variables.figureId });
      },
    });
  };

  const remove = (payload: { projectId: string; figureId: string }) => {
    return deleteFigure.mutate(payload, {
      onSuccess: (data: any, variables) => {
        toast.success('Figure deleted successfully');
        logger.info('Figure deleted', {
          projectId: variables.projectId,
          figureId: variables.figureId,
        });
      },
    });
  };

  return {
    generateDetails: generate,
    updateFigure: update,
    deleteFigure: remove,

    isLoading:
      generateDetails.isPending ||
      updateFigure.isPending ||
      deleteFigure.isPending,
  };
};
