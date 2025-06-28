import { useState, useCallback } from 'react';
import {
  ClaimViewMode,
  SearchMode,
  CLAIM_VIEW_MODES,
  SEARCH_MODES,
} from '../constants';
import { PriorArtReference } from '@/types/claimTypes';
import { FullAnalysisResponse } from '@/types/priorArtAnalysisTypes';
import { InventionData } from '@/types/invention';
import { useToast } from '@chakra-ui/react';
import { ClaimsClientService } from '@/client/services/claims.client-service';

interface ClaimViewState {
  // Modal states
  isPreviewModalOpen: boolean;
  isPriorArtModalOpen: boolean;
  isParsingModalOpen: boolean;
  isApplyModalOpen: boolean;

  // View states
  claimViewMode: ClaimViewMode;
  searchMode: SearchMode;

  // Selected/Active items
  viewingPriorArt: PriorArtReference | null;
  previewingSuggestionId: number | null;
  selectedClaimForParsing: string | null;
  selectedReference: string | null;
  selectedSearchIdState: string;

  // Data states
  parsedElements: string[];
  searchQueries: string[];
  analysisData: FullAnalysisResponse | null;
  applyModalData: { elementText: string; newLanguage: string } | null;

  // Loading states
  isParsingClaim: boolean;
  isAnalyzing: boolean;
  isComponentVisible: boolean;
  hasLoadedSearchHistory: boolean;
  isUnmounting: boolean;

  // UI states
  expandedPriorArt: number[];
  currentSuggestionSet: number;
}

interface ClaimViewStateActions {
  // Modal actions
  openPreviewModal: () => void;
  closePreviewModal: () => void;
  openPriorArtModal: (priorArt: PriorArtReference) => void;
  closePriorArtModal: () => void;
  openParsingModal: () => void;
  closeParsingModal: () => void;
  openApplyModal: (data: { elementText: string; newLanguage: string }) => void;
  closeApplyModal: () => void;

  // View actions
  toggleClaimViewMode: () => void;
  setSearchMode: (mode: SearchMode) => void;

  // Selection actions
  setPreviewingSuggestionId: (id: number | null) => void;
  setSelectedClaimForParsing: (claim: string | null) => void;
  setSelectedReference: (reference: string | null) => void;
  setSelectedSearchId: (id: string) => void;

  // Data actions
  setParsedElements: (elements: string[]) => void;
  setSearchQueries: (queries: string[]) => void;
  setAnalysisData: (data: FullAnalysisResponse | null) => void;

  // Loading actions
  setIsParsingClaim: (isParsing: boolean) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setIsComponentVisible: (isVisible: boolean) => void;
  setHasLoadedSearchHistory: (hasLoaded: boolean) => void;
  setIsUnmounting: (isUnmounting: boolean) => void;

  // UI actions
  toggleExpandedPriorArt: (index: number) => void;
  setCurrentSuggestionSet: (set: number) => void;
}

export function useClaimViewState(): ClaimViewState & ClaimViewStateActions {
  // Modal states
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isPriorArtModalOpen, setIsPriorArtModalOpen] = useState(false);
  const [isParsingModalOpen, setIsParsingModalOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // View states
  const [claimViewMode, setClaimViewMode] = useState<ClaimViewMode>(
    CLAIM_VIEW_MODES.BOX
  );
  const [searchMode, setSearchMode] = useState<SearchMode>(SEARCH_MODES.BASIC);

  // Selected/Active items
  const [viewingPriorArt, setViewingPriorArt] =
    useState<PriorArtReference | null>(null);
  const [previewingSuggestionId, setPreviewingSuggestionId] = useState<
    number | null
  >(null);
  const [selectedClaimForParsing, setSelectedClaimForParsing] = useState<
    string | null
  >(null);
  const [selectedReference, setSelectedReference] = useState<string | null>(
    null
  );
  const [selectedSearchIdState, setSelectedSearchIdState] =
    useState<string>('');

  // Data states
  const [parsedElements, setParsedElements] = useState<string[]>([]);
  const [searchQueries, setSearchQueries] = useState<string[]>([]);
  const [analysisData, setAnalysisData] = useState<FullAnalysisResponse | null>(
    null
  );
  const [applyModalData, setApplyModalData] = useState<{
    elementText: string;
    newLanguage: string;
  } | null>(null);

  // Loading states
  const [isParsingClaim, setIsParsingClaim] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isComponentVisible, setIsComponentVisible] = useState(false);
  const [hasLoadedSearchHistory, setHasLoadedSearchHistory] = useState(false);
  const [isUnmounting, setIsUnmounting] = useState(false);

  // UI states
  const [expandedPriorArt, setExpandedPriorArt] = useState<number[]>([]);
  const [currentSuggestionSet, setCurrentSuggestionSet] = useState(3);

  // Modal actions
  const openPreviewModal = useCallback(() => setIsPreviewModalOpen(true), []);
  const closePreviewModal = useCallback(() => setIsPreviewModalOpen(false), []);

  const openPriorArtModal = useCallback((priorArt: PriorArtReference) => {
    setViewingPriorArt(priorArt);
    setIsPriorArtModalOpen(true);
  }, []);

  const closePriorArtModal = useCallback(() => {
    setViewingPriorArt(null);
    setIsPriorArtModalOpen(false);
  }, []);

  const openParsingModal = useCallback(() => setIsParsingModalOpen(true), []);
  const closeParsingModal = useCallback(() => setIsParsingModalOpen(false), []);

  const openApplyModal = useCallback(
    (data: { elementText: string; newLanguage: string }) => {
      setApplyModalData(data);
      setIsApplyModalOpen(true);
    },
    []
  );

  const closeApplyModal = useCallback(() => {
    setApplyModalData(null);
    setIsApplyModalOpen(false);
  }, []);

  // View actions
  const toggleClaimViewMode = useCallback(() => {
    setClaimViewMode(current =>
      current === CLAIM_VIEW_MODES.LIST
        ? CLAIM_VIEW_MODES.BOX
        : CLAIM_VIEW_MODES.LIST
    );
  }, []);

  // UI actions
  const toggleExpandedPriorArt = useCallback((index: number) => {
    setExpandedPriorArt(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  }, []);

  const setSelectedSearchId = useCallback((id: string) => {
    setSelectedSearchIdState(id);
  }, []);

  return {
    // State
    isPreviewModalOpen,
    isPriorArtModalOpen,
    isParsingModalOpen,
    isApplyModalOpen,
    claimViewMode,
    searchMode,
    viewingPriorArt,
    previewingSuggestionId,
    selectedClaimForParsing,
    selectedReference,
    selectedSearchIdState,
    parsedElements,
    searchQueries,
    analysisData,
    applyModalData,
    isParsingClaim,
    isAnalyzing,
    isComponentVisible,
    hasLoadedSearchHistory,
    isUnmounting,
    expandedPriorArt,
    currentSuggestionSet,

    // Actions
    openPreviewModal,
    closePreviewModal,
    openPriorArtModal,
    closePriorArtModal,
    openParsingModal,
    closeParsingModal,
    openApplyModal,
    closeApplyModal,
    toggleClaimViewMode,
    setSearchMode,
    setPreviewingSuggestionId,
    setSelectedClaimForParsing,
    setSelectedReference,
    setSelectedSearchId,
    setParsedElements,
    setSearchQueries,
    setAnalysisData,
    setIsParsingClaim,
    setIsAnalyzing,
    setIsComponentVisible,
    setHasLoadedSearchHistory,
    setIsUnmounting,
    toggleExpandedPriorArt,
    setCurrentSuggestionSet,
  };
}
