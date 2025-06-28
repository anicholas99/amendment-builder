import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { inventionQueryKeys } from '@/lib/queryKeys/inventionKeys';
import { Figure, Figures } from '../carousel-components/types';
import { logger } from '@/lib/monitoring/logger';
import { queryKeys } from '@/config/reactQueryConfig';

// This hook has been refactored to be stateless. It no longer manages
// local state for editing or drafts. It provides a simple utility
// function to handle the update logic for a figure's description.
// The parent component is now responsible for all state management.

interface UseFigureDescriptionProps {
  figures: Figures | null;
  onUpdate: (figures: Figures) => void | Promise<void>;
  currentFigureKey: string;
  projectId?: string;
}

export const useFigureDescription = ({
  figures,
  onUpdate,
  currentFigureKey,
  projectId,
}: UseFigureDescriptionProps) => {
  const queryClient = useQueryClient();

  // Update a figure's description
  const handleUpdateDescription = useCallback(
    async (newDescription: string) => {
      if (!figures || !figures[currentFigureKey]) {
        logger.error(
          `Figure with key ${currentFigureKey} not found for update.`
        );
        return;
      }

      const updatedFigures = structuredClone(figures) as Figures;
      updatedFigures[currentFigureKey].description = newDescription;

      // Optimistically update cache so UI shows new description immediately
      if (projectId) {
        queryClient.setQueryData<Figures>(
          queryKeys.projects.figures(projectId),
          old => {
            const draft = structuredClone(old || {});
            if (draft[currentFigureKey]) {
              draft[currentFigureKey].description = newDescription;
            }
            return draft;
          }
        );
      }
      await onUpdate(updatedFigures);
    },
    [figures, currentFigureKey, onUpdate, projectId, queryClient]
  );

  // Update a whole figure object
  const handleUpdateFigure = useCallback(
    async (updatedFigure: Figure) => {
      if (!figures) return;
      const newFigures = structuredClone(figures) as Figures;
      newFigures[currentFigureKey] = updatedFigure;
      await onUpdate(newFigures);
    },
    [figures, currentFigureKey, onUpdate]
  );

  return {
    handleUpdateDescription,
    handleUpdateFigure,
  };
};
