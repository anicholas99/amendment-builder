import React, { useReducer, useCallback } from 'react';
import {
  ModalManagerProps,
  ViewState,
  ApplyModalData,
} from '../../types/claimRefinementView';
import { EditParsedClaimDataModal } from '../modals/EditParsedClaimDataModal';
import { PriorArtReference } from '@/types/claimTypes';
import { FullAnalysisResponse } from '@/types/priorArtAnalysisTypes';

// State shape - grouped by logical concerns
interface ModalManagerState {
  // Modal states
  modals: {
    isPreviewOpen: boolean;
    isPriorArtOpen: boolean;
    isParsingOpen: boolean;
    isApplyOpen: boolean;
  };

  // Modal data
  modalData: {
    viewingPriorArt: PriorArtReference | null;
    applyModalData: ApplyModalData | null;
  };

  // View states
  view: {
    claimViewMode: 'box' | 'compact';
    searchMode: 'basic' | 'advanced';
  };

  // Data states
  data: {
    parsedElements: string[];
    searchQueries: string[];
    analysisData: FullAnalysisResponse | null;
    selectedReference: string | null;
    selectedSearchId: string;
  };

  // Loading states
  loading: {
    isParsingClaim: boolean;
    isAnalyzing: boolean;
  };
}

// Action types
type ModalManagerAction =
  // Modal actions
  | { type: 'OPEN_PREVIEW_MODAL' }
  | { type: 'CLOSE_PREVIEW_MODAL' }
  | { type: 'OPEN_PRIOR_ART_MODAL'; payload: PriorArtReference }
  | { type: 'CLOSE_PRIOR_ART_MODAL' }
  | { type: 'OPEN_PARSING_MODAL' }
  | { type: 'CLOSE_PARSING_MODAL' }
  | { type: 'OPEN_APPLY_MODAL'; payload: ApplyModalData }
  | { type: 'CLOSE_APPLY_MODAL' }
  // View actions
  | { type: 'TOGGLE_CLAIM_VIEW_MODE' }
  | { type: 'SET_SEARCH_MODE'; payload: 'basic' | 'advanced' }
  // Data actions
  | { type: 'SET_PARSED_ELEMENTS'; payload: string[] }
  | { type: 'SET_SEARCH_QUERIES'; payload: string[] }
  | { type: 'SET_ANALYSIS_DATA'; payload: FullAnalysisResponse | null }
  | { type: 'SET_SELECTED_REFERENCE'; payload: string | null }
  | { type: 'SET_SELECTED_SEARCH_ID'; payload: string }
  // Loading actions
  | { type: 'SET_IS_PARSING_CLAIM'; payload: boolean }
  | { type: 'SET_IS_ANALYZING'; payload: boolean };

// Initial state
const initialState: ModalManagerState = {
  modals: {
    isPreviewOpen: false,
    isPriorArtOpen: false,
    isParsingOpen: false,
    isApplyOpen: false,
  },
  modalData: {
    viewingPriorArt: null,
    applyModalData: null,
  },
  view: {
    claimViewMode: 'box',
    searchMode: 'basic',
  },
  data: {
    parsedElements: [],
    searchQueries: [],
    analysisData: null,
    selectedReference: null,
    selectedSearchId: '',
  },
  loading: {
    isParsingClaim: false,
    isAnalyzing: false,
  },
};

// Reducer function
function modalManagerReducer(
  state: ModalManagerState,
  action: ModalManagerAction
): ModalManagerState {
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
        modalData: { ...state.modalData, viewingPriorArt: action.payload },
      };
    case 'CLOSE_PRIOR_ART_MODAL':
      return {
        ...state,
        modals: { ...state.modals, isPriorArtOpen: false },
        modalData: { ...state.modalData, viewingPriorArt: null },
      };
    case 'OPEN_PARSING_MODAL':
      return { ...state, modals: { ...state.modals, isParsingOpen: true } };
    case 'CLOSE_PARSING_MODAL':
      return { ...state, modals: { ...state.modals, isParsingOpen: false } };
    case 'OPEN_APPLY_MODAL':
      return {
        ...state,
        modals: { ...state.modals, isApplyOpen: true },
        modalData: { ...state.modalData, applyModalData: action.payload },
      };
    case 'CLOSE_APPLY_MODAL':
      return {
        ...state,
        modals: { ...state.modals, isApplyOpen: false },
        modalData: { ...state.modalData, applyModalData: null },
      };

    // View actions
    case 'TOGGLE_CLAIM_VIEW_MODE':
      return {
        ...state,
        view: {
          ...state.view,
          claimViewMode: state.view.claimViewMode === 'box' ? 'compact' : 'box',
        },
      };
    case 'SET_SEARCH_MODE':
      return { ...state, view: { ...state.view, searchMode: action.payload } };

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
    case 'SET_SELECTED_REFERENCE':
      return {
        ...state,
        data: { ...state.data, selectedReference: action.payload },
      };
    case 'SET_SELECTED_SEARCH_ID':
      return {
        ...state,
        data: { ...state.data, selectedSearchId: action.payload },
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

    default:
      return state;
  }
}

/**
 * ModalManager - Manages all modal state and UI operations
 *
 * This component encapsulates:
 * - Modal open/close state
 * - View mode toggles
 * - Data states for modals
 * - Loading states for UI operations
 */
export const ModalManager: React.FC<ModalManagerProps> = ({ children }) => {
  const [state, dispatch] = useReducer(modalManagerReducer, initialState);

  // Modal handlers
  const closePreviewModal = useCallback(() => {
    dispatch({ type: 'CLOSE_PREVIEW_MODAL' });
  }, []);

  const closePriorArtModal = useCallback(() => {
    dispatch({ type: 'CLOSE_PRIOR_ART_MODAL' });
  }, []);

  const closeParsingModal = useCallback(() => {
    dispatch({ type: 'CLOSE_PARSING_MODAL' });
  }, []);

  const closeApplyModal = useCallback(() => {
    dispatch({ type: 'CLOSE_APPLY_MODAL' });
  }, []);

  const openPriorArtModal = useCallback((ref: PriorArtReference) => {
    dispatch({ type: 'OPEN_PRIOR_ART_MODAL', payload: ref });
  }, []);

  const openApplyModal = useCallback(
    (data: { elementText: string; newLanguage: string }) => {
      dispatch({ type: 'OPEN_APPLY_MODAL', payload: data });
    },
    []
  );

  // View mode toggle
  const toggleClaimViewMode = useCallback(() => {
    dispatch({ type: 'TOGGLE_CLAIM_VIEW_MODE' });
  }, []);

  // Data setters
  const setSelectedReference = useCallback((reference: string | null) => {
    dispatch({ type: 'SET_SELECTED_REFERENCE', payload: reference });
  }, []);

  const setSelectedSearchId = useCallback((id: string) => {
    dispatch({ type: 'SET_SELECTED_SEARCH_ID', payload: id });
  }, []);

  // Placeholder function for hasLoadedSearchHistory
  const setHasLoadedSearchHistory = useCallback(() => {
    // Not needed in clean version
  }, []);

  // Create view state object - maintain backward compatibility
  const viewState: ViewState = {
    // Modal states
    isPreviewModalOpen: state.modals.isPreviewOpen,
    isPriorArtModalOpen: state.modals.isPriorArtOpen,
    isParsingModalOpen: state.modals.isParsingOpen,
    isApplyModalOpen: state.modals.isApplyOpen,
    closePreviewModal,
    closePriorArtModal,
    closeParsingModal,
    closeApplyModal,
    openPriorArtModal,
    openApplyModal,

    // View states
    claimViewMode: state.view.claimViewMode,
    toggleClaimViewMode,
    searchMode: state.view.searchMode,

    // Data states
    viewingPriorArt: state.modalData.viewingPriorArt,
    applyModalData: state.modalData.applyModalData,
    parsedElements: state.data.parsedElements,
    searchQueries: state.data.searchQueries,
    analysisData: state.data.analysisData,
    selectedReference: state.data.selectedReference,
    setSelectedReference,
    selectedSearchId: state.data.selectedSearchId,
    setSelectedSearchId,

    // Loading states
    isParsingClaim: state.loading.isParsingClaim,
    isAnalyzing: state.loading.isAnalyzing,
    setHasLoadedSearchHistory,
  };

  return <>{children(viewState)}</>;
};

ModalManager.displayName = 'ModalManager';
