import { logger } from '@/utils/clientLogger';
import { useToast } from '@/hooks/useToastWrapper';
import { ProjectApiService } from '@/client/services/project.client-service';
import { isFigureData } from '@/types/ui-types';
import { Figures } from '../components/figures/carousel-components/types';
import {
  ExtendedInventionData,
  StableProjectData,
} from '../types/techDetailsSidebar';
import { FigureData } from '@/types/ui-types';

/**
 * Utility functions for TechDetailsSidebar business logic
 */

/**
 * Converts unknown figures data to Figures type with proper validation
 */
export const convertToFiguresType = (figures: unknown): Figures => {
  // If figures is not an object or is null/undefined, return empty figures
  if (!figures || typeof figures !== 'object' || Array.isArray(figures)) {
    return {} as Figures;
  }

  const convertedFigures: Figures = {};
  Object.entries(figures).forEach(([figureKey, figureData]) => {
    // Make sure figureData is an object
    if (!isFigureData(figureData)) return;

    // Create the Figure object with all properties
    convertedFigures[figureKey] = {
      // Copy description and elements directly
      description: figureData.description,
      elements: figureData.elements || {},

      // Ensure type is one of the allowed values
      type:
        figureData.type === 'image' ||
        figureData.type === 'mermaid' ||
        figureData.type === 'reactflow'
          ? figureData.type
          : 'image', // Default to 'image' if not specified

      // Set content (used for special diagram types)
      content: figureData.originalDescription || '',

      // Ensure image data is preserved
      image: figureData.image || '',
    };
  });

  return convertedFigures;
};

/**
 * Handles element updates for a specific figure
 */
export const handleElementUpdate = async (
  updatedElements: Record<string, string>,
  analyzedInvention: ExtendedInventionData | null,
  currentFigure: string,
  projectId: string,
  onUpdateInvention: (updatedInvention: ExtendedInventionData) => void,
  toast: ReturnType<typeof useToast>
): Promise<void> => {
  if (!analyzedInvention || !currentFigure || !projectId) {
    logger.warn(
      'Cannot update elements: missing analyzedInvention, currentFigure, or projectId',
      {
        hasAnalyzedInvention: !!analyzedInvention,
        currentFigure,
        projectId,
      }
    );
    return;
  }

  const currentFigureData = analyzedInvention.figures?.[currentFigure];
  const updatedInvention = {
    ...analyzedInvention,
    figures: {
      ...analyzedInvention.figures,
      [currentFigure]: {
        ...(currentFigureData || {}),
        elements: updatedElements,
      },
    },
  };

  onUpdateInvention(updatedInvention);

  toast({
    title: 'Elements Updated',
    status: 'success',
    duration: 2000,
    isClosable: true,
  });
};

/**
 * Transforms figures data for carousel update
 */
export const transformFiguresForUpdate = (
  newFigures: Figures
): Record<string, FigureData> => {
  const updatedFigures: Record<string, FigureData> = {};
  Object.entries(newFigures).forEach(([key, figure]) => {
    updatedFigures[key] = {
      description: figure.description || '',
      elements: (figure.elements as Record<string, unknown>) || {},
      type: figure.type as 'image' | 'mermaid' | 'reactflow' | undefined,
      image: figure.image || '',
    };
  });
  return updatedFigures;
};

/**
 * Determines the target figure key based on current state
 */
export const determineTargetFigureKey = (
  analyzedInvention: ExtendedInventionData | null,
  currentFigure: string
): string => {
  let targetFigureKey = currentFigure;

  if (
    analyzedInvention?.figures &&
    typeof analyzedInvention.figures === 'object'
  ) {
    const figureKeys = Object.keys(analyzedInvention.figures);

    if (figureKeys.length > 0) {
      if (!currentFigure || !figureKeys.includes(currentFigure)) {
        targetFigureKey = figureKeys[0];
      }
    } else {
      targetFigureKey = 'FIG. 1'; // Default if UI shows FIG. 1 but no data
    }
  } else {
    targetFigureKey = 'FIG. 1'; // Default if UI shows FIG. 1 but no figures object
  }

  return targetFigureKey;
};

/**
 * Checks if figures exist in the current state
 */
export const checkFiguresExist = (
  analyzedInvention: ExtendedInventionData | null,
  targetFigureKey: string
): boolean => {
  return !!(
    analyzedInvention?.figures && analyzedInvention.figures[targetFigureKey]
  );
};

/**
 * Checks if a figure was newly added and is the only one
 */
export const checkIsOnlyFigureNewlyAdded = (
  targetFigureKey: string,
  analyzedInvention: ExtendedInventionData | null
): boolean => {
  return (
    targetFigureKey === 'FIG. 1' &&
    !!analyzedInvention?.figures &&
    Object.keys(analyzedInvention.figures).length === 1 &&
    !!analyzedInvention.figures[targetFigureKey]
  );
};

/**
 * Creates stable project data for chat interface
 */
export const createStableProjectData = (
  activeProjectData: any,
  projectId: string,
  analyzedInvention: ExtendedInventionData | null
): StableProjectData => {
  return {
    id: activeProjectData?.id || projectId || '',
    name: activeProjectData?.name,
    ...activeProjectData,
    title:
      analyzedInvention?.title || activeProjectData?.name || 'Untitled Project',
  };
};

/**
 * Handles chat content updates and project data refresh
 */
export const handleChatContentUpdate = async (
  action: string,
  stableProjectData: StableProjectData,
  onUpdateInvention: (updatedInvention: ExtendedInventionData) => void,
  toast: ReturnType<typeof useToast>
): Promise<void> => {
  // When the chat assistant updates the invention, we need to refresh the data
  if (action === 'refresh' && stableProjectData.id) {
    try {
      toast({
        title: 'Refreshing...',
        description: 'Loading updated invention data',
        status: 'info',
        duration: 2000,
      });

      // Fetch the updated project data via service layer (validated)
      const updatedProject = await ProjectApiService.getProject(
        stableProjectData.id
      );

      logger.info('Project data refreshed', {
        projectId: updatedProject.id,
      });

      toast({
        title: 'Success',
        description: 'Project data has been refreshed',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      logger.error('Error refreshing project data:', error);
      toast({
        title: 'Error',
        description: 'Failed to refresh project data',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }
};

/**
 * Creates chat props for the ChatInterface component
 */
export const createChatProps = (
  stableProjectData: StableProjectData,
  handleChatContentUpdateFn: (action: string) => Promise<void>,
  projectId: string
) => {
  return {
    projectData: stableProjectData,
    onContentUpdate: handleChatContentUpdateFn,
    setPreviousContent: () => {}, // Empty function
    pageContext: 'technology' as const,
    projectId: projectId,
  };
};
