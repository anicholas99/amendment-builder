/**
 * usePatentSidebar - Modern hook for PatentSidebar state management
 * Replaces legacy prop drilling with React Query and clean handlers
 */
import { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useToast } from '@/hooks/useToastWrapper';
import { useProjectData } from '@/contexts/ProjectDataContext';
import { useInventionQuery } from '@/hooks/api/useInvention';
import { useFigures } from '@/hooks/api/useFigures';
import { useFigureElements } from '@/hooks/api/useFigureElements';
import { FigureApiService } from '@/services/api/figureApiService';
import { Figures } from '../../technology-details/components/figures/carousel-components/types';
import type { FiguresWithIds } from '@/hooks/api/useFigures';
import {
  convertInventionFiguresToCarouselFormat,
  extractElementsFromInvention,
  createStableProjectReference,
  logPatentSidebarOperation,
  logFigureOperation,
} from '../utils/patentSidebarUtils';
import { useProject } from '@/hooks/api/useProjects';
import { logger } from '@/utils/clientLogger';
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
    (newFigures: FiguresWithIds) => {
      if (!inventionData || !projectId) {
        logPatentSidebarOperation(
          'Figure update failed - no invention data or projectId',
          {}
        );
        return Promise.resolve();
      }

      // IMPORTANT: Figures are no longer updated through the invention endpoint
      // This function is deprecated and should not be used
      // All figure updates should go through dedicated figure APIs:
      // - FigureApiService.updateFigureMetadata() for descriptions
      // - FigureApiService.updateElementCallout() for element descriptions
      // - FigureApiService.uploadFigure() for images
      logger.warn(
        '[usePatentSidebar] handleFigureUpdate called but figures should not be updated through invention endpoint',
        {
          projectId,
          figureKeys: Object.keys(newFigures),
        }
      );

      // Return resolved promise to maintain compatibility
      return Promise.resolve();
    },
    [inventionData, projectId]
  );

  // Handle element updates from ReferenceNumeralsEditor
  const handleElementUpdate = useCallback(
    async (newElements: Record<string, string>) => {
      if (!inventionData || !projectId || !currentFigure) {
        logPatentSidebarOperation(
          'Element update failed - missing required data',
          {
            hasInvention: !!inventionData,
            hasProjectId: !!projectId,
            currentFigure,
          }
        );
        return;
      }

      // Elements are now managed through normalized database tables
      // This function needs to be refactored to use FigureApiService element methods
      logger.warn(
        '[usePatentSidebar] handleElementUpdate needs refactoring to use proper element APIs',
        {
          currentFigure,
          elementCount: Object.keys(newElements).length,
        }
      );

      // TODO: Implementation needed:
      // 1. Get figure ID for currentFigure
      // 2. For each element, call FigureApiService.updateElementCallout()
      // 3. Handle any elements that need to be added/removed

      toast({
        title: 'Reference numerals update pending',
        description: 'Element updates need to be migrated to new API',
        status: 'warning',
        duration: 3000,
        position: 'bottom-right',
      });
    },
    [inventionData, projectId, currentFigure, toast]
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
    isUpdating: false,

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
    figures: combinedFigures as Figures, // Cast back to Figures for compatibility
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
