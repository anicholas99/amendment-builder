import { useState, useCallback, useEffect } from 'react';
import { InventionData } from '@/types';

interface UsePatentUIStateOptions {
  inventionData?: InventionData | null;
}

interface UsePatentUIStateReturn {
  selectedRefIds: string[];
  setSelectedRefIds: (ids: string[]) => void;
  currentFigure: string;
  setCurrentFigure: (figure: string) => void;
  activeTab: number;
  setActiveTab: (tab: number) => void;
}

/**
 * Hook to manage patent application UI state
 * Handles tabs, figure selection, and reference selections
 */
export const usePatentUIState = ({
  inventionData,
}: UsePatentUIStateOptions): UsePatentUIStateReturn => {
  const [selectedRefIds, setSelectedRefIds] = useState<string[]>([]);
  const [currentFigure, setCurrentFigure] = useState<string>('FIG. 1');
  const [activeTab, setActiveTab] = useState(0);

  // Memoize the setter to ensure stable reference
  const memoizedSetSelectedRefIds = useCallback(
    (ids: string[]) => setSelectedRefIds(ids),
    []
  );

  // Sync current figure with available figures
  useEffect(() => {
    if (
      inventionData?.figures &&
      Object.keys(inventionData.figures).length > 0 &&
      !Object.keys(inventionData.figures).includes(currentFigure)
    ) {
      const firstFigureKey = Object.keys(inventionData.figures)[0];
      if (firstFigureKey) {
        setCurrentFigure(firstFigureKey);
      }
    }
  }, [inventionData, currentFigure]);

  return {
    selectedRefIds,
    setSelectedRefIds: memoizedSetSelectedRefIds,
    currentFigure,
    setCurrentFigure,
    activeTab,
    setActiveTab,
  };
};
