import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { logger } from '@/utils/clientLogger';
import { useToast } from '@/hooks/useToastWrapper';
import { useFigureService } from '@/contexts/ClientServicesContext';
import { queryKeys } from '@/config/reactQueryConfig';
import {
  getNextBaseNumber,
  getNextVariant,
  sortFigureKeys,
} from '../carousel-components/figureUtils';
import type { FiguresWithIds, FigureWithId } from '@/hooks/api/useFigures';

interface UseFigureCreateOptions {
  projectId?: string;
  figures: FiguresWithIds;
  figureKeys: string[];
  currentIndex: number;
  onUpdate: (figures: FiguresWithIds) => void | Promise<void>;
  setCurrentIndex: (index: number) => void;
  onFigureChange?: (figureNumber: string) => void;
  onOpenAddFigureDialog?: (
    options: {
      label: string;
      value: string;
      isVariant: boolean;
      baseNumber: number;
      variant: string;
    }[]
  ) => void;
}

interface UseFigureCreateResult {
  handleAddNewFigure: () => Promise<void>;
  createNewFigure: (inputFigureNumber: string) => Promise<void>;
  generateFigureOptions: () => {
    label: string;
    value: string;
    isVariant: boolean;
    baseNumber: number;
    variant: string;
  }[];
}

/**
 * Hook for handling figure creation operations
 * Manages creating new figures with proper numbering and database sync
 */
export function useFigureCreate({
  projectId,
  figures,
  figureKeys,
  currentIndex,
  onUpdate,
  setCurrentIndex,
  onFigureChange,
  onOpenAddFigureDialog,
}: UseFigureCreateOptions): UseFigureCreateResult {
  const figureService = useFigureService();
  const toast = useToast();
  const queryClient = useQueryClient();

  // Generate figure number options for creation
  const generateFigureOptions = useCallback(() => {
    // Get base options for the new figure
    const nextMainFigure = getNextBaseNumber(figures);

    // Get existing figure numbers for variants
    const existingFigureNumbers = new Set<number>();
    Object.keys(figures).forEach(key => {
      const match = key.match(/FIG\.\s*(\d+)/i);
      if (match) {
        existingFigureNumbers.add(parseInt(match[1], 10));
      }
    });

    // Create variant options for existing figures
    const variantOptions = Array.from(existingFigureNumbers).map(baseNumber => {
      const nextVariant = getNextVariant(figures, baseNumber);
      return {
        label: `FIG. ${baseNumber}${nextVariant}`,
        value: `${baseNumber}${nextVariant}`,
        isVariant: true,
        baseNumber,
        variant: nextVariant,
      };
    });

    // Create main figure options
    const mainOptions = [
      {
        label: `FIG. ${nextMainFigure}`,
        value: `${nextMainFigure}`,
        isVariant: false,
        baseNumber: nextMainFigure,
        variant: '',
      },
    ];

    // Combine all options
    return [...mainOptions, ...variantOptions];
  }, [figures]);

  // Create a new figure from input
  const createNewFigure = useCallback(
    async (inputFigureNumber: string) => {
      const figureKey = `FIG. ${inputFigureNumber}`;

      if (figures[figureKey]) {
        toast({
          title: 'Figure already exists',
          description: `${figureKey} already exists`,
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'bottom-right',
        });
        return;
      }

      try {
        // Create new figure object for optimistic update
        const newFigure: FigureWithId = {
          description: '',
          type: 'image',
          content: '',
          // Note: _id will be set when the database record is created
        };

        // Update figures locally first (optimistic update)
        const newFigures = structuredClone(figures) as FiguresWithIds;
        newFigures[figureKey] = newFigure;

        // Immediately update cache for instant UI feedback
        if (projectId) {
          queryClient.setQueryData<FiguresWithIds>(
            queryKeys.projects.figures(projectId),
            () => structuredClone(newFigures)
          );
        }

        // Update invention data
        await onUpdate(newFigures);

        // Navigate to the new figure immediately
        const newFigureKeys = sortFigureKeys(newFigures);
        const newIndex = newFigureKeys.indexOf(figureKey);

        if (newIndex !== -1) {
          setCurrentIndex(newIndex);
          if (onFigureChange) {
            onFigureChange(figureKey);
          }
        }

        // Show success toast immediately
        toast({
          title: 'New figure added',
          description: `Created ${figureKey}`,
          status: 'success',
          duration: 2000,
          isClosable: true,
          position: 'bottom-right',
        });

        // Now create in database in the background
        if (projectId) {
          logger.info('Creating pending figure in database', {
            projectId,
            figureKey,
          });

          // Create pending figure asynchronously - don't await
          figureService
            .createPendingFigure(
              projectId,
              figureKey,
              '', // empty description
              `Figure ${figureKey}` // title
            )
            .then(pendingFigure => {
              logger.info('Pending figure created in database', {
                projectId,
                figureKey,
                figureId: pendingFigure.id,
              });

              // Update the cache with the new figure ID
              queryClient.setQueryData<FiguresWithIds>(
                queryKeys.projects.figures(projectId),
                old => {
                  if (!old || !old[figureKey]) return old;
                  const updated = structuredClone(old);
                  updated[figureKey] = {
                    ...updated[figureKey],
                    _id: pendingFigure.id,
                  };
                  return updated;
                }
              );
            })
            .catch(error => {
              logger.error('Failed to create pending figure in database', {
                error,
                figureKey,
                projectId,
              });

              // On error, revert the optimistic update
              const revertedFigures = structuredClone(
                figures
              ) as FiguresWithIds;
              delete revertedFigures[figureKey];

              queryClient.setQueryData<FiguresWithIds>(
                queryKeys.projects.figures(projectId),
                () => revertedFigures
              );

              // Also revert invention data
              onUpdate(revertedFigures);

              // Navigate away from the failed figure
              if (figureKeys.length > 0) {
                const safeIndex = Math.min(currentIndex, figureKeys.length - 1);
                setCurrentIndex(safeIndex);
                if (onFigureChange && figureKeys[safeIndex]) {
                  onFigureChange(figureKeys[safeIndex]);
                }
              }

              toast({
                title: 'Failed to create figure',
                description:
                  error instanceof Error ? error.message : 'Please try again',
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'bottom-right',
              });
            });
        } else {
          // If no projectId, we already updated locally which is enough
          logger.info('Figure created locally (no project)', { figureKey });
        }
      } catch (error) {
        logger.error('Failed to create new figure', { error, figureKey });
        toast({
          title: 'Failed to create figure',
          description:
            error instanceof Error ? error.message : 'Unknown error occurred',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'bottom-right',
        });
      }
    },
    [
      figures,
      onUpdate,
      setCurrentIndex,
      onFigureChange,
      toast,
      projectId,
      queryClient,
      figureKeys,
      currentIndex,
      figureService,
    ]
  );

  // Handle adding a new figure
  const handleAddNewFigure = useCallback(async () => {
    const allOptions = generateFigureOptions();

    // Open a custom dialog directly within the component
    if (onOpenAddFigureDialog) {
      onOpenAddFigureDialog(allOptions);
      return;
    }

    // Fallback to the original prompt-based approach if the dialog functionality isn't available
    const suggestionsText = allOptions
      .slice(0, 3)
      .map(opt => opt.label)
      .join(', ');

    // Prompt user for the figure number
    const inputFigureNumber = prompt(
      `Enter new figure number (e.g., "2", "1A", "3B").\nSuggestions: ${suggestionsText}`,
      allOptions[0].value // Default to first option without prefix
    );

    if (!inputFigureNumber) {
      // User cancelled
      return;
    }

    // Continue with creating the figure using the input value
    await createNewFigure(inputFigureNumber);
  }, [generateFigureOptions, onOpenAddFigureDialog, createNewFigure]);

  return {
    handleAddNewFigure,
    createNewFigure,
    generateFigureOptions,
  };
}
