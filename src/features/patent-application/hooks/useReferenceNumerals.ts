import { useState, useEffect, useMemo } from 'react';
import { logger } from '@/lib/monitoring/logger';
import { useFigures } from '@/hooks/api/useFigures';

export const useReferenceNumerals = (
  projectId: string,
  currentFigure?: string
) => {
  const { data: figures, isLoading } = useFigures(projectId);

  const [elements, setElements] = useState<Record<string, string>>({});

  // When figures data loads or current figure changes, populate the elements state
  useEffect(() => {
    if (!figures || !currentFigure) {
      setElements({});
      return;
    }

    const figureData = figures[currentFigure];

    if (!figureData) {
      setElements({});
      return;
    }

    // Build elements map from figure data
    const figureElements: Record<string, string> = {};

    // Get elements from the normalized figure data
    if (figureData.elements && typeof figureData.elements === 'object') {
      Object.entries(figureData.elements).forEach(
        ([elementId, description]) => {
          figureElements[String(elementId)] = String(description || '');
        }
      );
    }

    setElements(figureElements);
  }, [figures, currentFigure]);

  const onUpdate = async (newElements: Record<string, string>) => {
    // NOTE: Element updates are now handled through the figure management UI
    // This hook is read-only for displaying reference numerals in the patent application
    logger.warn(
      'Reference numeral updates should be done through the figure management interface',
      {
        projectId,
        currentFigure,
      }
    );
  };

  return {
    elements,
    isUpdating: false,
    onUpdate,
    isLoading,
  };
};
