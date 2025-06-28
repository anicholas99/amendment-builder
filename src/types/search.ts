import { PriorArtReference } from './domain/priorArt';
import { ProcessedSearchHistoryEntry } from './domain/searchHistory';

/**
 * Search-related interfaces with proper typing
 */

/**
 * Core search query interface
 */
export interface SearchQuery {
  /** The search query string */
  query: string;
  /** Associated parsed elements - V2 format (string array) */
  parsedElements?: string[];
  /** Search engine to use (optional) */
  engine?: 'semantic' | 'keyword' | 'hybrid';
  /** Maximum number of results to return */
  limit?: number;
  /** Additional search parameters */
  params?: Record<string, unknown>;
}

/**
 * Search history entry with complete typing
 */
export interface SearchHistoryEntry {
  id: string;
  projectId: string;
  query: string;
  parsedElements?: string[]; // V2 format
  searchData: SearchData;
  results?: SearchResult[];
  timestamp: Date;
  userId: string;
  citationJobId?: string | null;
  citationExtractionStatus?: CitationExtractionStatus;
}

/**
 * Individual search result
 */
export interface SearchResult {
  id: string;
  referenceNumber: string;
  title: string;
  abstract?: string;
  relevance?: number;
  publicationDate?: string;
  assignee?: string;
  inventors?: string[];
  classification?: string;
  score?: number;
  highlight?: string;
  familyId?: string;
  imageUrl?: string;
  documentLink?: string;
  isDerivedFromSemanticSearch?: boolean;
  claim1?: string;
  deepAnalysisJson?: string;
}

/**
 * Search metadata stored in DB
 */
export interface SearchData {
  engine: string;
  engineLink?: string;
  numberOfResults: number;
  searchTimestamp: string;
  queryParams?: Record<string, unknown>;
}

/**
 * Citation extraction status enum
 */
export type CitationExtractionStatus =
  | 'pending'
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED';

/**
 * Combined search result with citations
 */
export interface SearchResultWithCitations extends SearchResult {
  citations?: CitationMatch[];
  deepAnalysis?: unknown;
  examinerAnalysis?: unknown;
}

/**
 * Citation match from extraction
 */
export interface CitationMatch {
  id?: string;
  claimElement: string;
  citation: string;
  score: number;
  referenceNumber: string;
  paragraph: string;
  confidence?: number;
}

/**
 * Search session tracking
 */
export interface SearchSession {
  id: string;
  projectId: string;
  searches: SearchHistoryEntry[];
  createdAt: Date;
  updatedAt: Date;
  totalSearches: number;
  totalResults: number;
  totalCitations: number;
}

/**
 * Search analytics data
 */
export interface SearchAnalytics {
  projectId: string;
  totalSearches: number;
  averageResultsPerSearch: number;
  topSearchTerms: Array<{ term: string; count: number }>;
  searchEngineUsage: Record<string, number>;
  citationExtractionRate: number;
  periodStart: Date;
  periodEnd: Date;
}

/**
 * Search filters
 */
export interface SearchFilters {
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  assignee?: string[];
  classification?: string[];
  hasDeepAnalysis?: boolean;
  hasCitations?: boolean;
  minRelevance?: number;
}

/**
 * Search request interface for API
 */
export interface SearchRequest {
  query: string;
  projectId: string;
  parsedElements?: string[]; // V2 format
  filters?: SearchFilters;
  options?: {
    includeDeepAnalysis?: boolean;
    includeCitations?: boolean;
    limit?: number;
    offset?: number;
  };
}

/**
 * Search response from API
 */
export interface SearchResponse {
  searchId: string;
  results: SearchResult[];
  totalCount: number;
  query: string;
  timestamp: string;
  metadata?: {
    engine: string;
    processingTime: number;
    hasMore: boolean;
  };
}

/**
 * Type guards
 */
export function isSearchResult(obj: unknown): obj is SearchResult {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'referenceNumber' in obj &&
    'title' in obj
  );
}

export function isSearchHistoryEntry(obj: unknown): obj is SearchHistoryEntry {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'projectId' in obj &&
    'query' in obj &&
    'searchData' in obj
  );
}

// Re-export commonly used types
export type { PriorArtReference, ProcessedSearchHistoryEntry };
