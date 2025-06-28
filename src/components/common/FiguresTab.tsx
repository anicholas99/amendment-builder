import React from 'react';
import { Box } from '@chakra-ui/react';
import FigureCarousel from '@/features/technology-details/components/figures/FigureCarousel';
import ReferenceNumeralsEditor from '@/features/patent-application/components/ReferenceNumeralsEditor';
import { InventionData } from '@/types';

interface FiguresTabProps {
  projectId: string | null | undefined;
  inventionData: InventionData | null;
  currentFigure: string;
  setCurrentFigure: (figureKey: string) => void;
  onFigureChange?: (figureKey: string) => void;
}

/**
 * Shared FiguresTab component for consistent figure management UI
 * Used by both PatentSidebar and TechDetailsSidebar
 */
export const FiguresTab: React.FC<FiguresTabProps> = React.memo(({
  projectId,
  inventionData,
  currentFigure,
  setCurrentFigure,
  onFigureChange,
}) => {
  return (
    <Box
      p={3}
      height="100%"
      display="flex"
      flexDirection="column"
      overflow="auto"
    >
      {/* Figures Section - Top */}
      <Box mb={1}>
        <Box fontSize="md" fontWeight="bold" mb={1} color="text.primary">
          Figures
        </Box>
        <FigureCarousel
          projectId={projectId ? projectId : undefined}
          inventionData={inventionData as any}
          currentFigure={currentFigure}
          setCurrentFigure={setCurrentFigure}
          onFigureChange={onFigureChange}
        />
      </Box>

      {/* Reference Numerals Section - Bottom */}
      <Box mt={0} flex="1" overflow="visible">
        <ReferenceNumeralsEditor
          projectId={projectId}
          inventionData={inventionData}
          currentFigure={currentFigure}
          setCurrentFigure={setCurrentFigure}
        />
      </Box>
    </Box>
  );
});

FiguresTab.displayName = 'FiguresTab';

export default FiguresTab; 