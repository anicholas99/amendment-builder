/**
 * Search History Domain Types
 *
 * These types represent search history data throughout the application.
 * Note: Parsed elements are now stored as string arrays (V2 format).
 */

import { SearchResult, MappedSearchResult } from '../searchTypes';
import {
  SearchHistory as PrismaSearchHistory,
  CitationJob as PrismaCitationJob,
  CitationMatch as PrismaCitationMatch,
  Project as PrismaProject,
} from '@prisma/client';
import { PriorArtReference } from './priorArt';

/**
 * Normalized search result that ensures both 'number' and 'patentNumber' fields exist
 * This is the format used throughout the application after normalization
 */
export interface NormalizedSearchResult extends PriorArtReference {
  number: string; // Required for UI display
  patentNumber: string; // Required for API compatibility
}

/**
 * Raw search history data as stored in the database
 */
export interface RawSearchHistoryEntry {
  id: string;
  query: string;
  timestamp: Date;
  results: string | null;
  projectId: string | null;
  userId: string | null;
  citationExtractionStatus: string | null;
}

/**
 * Citation job status enum matching the database enum
 */
export type CitationJobStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED';

/**
 * Citation match from the database with camelCase conversion
 */
export interface CitationMatch {
  id: string;
  referenceNumber: string;
  citationJobId: string | null;
  jobId: string | null; // Alias for citationJobId for backward compatibility
  claimElement: string;
  citation: string;
  score: number;
  paragraph: string | null;
  createdAt: Date;
  updatedAt: Date;
  isPrimary: boolean | null;
  matchType: string | null;
  metadata: unknown | null;
  parsedElementText: string | null;
  citationReasoning: string | null;
  confidence: number | null;
  isIdentical: boolean | null;
  savedPriorArtId: string | null;
}

/**
 * Citation job from the database with relations
 */
export interface CitationJob extends PrismaCitationJob {
  citationMatches?: CitationMatch[];
}

/**
 * Base search history interface matching the database model
 */
export interface SearchHistoryBase {
  id: string;
  projectId: string;
  query: string;
  parsedElementsJson: string | null;
  searchData: unknown;
  timestamp: Date;
  userId: string | null;
  citationJobId: string | null;
}

/**
 * Search history with all possible relations
 */
export interface SearchHistoryWithRelations extends SearchHistoryBase {
  citationJob?: CitationJob | null;
  project?: PrismaProject | null;
}

/**
 * Processed search history entry with parsed data
 */
export interface ProcessedSearchHistoryEntry {
  id: string;
  projectId: string;
  query: string;
  parsedElements: string[]; // V2 format - array of strings
  searchData: {
    numberOfResults?: number;
    searchEngineUsed?: string;
    searchEngineLink?: string;
    [key: string]: unknown;
  };
  timestamp: Date;
  userId: string | null;
  citationJobId: string | null;
  citationJob?: CitationJob | null;
  priorArtReferences?: PriorArtReference[];
  // Additional properties used by search history utils
  results?: NormalizedSearchResult[]; // Now properly typed
  resultCount?: number;
  citationExtractionStatus?: string;
  citationJobCount?: number;
  hasCitationJobs?: boolean;
}

/**
 * Type alias for the main search history type used in the app
 */
export type SearchHistoryEntry = ProcessedSearchHistoryEntry;

/**
 * Serialized form for API responses
 */
export interface SerializedSearchHistoryEntry {
  id: string;
  query: string;
  timestamp: string;
  results?: string;
  projectId?: string;
  userId?: string;
  citationExtractionStatus?: string;
}

/**
 * Input type for creating/updating search history entries
 * Used when saving new searches or updating existing ones
 */
export interface SearchHistoryInput {
  query: string;
  results?: PriorArtReference[] | unknown; // Search results to be stringified
  projectId?: string;
  userId?: string;
}

/**
 * Extended types for special use cases
 */
export interface SearchHistoryWithDetails extends ProcessedSearchHistoryEntry {
  projectName?: string;
  totalCitations?: number;
  hasResults: boolean;
}

export interface SearchHistoryCreateInput {
  query: string;
  results?: any;
  projectId?: string;
  userId?: string;
  citationExtractionStatus?: string;
  parsedElements?: string[]; // V2 format - array of strings
  timestamp?: Date;
}

export interface SearchHistoryUpdateInput {
  query?: string;
  results?: any;
  citationExtractionStatus?: string;
}

/**
 * Search results as stored in the searchData JSON field
 */
export interface SearchHistoryResults {
  results: PriorArtReference[];
  totalCount: number;
  searchEngine?: string;
  searchEngineLink?: string;
  timestamp?: string;
}

/**
 * Helper type for search history with citation extraction results
 */
export interface SearchHistoryWithCitations
  extends ProcessedSearchHistoryEntry {
  citationJob: CitationJob & {
    citationMatches: CitationMatch[];
  };
}

/**
 * Type guards
 */
export function isRawSearchHistoryEntry(
  entry: any
): entry is RawSearchHistoryEntry {
  return (
    entry &&
    typeof entry.id === 'string' &&
    typeof entry.query === 'string' &&
    entry.timestamp instanceof Date
  );
}

export function isProcessedSearchHistoryEntry(
  entry: any
): entry is ProcessedSearchHistoryEntry {
  return (
    entry &&
    typeof entry.id === 'string' &&
    typeof entry.query === 'string' &&
    entry.timestamp instanceof Date &&
    Array.isArray(entry.parsedElements)
  );
}

export function isSearchHistoryWithCitations(
  entry: ProcessedSearchHistoryEntry
): entry is SearchHistoryWithCitations {
  return (
    entry.citationJob !== null &&
    entry.citationJob !== undefined &&
    'citationMatches' in entry.citationJob &&
    Array.isArray(entry.citationJob.citationMatches)
  );
}

export function hasSearchResults(
  searchData: unknown
): searchData is { results: PriorArtReference[]; totalCount: number } {
  return (
    typeof searchData === 'object' &&
    searchData !== null &&
    'results' in searchData &&
    Array.isArray((searchData as any).results)
  );
}

/**
 * Convert raw search history from database to processed format
 */
export function processSearchHistory(
  raw: SearchHistoryBase | SearchHistoryWithRelations
): ProcessedSearchHistoryEntry {
  return {
    ...raw,
    parsedElements: raw.parsedElementsJson
      ? JSON.parse(raw.parsedElementsJson)
      : [],
    searchData: raw.searchData as ProcessedSearchHistoryEntry['searchData'],
    priorArtReferences: hasSearchResults(raw.searchData)
      ? (raw.searchData as SearchHistoryResults).results
      : [],
  };
}

/**
 * Utility type for any search history entry
 * Can be either raw or processed format
 */
export type AnySearchHistoryEntry =
  | RawSearchHistoryEntry
  | ProcessedSearchHistoryEntry;
