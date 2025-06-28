/**
 * usePatentSidebar - Modern hook for PatentSidebar state management
 * Replaces legacy prop drilling with React Query and clean handlers
 */
import { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useToast } from '@chakra-ui/react';
import { useProjectData } from '@/contexts/ProjectDataContext';
import {
  useInventionQuery,
  useUpdateInventionMutation,
} from '@/hooks/api/useInvention';
import { useFigures } from '@/hooks/api/useFigures';
import { useFigureElements } from '@/hooks/api/useFigureElements';
import { FigureApiService } from '@/services/api/figureApiService';
import { Figures } from '../../technology-details/components/figures/carousel-components/types';
import {
  convertInventionFiguresToCarouselFormat,
  convertCarouselFiguresToInventionFormat,
  extractElementsFromInvention,
  createStableProjectReference,
  logPatentSidebarOperation,
  logFigureOperation,
} from '../utils/patentSidebarUtils';
import { useProject } from '@/hooks/api/useProjects';
import { logger } from '@/lib/monitoring/logger';
import { InventionData } from '@/types';

/**
 * Props for the new, simplified usePatentSidebar hook
 */
export interface UsePatentSidebarProps {
  projectId: string | null | undefined;
  inventionData: InventionData | null;
  currentFigure: string;
  setCurrentFigure: (figureKey: string) => void;
}

/**
 * Cleaned hook for managing PatentSidebar state and operations.
 * This hook is now a "dumb" hook that receives state and handlers from its parent.
 * It is responsible for transforming data for the UI and creating memoized callbacks.
 */
export const usePatentSidebar = ({
  projectId,
  inventionData,
  currentFigure,
  setCurrentFigure,
}: UsePatentSidebarProps) => {
  const toast = useToast();
  const updateInventionMutation = useUpdateInventionMutation();

  // Convert figures data for FigureCarousel
  const convertedFigures = useMemo(
    () => convertInventionFiguresToCarouselFormat(inventionData?.figures || {}),
    [inventionData]
  );

  // Extract elements for ReferenceNumeralsEditor
  const elements = useMemo(
    () => extractElementsFromInvention(inventionData, currentFigure),
    [inventionData, currentFigure]
  );

  // Handle figure updates from FigureCarousel
  const handleFigureUpdate = useCallback(
    (newFigures: Figures) => {
      if (!inventionData || !projectId) {
        logPatentSidebarOperation(
          'Figure update failed - no invention data or projectId',
          {}
        );
        return Promise.resolve();
      }
      const updatedFigures =
        convertCarouselFiguresToInventionFormat(newFigures);

      return new Promise<void>((resolve, reject) => {
        updateInventionMutation.mutate(
          { projectId, updates: { figures: updatedFigures } },
          {
            onSuccess: () => {
              logPatentSidebarOperation('Figure update successful', {});
              toast({
                title: 'Figures saved',
                status: 'success',
                duration: 2000,
                position: 'bottom-right',
              });
              resolve();
            },
            onError: error => {
              toast({
                title: 'Save failed',
                description: 'Failed to save figure changes.',
                status: 'error',
                position: 'bottom-right',
              });
              reject(error);
            },
          }
        );
      });
    },
    [inventionData, projectId, updateInventionMutation, toast]
  );

  // Handle element updates from ReferenceNumeralsEditor
  const handleElementUpdate = useCallback(
    (newElements: Record<string, string>) => {
      if (!inventionData || !projectId || !currentFigure) {
        logPatentSidebarOperation(
          'Element update failed - no invention data, projectId, or currentFigure',
          {
            hasInvention: !!inventionData,
            hasProjectId: !!projectId,
            currentFigure,
          }
        );
        return;
      }

      // Log the new elements being saved
      logger.info('[usePatentSidebar] Saving reference numerals', {
        currentFigure,
        newElements,
        elementCount: Object.keys(newElements).length,
      });

      // Create updated figures object with elements for the current figure
      const currentFigures = inventionData.figures || {};
      const currentFigureData = currentFigures[currentFigure] || {};

      // Preserve existing figure data while updating elements
      const updatedFigures = {
        ...currentFigures,
        [currentFigure]: {
          ...currentFigureData,
          elements: newElements,
          // If callouts exist, update them to match the new elements
          ...(currentFigureData.callouts
            ? {
                callouts: Object.entries(newElements)
                  .map(([element, description]) => ({
                    element,
                    description,
                  }))
                  .filter(callout => callout.description), // Only include callouts with descriptions
              }
            : {}),
        },
      };

      // Log the complete figures object being sent
      logger.info('[usePatentSidebar] Updated figures object', {
        currentFigure,
        updatedFigures,
        figureKeys: Object.keys(updatedFigures),
      });

      updateInventionMutation.mutate(
        { projectId, updates: { figures: updatedFigures } },
        {
          onSuccess: () => {
            logPatentSidebarOperation('Element update successful', {
              figureKey: currentFigure,
              elementCount: Object.keys(newElements).length,
            });
            toast({
              title: 'Reference numerals saved',
              status: 'success',
              duration: 2000,
              position: 'bottom-right',
            });
          },
          onError: error => {
            logPatentSidebarOperation('Element update failed', {
              error,
              figureKey: currentFigure,
            });
            toast({
              title: 'Save failed',
              description: 'Failed to save reference numerals.',
              status: 'error',
              position: 'bottom-right',
            });
          },
        }
      );
    },
    [inventionData, projectId, currentFigure, updateInventionMutation, toast]
  );

  // Handle figure selection change
  const handleFigureChange = useCallback(
    (figureKey: string) => {
      logFigureOperation('Figure selection changed', figureKey, {});
      setCurrentFigure(figureKey);
    },
    [setCurrentFigure]
  );

  return {
    // Data
    inventionData,
    convertedFigures,
    elements,
    isUpdating: updateInventionMutation.isPending,

    // Handlers
    handleFigureUpdate,
    handleElementUpdate,
    handleFigureChange,
  };
};

/**
 * Hook specifically for FigureCarousel component
 * Provides focused interface for figure management
 * Now uses useFigures to combine database files with invention content
 */
export const usePatentFigures = (props: UsePatentSidebarProps) => {
  const { handleFigureUpdate, handleFigureChange, isUpdating } =
    usePatentSidebar(props);

  // Use the new hook that combines database figures with invention content
  const { data: combinedFigures = {}, isLoading: figuresLoading } = useFigures(
    props.projectId || '',
    props.inventionData || undefined
  );

  return {
    figures: combinedFigures,
    onUpdate: handleFigureUpdate,
    onFigureChange: handleFigureChange,
    isUpdating,
    isLoading: figuresLoading,
  };
};

/**
 * Hook specifically for ReferenceNumeralsEditor component
 * Provides focused interface for element management
 */
export const usePatentElements = (props: UsePatentSidebarProps) => {
  const { inventionData, handleElementUpdate, isUpdating } =
    usePatentSidebar(props);

  // Use the database-backed figures data which includes elements
  const { data: figures = {}, isLoading: figuresLoading } = useFigures(
    props.projectId || '',
    inventionData || undefined
  );

  // Extract elements for the current figure from the database-backed data
  const elements = useMemo(() => {
    if (!props.currentFigure || !figures[props.currentFigure]) {
      return {};
    }

    const currentFigureData = figures[props.currentFigure];

    // The elements are already in the correct format from useFigures
    const extractedElements = currentFigureData.elements || {};

    // Debug logging to help diagnose the issue
    // Only log when there's something unusual or during specific debugging
    // if (Object.keys(extractedElements).length > 20) {
    //   logger.debug('[usePatentElements] Large number of elements', {
    //     currentFigure: props.currentFigure,
    //     elementCount: Object.keys(extractedElements).length,
    //   });
    // }

    return extractedElements;
  }, [figures, props.currentFigure]);

  // Check if data is still loading
  const isLoading = !!props.projectId && (figuresLoading || !inventionData);

  return {
    analyzedInvention: inventionData,
    elements,
    figures, // Return the database-backed figures for "show all" functionality
    onUpdate: handleElementUpdate,
    isUpdating,
    isLoading,
  };
};

// This hook is no longer needed as the parent will manage the project reference
// export const usePatentChat = () => {
//   const { stableProjectData, projectId } = usePatentSidebar();
//
//   return {
//     projectData: stableProjectData,
//     projectId,
//   };
// };
