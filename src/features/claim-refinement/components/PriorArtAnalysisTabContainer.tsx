import React from 'react';
import PriorArtAnalysisTab from './PriorArtAnalysisTab';
import { FullAnalysisResponse } from '../../../types/priorArtAnalysisTypes';
import { ProcessedSearchHistoryEntry } from '@/types/domain/searchHistory';
import { usePriorArtAnalysis } from '../hooks/usePriorArtAnalysis';

interface PriorArtAnalysisTabContainerProps {
  claim1Text: string;
  isAnalyzing?: boolean;
  analysisData?: FullAnalysisResponse | null;
  searchHistory: ProcessedSearchHistoryEntry[];
  projectId: string;
  handleOpenApplyModal: (data: {
    elementText: string;
    newLanguage: string;
  }) => void;
  onInsertClaim?: (
    afterClaimNumber: string,
    text: string,
    dependsOn: string
  ) => void;
}

/**
 * Container component for the Prior Art Analysis tab in the ClaimSidebar
 */
const PriorArtAnalysisTabContainer: React.FC<
  PriorArtAnalysisTabContainerProps
> = ({
  claim1Text,
  isAnalyzing: externalIsAnalyzing,
  analysisData: externalAnalysisData,
  searchHistory,
  projectId,
  handleOpenApplyModal,
  onInsertClaim,
}) => {
  // Use the prior art analysis hook for tab state management
  const {
    selectedSearchId,
    setSelectedSearchId,
    availableReferences,
    displayedReferences,
    selectedReferenceNumbers,
    toggleReferenceSelection,
    selectAllReferences,
    deselectAllReferences,
    showAllReferences,
    toggleShowAll,
    triggerAnalysis,
    hideResolved,
    toggleHideResolved,
    referenceRiskProfiles,
    overallCoverageScore,
    resolvedStatusMap,
    isAnalyzing,
    analysisData,
  } = usePriorArtAnalysis({
    searchHistory,
    projectId,
    claim1Text,
  });

  // Use hook data primarily, fallback to external props if needed
  const effectiveIsAnalyzing = isAnalyzing || externalIsAnalyzing || false;
  const effectiveAnalysisData = analysisData || externalAnalysisData || null;

  return (
    <PriorArtAnalysisTab
      key="prior-art-analysis"
      // State for the dropdown selection
      selectedSearchId={selectedSearchId}
      onSelectedSearchIdChange={setSelectedSearchId}
      // Reference management
      availableReferences={availableReferences}
      displayedReferences={displayedReferences}
      selectedReferenceNumbers={selectedReferenceNumbers}
      onToggleReference={toggleReferenceSelection}
      onSelectAllReferences={selectAllReferences}
      onDeselectAllReferences={deselectAllReferences}
      showAllReferences={showAllReferences}
      onToggleShowAll={toggleShowAll}
      // Other necessary props
      claim1Text={claim1Text}
      isAnalyzing={effectiveIsAnalyzing}
      analysisData={effectiveAnalysisData}
      onAnalyze={() => triggerAnalysis(false)} // Wrapper for normal analysis
      onReAnalyze={() => triggerAnalysis(true)} // Wrapper for re-analysis
      searchHistory={searchHistory}
      onOpenApplyModal={handleOpenApplyModal}
      onInsertClaim={onInsertClaim}
      hideResolved={hideResolved}
      onToggleHideResolved={toggleHideResolved}
      referenceRiskProfiles={referenceRiskProfiles}
      overallCoverageScore={overallCoverageScore}
      resolvedStatusMap={resolvedStatusMap}
    />
  );
};

export default PriorArtAnalysisTabContainer;
