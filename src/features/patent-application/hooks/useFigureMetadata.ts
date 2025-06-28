import { useState, useEffect } from 'react';
import { logger } from '@/lib/monitoring/logger';
import { FigureApiService } from '@/services/api/figureApiService';

interface FigureMetadata {
  id: string;
  figureKey: string | null;
}

/**
 * Hook for fetching and managing figure metadata
 * Maps figureKey to figureId for API operations
 */
export function useFigureMetadata(projectId: string | null | undefined) {
  const [allFiguresData, setAllFiguresData] = useState<FigureMetadata[]>([]);
  const [currentFigureId, setCurrentFigureId] = useState<string | null>(null);

  // Fetch figure metadata
  useEffect(() => {
    async function fetchFigureData() {
      if (!projectId) return;

      try {
        const response =
          await FigureApiService.listFiguresWithElements(projectId);
        const newFiguresData = response.figures.map(f => ({
          id: f.id,
          figureKey: f.figureKey || null,
        }));

        // Only update if data has changed
        const currentDataStr = JSON.stringify(allFiguresData);
        const newDataStr = JSON.stringify(newFiguresData);

        if (currentDataStr !== newDataStr) {
          setAllFiguresData(newFiguresData);
        }
      } catch (error) {
        logger.error('[useFigureMetadata] Failed to fetch figure data', {
          error,
        });
      }
    }

    fetchFigureData();
  }, [projectId]);

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
