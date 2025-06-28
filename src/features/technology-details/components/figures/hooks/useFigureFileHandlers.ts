import React, { useState, useRef, useCallback } from 'react';
import { logger } from '@/lib/monitoring/logger';
import { Figure, Figures } from '../carousel-components/types';
import {
  optimizeImage,
  getNextFigureNumber,
  getNextBaseNumber,
  getNextVariant,
  sortFigureKeys,
} from '../carousel-components/figureUtils';
import { useToast as useChakraToast } from '@chakra-ui/react';
import { figureClientService } from '@/client/services/figure.client-service';
import { API_ROUTES } from '@/constants/apiRoutes';
import { useQueryClient } from '@tanstack/react-query';
import { storageClientService } from '@/client/services/storage.client-service';
import { useUpdateFigure } from '@/hooks/api/useUpdateFigure';
import { queryKeys } from '@/config/reactQueryConfig';
import { FigureApiService } from '@/services/api/figureApiService';

interface FigureFileHandlersOptions {
  figures: Figures;
  onUpdate: (figures: Figures) => void | Promise<void>;
  onFigureChange?: (figureNumber: string) => void;
  currentIndex: number;
  figureKeys: string[];
  setCurrentIndex: (index: number) => void;
  closeModal?: () => void;
  onOpenAddFigureDialog?: (
    options: {
      label: string;
      value: string;
      isVariant: boolean;
      baseNumber: number;
      variant: string;
    }[]
  ) => void;
  projectId?: string;
}

export const useFigureFileHandlers = ({
  figures,
  onUpdate,
  onFigureChange,
  currentIndex,
  figureKeys,
  setCurrentIndex,
  closeModal,
  onOpenAddFigureDialog,
  projectId,
}: FigureFileHandlersOptions) => {
  const toast = useChakraToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isReplaceMode, setIsReplaceMode] = useState(false);
  const updateFigureMutation = useUpdateFigure();

  // Get current figure information
  const figureNum = figureKeys[currentIndex] || 'FIG. 1';
  const figure = (figureKeys.length > 0 && figures[figureNum]) || {
    description: '',
    elements: {},
    type: 'image',
  };

  // File upload handlers
  const handleFileInput = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      const file = files[0];

      // Validate that it's an image
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file',
          description: 'Please select an image file',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast({
          title: 'File too large',
          description: 'Please select an image smaller than 10MB',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      if (!projectId) {
        toast({
          title: 'No project selected',
          description: 'Please select a project before uploading',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      try {
        const figNum = figureKeys[currentIndex] || 'FIG. 1';

        // Ensure the figure exists in our data before uploading
        if (!figures[figNum]) {
          logger.warn('Attempting to upload to non-existent figure', {
            figNum,
            figureKeys,
          });
          toast({
            title: 'Figure not ready',
            description:
              'Please wait for the figure to be created before uploading',
            status: 'warning',
            duration: 3000,
            isClosable: true,
          });
          return;
        }

        logger.info('[useFigureFileHandlers] Starting figure upload', {
          figNum,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          projectId,
        });

        const result = await figureClientService.uploadFigure(
          projectId,
          file,
          figNum
        );

        logger.info('[useFigureFileHandlers] Upload response received', {
          figNum,
          result,
          resultUrl: result?.url,
          resultFileName: result?.fileName,
        });

        if (result && result.url) {
          // Optimistically update the figures cache immediately
          if (projectId) {
            queryClient.setQueryData<Figures>(
              queryKeys.projects.figures(projectId),
              old => {
                const draft: Figures = structuredClone(old || {});
                draft[figNum] = {
                  ...(draft[figNum] || {
                    description: '',
                    elements: {},
                    type: 'image',
                    content: '',
                  }),
                  type: 'image',
                  // Set the image URL for immediate display
                  image: `${result.url}?v=${Date.now()}`,
                } as Figure;
                return draft;
              }
            );

            // Also update the local figures to keep in sync
            const updatedFigures = structuredClone(figures) as Figures;
            updatedFigures[figNum] = {
              ...updatedFigures[figNum],
              type: 'image',
              image: `${result.url}?v=${Date.now()}`,
            };

            // Note: Removed onUpdate call here since the upload API already handles database persistence
            // This prevents the redundant "Figures saved" toast
          }

          toast({
            title: 'Image uploaded',
            status: 'success',
            duration: 2000,
            isClosable: true,
          });

          // Don't schedule background invalidation - let the optimistic update persist
          // The cache will be naturally refreshed when the user navigates or on next mount
          // This prevents the figure from disappearing due to race conditions with DB commits
        }
      } catch (error) {
        logger.error('Error uploading file', { error });
        toast({
          title: 'Upload failed',
          description: 'There was an error uploading the image',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    },
    [currentIndex, figureKeys, toast, projectId, queryClient]
  );

  // Handle replacing an existing image
  const handleReplaceImage = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!event.target.files?.length || !projectId) return;

      const file = event.target.files[0];
      const figNum = figureKeys[currentIndex] || 'FIG. 1';

      logger.log(`Replacing image for ${figNum} with ${file.name}`);

      try {
        // Check if the current figure has an image to replace
        const currentFigure = figures[figNum];
        if (!currentFigure?.image) {
          toast({
            title: 'No image to replace',
            description: 'Please add an image first',
            status: 'warning',
            duration: 3000,
            isClosable: true,
          });
          return;
        }

        // Upload to blob storage and assign to current figure
        if (file) {
          const result = await figureClientService.uploadFigure(
            projectId,
            file,
            figNum
          );

          if (result && result.url) {
            // Optimistically update the figures cache so the UI reflects the
            // replaced image immediately
            if (projectId) {
              queryClient.setQueryData<Figures>(
                queryKeys.projects.figures(projectId),
                old => {
                  const draft: Figures = structuredClone(old || {});
                  draft[figNum] = {
                    ...(draft[figNum] || {
                      description: '',
                      elements: {},
                      type: 'image',
                      content: '',
                    }),
                    type: 'image',
                    // Set the new image URL for immediate display
                    image: `${result.url}?v=${Date.now()}`,
                  } as Figure;
                  return draft;
                }
              );
            }

            toast({
              title: 'Image updated',
              status: 'success',
              duration: 2000,
              isClosable: true,
            });

            // Manually invalidate figures query after successful upload
            // This ensures the UI stays in sync without automatic background refetches
            if (projectId) {
              queryClient.invalidateQueries({
                queryKey: queryKeys.projects.figures(projectId),
                refetchType: 'none', // Don't refetch immediately to avoid UI flicker
              });
            }
          }
        }
      } catch (error) {
        logger.error('Error replacing image', { error });
        toast({
          title: 'Replace failed',
          description: 'There was an error replacing the image',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsReplaceMode(false);
        if (event.target) {
          event.target.value = '';
        }
      }
    },
    [figureNum, figures, toast, setIsReplaceMode, projectId, queryClient]
  );

  // Handle deleting a figure
  const handleDeleteFigure = useCallback(async () => {
    if (figureKeys.length <= 1) {
      // If this is the only figure, clear it instead of deleting it
      const newFigures = structuredClone(figures) as Figures;
      newFigures[figureNum] = {
        description: '',
        type: 'image',
        elements: {},
      };

      // Optimistically update cache
      if (projectId) {
        queryClient.setQueryData<Figures>(
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
      });
    } else {
      // Copy figures without the current one
      const newFigures = structuredClone(figures) as Figures;
      delete newFigures[figureNum];

      // Optimistically update cache to remove the figure immediately
      if (projectId) {
        queryClient.setQueryData<Figures>(
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
      });

      // IMPORTANT: Delete the ProjectFigure record from the database
      // This is necessary to keep the UI and database in sync
      const currentFig = figures[figureNum];
      if (projectId) {
        try {
          let figureId: string | null = null;

          // First, try to extract figure ID from the image URL (most efficient path)
          if (currentFig?.image) {
            // URL format: /api/projects/{projectId}/figures/{figureId}/download
            const match = currentFig.image.match(
              /figures\/([a-zA-Z0-9-]+)\/download/
            );
            figureId = match?.[1] || null;

            if (figureId) {
              logger.info('Found figure ID from image URL', {
                figureId,
                figureKey: figureNum,
              });
            }
          }

          // If no ID from URL (e.g., PENDING figures without images), we need to fetch it
          if (!figureId) {
            logger.info('No figure ID in URL, fetching from database', {
              figureKey: figureNum,
              hasImage: !!currentFig?.image,
              projectId,
            });

            // IMPORTANT: This API call is necessary for PENDING figures that don't have images yet
            // The figure ID is created asynchronously when the figure is added, so we don't have it
            // in the UI state immediately. This ensures we can delete ALL figures, not just ones with images.
            const figuresResponse =
              await FigureApiService.listFigures(projectId);
            const dbFigure = figuresResponse.figures.find(
              (f: any) => f.figureKey === figureNum
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
                figureKey: figureNum,
                totalFigures: figuresResponse.figures.length,
              });
            }
          }

          if (figureId) {
            logger.info('Deleting ProjectFigure record', {
              figureId,
              figureKey: figureNum,
              projectId,
            });

            // Delete the ProjectFigure record (soft delete for audit trail)
            await FigureApiService.deleteFigure(projectId, figureId);

            logger.info('Successfully deleted ProjectFigure record', {
              figureId,
              figureKey: figureNum,
            });
          } else {
            // This shouldn't happen in normal operation, but handle it gracefully
            logger.error('Could not determine figure ID for deletion', {
              figureKey: figureNum,
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
            });
          }
        } catch (error) {
          logger.error('Failed to delete ProjectFigure from database', {
            error,
            figureKey: figureNum,
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
          });
        }
      }

      // If the figure has an uploaded image, attempt to delete it from storage in the background
      if (currentFig?.image && projectId) {
        const match = currentFig.image.match(
          /figures\/([a-zA-Z0-9-]+)\/download/
        );
        const figureId = match?.[1];
        if (figureId) {
          // Delete from storage asynchronously - don't block the UI
          storageClientService.deleteFigure(projectId, figureId).catch(err => {
            logger.warn('Failed to delete figure file during slot deletion', {
              err,
              projectId,
              figureId,
            });
          });
        }
      }

      // Don't schedule background invalidation - let the optimistic update persist
      // The cache will be naturally refreshed when the user navigates or on next mount
      // This prevents unwanted refetches that could cause UI inconsistencies
    }
  }, [
    figureKeys.length,
    figures,
    figureNum,
    toast,
    closeModal,
    currentIndex,
    setCurrentIndex,
    onFigureChange,
    onUpdate,
    projectId,
    queryClient,
  ]);

  // Separate function to create a new figure from input
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
        });
        return;
      }

      try {
        // Create new figure object for optimistic update
        const newFigure: Figure = {
          description: '',
          type: 'image',
          elements: {},
          content: '',
        };

        // Update figures locally first (optimistic update)
        const newFigures = structuredClone(figures) as Figures;
        newFigures[figureKey] = newFigure;

        // Immediately update cache for instant UI feedback
        if (projectId) {
          queryClient.setQueryData<Figures>(
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
        });

        // Now create in database in the background
        if (projectId) {
          logger.info('Creating pending figure in database', {
            projectId,
            figureKey,
          });

          // Create pending figure asynchronously - don't await
          figureClientService
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

              // After successful creation, invalidate to sync with backend
              // but keep the optimistic update in place
              queryClient.invalidateQueries({
                queryKey: queryKeys.projects.figures(projectId),
                refetchType: 'none', // Don't refetch immediately
              });

              // Don't schedule background invalidation - let the optimistic update persist
              // The cache will be naturally refreshed when the user navigates or on next mount
              // This prevents the figure from disappearing due to race conditions with DB commits
            })
            .catch(error => {
              logger.error('Failed to create pending figure in database', {
                error,
                figureKey,
                projectId,
              });

              // On error, revert the optimistic update
              const revertedFigures = structuredClone(figures) as Figures;
              delete revertedFigures[figureKey];

              queryClient.setQueryData<Figures>(
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
    ]
  );

  // Handle adding a new figure
  const handleAddNewFigure = useCallback(async () => {
    // Create a copy of the figures object
    const newFigures = structuredClone(figures) as Figures;

    // Get base options for the new figure
    const nextMainFigure = getNextBaseNumber(newFigures);

    // Get existing figure numbers for variants
    const existingFigureNumbers = new Set<number>();
    Object.keys(newFigures).forEach(key => {
      const match = key.match(/FIG\.\s*(\d+)/i);
      if (match) {
        existingFigureNumbers.add(parseInt(match[1], 10));
      }
    });

    // Create variant options for existing figures
    const variantOptions = Array.from(existingFigureNumbers).map(baseNumber => {
      const nextVariant = getNextVariant(newFigures, baseNumber);
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
    const allOptions = [...mainOptions, ...variantOptions];

    // Open a custom dialog directly within the component
    // (This will be handled by the FigureCarousel component)
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
  }, [figures, onOpenAddFigureDialog, createNewFigure]);

  // Handle dropped files
  const handleDroppedFile = useCallback(
    async (file: File) => {
      if (!projectId) return;
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload an image file',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please upload an image smaller than 5MB',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      try {
        // Upload to blob storage
        const figNum = figureKeys[currentIndex] || 'FIG. 1';

        // Ensure the figure exists in our data before uploading
        if (!figures[figNum]) {
          logger.warn('Attempting to upload to non-existent figure via drop', {
            figNum,
            figureKeys,
          });
          toast({
            title: 'Figure not ready',
            description:
              'Please wait for the figure to be created before uploading',
            status: 'warning',
            duration: 3000,
            isClosable: true,
          });
          return;
        }

        const result = await figureClientService.uploadFigure(
          projectId,
          file,
          figNum
        );

        if (result && result.url) {
          // Optimistically update the figures cache immediately
          if (projectId) {
            queryClient.setQueryData<Figures>(
              queryKeys.projects.figures(projectId),
              old => {
                const draft: Figures = structuredClone(old || {});
                draft[figNum] = {
                  ...(draft[figNum] || {
                    description: '',
                    elements: {},
                    type: 'image',
                    content: '',
                  }),
                  type: 'image',
                  // Set the image URL for immediate display
                  image: `${result.url}?v=${Date.now()}`,
                } as Figure;
                return draft;
              }
            );

            // Also update the local figures to keep in sync
            const updatedFigures = structuredClone(figures) as Figures;
            updatedFigures[figNum] = {
              ...updatedFigures[figNum],
              type: 'image',
              image: `${result.url}?v=${Date.now()}`,
            };

            // Note: Removed onUpdate call here since the upload API already handles database persistence
            // This prevents the redundant "Figures saved" toast
          }

          toast({
            title: 'Image uploaded',
            status: 'success',
            duration: 2000,
            isClosable: true,
          });

          // Don't schedule background invalidation - let the optimistic update persist
          // The cache will be naturally refreshed when the user navigates or on next mount
          // This prevents the figure from disappearing due to race conditions with DB commits
        }
      } catch (error) {
        logger.error('Error uploading dropped file', { error });
        toast({
          title: 'Upload failed',
          description: 'There was an error uploading the image',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    },
    [currentIndex, figureKeys, figures, toast, projectId, queryClient]
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

      // Validate the figure number format
      const isValidFormat = /^FIG\.\s*\d+[A-Za-z]*$/i.test(newFigureKey);
      if (!isValidFormat) {
        toast({
          title: 'Invalid figure number',
          description:
            'Figure number must be in format "FIG. 1", "FIG. 1A", etc.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Check if same as current
      if (newFigureKey === figureNum) {
        return;
      }

      // Check if target figure number already exists
      if (figures[newFigureKey]) {
        toast({
          title: 'Figure exists',
          description: `${newFigureKey} already exists.`,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Create a copy of figures with the rename
      const newFigures = structuredClone(figures) as Figures;
      const currentFig = newFigures[figureNum];

      if (currentFig?.image && projectId) {
        // Extract figure ID from the URL pattern: /api/projects/{projectId}/figures/{figureId}/download
        const match = currentFig.image.match(
          /figures\/([a-zA-Z0-9-]+)\/download/
        );
        const figureId = match?.[1];

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
        queryClient.setQueryData<Figures>(
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
      // This is crucial for keeping the parent component in sync
      logger.info('[useFigureFileHandlers] Navigating to renamed figure', {
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
      });

      // Manually invalidate figures query after successful upload
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
    ]
  );

  return {
    fileInputRef,
    isReplaceMode,
    setIsReplaceMode,
    handleFileInput,
    handleReplaceImage,
    handleDeleteFigure,
    handleAddNewFigure,
    handleDroppedFile,
    handleRenameFigure,
    createNewFigure,
  };
};
