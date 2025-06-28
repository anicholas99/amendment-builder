import React from 'react';
import { InventionData } from './invention';
import { PriorArtReference, FamilyMemberReference } from './domain/priorArt';

// Re-export for backward compatibility
export type { PriorArtReference, FamilyMemberReference };

/**
 * Types related to claims and claim refinement
 */

// Alternative suggestion structure
export interface AlternativeSuggestion {
  suggestedText: string;
  reason: string;
  strategy: string;
}

// Suggestion structure for AI-generated suggestions
export interface Suggestion {
  id: string | number;
  type:
    | 'narrowing'
    | 'clarification'
    | 'patentability'
    | 'formatting'
    | 'prior-art'
    | 'other';
  text: string;
  description: string;
  originalText?: string;
  suggestedText?: string;
  replacementText?: string;
  claimNumber: string;
  priority: 'high' | 'medium' | 'low';
  alternatives?: Suggestion[];
  sourceReferences?: PriorArtReference[];
  appliedAt?: number;
  dismissedAt?: number;
  searchId?: string; // ID of the search this suggestion is associated with

  // Additional properties used in the UI
  elementName?: string;
  reason?: string;
  strategy?: 'narrowing' | 'dependent_claim' | string;
  priorArtReferences?: PriorArtReference[];
  alternativeSuggestion?: AlternativeSuggestion;
  applied?: boolean;
  dismissed?: boolean;
}

/**
 * Represents the structure of a single claim object.
 */
export interface ClaimData {
  id: string;
  number: number;
  text: string;
  dependsOn: number | null;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

// Claim version structure for version history
export interface ClaimVersion {
  id: string;
  timestamp: number;
  description: string;
  claims: Record<string, string>;
  userId?: string; // For tracking who made the changes
}

/**
 * Props for the ClaimRefinementView component
 * This is now an empty interface as the view gets all its data from hooks.
 */
export interface ClaimRefinementViewProps {
  analyzedInvention?: InventionData | null;
  setAnalyzedInvention?: (invention: InventionData | null) => void;
}

// Search result structure - extends common fields with PriorArtReference
export interface SearchResult extends PriorArtReference {
  relevancy?: number; // Alternative field name for relevance
  date?: string;
  assignee?: string;
  classification?: string;
}

// Message structure for assistant interactions
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export interface EditableClaimProps {
  claimNumber: string;
  claimText: string;
  isIndependent: boolean;
  onChange: (
    claimNumber: string,
    text: string,
    dependsOn?: string | null
  ) => void;
  onDelete: (claimNumber: string) => void;
  onInsertAfter: (afterClaimNumber: string) => void;
  onReorder?: (claimNumber: string, direction: 'up' | 'down') => void;
  analyzedInvention: InventionData | null;
  setAnalyzedInvention: React.Dispatch<
    React.SetStateAction<InventionData | null>
  >;
}

export interface SearchResponse {
  results: PriorArtReference[];
  totalCount: number;
  message?: string;
  isMock?: boolean;
  isGuaranteedQuery?: boolean;
  jobId?: string;
}

/**
 * History entry for claim undo/redo functionality
 */
export interface ClaimHistoryEntry {
  data: InventionData;
  description: string;
}

/**
 * Claim handlers interface containing all claim-related operations
 */
export interface ClaimHandlers {
  handleClaimChangeWithHistory: (claimNumber: string, text: string) => void;
  handleDeleteClaimWithHistory: (claimNumber: string) => void;
  handleInsertNewClaimWithHistory: (
    afterClaimNumber: string,
    text: string,
    dependsOn: string
  ) => void;
  handleReorderClaimWithHistory: (
    claimNumber: string,
    direction: 'up' | 'down'
  ) => void;
  handleGenerateClaim1: () => Promise<void>;
  handleAddClaimWithHistory: () => void;
  handleConfirmApply: (newClaimText: string) => void;
  getCurrentClaim1Text: () => string;

  // State properties
  isRegeneratingClaim1: boolean;
  isAddingClaim: boolean;
  newClaimText: string;
  setNewClaimText: (text: string) => void;
  newClaimDependsOn: string;
  setNewClaimDependsOn: (dependsOn: string) => void;
  setIsAddingClaim: (adding: boolean) => void;

  // History operations
  initializeHistory: () => void;
  handleUndo: () => void;
  handleRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  previousDescription: string | null;
  nextDescription: string | null;
}

// Simplified ParsedElementWithVariants for V2 compatibility
export interface ParsedElementWithVariants {
  text: string;
  variants?: string[];
}

// Re-export other types that don't depend on ParsedElement
export * from './domain/priorArt';

// Note: searchHistory and citation exports are handled in their respective files
// to avoid duplicate export conflicts with CitationJobStatus and CitationMatch
