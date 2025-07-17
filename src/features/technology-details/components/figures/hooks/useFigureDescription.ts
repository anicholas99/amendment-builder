import { useCallback } from 'react';
import { Figure } from '../carousel-components/types';
import { FiguresWithIds } from '@/hooks/api/useFigures';
import { logger } from '@/utils/clientLogger';
import { useFigureDescriptionOptimistic } from './useFigureDescriptionOptimistic';

// This hook has been refactored to be stateless. It no longer manages
// local state for editing or drafts. It provides a simple utility
// function to handle the update logic for a figure's description.
// The parent component is now responsible for all state management.

interface UseFigureDescriptionProps {
  figures: FiguresWithIds | null;
  onUpdate: (figures: FiguresWithIds) => void | Promise<void>;
  currentFigureKey: string;
  projectId?: string;
}

export const useFigureDescription = ({
  figures,
  onUpdate,
  currentFigureKey,
  projectId,
}: UseFigureDescriptionProps) => {
  // Use the optimistic version for better UX
  const { handleUpdateDescription, isUpdating } =
    useFigureDescriptionOptimistic({
      figures,
      onUpdate,
      currentFigureKey,
      projectId,
    });

  // Update a whole figure object
  const handleUpdateFigure = useCallback(
    async (updatedFigure: Figure) => {
      if (!figures) return;

      // This function should also be refactored to use proper APIs
      // For now, keeping it as a no-op since it's not clear what updates it handles
      logger.warn(
        '[useFigureDescription] handleUpdateFigure called but should use specific APIs',
        { currentFigureKey }
      );
    },
    [currentFigureKey]
  );

  return {
    handleUpdateDescription,
    handleUpdateFigure,
  };
};
