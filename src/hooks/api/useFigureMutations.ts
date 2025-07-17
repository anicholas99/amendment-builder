import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToastWrapper';
import {
  FigureApiService,
  FigureUpdatePayload,
} from '@/services/api/figureApiService';
import { logger } from '@/utils/clientLogger';
import { queryKeys } from '@/config/reactQueryConfig';
import { API_ROUTES } from '@/constants/apiRoutes';
import { apiFetch } from '@/lib/api/apiClient';

interface AssignFigureParams {
  projectId: string;
  figureId: string;
  figureKey: string;
}

interface UnassignFigureParams {
  projectId: string;
  figureId: string;
}

/**
 * Simplified hook for assigning figures
 */
export function useAssignFigure() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({
      projectId,
      figureId,
      figureKey,
    }: AssignFigureParams) => {
      logger.info('[useAssignFigure] Assigning figure', {
        projectId,
        figureId,
        figureKey,
      });

      const response = await FigureApiService.updateFigure(
        projectId,
        figureId,
        {
          figureKey,
        }
      );

      return response;
    },
    onSuccess: async (data, variables) => {
      const { projectId, figureKey } = variables;

      logger.info('[useAssignFigure] Assignment successful', {
        projectId,
        figureKey,
        assignedFigureId: data.id,
      });

      // Invalidate all figure-related queries
      const figuresKey = queryKeys.projects.figures(projectId);
      const unassignedKey = [...figuresKey, 'unassigned'];

      // Cancel any in-flight requests
      await queryClient.cancelQueries({ queryKey: figuresKey });
      await queryClient.cancelQueries({ queryKey: unassignedKey });

      // Remove the cached data to force fresh fetch
      queryClient.removeQueries({ queryKey: figuresKey, exact: false });
      queryClient.removeQueries({ queryKey: unassignedKey, exact: true });

      // Add a small delay to ensure server has processed the assignment
      await new Promise(resolve => setTimeout(resolve, 500));

      // Force immediate refetch
      await Promise.all([
        queryClient.refetchQueries({ queryKey: figuresKey, exact: false }),
        queryClient.refetchQueries({ queryKey: unassignedKey, exact: true }),
      ]);

      toast({
        title: 'Figure assigned',
        description: `Figure has been assigned to ${figureKey}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'bottom-right',
      });
    },
    onError: (error, variables) => {
      logger.error('[useAssignFigure] Assignment failed', {
        projectId: variables.projectId,
        figureId: variables.figureId,
        error,
      });

      toast({
        title: 'Assignment failed',
        description: 'Failed to assign figure. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom-right',
      });
    },
  });
}

/**
 * Simplified hook for unassigning figures
 */
export function useUnassignFigure() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({ projectId, figureId }: UnassignFigureParams) => {
      logger.info('[useUnassignFigure] Unassigning figure', {
        projectId,
        figureId,
      });

      const response = await FigureApiService.updateFigure(
        projectId,
        figureId,
        {
          unassign: true,
        }
      );

      return response;
    },
    onSuccess: async (data, variables) => {
      const { projectId } = variables;

      logger.info('[useUnassignFigure] Unassignment successful', {
        projectId,
        unassignedFigureId: data.id,
      });

      // Invalidate all figure-related queries
      const figuresKey = queryKeys.projects.figures(projectId);
      const unassignedKey = [...figuresKey, 'unassigned'];

      // Cancel any in-flight requests
      await queryClient.cancelQueries({ queryKey: figuresKey });
      await queryClient.cancelQueries({ queryKey: unassignedKey });

      // Remove the cached data to force fresh fetch
      queryClient.removeQueries({ queryKey: figuresKey, exact: false });
      queryClient.removeQueries({ queryKey: unassignedKey, exact: true });

      // Add a small delay to ensure server has processed the unassignment
      await new Promise(resolve => setTimeout(resolve, 500));

      // Force immediate refetch
      await Promise.all([
        queryClient.refetchQueries({ queryKey: figuresKey, exact: false }),
        queryClient.refetchQueries({ queryKey: unassignedKey, exact: true }),
      ]);

      toast({
        title: 'Figure unassigned',
        description:
          'Figure has been unassigned and is now available for reassignment.',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'bottom-right',
      });
    },
    onError: (error, variables) => {
      logger.error('[useUnassignFigure] Unassignment failed', {
        projectId: variables.projectId,
        figureId: variables.figureId,
        error,
      });

      toast({
        title: 'Unassignment failed',
        description: 'Failed to unassign figure. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom-right',
      });
    },
  });
}

/**
 * Hook to force refresh all figure data
 */
export function useRefreshFigures() {
  const queryClient = useQueryClient();

  return async (projectId: string) => {
    logger.info('[useRefreshFigures] Forcing refresh of all figure data', {
      projectId,
    });

    const figuresKey = queryKeys.projects.figures(projectId);
    const unassignedKey = [...figuresKey, 'unassigned'];

    // Cancel, remove, and refetch
    await queryClient.cancelQueries({ queryKey: figuresKey });
    await queryClient.cancelQueries({ queryKey: unassignedKey });

    queryClient.removeQueries({ queryKey: figuresKey, exact: false });
    queryClient.removeQueries({ queryKey: unassignedKey, exact: true });

    await Promise.all([
      queryClient.refetchQueries({ queryKey: figuresKey, exact: false }),
      queryClient.refetchQueries({ queryKey: unassignedKey, exact: true }),
    ]);
  };
}
