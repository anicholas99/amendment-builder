import React from 'react';
import { logger } from '@/lib/monitoring/logger';
import { InventionData } from '@/types/invention';

interface FigureElementUpdaterProps {
  analyzedInvention: InventionData;
  setAnalyzedInvention: React.Dispatch<
    React.SetStateAction<InventionData | null>
  >;
  currentFigure: string;
  elements: Record<string, unknown>;
}

/**
 * A utility component to handle updating figure elements
 * This component doesn't render any UI, it just provides a function to update elements
 */
const handleElementUpdate = ({
  analyzedInvention,
  setAnalyzedInvention,
  currentFigure,
  elements,
}: FigureElementUpdaterProps) => {
  if (!analyzedInvention) return;

  // Update element labels
  setAnalyzedInvention((prev: InventionData | null) => {
    if (!prev) return null;

    // Find the current figure and update its elements
    const figures =
      prev.figures && typeof prev.figures === 'object'
        ? { ...(prev.figures as Record<string, any>) }
        : {};

    // Check if figures object exists
    if (!figures || Object.keys(figures).length === 0) {
      logger.warn('No figures object found in analyzedInvention');
      // Initialize the figures object if it doesn't exist
      return {
        ...prev,
        figures: {
          [currentFigure]: {
            description: `Figure ${currentFigure}`,
            elements,
          },
        },
      };
    }

    // Check if current figure exists
    if (!currentFigure) {
      logger.warn('No current figure selected');
      // Create a default figure if none exists
      const defaultFigure = 'FIG. 1';
      figures[defaultFigure] = {
        ...(figures[defaultFigure] || {}),
        description: `Figure ${defaultFigure}`,
        elements,
      };

      return {
        ...prev,
        figures,
      };
    }

    // Update the elements for the current figure
    const currentFigureData = figures[currentFigure] || {};
    figures[currentFigure] = {
      ...currentFigureData,
      description:
        (currentFigureData as any).description || `Figure ${currentFigure}`,
      elements,
    };

    logger.log(`Updated elements for figure ${currentFigure}:`, elements);

    return {
      ...prev,
      figures,
    };
  });
};

export default handleElementUpdate;
