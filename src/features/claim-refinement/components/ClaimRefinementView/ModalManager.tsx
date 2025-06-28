import React, { useState, useCallback } from 'react';
import {
  ModalManagerProps,
  ViewState,
  ApplyModalData,
} from '../../types/claimRefinementView';
import { EditParsedClaimDataModal } from '../modals/EditParsedClaimDataModal';
import { PriorArtReference } from '@/types/claimTypes';
import { FullAnalysisResponse } from '@/types/priorArtAnalysisTypes';

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
  // Modal State
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isPriorArtModalOpen, setIsPriorArtModalOpen] = useState(false);
  const [isParsingModalOpen, setIsParsingModalOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [viewingPriorArt, setViewingPriorArt] =
    useState<PriorArtReference | null>(null);
  const [applyModalData, setApplyModalData] = useState<ApplyModalData | null>(
    null
  );

  // View states
  const [claimViewMode, setClaimViewMode] = useState<'list' | 'box'>('box');
  const [searchMode] = useState<'basic' | 'advanced'>('basic');

  // Data states
  const [parsedElements] = useState<string[]>([]);
  const [searchQueries] = useState<string[]>([]);
  const [analysisData] = useState<FullAnalysisResponse | null>(null);
  const [selectedReference, setSelectedReference] = useState<string | null>(
    null
  );
  const [selectedSearchId, setSelectedSearchId] = useState('');

  // Loading states
  const [isParsingClaim] = useState(false);
  const [isAnalyzing] = useState(false);

  // Modal handlers
  const closePreviewModal = useCallback(() => {
    setIsPreviewModalOpen(false);
  }, []);

  const closePriorArtModal = useCallback(() => {
    setIsPriorArtModalOpen(false);
    setViewingPriorArt(null);
  }, []);

  const closeParsingModal = useCallback(() => {
    setIsParsingModalOpen(false);
  }, []);

  const closeApplyModal = useCallback(() => {
    setIsApplyModalOpen(false);
    setApplyModalData(null);
  }, []);

  const openPriorArtModal = useCallback((ref: PriorArtReference) => {
    setViewingPriorArt(ref);
    setIsPriorArtModalOpen(true);
  }, []);

  const openApplyModal = useCallback(
    (data: { elementText: string; newLanguage: string }) => {
      setApplyModalData(data);
      setIsApplyModalOpen(true);
    },
    []
  );

  // View mode toggle
  const toggleClaimViewMode = useCallback(() => {
    setClaimViewMode(prev => (prev === 'list' ? 'box' : 'list'));
  }, []);

  // Placeholder function for hasLoadedSearchHistory
  const setHasLoadedSearchHistory = useCallback(() => {
    // Not needed in clean version
  }, []);

  // Create view state object
  const viewState: ViewState = {
    // Modal states
    isPreviewModalOpen,
    isPriorArtModalOpen,
    isParsingModalOpen,
    isApplyModalOpen,
    closePreviewModal,
    closePriorArtModal,
    closeParsingModal,
    closeApplyModal,
    openPriorArtModal,
    openApplyModal,

    // View states
    claimViewMode,
    toggleClaimViewMode,
    searchMode,

    // Data states
    viewingPriorArt,
    applyModalData,
    parsedElements,
    searchQueries,
    analysisData,
    selectedReference,
    setSelectedReference,
    selectedSearchId,
    setSelectedSearchId,

    // Loading states
    isParsingClaim,
    isAnalyzing,
    setHasLoadedSearchHistory,
  };

  return <>{children(viewState)}</>;
};

ModalManager.displayName = 'ModalManager';
