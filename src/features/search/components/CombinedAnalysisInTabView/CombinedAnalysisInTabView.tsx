import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/useToastWrapper';
import { LoadingState } from '@/components/common/LoadingState';
import { StructuredCombinedAnalysis } from '@/client/services/patent/patentability/combined-analysis.client-service';
import { CitationJobApiResponse } from '@/types/apiResponses';
import { useCombinedAnalyses } from '@/hooks/api/useCombinedAnalyses';
import { useSearchHistory } from '@/hooks/api/useSearchHistory';
import { CitationJobWithAnalysis } from '@/types/api/citation';
import { logger } from '@/utils/clientLogger';

// Import all our extracted components
import { CombinedAnalysisBreadcrumb } from './CombinedAnalysisBreadcrumb';
import { CombinedAnalysisHeader } from './CombinedAnalysisHeader';
import { PastAnalysesList } from './PastAnalysesList';
import { ReferenceSelectionForm } from './ReferenceSelectionForm';
import { CombinedAnalysisResult } from './CombinedAnalysisResult';

interface ReferenceOption {
  referenceNumber: string;
  title?: string;
  applicant?: string;
}

interface CombinedAnalysisInTabViewProps {
  citationJobs: CitationJobWithAnalysis[];
  searchHistoryId: string | null;
  onBack: () => void;
  onRunCombinedAnalysis: (selected: string[]) => void;
  isLoading: boolean;
  result: StructuredCombinedAnalysis | null;
  selectedReferences: string[];
  claim1Text?: string;
  onClearResult?: () => void;
  projectId: string;
  onSearchChange: (searchId: string) => void;
  onApplyAmendmentToClaim1?: (original: string, revised: string) => void;
  onAddDependentClaim?: (dependentClaimText: string) => void;
}

const CombinedAnalysisInTabView: React.FC<CombinedAnalysisInTabViewProps> = ({
  citationJobs,
  searchHistoryId,
  onBack,
  onRunCombinedAnalysis,
  isLoading,
  result,
  selectedReferences,
  claim1Text,
  onClearResult,
  projectId,
  onSearchChange,
  onApplyAmendmentToClaim1,
  onAddDependentClaim,
}) => {
  const toast = useToast();
  const { isDarkMode } = useThemeContext();

  // Fetch search history for dropdown
  const { data: searchHistoryData } = useSearchHistory(projectId);
  const searchHistory = searchHistoryData || [];

  // Local selection state for references (persisted in parent on run)
  const [localSelected, setLocalSelected] = useState<string[]>(
    selectedReferences || []
  );
  const [viewingPastAnalysis, setViewingPastAnalysis] =
    useState<StructuredCombinedAnalysis | null>(null);
  const [showCreateNew, setShowCreateNew] = useState(false);

  // Fetch past analyses
  const { data: pastAnalyses, isLoading: isLoadingPast } =
    useCombinedAnalyses(searchHistoryId);

  // Automatically hide the create new interface when a result arrives
  useEffect(() => {
    if (result) {
      setShowCreateNew(false);
    }
  }, [result]);

  // Automatically hide the create new interface when loading starts
  useEffect(() => {
    if (isLoading && showCreateNew) {
      // Keep showCreateNew true so we can show the loading state in the form
      // The form itself will render the loading state instead of the selection UI
    }
  }, [isLoading, showCreateNew]);

  // Build selectable references (with deep analysis)
  const selectableReferences: ReferenceOption[] = (citationJobs || [])
    .filter(job => job.referenceNumber && job.deepAnalysisJson)
    .map(job => ({
      referenceNumber: job.referenceNumber!,
      title: job.referenceTitle || undefined,
      applicant: job.referenceApplicant || undefined,
    }));

  const handleToggle = (refNum: string) => {
    setLocalSelected(prev =>
      prev.includes(refNum) ? prev.filter(r => r !== refNum) : [...prev, refNum]
    );
  };

  const handleRun = useCallback(() => {
    logger.info('[CombinedAnalysisInTabView] Starting combined analysis', {
      selectedReferences: localSelected,
      searchHistoryId,
    });

    // Show immediate toast feedback
    toast({
      title: 'Starting Analysis',
      description: `Analyzing ${localSelected.length} references...`,
      status: 'info',
      duration: 2000,
    });

    onRunCombinedAnalysis(localSelected);
  }, [localSelected, searchHistoryId, onRunCombinedAnalysis, toast]);

  const handleCopy = () => {
    const resultToCopy = viewingPastAnalysis || result;
    if (!resultToCopy || !resultToCopy.rejectionJustification?.fullNarrative)
      return;
    // Attempt to copy a summarized version or the full narrative
    const textToCopy = `Combined Analysis Summary:\nDetermination: ${resultToCopy.patentabilityDetermination}\n${
      resultToCopy.primaryReference
        ? `Primary Reference: ${resultToCopy.primaryReference.replace(/-/g, '')}\n`
        : ''
    }Combined References: ${resultToCopy.combinedReferences.map(ref => ref.replace(/-/g, '')).join(', ')}\n\nFull Analysis:\n${
      resultToCopy.rejectionJustification.fullNarrative
    }`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast({
        title: 'Copied to clipboard',
        duration: 2000,
      });
    });
  };

  const getDeterminationColorScheme = (determination?: string) => {
    switch (determination) {
      case 'Likely Patentable':
        return 'green';
      case 'Anticipated (§ 102)':
        return 'red';
      case 'Obvious (§ 103)':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const handleViewPastAnalysis = (analysis: StructuredCombinedAnalysis) => {
    setViewingPastAnalysis(analysis);
    setShowCreateNew(false);
  };

  const handleCreateNew = () => {
    if (!searchHistoryId) {
      toast({
        title: 'No search selected',
        description:
          'Please select a search from the dropdown above to create an analysis.',
        status: 'warning',
        duration: 3000,
      });
      return;
    }
    setViewingPastAnalysis(null);
    setShowCreateNew(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSearchId = e.target.value;
    // Clear any viewing state when changing search
    setViewingPastAnalysis(null);
    setShowCreateNew(false);
    setLocalSelected([]);
    // Call parent's handler to update the search
    onSearchChange(newSearchId);
  };

  const handleCancelCreateNew = () => {
    setShowCreateNew(false);
    setLocalSelected([]);
  };

  const handleBackToList = () => {
    setViewingPastAnalysis(null);
    setShowCreateNew(false);
  };

  // Handler for going back from fresh results
  const handleBackFromFreshResult = () => {
    // Clear the result and go back to the list
    if (onClearResult) {
      onClearResult();
    }
    // Reset local state
    setViewingPastAnalysis(null);
    setShowCreateNew(false);
    setLocalSelected([]);
  };

  // Determine what result to show - don't show result if we're creating new
  const displayResult = showCreateNew ? null : viewingPastAnalysis || result;

  // Reading mode: when displaying a result, use full screen real estate
  const isReadingMode = !!displayResult;

  if (isReadingMode) {
    return (
      <div
        className={cn(
          'h-full overflow-y-auto',
          isDarkMode ? 'bg-gray-50 dark:bg-gray-900' : 'bg-gray-50'
        )}
      >
        {/* Minimal floating navigation for reading mode */}
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
          <div className="px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 flex items-center gap-1"
              >
                ← Back to Citations
              </button>
              {/* Always show back to list button, different handler based on context */}
              <button
                onClick={
                  viewingPastAnalysis
                    ? handleBackToList
                    : handleBackFromFreshResult
                }
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                Back to List
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCreateNew}
                className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded"
              >
                {viewingPastAnalysis ? 'Create New Analysis' : 'Create Another'}
              </button>
            </div>
          </div>
        </div>

        {/* Full-width analysis content */}
        <div className="px-8 py-6">
          <CombinedAnalysisResult
            result={displayResult}
            isViewingPast={!!viewingPastAnalysis}
            onBackToList={
              viewingPastAnalysis ? handleBackToList : handleBackFromFreshResult
            }
            onCreateNew={handleCreateNew}
            onClearResult={
              !viewingPastAnalysis && result ? onClearResult : undefined
            }
            onCopy={handleCopy}
            getDeterminationColorScheme={getDeterminationColorScheme}
            claim1Text={claim1Text}
            onApplyAmendment={onApplyAmendmentToClaim1}
            onAddDependent={onAddDependentClaim}
          />
        </div>
      </div>
    );
  }

  // Normal navigation mode for browsing/creating
  return (
    <div
      className={cn(
        'p-6 h-full flex flex-col',
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      )}
    >
      {/* Breadcrumb */}
      <div className="flex-shrink-0">
        <CombinedAnalysisBreadcrumb onBack={onBack} />
      </div>

      {/* Header with search dropdown */}
      <div className="flex-shrink-0">
        <CombinedAnalysisHeader
          searchHistory={searchHistory}
          searchHistoryId={searchHistoryId}
          onSearchChange={handleSearchChange}
        />
      </div>

      {/* Main content area */}
      <div className="flex-1 min-h-0">
        {/* Show past analyses or create new */}
        {!showCreateNew && (
          <div className="h-full">
            {searchHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  No searches available
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Run a search from the Patent Search tab to perform combined
                  analysis
                </p>
              </div>
            ) : searchHistoryId ? (
              <PastAnalysesList
                isLoading={isLoadingPast}
                pastAnalyses={pastAnalyses}
                onViewAnalysis={handleViewPastAnalysis}
                onCreateNew={handleCreateNew}
                getDeterminationColorScheme={getDeterminationColorScheme}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Please select a search to view analyses
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Choose a search from the dropdown above to view past analyses
                  or create a new one
                </p>
              </div>
            )}
          </div>
        )}

        {/* Show create new interface */}
        {showCreateNew && searchHistoryId && (
          <div className="h-full">
            <ReferenceSelectionForm
              selectableReferences={selectableReferences}
              selectedReferences={localSelected}
              onToggle={handleToggle}
              onRun={handleRun}
              onCancel={handleCancelCreateNew}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Loading state - only show when not in create new mode */}
        {isLoading && searchHistoryId && !showCreateNew && (
          <div className="flex items-center justify-center h-full">
            <LoadingState
              variant="spinner"
              message="Generating combined examiner analysis... this may take a moment."
              minHeight="200px"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CombinedAnalysisInTabView;
