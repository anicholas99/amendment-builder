import { useCallback } from 'react';
import { useToast } from '@/hooks/useToastWrapper';
import { queryKeys } from '@/config/reactQueryConfig';
import { FiguresWithIds } from '@/hooks/api/useFigures';
import { logger } from '@/utils/clientLogger';
import { FigureApiService } from '@/services/api/figureApiService';
import { useOptimisticMutation } from '@/hooks/api/useOptimisticMutations';

interface UseFigureDescriptionProps {
  figures: FiguresWithIds | null;
  onUpdate: (figures: FiguresWithIds) => void | Promise<void>;
  currentFigureKey: string;
  projectId?: string;
}

export const useFigureDescriptionOptimistic = ({
  figures,
  onUpdate,
  currentFigureKey,
  projectId,
}: UseFigureDescriptionProps) => {
  const toast = useToast();

  // Create pending figure mutation
  const createPendingMutation = useOptimisticMutation({
    mutationFn: async ({
      description,
      title,
    }: {
      description: string;
      title?: string;
    }) => {
      if (!projectId) throw new Error('Project ID is required');

      return FigureApiService.createPendingFigure(
        projectId,
        currentFigureKey,
        description,
        title || `Figure ${currentFigureKey}`
      );
    },
    queryKey: [...queryKeys.projects.figures(projectId!)],
    updateCache: (old: FiguresWithIds, { description, title }) => {
      if (!old || !old[currentFigureKey]) return old;

      return {
        ...old,
        [currentFigureKey]: {
          ...old[currentFigureKey],
          title: title || `Figure ${currentFigureKey}`,
        },
      };
    },
    onSuccess: pendingFigure => {
      logger.info('[useFigureDescriptionOptimistic] Created pending figure', {
        figureId: pendingFigure.id,
        figureKey: currentFigureKey,
      });

      toast({
        title: 'Title saved',
        status: 'success',
        duration: 2000,
        position: 'bottom-right',
      });
    },
    onError: error => {
      logger.error(
        '[useFigureDescriptionOptimistic] Failed to create pending figure',
        error
      );

      toast({
        title: 'Failed to save title',
        description: 'Please try again',
        status: 'error',
        duration: 3000,
        position: 'bottom-right',
      });
    },
  });

  // Update description mutation (actually updates title now)
  const updateDescriptionMutation = useOptimisticMutation({
    mutationFn: async ({
      figureId,
      description,
    }: {
      figureId: string;
      description: string; // This is actually the title value from UI
    }) => {
      if (!projectId) throw new Error('Project ID is required');

      return FigureApiService.updateFigureMetadata(projectId, figureId, {
        title: description, // Update title field in the API
      });
    },
    queryKey: [...queryKeys.projects.figures(projectId!)],
    updateCache: (old: FiguresWithIds, { description }) => {
      if (!old || !old[currentFigureKey]) return old;

      return {
        ...old,
        [currentFigureKey]: {
          ...old[currentFigureKey],
          title: description, // Update title in cache
        },
      };
    },
    onSuccess: () => {
      logger.info('[useFigureDescriptionOptimistic] Updated figure title', {
        figureKey: currentFigureKey,
      });

      toast({
        title: 'Title saved',
        status: 'success',
        duration: 2000,
        position: 'bottom-right',
      });
    },
    onError: error => {
      logger.error(
        '[useFigureDescriptionOptimistic] Failed to update description',
        error
      );

      toast({
        title: 'Failed to update title',
        description: 'Please try again',
        status: 'error',
        duration: 3000,
        position: 'bottom-right',
      });
    },
  });

  // Main update function (updates title, not description)
  const handleUpdateDescription = useCallback(
    async (newTitle: string) => {
      if (!figures || !figures[currentFigureKey] || !projectId) {
        logger.error(`Cannot update title - missing required data`, {
          currentFigureKey,
          hasProjectId: !!projectId,
          hasFigures: !!figures,
        });
        return;
      }

      const currentFigure = figures[currentFigureKey];
      const figureId = currentFigure._id;

      // If figure doesn't have an ID, create a pending figure first
      if (!figureId) {
        await createPendingMutation.mutateAsync({
          description: '', // Empty description since we're editing title
          title: newTitle, // The new value is actually the title
        });
      } else {
        // Update existing figure
        await updateDescriptionMutation.mutateAsync({
          figureId,
          description: newTitle, // This will be mapped to title in the mutation
        });
      }
    },
    [
      figures,
      currentFigureKey,
      projectId,
      createPendingMutation,
      updateDescriptionMutation,
    ]
  );

  return {
    handleUpdateDescription,
    isUpdating:
      createPendingMutation.isPending || updateDescriptionMutation.isPending,
  };
};
