/**
 * Shared API Response Types
 *
 * This file centralizes all API response types to ensure consistency
 * across React Query hooks and components.
 */

// Import domain types that are referenced
import type { SearchResult, PriorArtReference } from '@/types/claimTypes';
import type { SearchHistoryResults } from '@/types/domain/searchHistory';

// Re-export for convenience
export type { SearchResult, PriorArtReference };

// Generic API Response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

// Pagination types
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Search Domain Types
export interface SearchHistoryResponse {
  id: string;
  projectId: string;
  query: string;
  results: SearchHistoryResults;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface AsyncSearchStartResponse {
  searchId: string;
  message?: string;
}

export interface SearchStatusResponse {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  message?: string;
}

// Claim Domain Types
export interface ParseClaimResponse {
  parsedElements: string[];
  searchQueries?: string[];
}

export interface GenerateQueriesResponse {
  searchQueries: string[];
}

export interface GenerateDependentClaimsResponse {
  dependentClaims: Array<{
    id: string;
    text: string;
    type: string;
  }>;
}

// Figure Domain Types
export interface FigureDetails {
  id: string;
  projectId: string;
  imageUrl: string;
  imageName: string;
  title?: string;
  description?: string;
  details?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateFigureDetailsResponse {
  figureDetails: FigureDetails;
}

export interface UpdateFigureResponse {
  success: boolean;
  figure: FigureDetails;
}

export interface DeleteFigureResponse {
  success: boolean;
  message: string;
}

// Prior Art Domain Types
export interface PriorArtAnalysisResponse {
  analysis: {
    score: number;
    summary: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
  metadata?: {
    analyzedAt: string;
    modelUsed: string;
    tokensUsed?: number;
  };
}

export interface SavedPriorArt {
  id: string;
  projectId: string;
  patentNumber: string;
  title: string;
  abstract?: string;
  url?: string;
  relevanceScore?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Citation Domain Types
export interface CitationMatch {
  id: string;
  citationJobId: string;
  patentId: string;
  claimNumber: string;
  elementLabel: string;
  elementText: string;
  matchScore: number;
  explanation?: string;
  createdAt: string;
}

export interface CitationJob {
  id: string;
  searchHistoryId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  patentIds: string[];
  totalPatents: number;
  processedPatents: number;
  citationMatches?: CitationMatch[];
  error?: string;
  createdAt: string;
  updatedAt: string;
}

// Project Domain Types
export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'archived' | 'draft';
  createdAt: string;
  updatedAt: string;
  lastActivityAt?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateProjectResponse {
  project: Project;
}

export interface UpdateProjectResponse {
  project: Project;
}

// Text Extraction Types
export interface ExtractTextResponse {
  extractedText: string;
  metadata?: {
    pageCount?: number;
    wordCount?: number;
    format?: string;
  };
}

// Error Response Types
export interface ApiError {
  error: string;
  message?: string;
  statusCode: number;
  details?: Record<string, unknown>;
}

// Mutation Response Types
export interface MutationResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

// Batch Operation Types
export interface BatchOperationResponse<T, TItem = unknown> {
  successful: T[];
  failed: Array<{
    item: TItem;
    error: string;
  }>;
  totalProcessed: number;
  totalSuccessful: number;
  totalFailed: number;
}
