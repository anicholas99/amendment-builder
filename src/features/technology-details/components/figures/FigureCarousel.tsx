import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { logger } from '@/utils/clientLogger';
import { useToast } from '@/hooks/useToastWrapper';
import {
  Figure,
  FigureCarouselProps,
  Figures,
} from './carousel-components/types';
import FigureContent from './carousel-components/FigureContent';
import FigureControls from './carousel-components/FigureControls';
import FigureNavigation from './carousel-components/FigureNavigation';
import FigureMetadata from './carousel-components/FigureMetadata';
import ModalView from './carousel-components/ModalView';
import DeleteConfirmationDialog from '@/components/common/DeleteConfirmationDialogV2';
import AddFigureDialog from './carousel-components/AddFigureDialog';
import { FigureManagementModal } from './FigureManagementModal';
import { sortFigureKeys } from './carousel-components/figureUtils';
import { useFigureFileHandlers } from './hooks/useFigureFileHandlers';
import { useFigureDescription } from './hooks/useFigureDescription';
import {
  usePatentFigures,
  UsePatentSidebarProps,
} from '../../../patent-application/hooks/usePatentSidebar';
import { useUpdateFigure } from '@/hooks/api/useUpdateFigure';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/config/reactQueryConfig';
import { FigureApiService } from '@/services/api/figureApiService';
import type { FigureWithId, FiguresWithIds } from '@/hooks/api/useFigures';
import { cn } from '@/lib/utils';

interface ExtendedFigureCarouselProps extends Partial<UsePatentSidebarProps> {
  onFigureChange?: (figureKey: string) => void; // Optional callback for external state sync
  projectId?: string;
  inventionData?: {
    id: string;
    title?: string;
    figures?: Array<{ id: string; url: string; caption?: string }>;
  } | null;
  currentFigure?: string;
  setCurrentFigure?: (figureKey: string) => void;
}

interface AddFigureOption {
  label: string;
  value: string;
  isVariant: boolean;
  baseNumber: number;
  variant: string;
}

/**
 * Component for displaying and navigating figures
 * Now uses usePatentFigures hook instead of props for figures data
 */
const FigureCarousel: React.FC<ExtendedFigureCarouselProps> = React.memo(
  ({
    onFigureChange: externalOnFigureChange,
    projectId,
    inventionData,
    currentFigure,
    setCurrentFigure,
  }) => {
    // State management for navigation and selection is now REMOVED.
    // The component is fully controlled by `currentFigure` and `setCurrentFigure`.
    const [isReplaceMode, setIsReplaceMode] = useState(false);
    const [addFigureOptions, setAddFigureOptions] = useState<AddFigureOption[]>(
      []
    );

    // Provide a default function if setCurrentFigure is not provided
    const effectiveSetCurrentFigure = setCurrentFigure || (() => {});

    // Modal and dialog hooks
    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const openDeleteAlert = () => setIsDeleteAlertOpen(true);
    const closeDeleteAlert = () => setIsDeleteAlertOpen(false);

    const [isAddFigureDialogOpen, setIsAddFigureDialogOpen] = useState(false);
    const openAddFigureDialog = () => setIsAddFigureDialogOpen(true);
    const closeAddFigureDialog = () => setIsAddFigureDialogOpen(false);

    const [isManagementModalOpen, setIsManagementModalOpen] = useState(false);
    const openManagementModal = () => setIsManagementModalOpen(true);
    const closeManagementModal = () => setIsManagementModalOpen(false);

    // Hook for API calls
    const updateFigureMutation = useUpdateFigure();
    const queryClient = useQueryClient();
    const toast = useToast();

    // Memoize props to prevent infinite re-renders
    const figuresProps = React.useMemo(() => ({
      projectId: projectId || '',
      inventionData: inventionData || null,
      currentFigure: currentFigure || '',
      setCurrentFigure: effectiveSetCurrentFigure,
    }), [projectId, inventionData, currentFigure, effectiveSetCurrentFigure]);

    // Get the figures data using the hook
    const { figures, onUpdate, isLoading } = usePatentFigures(figuresProps);

    // Get array of figure keys (FIG. 1, FIG. 2, etc.)
    const figureKeys = sortFigureKeys(figures || {});
    if (figureKeys.length === 0) {
      figureKeys.push('FIG. 1');
    }

    // Track previous figure keys to detect renames
    const prevFigureKeysRef = useRef<string[]>([]);

    // Auto-create FIG. 1 when no figures exist in the database
    const hasCreatedInitialFigure = useRef(false);
    const isCreatingFigure = useRef(false);
    useEffect(() => {
      // Only run if we have a projectId and figures data has loaded
      if (!projectId || !figures || isLoading) return;

      // Check if no actual figures exist in the database
      const actualFigureKeys = Object.keys(figures);
      const hasNoFigures = actualFigureKeys.length === 0;

      // Auto-create FIG. 1 if no figures exist and we haven't already tried
      if (
        hasNoFigures &&
        !hasCreatedInitialFigure.current &&
        !isCreatingFigure.current
      ) {
        hasCreatedInitialFigure.current = true;
        isCreatingFigure.current = true;

        logger.info('[FigureCarousel] No figures exist, auto-creating FIG. 1', {
          projectId,
        });

        // Create pending FIG. 1
        FigureApiService.createPendingFigure(
          projectId,
          'FIG. 1',
          '', // empty description
          'Figure FIG. 1'
        )
          .then(async createdFigure => {
            logger.info(
              '[FigureCarousel] Successfully created initial FIG. 1',
              {
                projectId,
                figureId: createdFigure.id,
                figureKey: createdFigure.figureKey,
              }
            );

            // Convert the API response to the format expected by the cache
            const newFigure: FigureWithId = {
              description:
                createdFigure.title || createdFigure.description || '',
              elements: createdFigure.elements.reduce(
                (acc, element) => {
                  acc[element.elementKey] =
                    element.elementName || element.calloutDescription || '';
                  return acc;
                },
                {} as Record<string, string>
              ),
              type: 'image',
              content: '',
              image: '', // No image for PENDING figures
              _id: createdFigure.id,
            };

            // Update the cache with the new figure
            queryClient.setQueryData<FiguresWithIds>(
              queryKeys.projects.figures(projectId),
              (oldData = {}) => ({
                ...oldData,
                'FIG. 1': newFigure,
              })
            );

            logger.info('[FigureCarousel] Cache updated with new figure', {
              projectId,
              figureId: createdFigure.id,
            });

            // Set current figure to FIG. 1
            if (effectiveSetCurrentFigure) {
              effectiveSetCurrentFigure('FIG. 1');
            }

            // Reset creating flag
            isCreatingFigure.current = false;
          })
          .catch(error => {
            logger.error('[FigureCarousel] Failed to create initial FIG. 1', {
              projectId,
              error,
            });

            // Reset the flags so we can try again if the user refreshes
            hasCreatedInitialFigure.current = false;
            isCreatingFigure.current = false;
          });
      }
    }, [projectId, figures, queryClient, effectiveSetCurrentFigure, isLoading]);

    // Ensure currentFigure is always valid - auto-correct if it doesn't exist
    useEffect(() => {
      const prevKeys = prevFigureKeysRef.current;

      // If currentFigure doesn't exist in the current figureKeys, update to first available
      if (
        currentFigure &&
        figureKeys.length > 0 &&
        !figureKeys.includes(currentFigure)
      ) {
        // Check if this is due to a rename (keys changed but same count)
        const isLikelyRename =
          prevKeys.length === figureKeys.length && prevKeys.length > 0;

        logger.info('[FigureCarousel] Current figure no longer exists', {
          oldFigure: currentFigure,
          availableFigures: figureKeys,
          wasRename: isLikelyRename,
          prevKeys,
        });

        // For renames, the onFigureChange callback should have already updated the figure
        // This is just a fallback for other cases (like deletion)
        if (!isLikelyRename && effectiveSetCurrentFigure) {
          effectiveSetCurrentFigure(figureKeys[0]);
        }
      }

      // Update the ref for next comparison
      prevFigureKeysRef.current = [...figureKeys];
    }, [currentFigure, figureKeys, effectiveSetCurrentFigure]);

    // DERIVE the current index from props instead of using local state.
    const currentIndex = useMemo(() => {
      const index = figureKeys.indexOf(currentFigure || 'FIG. 1');
      return index === -1 ? 0 : index;
    }, [currentFigure, figureKeys]);

    // Current figure information
    const figureNum = figureKeys[currentIndex] || 'FIG. 1';
    const figure = (figureKeys.length > 0 && figures && figures[figureNum]) || {
      description: '',
      type: 'image',
    };

    // Handle unassigning a figure
    const handleUnassign = useCallback(() => {
      const figureNum = figureKeys[currentIndex];
      const figure = figures[figureNum];

      if (!projectId || !figure) return;

      const figureId = figure._id;

      if (!figureId) {
        logger.error('[FigureCarousel] Could not find figure ID', {
          figureKey: figureNum,
          figure,
        });
        toast({
          title: 'Cannot unassign figure',
          description: 'Figure ID not found. Please refresh and try again.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      logger.info('[FigureCarousel] Unassigning figure', {
        figureId,
        figureKey: figureNum,
        projectId,
      });

      // Call the API to unassign the figure
      updateFigureMutation.mutate(
        {
          projectId,
          figureId,
          updates: { unassign: true },
        },
        {
          onSuccess: () => {
            // Invalidate the unassigned figures query instead of manually updating cache
            // This ensures the modal will fetch fresh data from the server
            const unassignedQueryKey = [
              ...queryKeys.projects.figures(projectId),
              'unassigned',
            ];

            queryClient.invalidateQueries({
              queryKey: unassignedQueryKey,
              exact: true,
            });

            toast({
              title: 'Figure unassigned',
              description: `Image has been removed from ${figureNum}. You can now assign a different image.`,
              status: 'success',
              duration: 3000,
              isClosable: true,
            });
            logger.info('[FigureCarousel] Unassign mutation succeeded', {
              figureId,
              figureKey: figureNum,
              projectId,
            });
          },
          onError: (error: Error) => {
            toast({
              title: 'Unassign failed',
              description:
                error.message ||
                'Could not unassign the figure. Please try again.',
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
            logger.error('[FigureCarousel] Failed to unassign figure', {
              figureId,
              error,
            });
          },
        }
      );
    }, [
      currentIndex,
      figureKeys,
      figures,
      projectId,
      updateFigureMutation,
      toast,
      queryClient,
    ]);

    // Handle opening the add figure dialog with options
    const handleOpenAddFigureDialog = (options: AddFigureOption[]) => {
      setAddFigureOptions(options);
      openAddFigureDialog();
    };

    // Use our custom hooks
    const fileHandlers = useFigureFileHandlers({
      figures,
      onUpdate,
      onFigureChange: (newFigureKey: string) => {
        // Directly set the current figure to the new key
        // This is called after rename to navigate to the renamed figure
        logger.info('[FigureCarousel] onFigureChange called', {
          newFigureKey,
          currentFigure,
        });
        if (effectiveSetCurrentFigure) {
          effectiveSetCurrentFigure(newFigureKey);
        }
        // Also call the external callback if provided
        if (externalOnFigureChange) {
          externalOnFigureChange(newFigureKey);
        }
      },
      currentIndex: currentIndex, // Pass derived index
      figureKeys,
      setCurrentIndex: (index: number) => {
        if (effectiveSetCurrentFigure && figureKeys[index]) {
          effectiveSetCurrentFigure(figureKeys[index]);
        }
      },
      closeModal,
      onOpenAddFigureDialog: handleOpenAddFigureDialog,
      projectId,
    });

    // Use the now-stateless description hook
    const { handleUpdateDescription, handleUpdateFigure } =
      useFigureDescription({
        figures,
        onUpdate, // Use the onUpdate from usePatentFigures hook
        currentFigureKey: figureNum,
        projectId,
      });

    // Handle navigation between figures - now just calls the prop callback.
    const handleNavigate = (index: number) => {
      if (effectiveSetCurrentFigure && figureKeys[index]) {
        effectiveSetCurrentFigure(figureKeys[index]);
      }
    };

    // Handle adding a figure from the dialog
    const handleAddFigureFromDialog = async (figureNumber: string) => {
      await fileHandlers.createNewFigure(figureNumber);
    };

    // Show loading state if data is still loading
    if (!projectId || isLoading) {
      return (
        <div className="w-full relative">
          <div className="h-[180px] md:h-[200px] lg:h-[220px] xl:h-[240px] flex-shrink-0 border border-border rounded-md p-2 bg-card relative overflow-hidden">
            <div className="h-full flex flex-col items-center justify-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="text-sm text-gray-500">Loading figures...</span>
            </div>
          </div>
        </div>
      );
    }

    // Prepare specific props used by FigureContent
    const figureContentProps = {
      figure,
      figureKey: figureNum,
      onOpen: openModal,
      onUpload: () => fileHandlers.fileInputRef.current?.click(),
      onUpdate: handleUpdateFigure,
      onDropUpload: fileHandlers.handleDroppedFile,
      projectId,
      inventionData,
      onFigureAssigned: async (figureId: string, figureKey: string) => {
        // Just navigate to the assigned figure - cache is already handled by the modal
        logger.info('[FigureCarousel] onFigureAssigned callback called', {
          figureId,
          figureKey,
          projectId,
        });

        // Ensure the cache is fresh by invalidating figures query
        // This provides a backup in case the modal's cache invalidation hasn't propagated yet
        const figuresQueryKey = queryKeys.projects.figures(projectId);
        await queryClient.invalidateQueries({
          queryKey: figuresQueryKey,
          exact: true,
          refetchType: 'active',
        });

        // Force a refetch to ensure we get the latest data
        await queryClient.refetchQueries({
          queryKey: figuresQueryKey,
          exact: true,
        });

        // Small delay to ensure cache propagation
        await new Promise(resolve => setTimeout(resolve, 200));

        // Navigate to the assigned figure
        logger.info('[FigureCarousel] Navigating to assigned figure', {
          figureKey,
          hasSetCurrentFigure: !!effectiveSetCurrentFigure,
        });

        if (effectiveSetCurrentFigure) {
          effectiveSetCurrentFigure(figureKey);
        }

        logger.info('[FigureCarousel] onFigureAssigned callback completed', {
          figureId,
          figureKey,
        });
      },
    };

    // Remove the check that prevents rendering when no figures exist
    // The carousel should always be visible to allow users to add figures

    return (
      <>
        {/* Hidden file input for uploads */}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileHandlers.fileInputRef}
          onChange={
            fileHandlers.isReplaceMode
              ? fileHandlers.handleReplaceImage
              : fileHandlers.handleFileInput
          }
        />

        {/* Figure carousel container */}
        <div className="w-full relative h-full">
          {/* Main content */}
          <div className="flex flex-col h-full gap-2">
            {/* Figure content area */}
            <div className="h-[180px] md:h-[200px] lg:h-[220px] xl:h-[240px] flex-shrink-0 border border-border rounded-md p-2 bg-card relative overflow-hidden">
              <FigureContent {...figureContentProps} />

              {/* Figure controls (delete, fullscreen, etc.) inside the image area */}
              <FigureControls
                figureKeys={figureKeys}
                onDelete={openDeleteAlert}
                onFullView={openModal}
                onUnassign={handleUnassign}
                hasImage={!!figure.image}
              />

              {/* Figure navigation arrows inside the image area */}
              {figureKeys.length > 1 && (
                <div className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2 pointer-events-none">
                  <FigureNavigation
                    figureKeys={figureKeys}
                    currentIndex={currentIndex} // Use derived index
                    onNavigate={handleNavigate}
                  />
                </div>
              )}
            </div>

            {/* Navigation dots below the figure */}
            {figureKeys.length > 1 && (
              <div className="flex justify-center w-full mb-1">
                <div className="flex items-center space-x-1">
                  {figureKeys.map((key, index) => (
                    <div
                      key={key}
                      className={cn(
                        'w-1.5 h-1.5 rounded-full cursor-pointer transition-all duration-200 ease-out mx-px',
                        'shadow-sm border',
                        index === currentIndex
                          ? 'bg-blue-600 dark:bg-blue-500 border-blue-700 dark:border-blue-400 shadow-blue-500/50'
                          : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-600'
                      )}
                      onClick={() => handleNavigate(index)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Figure metadata */}
            <div className="w-full">
              <FigureMetadata
                figure={figure}
                figureNum={figureNum}
                onUpdateDescription={handleUpdateDescription}
                onUpload={() => fileHandlers.fileInputRef.current?.click()}
                onAddNewFigure={fileHandlers.handleAddNewFigure}
                onRenameFigure={fileHandlers.handleRenameFigure}
                onManageAllFigures={openManagementModal}
              />
            </div>
          </div>
        </div>

        {/* Modal for full-screen figure view */}
        <ModalView
          isOpen={isModalOpen}
          onClose={closeModal}
          title={`${figureNum}${figure.description ? ` - ${figure.description}` : ''}`}
        >
          <FigureContent
            {...figureContentProps}
            fullView={true}
            onClose={closeModal}
          />
        </ModalView>

        {/* Confirmation dialog for figure deletion */}
        <DeleteConfirmationDialog
          isOpen={isDeleteAlertOpen}
          onClose={closeDeleteAlert}
          onConfirm={() => {
            fileHandlers.handleDeleteFigure();
            closeDeleteAlert();
          }}
          title="Delete Figure"
          message={`Are you sure you want to delete ${figureNum}?${
            figureKeys.length <= 1
              ? ' This is the only figure. Deleting it will clear the figure data but keep the figure slot.'
              : ''
          }`}
        />

        {/* Dialog for adding new figures with improved UX */}
        <AddFigureDialog
          isOpen={isAddFigureDialogOpen}
          onClose={closeAddFigureDialog}
          options={addFigureOptions}
          onAddFigure={handleAddFigureFromDialog}
        />

        {/* Figure Management Modal */}
        <FigureManagementModal
          isOpen={isManagementModalOpen}
          onClose={closeManagementModal}
          projectId={projectId}
          inventionData={inventionData}
          currentFigure={currentFigure}
          onFigureAssigned={async (figureId, figureKey) => {
            logger.info(
              '[FigureCarousel] Figure assigned via management modal',
              {
                figureId,
                figureKey,
              }
            );

            // Use the same logic as figureContentProps.onFigureAssigned
            // Ensure the cache is fresh by invalidating figures query
            const figuresQueryKey = queryKeys.projects.figures(projectId);
            await queryClient.invalidateQueries({
              queryKey: figuresQueryKey,
              exact: true,
              refetchType: 'active',
            });

            // Force a refetch to ensure we get the latest data
            await queryClient.refetchQueries({
              queryKey: figuresQueryKey,
              exact: true,
            });

            // Small delay to ensure cache propagation
            await new Promise(resolve => setTimeout(resolve, 200));

            // Navigate to the assigned figure
            logger.info(
              '[FigureCarousel] Navigating to assigned figure from modal',
              {
                figureKey,
                hasSetCurrentFigure: !!effectiveSetCurrentFigure,
              }
            );

            if (effectiveSetCurrentFigure) {
              effectiveSetCurrentFigure(figureKey);
            }

            logger.info(
              '[FigureCarousel] Management modal onFigureAssigned completed',
              {
                figureId,
                figureKey,
              }
            );
          }}
        />
      </>
    );
  }
);

FigureCarousel.displayName = 'FigureCarousel';

export default FigureCarousel;
