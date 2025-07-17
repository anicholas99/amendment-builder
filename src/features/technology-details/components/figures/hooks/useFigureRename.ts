import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { logger } from '@/utils/clientLogger';
import { useToast } from '@/hooks/useToastWrapper';
import { useUpdateFigure } from '@/hooks/api/useUpdateFigure';
import { queryKeys } from '@/config/reactQueryConfig';
import { sortFigureKeys } from '../carousel-components/figureUtils';
import type { FiguresWithIds } from '@/hooks/api/useFigures';

interface UseFigureRenameOptions {
  projectId?: string;
  figures: FiguresWithIds;
  figureKeys: string[];
  currentIndex: number;
  onUpdate: (figures: FiguresWithIds) => void | Promise<void>;
  setCurrentIndex: (index: number) => void;
  onFigureChange?: (figureNumber: string) => void;
}

interface UseFigureRenameResult {
  handleRenameFigure: (newFigureNumber: string) => Promise<void>;
  validateFigureNumber: (figureNumber: string) => {
    isValid: boolean;
    error?: string;
  };
}

/**
 * Hook for handling figure renaming operations
 * Manages validation, database updates, and cache synchronization
 */
export function useFigureRename({
  projectId,
  figures,
  figureKeys,
  currentIndex,
  onUpdate,
  setCurrentIndex,
  onFigureChange,
}: UseFigureRenameOptions): UseFigureRenameResult {
  const toast = useToast();
  const queryClient = useQueryClient();
  const updateFigureMutation = useUpdateFigure();

  // Validate figure number format
  const validateFigureNumber = useCallback(
    (figureNumber: string): { isValid: boolean; error?: string } => {
      // Parse input and create standardized figure key
      let newFigureKey: string;

      // Check if input already has FIG. prefix
      if (figureNumber.toUpperCase().startsWith('FIG.')) {
        newFigureKey = figureNumber.trim();
      } else if (figureNumber.toUpperCase().startsWith('FIG')) {
        // Handle case where user typed "FIG" without the period
        newFigureKey = figureNumber.replace(/^FIG/i, 'FIG.').trim();
      } else {
        // Add the FIG. prefix
        newFigureKey = `FIG. ${figureNumber.trim()}`;
      }

      // Validate the figure number format
      const isValidFormat = /^FIG\.\s*\d+[A-Za-z]*$/i.test(newFigureKey);
      if (!isValidFormat) {
        return {
          isValid: false,
          error: 'Figure number must be in format "FIG. 1", "FIG. 1A", etc.',
        };
      }

      // Check if figure already exists
      if (figures[newFigureKey]) {
        return {
          isValid: false,
          error: `${newFigureKey} already exists.`,
        };
      }

      return { isValid: true };
    },
    [figures]
  );

  // Extract figure ID from image URL
  const extractFigureIdFromUrl = useCallback(
    (imageUrl: string): string | null => {
      // URL format: /api/projects/{projectId}/figures/{figureId}/download
      const match = imageUrl.match(/figures\/([a-zA-Z0-9-]+)\/download/);
      return match?.[1] || null;
    },
    []
  );

  // Handle renaming a figure
  const handleRenameFigure = useCallback(
    async (newFigureNumber: string) => {
      if (!figures) return;

      const figureNum = figureKeys[currentIndex];
      if (!figureNum) return;

      // Parse input and create standardized figure key
      let newFigureKey: string;

      // Check if input already has FIG. prefix
      if (newFigureNumber.toUpperCase().startsWith('FIG.')) {
        newFigureKey = newFigureNumber.trim();
      } else if (newFigureNumber.toUpperCase().startsWith('FIG')) {
        // Handle case where user typed "FIG" without the period
        newFigureKey = newFigureNumber.replace(/^FIG/i, 'FIG.').trim();
      } else {
        // Add the FIG. prefix
        newFigureKey = `FIG. ${newFigureNumber.trim()}`;
      }

      // Validate
      const validation = validateFigureNumber(newFigureNumber);
      if (!validation.isValid) {
        toast({
          title: validation.error?.includes('exists')
            ? 'Figure exists'
            : 'Invalid figure number',
          description: validation.error,
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'bottom-right',
        });
        return;
      }

      // Check if same as current
      if (newFigureKey === figureNum) {
        return;
      }

      // Create a copy of figures with the rename
      const newFigures = structuredClone(figures) as FiguresWithIds;
      const currentFig = newFigures[figureNum];

      // Update database if figure has an uploaded image
      if (currentFig?.image && projectId) {
        const figureId = extractFigureIdFromUrl(currentFig.image);

        if (figureId) {
          try {
            // Update the figureKey in the database
            await updateFigureMutation.mutateAsync({
              projectId,
              figureId,
              updates: { figureKey: newFigureKey },
            });

            logger.info('Updated figure key in database', {
              projectId,
              figureId,
              oldKey: figureNum,
              newKey: newFigureKey,
            });
          } catch (error) {
            logger.error('Failed to update figure key in database', {
              projectId,
              figureId,
              error,
            });

            // Still proceed with the UI update even if DB update fails
            toast({
              title: 'Warning',
              description:
                'Figure renamed locally but database update failed. The change may not persist.',
              status: 'warning',
              duration: 5000,
              isClosable: true,
              position: 'bottom-right',
            });
          }
        }
      }

      // Copy the figure data to the new key
      newFigures[newFigureKey] = { ...newFigures[figureNum] };

      // Delete the old figure
      delete newFigures[figureNum];

      // Optimistically update cache for rename so UI switches instantly
      if (projectId) {
        queryClient.setQueryData<FiguresWithIds>(
          queryKeys.projects.figures(projectId),
          () => structuredClone(newFigures)
        );
      }

      // Persist rename
      await onUpdate(newFigures);

      // Find and navigate to the new figure
      const newFigureKeys = sortFigureKeys(newFigures);
      const newIndex = newFigureKeys.indexOf(newFigureKey);

      if (newIndex !== -1) {
        setCurrentIndex(newIndex);
        if (onFigureChange) {
          onFigureChange(newFigureKey);
        }
      }

      // Important: Also ensure the parent's setCurrentFigure is called with the new key
      logger.info('[useFigureRename] Navigating to renamed figure', {
        oldKey: figureNum,
        newKey: newFigureKey,
        newIndex,
      });

      toast({
        title: 'Figure renamed',
        description: `Renamed to ${newFigureKey}`,
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'bottom-right',
      });

      // Manually invalidate figures query after successful rename
      // This ensures the UI stays in sync without automatic background refetches
      if (projectId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.figures(projectId),
          refetchType: 'none', // Don't refetch immediately to avoid UI flicker
        });
      }
    },
    [
      figures,
      figureKeys,
      currentIndex,
      onUpdate,
      setCurrentIndex,
      onFigureChange,
      toast,
      projectId,
      queryClient,
      updateFigureMutation,
      validateFigureNumber,
      extractFigureIdFromUrl,
    ]
  );

  return {
    handleRenameFigure,
    validateFigureNumber,
  };
}
