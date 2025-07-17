import React from 'react';
import FigureCarousel from '@/features/technology-details/components/figures/FigureCarousel';
import ReferenceNumeralsEditor from '@/features/patent-application/components/ReferenceNumeralsEditor';
import { InventionData } from '@/types';
import { cn } from '@/lib/utils';

interface FiguresTabProps {
  projectId: string | null | undefined;
  inventionData: InventionData | null;
  currentFigure: string;
  setCurrentFigure: (figureKey: string) => void;
  onFigureChange?: (figureKey: string) => void;
  onSearchReferenceNumeral?: (numeralId: string) => void;
}

/**
 * Shared FiguresTab component for consistent figure management UI
 * Used by both PatentSidebar and TechDetailsSidebar
 */
export const FiguresTab: React.FC<FiguresTabProps> = React.memo(
  ({
    projectId,
    inventionData,
    currentFigure,
    setCurrentFigure,
    onFigureChange,
    onSearchReferenceNumeral,
  }) => {
    return (
      <div className="p-4 h-full flex flex-col overflow-auto">
        {/* Figures Section - Top */}
        <div className="mb-1">
          <FigureCarousel
            projectId={projectId ? projectId : undefined}
            inventionData={inventionData as any}
            currentFigure={currentFigure}
            setCurrentFigure={setCurrentFigure}
            onFigureChange={onFigureChange}
          />
        </div>

        {/* Reference Numerals Section - Bottom */}
        <div className="mt-0 flex-1 overflow-visible">
          <ReferenceNumeralsEditor
            projectId={projectId}
            inventionData={inventionData}
            currentFigure={currentFigure}
            setCurrentFigure={setCurrentFigure}
            onSearchReferenceNumeral={onSearchReferenceNumeral}
          />
        </div>
      </div>
    );
  }
);

FiguresTab.displayName = 'FiguresTab';

export default FiguresTab;
