import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  Flex,
  Spinner,
  VStack,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';
import { StructuredCombinedAnalysis } from '@/client/services/patent/patentability/combinedAnalysisService';
import { CitationJobApiResponse } from '@/types/apiResponses';
import { useCombinedAnalyses } from '@/hooks/api/useCombinedAnalyses';
import { useSearchHistory } from '@/hooks/api/useSearchHistory';
import { CitationJob } from '@prisma/client';

// Import all our extracted components
import { CombinedAnalysisBreadcrumb } from './CombinedAnalysisBreadcrumb';
import { CombinedAnalysisHeader } from './CombinedAnalysisHeader';
import { PastAnalysesList } from './PastAnalysesList';
import { ReferenceSelectionForm } from './ReferenceSelectionForm';
import { CombinedAnalysisResult } from './CombinedAnalysisResult';

// Extended citation job type to include additional fields
interface CitationJobWithAnalysis extends CitationJob {
  referenceTitle?: string;
}

interface ReferenceOption {
  referenceNumber: string;
  title?: string;
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

  // Build selectable references (with deep analysis)
  const selectableReferences: ReferenceOption[] = (citationJobs || [])
    .filter(job => job.referenceNumber && job.deepAnalysisJson)
    .map(job => ({
      referenceNumber: job.referenceNumber!,
      title: job.referenceTitle || undefined,
    }));

  const handleToggle = (refNum: string) => {
    setLocalSelected(prev =>
      prev.includes(refNum) ? prev.filter(r => r !== refNum) : [...prev, refNum]
    );
  };

  const handleRun = () => {
    onRunCombinedAnalysis(localSelected);
  };

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
        status: 'success',
        duration: 2000,
        isClosable: true,
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

  // Determine what result to show - don't show result if we're creating new
  const displayResult = showCreateNew ? null : viewingPastAnalysis || result;

  // Color mode values
  const cardBg = useColorModeValue('bg.card', 'bg.card');
  const textSecondaryColor = useColorModeValue(
    'text.secondary',
    'text.secondary'
  );

  return (
    <Box p={6} h="100%" overflowY="auto" bg={cardBg}>
      {/* Breadcrumb */}
      <CombinedAnalysisBreadcrumb onBack={onBack} />

      {/* Header with search dropdown */}
      <CombinedAnalysisHeader
        searchHistory={searchHistory}
        searchHistoryId={searchHistoryId}
        onSearchChange={handleSearchChange}
      />

      {/* Show past analyses or create new - only if no result is being displayed */}
      {!displayResult && !showCreateNew && (
        <VStack spacing={4} align="stretch">
          <PastAnalysesList
            isLoading={isLoadingPast}
            pastAnalyses={pastAnalyses}
            onViewAnalysis={handleViewPastAnalysis}
            onCreateNew={handleCreateNew}
            getDeterminationColorScheme={getDeterminationColorScheme}
          />
        </VStack>
      )}

      {/* Show create new interface */}
      {showCreateNew && !displayResult && (
        <ReferenceSelectionForm
          selectableReferences={selectableReferences}
          selectedReferences={localSelected}
          onToggle={handleToggle}
          onRun={handleRun}
          onCancel={handleCancelCreateNew}
          isLoading={isLoading}
        />
      )}

      {/* Display result (either new or past) */}
      {displayResult && (
        <CombinedAnalysisResult
          result={displayResult}
          isViewingPast={!!viewingPastAnalysis}
          onBackToList={viewingPastAnalysis ? handleBackToList : undefined}
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
      )}

      {/* Loading state */}
      {isLoading && (
        <Flex align="center" justify="center" minHeight="200px" mt={6}>
          <Spinner size="lg" thickness="4px" color="blue.500" />
          <Text ml={4} color={textSecondaryColor}>
            Generating combined examiner analysis... this may take a moment.
          </Text>
        </Flex>
      )}
    </Box>
  );
};

export default CombinedAnalysisInTabView;
