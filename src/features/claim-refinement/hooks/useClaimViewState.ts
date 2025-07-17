import { useReducer, useCallback } from 'react';
import {
  ClaimViewMode,
  SearchMode,
  CLAIM_VIEW_MODES,
  SEARCH_MODES,
} from '../constants';
import { PriorArtReference } from '@/types/claimTypes';
import { FullAnalysisResponse } from '@/types/priorArtAnalysisTypes';

// State shape - grouped by logical concerns
interface ClaimViewState {
  // Modal states
  modals: {
    isPreviewOpen: boolean;
    isPriorArtOpen: boolean;
    isParsingOpen: boolean;
    isApplyOpen: boolean;
  };

  // View configuration
  view: {
    claimMode: ClaimViewMode;
    searchMode: SearchMode;
    expandedPriorArt: number[];
    currentSuggestionSet: number;
  };

  // Selected items
  selections: {
    viewingPriorArt: PriorArtReference | null;
    previewingSuggestionId: number | null;
    selectedClaimForParsing: string | null;
    selectedReference: string | null;
    selectedSearchId: string;
  };

  // Data
  data: {
    parsedElements: string[];
    searchQueries: string[];
    analysisData: FullAnalysisResponse | null;
    applyModalData: { elementText: string; newLanguage: string } | null;
  };

  // Loading states
  loading: {
    isParsingClaim: boolean;
    isAnalyzing: boolean;
    isComponentVisible: boolean;
    hasLoadedSearchHistory: boolean;
    isUnmounting: boolean;
  };
}

// Action types
type ClaimViewAction =
  // Modal actions
  | { type: 'OPEN_PREVIEW_MODAL' }
  | { type: 'CLOSE_PREVIEW_MODAL' }
  | { type: 'OPEN_PRIOR_ART_MODAL'; payload: PriorArtReference }
  | { type: 'CLOSE_PRIOR_ART_MODAL' }
  | { type: 'OPEN_PARSING_MODAL' }
  | { type: 'CLOSE_PARSING_MODAL' }
  | {
      type: 'OPEN_APPLY_MODAL';
      payload: { elementText: string; newLanguage: string };
    }
  | { type: 'CLOSE_APPLY_MODAL' }
  // View actions
  | { type: 'TOGGLE_CLAIM_VIEW_MODE' }
  | { type: 'SET_SEARCH_MODE'; payload: SearchMode }
  | { type: 'TOGGLE_EXPANDED_PRIOR_ART'; payload: number }
  | { type: 'SET_CURRENT_SUGGESTION_SET'; payload: number }
  // Selection actions
  | { type: 'SET_PREVIEWING_SUGGESTION_ID'; payload: number | null }
  | { type: 'SET_SELECTED_CLAIM_FOR_PARSING'; payload: string | null }
  | { type: 'SET_SELECTED_REFERENCE'; payload: string | null }
  | { type: 'SET_SELECTED_SEARCH_ID'; payload: string }
  // Data actions
  | { type: 'SET_PARSED_ELEMENTS'; payload: string[] }
  | { type: 'SET_SEARCH_QUERIES'; payload: string[] }
  | { type: 'SET_ANALYSIS_DATA'; payload: FullAnalysisResponse | null }
  // Loading actions
  | { type: 'SET_IS_PARSING_CLAIM'; payload: boolean }
  | { type: 'SET_IS_ANALYZING'; payload: boolean }
  | { type: 'SET_IS_COMPONENT_VISIBLE'; payload: boolean }
  | { type: 'SET_HAS_LOADED_SEARCH_HISTORY'; payload: boolean }
  | { type: 'SET_IS_UNMOUNTING'; payload: boolean };

// Initial state
const initialState: ClaimViewState = {
  modals: {
    isPreviewOpen: false,
    isPriorArtOpen: false,
    isParsingOpen: false,
    isApplyOpen: false,
  },
  view: {
    claimMode: CLAIM_VIEW_MODES.BOX,
    searchMode: SEARCH_MODES.BASIC,
    expandedPriorArt: [],
    currentSuggestionSet: 3,
  },
  selections: {
    viewingPriorArt: null,
    previewingSuggestionId: null,
    selectedClaimForParsing: null,
    selectedReference: null,
    selectedSearchId: '',
  },
  data: {
    parsedElements: [],
    searchQueries: [],
    analysisData: null,
    applyModalData: null,
  },
  loading: {
    isParsingClaim: false,
    isAnalyzing: false,
    isComponentVisible: false,
    hasLoadedSearchHistory: false,
    isUnmounting: false,
  },
};

// Reducer function
function claimViewReducer(
  state: ClaimViewState,
  action: ClaimViewAction
): ClaimViewState {
  switch (action.type) {
    // Modal actions
    case 'OPEN_PREVIEW_MODAL':
      return { ...state, modals: { ...state.modals, isPreviewOpen: true } };
    case 'CLOSE_PREVIEW_MODAL':
      return { ...state, modals: { ...state.modals, isPreviewOpen: false } };
    case 'OPEN_PRIOR_ART_MODAL':
      return {
        ...state,
        modals: { ...state.modals, isPriorArtOpen: true },
        selections: { ...state.selections, viewingPriorArt: action.payload },
      };
    case 'CLOSE_PRIOR_ART_MODAL':
      return {
        ...state,
        modals: { ...state.modals, isPriorArtOpen: false },
        selections: { ...state.selections, viewingPriorArt: null },
      };
    case 'OPEN_PARSING_MODAL':
      return { ...state, modals: { ...state.modals, isParsingOpen: true } };
    case 'CLOSE_PARSING_MODAL':
      return { ...state, modals: { ...state.modals, isParsingOpen: false } };
    case 'OPEN_APPLY_MODAL':
      return {
        ...state,
        modals: { ...state.modals, isApplyOpen: true },
        data: { ...state.data, applyModalData: action.payload },
      };
    case 'CLOSE_APPLY_MODAL':
      return {
        ...state,
        modals: { ...state.modals, isApplyOpen: false },
        data: { ...state.data, applyModalData: null },
      };

    // View actions
    case 'TOGGLE_CLAIM_VIEW_MODE':
      return {
        ...state,
        view: {
          ...state.view,
          claimMode:
            state.view.claimMode === CLAIM_VIEW_MODES.LIST
              ? CLAIM_VIEW_MODES.BOX
              : CLAIM_VIEW_MODES.LIST,
        },
      };
    case 'SET_SEARCH_MODE':
      return {
        ...state,
        view: { ...state.view, searchMode: action.payload },
      };
    case 'TOGGLE_EXPANDED_PRIOR_ART':
      return {
        ...state,
        view: {
          ...state.view,
          expandedPriorArt: state.view.expandedPriorArt.includes(action.payload)
            ? state.view.expandedPriorArt.filter(i => i !== action.payload)
            : [...state.view.expandedPriorArt, action.payload],
        },
      };
    case 'SET_CURRENT_SUGGESTION_SET':
      return {
        ...state,
        view: { ...state.view, currentSuggestionSet: action.payload },
      };

    // Selection actions
    case 'SET_PREVIEWING_SUGGESTION_ID':
      return {
        ...state,
        selections: {
          ...state.selections,
          previewingSuggestionId: action.payload,
        },
      };
    case 'SET_SELECTED_CLAIM_FOR_PARSING':
      return {
        ...state,
        selections: {
          ...state.selections,
          selectedClaimForParsing: action.payload,
        },
      };
    case 'SET_SELECTED_REFERENCE':
      return {
        ...state,
        selections: { ...state.selections, selectedReference: action.payload },
      };
    case 'SET_SELECTED_SEARCH_ID':
      return {
        ...state,
        selections: { ...state.selections, selectedSearchId: action.payload },
      };

    // Data actions
    case 'SET_PARSED_ELEMENTS':
      return {
        ...state,
        data: { ...state.data, parsedElements: action.payload },
      };
    case 'SET_SEARCH_QUERIES':
      return {
        ...state,
        data: { ...state.data, searchQueries: action.payload },
      };
    case 'SET_ANALYSIS_DATA':
      return {
        ...state,
        data: { ...state.data, analysisData: action.payload },
      };

    // Loading actions
    case 'SET_IS_PARSING_CLAIM':
      return {
        ...state,
        loading: { ...state.loading, isParsingClaim: action.payload },
      };
    case 'SET_IS_ANALYZING':
      return {
        ...state,
        loading: { ...state.loading, isAnalyzing: action.payload },
      };
    case 'SET_IS_COMPONENT_VISIBLE':
      return {
        ...state,
        loading: { ...state.loading, isComponentVisible: action.payload },
      };
    case 'SET_HAS_LOADED_SEARCH_HISTORY':
      return {
        ...state,
        loading: { ...state.loading, hasLoadedSearchHistory: action.payload },
      };
    case 'SET_IS_UNMOUNTING':
      return {
        ...state,
        loading: { ...state.loading, isUnmounting: action.payload },
      };

    default:
      return state;
  }
}

// Hook return type for better type safety
interface UseClaimViewStateReturn {
  // Flattened state for backward compatibility
  isPreviewModalOpen: boolean;
  isPriorArtModalOpen: boolean;
  isParsingModalOpen: boolean;
  isApplyModalOpen: boolean;
  claimViewMode: ClaimViewMode;
  searchMode: SearchMode;
  viewingPriorArt: PriorArtReference | null;
  previewingSuggestionId: number | null;
  selectedClaimForParsing: string | null;
  selectedReference: string | null;
  selectedSearchIdState: string;
  parsedElements: string[];
  searchQueries: string[];
  analysisData: FullAnalysisResponse | null;
  applyModalData: { elementText: string; newLanguage: string } | null;
  isParsingClaim: boolean;
  isAnalyzing: boolean;
  isComponentVisible: boolean;
  hasLoadedSearchHistory: boolean;
  isUnmounting: boolean;
  expandedPriorArt: number[];
  currentSuggestionSet: number;

  // Actions
  openPreviewModal: () => void;
  closePreviewModal: () => void;
  openPriorArtModal: (priorArt: PriorArtReference) => void;
  closePriorArtModal: () => void;
  openParsingModal: () => void;
  closeParsingModal: () => void;
  openApplyModal: (data: { elementText: string; newLanguage: string }) => void;
  closeApplyModal: () => void;
  toggleClaimViewMode: () => void;
  setSearchMode: (mode: SearchMode) => void;
  setPreviewingSuggestionId: (id: number | null) => void;
  setSelectedClaimForParsing: (claim: string | null) => void;
  setSelectedReference: (reference: string | null) => void;
  setSelectedSearchId: (id: string) => void;
  setParsedElements: (elements: string[]) => void;
  setSearchQueries: (queries: string[]) => void;
  setAnalysisData: (data: FullAnalysisResponse | null) => void;
  setIsParsingClaim: (isParsing: boolean) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setIsComponentVisible: (isVisible: boolean) => void;
  setHasLoadedSearchHistory: (hasLoaded: boolean) => void;
  setIsUnmounting: (isUnmounting: boolean) => void;
  toggleExpandedPriorArt: (index: number) => void;
  setCurrentSuggestionSet: (set: number) => void;
}

export function useClaimViewState(): UseClaimViewStateReturn {
  const [state, dispatch] = useReducer(claimViewReducer, initialState);

  // Modal actions
  const openPreviewModal = useCallback(
    () => dispatch({ type: 'OPEN_PREVIEW_MODAL' }),
    []
  );
  const closePreviewModal = useCallback(
    () => dispatch({ type: 'CLOSE_PREVIEW_MODAL' }),
    []
  );
  const openPriorArtModal = useCallback(
    (priorArt: PriorArtReference) =>
      dispatch({ type: 'OPEN_PRIOR_ART_MODAL', payload: priorArt }),
    []
  );
  const closePriorArtModal = useCallback(
    () => dispatch({ type: 'CLOSE_PRIOR_ART_MODAL' }),
    []
  );
  const openParsingModal = useCallback(
    () => dispatch({ type: 'OPEN_PARSING_MODAL' }),
    []
  );
  const closeParsingModal = useCallback(
    () => dispatch({ type: 'CLOSE_PARSING_MODAL' }),
    []
  );
  const openApplyModal = useCallback(
    (data: { elementText: string; newLanguage: string }) =>
      dispatch({ type: 'OPEN_APPLY_MODAL', payload: data }),
    []
  );
  const closeApplyModal = useCallback(
    () => dispatch({ type: 'CLOSE_APPLY_MODAL' }),
    []
  );

  // View actions
  const toggleClaimViewMode = useCallback(
    () => dispatch({ type: 'TOGGLE_CLAIM_VIEW_MODE' }),
    []
  );
  const setSearchMode = useCallback(
    (mode: SearchMode) => dispatch({ type: 'SET_SEARCH_MODE', payload: mode }),
    []
  );
  const toggleExpandedPriorArt = useCallback(
    (index: number) =>
      dispatch({ type: 'TOGGLE_EXPANDED_PRIOR_ART', payload: index }),
    []
  );
  const setCurrentSuggestionSet = useCallback(
    (set: number) =>
      dispatch({ type: 'SET_CURRENT_SUGGESTION_SET', payload: set }),
    []
  );

  // Selection actions
  const setPreviewingSuggestionId = useCallback(
    (id: number | null) =>
      dispatch({ type: 'SET_PREVIEWING_SUGGESTION_ID', payload: id }),
    []
  );
  const setSelectedClaimForParsing = useCallback(
    (claim: string | null) =>
      dispatch({ type: 'SET_SELECTED_CLAIM_FOR_PARSING', payload: claim }),
    []
  );
  const setSelectedReference = useCallback(
    (reference: string | null) =>
      dispatch({ type: 'SET_SELECTED_REFERENCE', payload: reference }),
    []
  );
  const setSelectedSearchId = useCallback(
    (id: string) => dispatch({ type: 'SET_SELECTED_SEARCH_ID', payload: id }),
    []
  );

  // Data actions
  const setParsedElements = useCallback(
    (elements: string[]) =>
      dispatch({ type: 'SET_PARSED_ELEMENTS', payload: elements }),
    []
  );
  const setSearchQueries = useCallback(
    (queries: string[]) =>
      dispatch({ type: 'SET_SEARCH_QUERIES', payload: queries }),
    []
  );
  const setAnalysisData = useCallback(
    (data: FullAnalysisResponse | null) =>
      dispatch({ type: 'SET_ANALYSIS_DATA', payload: data }),
    []
  );

  // Loading actions
  const setIsParsingClaim = useCallback(
    (isParsing: boolean) =>
      dispatch({ type: 'SET_IS_PARSING_CLAIM', payload: isParsing }),
    []
  );
  const setIsAnalyzing = useCallback(
    (isAnalyzing: boolean) =>
      dispatch({ type: 'SET_IS_ANALYZING', payload: isAnalyzing }),
    []
  );
  const setIsComponentVisible = useCallback(
    (isVisible: boolean) =>
      dispatch({ type: 'SET_IS_COMPONENT_VISIBLE', payload: isVisible }),
    []
  );
  const setHasLoadedSearchHistory = useCallback(
    (hasLoaded: boolean) =>
      dispatch({ type: 'SET_HAS_LOADED_SEARCH_HISTORY', payload: hasLoaded }),
    []
  );
  const setIsUnmounting = useCallback(
    (isUnmounting: boolean) =>
      dispatch({ type: 'SET_IS_UNMOUNTING', payload: isUnmounting }),
    []
  );

  // Return flattened state for backward compatibility
  return {
    // State
    isPreviewModalOpen: state.modals.isPreviewOpen,
    isPriorArtModalOpen: state.modals.isPriorArtOpen,
    isParsingModalOpen: state.modals.isParsingOpen,
    isApplyModalOpen: state.modals.isApplyOpen,
    claimViewMode: state.view.claimMode,
    searchMode: state.view.searchMode,
    viewingPriorArt: state.selections.viewingPriorArt,
    previewingSuggestionId: state.selections.previewingSuggestionId,
    selectedClaimForParsing: state.selections.selectedClaimForParsing,
    selectedReference: state.selections.selectedReference,
    selectedSearchIdState: state.selections.selectedSearchId,
    parsedElements: state.data.parsedElements,
    searchQueries: state.data.searchQueries,
    analysisData: state.data.analysisData,
    applyModalData: state.data.applyModalData,
    isParsingClaim: state.loading.isParsingClaim,
    isAnalyzing: state.loading.isAnalyzing,
    isComponentVisible: state.loading.isComponentVisible,
    hasLoadedSearchHistory: state.loading.hasLoadedSearchHistory,
    isUnmounting: state.loading.isUnmounting,
    expandedPriorArt: state.view.expandedPriorArt,
    currentSuggestionSet: state.view.currentSuggestionSet,

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
