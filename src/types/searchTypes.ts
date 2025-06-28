import { SearchHistoryResults } from './domain/searchHistory';

// Type aliases for missing types
export type CitationExtractionStatus =
  | 'pending'
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED';
export type ExpandedSearchInput = string;
export type Citation = CitationMatch;

/**
 * Type definition for citation results
 */
export interface CitationMatch {
  claimElement: string;
  citation: string;
  score: number;
  referenceNumber: string;
  paragraph: string;
}

/**
 * Type definition for the citation results saved to the database
 */
export interface CitationResults {
  parsedElements: unknown[]; // Exact elements used for extraction
  results: CitationMatch[];
  timestamp: string;
  reference: string;
}

/**
 * Extended search history type that includes citation results
 */
export interface SearchHistoryWithCitations {
  id: string;
  query: string;
  searchData: unknown;
  citationJobId?: number | null;
  citationResults?: CitationResults | null;
  timestamp: Date;
  projectId: string;
  documentId: string;
  parsedElements?: string[] | null;
}

/**
 * Type for search history response
 */
export interface SearchHistoryResponse {
  searchId: string;
  query: string;
  citationJobId?: number | null;
  citationResults?: CitationResults | null;
}

/**
 * Type for search filter results
 */
export interface FilterResult {
  id: string;
  title: string;
  abstract?: string;
  score: number;
  familyId?: string;
  otherFamilyMembersInSearch?: unknown[];
}

/**
 * Type for mapped search results with enriched data
 */
export interface MappedSearchResult {
  id: string;
  title: string;
  abstract?: string;
  score: number;
  authors?: string[];
  year?: string;
  url?: string;
  familyId?: string;
  otherFamilyMembers?: unknown[];
}

export interface SearchEntry {
  id: string;
  projectId: string;
  searchQuery: string;
  parsedElements: unknown[]; // Exact elements used for extraction
  searchEngineUsed: string;
  searchEngineLink?: string;
  numberOfResults: number;
  numberOfCitations?: number;
  timestamp: Date;
  userId: string;
  searchResults?: SearchResult[];
  combinedData?: CombinedSearchResultData[];
  searchData: unknown;
  citationExtractionStatus?: CitationExtractionStatus;
}

export interface CombinedSearchResultData {
  citations: Citation[];
  patentNumber: string;
  title: string;
  abstract: string;
  applicationDate?: string;
  applicant?: string;
  assignee?: string;
  inventors?: string;
  documentLink?: string;
  imageUrl?: string;
  otherFamilyMembersInSearch?: unknown[];
  highlight?: string;
  score?: number;
  isDerivedFromSemanticSearch?: boolean;
  rank?: number;
  claim1?: string;
  deepAnalysisJson?: string;
}

export interface SearchResult {
  patentNumber: string;
  title: string;
  abstract?: string;
  isDerivedFromSemanticSearch?: boolean;
  otherFamilyMembers?: unknown[];
  highlight?: string;
  score?: number;
  imageUrl?: string;
  documentLink?: string;
  assignee?: string;
  applicant?: string;
  inventors?: string;
  applicationDate?: string;
  claim1?: string;
}

export interface SearchHistoryEntry {
  id: string;
  query: string;
  timestamp: string;
  results: SearchHistoryResults;
  projectId: string | null;
  userId: string | null;
  citationExtractionStatus?: string | null;
}

/**
 * Types for search-related functionality
 */

export interface SearchQuery {
  query: string;
  elements?: string[]; // V2 format - simple string array
  projectId?: string;
  inventionData?: any;
}

export interface SearchResultItem {
  id: string;
  title: string;
  abstract?: string;
  relevance?: number;
  publicationNumber?: string;
  publicationDate?: string;
  assignee?: string;
  classification?: string;
}

export interface SearchResponse {
  results: SearchResultItem[];
  totalCount: number;
  query: string;
  searchId?: string;
}

// Export search-related interfaces
export interface SearchOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'relevance' | 'date';
  filterByDate?: {
    from?: Date;
    to?: Date;
  };
}
