import { useState, useEffect, useMemo } from 'react';
import { logger } from '@/utils/clientLogger';
import { useFigures } from '@/hooks/api/useFigures';

interface FigureMetadata {
  id: string;
  figureKey: string | null;
}

/**
 * Hook for fetching and managing figure metadata
 * Maps figureKey to figureId for API operations
 *
 * PERFORMANCE OPTIMIZATION: This hook now reuses the data from useFigures
 * instead of making a duplicate API call to the same endpoint
 */
export function useFigureMetadata(projectId: string | null | undefined) {
  const [currentFigureId, setCurrentFigureId] = useState<string | null>(null);

  // Reuse existing figures data from useFigures hook (no duplicate API call!)
  const { data: figuresData, isLoading } = useFigures(
    projectId || '',
    undefined
  );

  // Transform figures data to metadata array format
  const allFiguresData = useMemo<FigureMetadata[]>(() => {
    if (!figuresData || isLoading) return [];

    // Convert the figures object to array of metadata
    const metadata: FigureMetadata[] = [];

    Object.entries(figuresData).forEach(([figureKey, figure]) => {
      if (figure._id) {
        metadata.push({
          id: figure._id,
          figureKey: figureKey,
        });
      }
    });

    return metadata;
  }, [figuresData, isLoading]);

  // Get figure ID for a given figure key
  const getFigureId = (figureKey: string | null): string | null => {
    if (!figureKey) return null;
    const figure = allFiguresData.find(f => f.figureKey === figureKey);
    return figure?.id || null;
  };

  return {
    allFiguresData,
    currentFigureId,
    setCurrentFigureId,
    getFigureId,
  };
}
