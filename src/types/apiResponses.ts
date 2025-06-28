/**
 * Centralized API response types to ensure consistency across the application
 * and reduce type duplication in API handlers and client code.
 */

import { SearchHistoryResults } from './domain/searchHistory';

/**
 * Standard API error response
 */
export interface ApiErrorResponse {
  error: string;
  message?: string;
  statusCode?: number;
  details?: unknown;
}

/**
 * Standard API success response wrapper
 */
export interface ApiSuccessResponse<T = unknown> {
  data: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    [key: string]: unknown;
  };
}

/**
 * Paginated API response
 */
export interface PaginatedApiResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Search API response types
 */
export interface SearchHistoryResponse {
  id: string;
  query: string;
  timestamp: string;
  results?: SearchHistoryResults;
  projectId?: string;
  userId?: string;
  citationExtractionStatus?: string;
}

/**
 * Citation API response types
 */
export interface CitationJobApiResponse {
  id: string;
  searchHistoryId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  externalJobId?: number;
  referenceNumber?: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  results?: CitationResultApiResponse;
  deepAnalysisJson?: string;
}

export interface CitationResultApiResponse {
  id: string;
  citationJobId: string;
  resultsData: string | null;
  createdAt: string;
}

export interface CitationMatchApiResponse {
  id: string;
  searchHistoryId: string;
  referenceNumber: string;
  parsedElementText?: string;
  location?: string;
  locationStatus?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  reasoningScore?: number;
  reasoningSummary?: string;
  reasoningStatus?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
}

/**
 * Project API response types
 */
export interface ProjectApiResponse {
  id: string;
  name: string;
  description?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Prior Art API response types
 */
export interface PriorArtApiResponse {
  id: string;
  projectId: string;
  patentNumber: string;
  title?: string;
  abstract?: string;
  url?: string;
  notes?: string;
  authors?: string;
  publicationDate?: string;
  savedCitationsData?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Type guards for API responses
 */
export function isApiErrorResponse(
  response: unknown
): response is ApiErrorResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'error' in response &&
    typeof (response as ApiErrorResponse).error === 'string'
  );
}

export function isApiSuccessResponse<T = unknown>(
  response: unknown
): response is ApiSuccessResponse<T> {
  return (
    typeof response === 'object' && response !== null && 'data' in response
  );
}

/**
 * API response builders
 */
export function createApiErrorResponse(
  error: string,
  statusCode?: number,
  details?: unknown
): ApiErrorResponse {
  return {
    error,
    statusCode,
    details,
  };
}

export function createApiSuccessResponse<T>(
  data: T,
  message?: string,
  meta?: ApiSuccessResponse['meta']
): ApiSuccessResponse<T> {
  return {
    data,
    ...(message && { message }),
    ...(meta && { meta }),
  };
}

/**
 * Standard HTTP status codes as constants
 */
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export type HttpStatusCode = (typeof HttpStatus)[keyof typeof HttpStatus];
