/**
 * Type definitions for UI components to replace type assertion patterns
 */

import type { CitationMatch, CitationJob } from '@prisma/client';
import { logger } from '@/utils/clientLogger';

/**
 * Enhanced citation job type with optimistic update flags
 * Compatible with CitationJob but allows partial data for optimistic updates
 */
export type EnhancedCitationJob = {
  // Required fields that must always be present
  id: string;
  searchHistoryId: string;
  referenceNumber: string;
  status: string;
  createdAt: string;
  // Optimistic update flags
  isOptimistic?: boolean;
  wasOptimistic?: boolean;
  originalIndex?: number;
  // Optional fields from CitationJob (matching API response exactly)
  externalJobId: number | null;
  startedAt: string | null;
  completedAt: string | null;
  error: string | null;
  results: string | null;
  deepAnalysisJson?: Record<string, unknown> | null;
  updatedAt?: string;
  rawResultData?: Record<string, unknown> | null;
  errorMessage?: string | null;
  lastCheckedAt?: string | null;
} & Partial<
  Omit<
    CitationJob,
    | 'id'
    | 'searchHistoryId'
    | 'referenceNumber'
    | 'status'
    | 'createdAt'
    | 'externalJobId'
    | 'startedAt'
    | 'completedAt'
    | 'error'
    | 'results'
    | 'errorMessage'
    | 'lastCheckedAt'
    | 'updatedAt'
  >
>;

/**
 * Enhanced citation match with metadata fields
 * This is a composition type that includes CitationMatch plus additional UI fields
 */
export type EnhancedCitationMatch = CitationMatch & {
  referenceAssignee?: string;
  referenceApplicant?: string;
  isMetadataOnly?: boolean;
};

/**
 * Figure data types for tech details and patent views
 */
export interface FigureData {
  description: string;
  elements?: Record<string, unknown>;
  type?: 'image' | 'mermaid' | 'reactflow';
  originalDescription?: string;
  image?: string;
}

/**
 * Prior art item with all possible fields
 */
export interface PriorArtItem {
  patentNumber?: string;
  savedAt?: string | Date;
  authors?: string;
  publicationDate?: string | Date;
  number?: string;
  dateAdded?: string | Date;
  claim1?: string;
  summary?: string;
}

/**
 * Analyzed invention type with proper figure structure
 */
export interface AnalyzedInvention {
  figures?: Record<string, FigureData>;
  background?: {
    technical_field?: string;
  };
  [key: string]: unknown;
}

/**
 * Search history with typed parsed elements
 */
export interface TypedSearchHistory {
  excludedReferences?: string[];
  parsedElements?: Array<{
    elementNumber: string;
    elementText: string;
  }>;
  [key: string]: unknown;
}

/**
 * Deep analysis examiner data
 */
export interface ExaminerData {
  originalClaim?: string;
  revisedClaim?: string;
  [key: string]: unknown;
}

/**
 * Common UI data structures
 */
export interface SearchHistoryUIEntry {
  id: string;
  query: string;
  timestamp: string;
  resultCount: number;
  citations?: Array<{
    id: string;
    referenceNumber: string;
    status: string;
  }>;
  projectId: string | null;
  userId: string | null;
  citationExtractionStatus: string | null;

  // UI-specific fields
  isExpanded?: boolean;
  isSelected?: boolean;
  isLoading?: boolean;
}

/**
 * Omit types for form data
 */
export type SearchHistoryFormData = Omit<
  SearchHistoryUIEntry,
  | 'id'
  | 'timestamp'
  | 'resultCount'
  | 'citations'
  | 'citationExtractionStatus'
  | 'isExpanded'
  | 'isSelected'
  | 'isLoading'
>;

/**
 * Type guards for runtime validation
 */
export function isFigureData(value: unknown): value is FigureData {
  logger.debug('[TYPE GUARD DEBUG] isFigureData input:', { value });

  const isObject = typeof value === 'object';
  const isNotNull = value !== null;
  const hasDescription = isObject && isNotNull && 'description' in value;
  const hasStringDescription =
    hasDescription &&
    typeof (value as Record<string, unknown>).description === 'string';

  logger.debug('[TYPE GUARD DEBUG] Checks:', {
    isObject,
    isNotNull,
    hasDescription,
    hasStringDescription,
    finalResult:
      isObject && isNotNull && hasDescription && hasStringDescription,
  });

  return (
    typeof value === 'object' &&
    value !== null &&
    'description' in value &&
    typeof (value as Record<string, unknown>).description === 'string'
  );
}

export function isEnhancedCitationJob(
  value: unknown
): value is EnhancedCitationJob {
  return (
    typeof value === 'object' &&
    value !== null &&
    'referenceNumber' in value &&
    'status' in value
  );
}

export function isExaminerData(value: unknown): value is ExaminerData {
  return typeof value === 'object' && value !== null;
}

export function isPriorArtItem(value: unknown): value is PriorArtItem {
  return typeof value === 'object' && value !== null;
}

export function isUISearchHistory(
  value: unknown
): value is SearchHistoryUIEntry {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'query' in value &&
    'timestamp' in value &&
    'resultCount' in value
  );
}
