import React from 'react';
import { ProcessedSearchHistoryEntry } from '@/types/domain/searchHistory';
import { SavedPriorArt, ProcessedSavedPriorArt } from '@/features/search/types';

// Local type for enhanced jobs with tracking properties
export interface LocalEnhancedJob {
  id: string;
  searchHistoryId: string;
  status: string;
  externalJobId: number | null;
  referenceNumber: string | null;
  createdAt: string;
  updatedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  error: string | null;
  results?: {
    id: string;
    citationJobId: string;
    resultsData: string | null;
    createdAt: string;
  } | null;
  deepAnalysisJson?: string | null;
  claimSetVersionId?: string;
  // Add missing fields from CitationJob
  rawResultData?: string | null;
  errorMessage?: string | null;
  lastCheckedAt?: string | null;
  // Tracking fields
  isOptimistic?: boolean;
  wasOptimistic?: boolean;
  citationCount?: number;
  metadata?: {
    title?: string;
  };
}

export interface CitationsTabContainerProps {
  currentSearchHistory: ProcessedSearchHistoryEntry[];
  activeSearchEntry: ProcessedSearchHistoryEntry | null;
  persistentSelectedSearchIdRef: React.MutableRefObject<string | null>;
  activeSelectedSearchIndex: number | null;
  isActive?: boolean;
  projectId: string;
  refreshProjectData: () => Promise<void>;
  refreshSavedArtData: (projectId: string | null) => Promise<void>;
  setHasNewCitations?: React.Dispatch<React.SetStateAction<boolean>>;
  selectedReference?: string | null;
  setSelectedReference?: (reference: string | null) => void;
  optimisticallyProcessingRefs?: Record<string, boolean>;
  onApplyAmendmentToClaim1?: (original: string, revised: string) => void;
  onClearOptimisticRefs?: (referenceNumbers: string[]) => void;
  savedArtNumbers?: Set<string>;
  excludedPatentNumbers?: Set<string>;
  savedPriorArtList?: ProcessedSavedPriorArt[];
  disablePolling?: boolean;
}

export interface JobTransition {
  from: string;
  to: string;
}
