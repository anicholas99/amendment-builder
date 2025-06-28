import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { logger } from '@/lib/monitoring/logger';
import { environment } from '@/config/environment';
import {
  useDisclosure,
  Box,
  Flex,
  Input,
  Circle,
  HStack,
  Text as ChakraText,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';
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
import DeleteConfirmationDialog from './carousel-components/DeleteConfirmationDialog';
import AddFigureDialog from './carousel-components/AddFigureDialog';
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

interface ExtendedFigureCarouselProps extends Partial<UsePatentSidebarProps> {
  onFigureChange?: (figureKey: string) => void; // Optional callback for external state sync
  projectId?: string;
  inventionData?: { id: string; title?: string; figures?: Array<{ id: string; url: string; caption?: string }> } | null;
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

    // Modal and dialog hooks
    const {
      isOpen: isModalOpen,
      onOpen: openModal,
      onClose: closeModal,
    } = useDisclosure();
    const {
      isOpen: isDeleteAlertOpen,
      onOpen: openDeleteAlert,
      onClose: closeDeleteAlert,
    } = useDisclosure();
    const {
      isOpen: isAddFigureDialogOpen,
      onOpen: openAddFigureDialog,
      onClose: closeAddFigureDialog,
    } = useDisclosure();

    // Hook for API calls
    const updateFigureMutation = useUpdateFigure();
    const queryClient = useQueryClient();
    const toast = useToast();

    // Get the figures data using the hook
    const { figures, onUpdate, onFigureChange, isUpdating } = usePatentFigures({
      projectId: projectId || '',
      inventionData: inventionData || null,
      currentFigure: currentFigure || '',
      setCurrentFigure: setCurrentFigure || (() => {}),
    });

    // Get array of figure keys (FIG. 1, FIG. 2, etc.)
    const figureKeys = sortFigureKeys(figures || {});
    if (figureKeys.length === 0) {
      figureKeys.push('FIG. 1');
    }

    // Track previous figure keys to detect renames
    const prevFigureKeysRef = useRef<string[]>([]);

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
        if (!isLikelyRename && setCurrentFigure) {
          setCurrentFigure(figureKeys[0]);
        }
      }

      // Update the ref for next comparison
      prevFigureKeysRef.current = [...figureKeys];
    }, [currentFigure, figureKeys, setCurrentFigure]);

    // DERIVE the current index from props instead of using local state.
    const currentIndex = useMemo(() => {
      const index = figureKeys.indexOf(currentFigure || 'FIG. 1');
      return index === -1 ? 0 : index;
    }, [currentFigure, figureKeys]);

    // Current figure information
    const figureNum = figureKeys[currentIndex] || 'FIG. 1';
    const figure = (figureKeys.length > 0 && figures && figures[figureNum]) || {
      description: '',
      elements: {},
      type: 'image',
    };

    // Handle unassigning a figure
    const handleUnassign = useCallback(() => {
      const figureNum = figureKeys[currentIndex];
      const figure = figures[figureNum];

      if (!projectId || !figure.image) return;

      // Extract figure ID from the image URL
      // URL format: /api/projects/{projectId}/figures/{figureId}/download
      const match = figure.image.match(/figures\/([a-zA-Z0-9-]+)\/download/);
      const figureId = match?.[1];

      if (!figureId) {
        logger.error('[FigureCarousel] Could not extract figure ID from URL', {
          imageUrl: figure.image,
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
        if (setCurrentFigure) {
          setCurrentFigure(newFigureKey);
        }
        // Also call the external callback if provided
        if (externalOnFigureChange) {
          externalOnFigureChange(newFigureKey);
        }
      },
      currentIndex: currentIndex, // Pass derived index
      figureKeys,
      setCurrentIndex: (index: number) => {
        if (setCurrentFigure && figureKeys[index]) {
          setCurrentFigure(figureKeys[index]);
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
      if (setCurrentFigure && figureKeys[index]) {
        setCurrentFigure(figureKeys[index]);
      }
    };

    // Handle adding a figure from the dialog
    const handleAddFigureFromDialog = async (figureNumber: string) => {
      await fileHandlers.createNewFigure(figureNumber);
    };

    // Theme-aware colors for navigation dots
    const activeDotColor = useColorModeValue('blue.500', 'blue.400');
    const inactiveDotColor = useColorModeValue('gray.300', 'gray.600');

    // Show loading state if data is still loading
    if (!projectId) {
      return (
        <Box
          width="100%"
          height={{ base: "240px", md: "260px", lg: "280px", xl: "300px" }}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <ChakraText>Loading figures...</ChakraText>
        </Box>
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
      onFigureAssigned: async (figureId: string, figureKey: string) => {
        // Refresh the figures data after assignment
        logger.info('[FigureCarousel] Figure assigned from unassigned pool', {
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
        <Box width="100%" position="relative" height="100%">
          {/* Main content */}
          <Flex direction="column" height="100%" gap={2}>
            {/* Figure content area */}
            <Box
              height={{ base: "240px", md: "260px", lg: "280px", xl: "300px" }}
              flexShrink={0}
              borderWidth="1px"
              borderRadius="md"
              p={2}
              bg="bg.card"
              borderColor="border.primary"
              position="relative"
              overflow="hidden"
            >
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
                <Box
                  position="absolute"
                  top="50%"
                  left={0}
                  right={0}
                  transform="translateY(-50%)"
                >
                  <FigureNavigation
                    figureKeys={figureKeys}
                    currentIndex={currentIndex} // Use derived index
                    onNavigate={handleNavigate}
                  />
                </Box>
              )}
            </Box>

            {/* Navigation dots below the figure */}
            {figureKeys.length > 1 && (
              <Box display="flex" justifyContent="center" width="100%" mb={1}>
                <HStack spacing={1}>
                  {figureKeys.map((key, index) => (
                    <Circle
                      key={key}
                      size={index === currentIndex ? '8px' : '6px'}
                      bg={
                        index === currentIndex
                          ? activeDotColor
                          : inactiveDotColor
                      }
                      className="cursor-pointer transition-bg mx-px"
                      style={{
                        transition:
                          'background-color 0.15s ease-out, width 0.15s ease-out, height 0.15s ease-out',
                      }}
                      onClick={() => handleNavigate(index)}
                    />
                  ))}
                </HStack>
              </Box>
            )}

            {/* Figure metadata */}
            <Box width="100%">
              <FigureMetadata
                figure={figure}
                figureNum={figureNum}
                onUpdateDescription={handleUpdateDescription}
                onUpload={() => fileHandlers.fileInputRef.current?.click()}
                onAddNewFigure={fileHandlers.handleAddNewFigure}
                onRenameFigure={fileHandlers.handleRenameFigure}
              />
            </Box>
          </Flex>
        </Box>

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
      </>
    );
  }
);

FigureCarousel.displayName = 'FigureCarousel';

export default FigureCarousel;
