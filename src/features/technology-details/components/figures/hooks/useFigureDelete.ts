import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { logger } from '@/utils/clientLogger';
import { useToast } from '@/hooks/useToastWrapper';
import { useStorageService } from '@/contexts/ClientServicesContext';
import { queryKeys } from '@/config/reactQueryConfig';
import { FigureApiService } from '@/services/api/figureApiService';
import type { FiguresWithIds } from '@/hooks/api/useFigures';

interface UseFigureDeleteOptions {
  projectId?: string;
  figures: FiguresWithIds;
  figureKeys: string[];
  currentIndex: number;
  onUpdate: (figures: FiguresWithIds) => void | Promise<void>;
  setCurrentIndex: (index: number) => void;
  onFigureChange?: (figureNumber: string) => void;
  closeModal?: () => void;
}

interface UseFigureDeleteResult {
  handleDeleteFigure: () => Promise<void>;
}

/**
 * Hook for handling figure deletion operations
 * Manages both UI updates and database/storage cleanup
 */
export function useFigureDelete({
  projectId,
  figures,
  figureKeys,
  currentIndex,
  onUpdate,
  setCurrentIndex,
  onFigureChange,
  closeModal,
}: UseFigureDeleteOptions): UseFigureDeleteResult {
  const storageService = useStorageService();
  const toast = useToast();
  const queryClient = useQueryClient();

  // Extract figure ID from image URL
  const extractFigureIdFromUrl = useCallback(
    (imageUrl: string): string | null => {
      // URL format: /api/projects/{projectId}/figures/{figureId}/download
      const match = imageUrl.match(/figures\/([a-zA-Z0-9-]+)\/download/);
      return match?.[1] || null;
    },
    []
  );

  // Delete ProjectFigure record from database
  const deleteFigureFromDatabase = useCallback(
    async (figureKey: string): Promise<string | null> => {
      if (!projectId) return null;

      const currentFig = figures[figureKey];
      let figureId: string | null = null;

      try {
        // First, try to extract figure ID from the image URL (most efficient path)
        if (currentFig?.image) {
          figureId = extractFigureIdFromUrl(currentFig.image);

          if (figureId) {
            logger.info('Found figure ID from image URL', {
              figureId,
              figureKey,
            });
          }
        }

        // If no ID from URL (e.g., PENDING figures without images), we need to fetch it
        if (!figureId) {
          logger.info('No figure ID in URL, fetching from database', {
            figureKey,
            hasImage: !!currentFig?.image,
            projectId,
          });

          // IMPORTANT: This API call is necessary for PENDING figures that don't have images yet
          const figuresResponse = await FigureApiService.listFigures(projectId);
          const dbFigure = figuresResponse.figures.find(
            (f: any) => f.figureKey === figureKey
          );

          if (dbFigure) {
            figureId = dbFigure.id;
            logger.info('Found figure in database', {
              figureId: dbFigure.id,
              figureKey: dbFigure.figureKey,
              status: dbFigure.status,
            });
          } else {
            logger.warn('Figure not found in database', {
              figureKey,
              totalFigures: figuresResponse.figures.length,
            });
          }
        }

        if (figureId) {
          logger.info('Deleting ProjectFigure record', {
            figureId,
            figureKey,
            projectId,
          });

          // Delete the ProjectFigure record (soft delete for audit trail)
          await FigureApiService.deleteFigure(projectId, figureId);

          logger.info('Successfully deleted ProjectFigure record', {
            figureId,
            figureKey,
          });

          return figureId;
        } else {
          // This shouldn't happen in normal operation, but handle it gracefully
          logger.error('Could not determine figure ID for deletion', {
            figureKey,
            projectId,
            hasImage: !!currentFig?.image,
          });

          // Inform the user but don't block the UI operation
          toast({
            title: 'Warning',
            description:
              'Figure removed from view but could not be deleted from database. Please refresh the page.',
            status: 'warning',
            duration: 5000,
            isClosable: true,
            position: 'bottom-right',
          });

          return null;
        }
      } catch (error) {
        logger.error('Failed to delete ProjectFigure from database', {
          error,
          figureKey,
          projectId,
        });

        // Show user-friendly error but don't block the UI operation
        toast({
          title: 'Warning',
          description:
            'Figure removed from view but database cleanup failed. The figure may reappear on refresh.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
          position: 'bottom-right',
        });

        return null;
      }
    },
    [projectId, figures, extractFigureIdFromUrl, toast]
  );

  // Delete figure from storage (blob storage)
  const deleteFigureFromStorage = useCallback(
    async (figureId: string) => {
      if (!projectId || !figureId) return;

      try {
        await storageService.deleteFigure(projectId, figureId);
        logger.info('Successfully deleted figure from storage', {
          projectId,
          figureId,
        });
      } catch (err) {
        logger.warn('Failed to delete figure file during slot deletion', {
          err,
          projectId,
          figureId,
        });
      }
    },
    [projectId, storageService]
  );

  // Handle deleting or clearing a figure
  const handleDeleteFigure = useCallback(async () => {
    const figureNum = figureKeys[currentIndex] || 'FIG. 1';

    if (figureKeys.length <= 1) {
      // If this is the only figure, clear it instead of deleting it
      const newFigures = structuredClone(figures) as FiguresWithIds;
      const existingId = figures[figureNum]?._id;
      newFigures[figureNum] = {
        description: '',
        type: 'image',
        _id: existingId, // Preserve the ID
      };

      // Optimistically update cache
      if (projectId) {
        queryClient.setQueryData<FiguresWithIds>(
          queryKeys.projects.figures(projectId),
          () => structuredClone(newFigures)
        );
      }

      await onUpdate(newFigures);

      // Close the modal if it's open
      if (closeModal) {
        closeModal();
      }

      toast({
        title: 'Figure cleared',
        status: 'info',
        duration: 2000,
        isClosable: true,
        position: 'bottom-right',
      });
    } else {
      // Copy figures without the current one
      const newFigures = structuredClone(figures) as FiguresWithIds;
      delete newFigures[figureNum];

      // Optimistically update cache to remove the figure immediately
      if (projectId) {
        queryClient.setQueryData<FiguresWithIds>(
          queryKeys.projects.figures(projectId),
          () => structuredClone(newFigures)
        );
      }

      // Navigate to previous figure if available, otherwise the first one
      const newFigureKeys = Object.keys(newFigures).sort((a, b) => {
        const numA = parseInt(a.replace(/[^\d]/g, ''));
        const numB = parseInt(b.replace(/[^\d]/g, ''));
        return numA - numB;
      });
      const newIndex = Math.max(0, currentIndex - 1);
      setCurrentIndex(newIndex);

      if (onFigureChange && newFigureKeys[newIndex]) {
        onFigureChange(newFigureKeys[newIndex]);
      }

      // Persist deletion
      await onUpdate(newFigures);

      // Close the modal if it's open
      if (closeModal) {
        closeModal();
      }

      toast({
        title: 'Figure deleted',
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'bottom-right',
      });

      // Delete from database
      const figureId = await deleteFigureFromDatabase(figureNum);

      // If the figure has an uploaded image, attempt to delete it from storage in the background
      const currentFig = figures[figureNum];
      if (currentFig?.image && projectId && figureId) {
        // Delete from storage asynchronously - don't block the UI
        deleteFigureFromStorage(figureId);
      }
    }
  }, [
    figureKeys,
    figures,
    currentIndex,
    projectId,
    queryClient,
    onUpdate,
    setCurrentIndex,
    onFigureChange,
    closeModal,
    toast,
    deleteFigureFromDatabase,
    deleteFigureFromStorage,
  ]);

  return {
    handleDeleteFigure,
  };
}
