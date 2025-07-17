import React from 'react';
import { InventionData } from '@/types/invention';
import {
  PriorArtReference,
  ClaimHandlers,
  ClaimHistoryEntry,
} from '@/types/claimTypes';
import { FullAnalysisResponse } from '@/types/priorArtAnalysisTypes';
import { ClaimRefinementViewProps } from '@/types/claimTypes';
import { ClaimSyncState } from '../hooks/useClaimSyncState';

/**
 * Type alias for backward compatibility
 */
export type StructuredInventionData = InventionData;

/**
 * Prior art handlers interface containing all prior art operations
 */
export interface PriorArtHandlers {
  handleSavePriorArt: (reference: any) => Promise<void>;
  handleRemovePriorArt: (index: number, art: any) => Promise<void>;
  refreshInventionData: () => Promise<void>;
}

/**
 * Prior art analysis handlers interface
 */
export interface PriorArtAnalysisHandlers {
  handleAnalyzePriorArt: (
    searchHistoryId: string,
    selectedReferenceNumbers: string[],
    forceRefresh: boolean
  ) => Promise<void>;
}

/**
 * View state interface containing all modal and UI state
 */
export interface ViewState {
  // Modal states
  isPreviewModalOpen: boolean;
  isPriorArtModalOpen: boolean;
  isParsingModalOpen: boolean;
  isApplyModalOpen: boolean;
  closePreviewModal: () => void;
  closePriorArtModal: () => void;
  closeParsingModal: () => void;
  closeApplyModal: () => void;
  openPriorArtModal: (ref: PriorArtReference) => void;
  openApplyModal: (data: { elementText: string; newLanguage: string }) => void;

  // View states
  claimViewMode: 'box' | 'compact';
  toggleClaimViewMode: () => void;
  searchMode: 'basic' | 'advanced';

  // Data states
  viewingPriorArt: PriorArtReference | null;
  applyModalData: { elementText: string; newLanguage: string } | null;
  parsedElements: string[];
  searchQueries: string[];
  analysisData: FullAnalysisResponse | null;
  selectedReference: string | null;
  setSelectedReference: (ref: string | null) => void;
  selectedSearchId: string;
  setSelectedSearchId: (id: string) => void;

  // Loading states
  isParsingClaim: boolean;
  isAnalyzing: boolean;
  setHasLoadedSearchHistory: () => void;
}

/**
 * UI state interface for tab and loading management
 */
export interface UIState {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  startLoading: (msg: string) => void;
  stopLoading: () => void;
}

/**
 * Messages state interface for chat functionality
 */
export interface MessagesState {
  messages: any[];
  addUserMessage: (message: string) => void;
  addAssistantMessage: (message: string) => void;
}

/**
 * Search history state interface
 */
export interface SearchHistoryState {
  searchHistory: any[];
  setSearchHistory: React.Dispatch<React.SetStateAction<any[]>>;
}

/**
 * Apply modal data interface
 */
export interface ApplyModalData {
  elementText: string;
  newLanguage: string;
}

/**
 * Main component state interface
 */
export interface ClaimRefinementState {
  // UI State
  activeTab: string;
  claimViewMode: 'box' | 'compact';
  loadingMessage: string;

  // Modal State
  isPreviewModalOpen: boolean;
  isPriorArtModalOpen: boolean;
  isParsingModalOpen: boolean;
  isApplyModalOpen: boolean;
  viewingPriorArt: PriorArtReference | null;
  applyModalData: ApplyModalData | null;

  // Loading State
  isRegeneratingClaim1: boolean;
  isParsingClaim: boolean;
  isAnalyzing: boolean;
  isAddingClaim: boolean;

  // Search State
  parsedElements: string[];
  searchQueries: string[];
  searchHistory: any[];
  selectedSearchId: string;
  selectedClaimForParsing: string | null;
  searchMode: 'basic' | 'advanced';

  // Other State
  messages: any[];
  analysisData: FullAnalysisResponse | null;
  selectedReference: string | null;
  newClaimText: string;
  newClaimDependsOn: string;

  // Claim History
  claimHistory: ClaimHistoryEntry[];
  historyIndex: number;
}

/**
 * Props for ClaimStateManager component
 */
export interface ClaimStateManagerProps extends ClaimHandlers {
  children: (handlers: ClaimHandlers) => React.ReactNode;
}

/**
 * Props for PriorArtManager component
 */
export interface PriorArtManagerProps {
  projectId: string;
  analyzedInvention: StructuredInventionData | null;
  children: (
    handlers: PriorArtHandlers & PriorArtAnalysisHandlers
  ) => React.ReactNode;
}

/**
 * Props for ModalManager component
 */
export interface ModalManagerProps {
  children: (viewState: ViewState) => React.ReactNode;
}

/**
 * Constants for tabs
 */
export const TAB_CONSTANTS = {
  SEARCH: 'search',
  PRIOR_ART: 'prior-art',
  CHAT: 'chat',
} as const;

// Re-export for convenience
export type { ClaimHistoryEntry } from '@/types/claimTypes';
