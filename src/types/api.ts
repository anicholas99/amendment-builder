import type { NextApiRequest } from 'next';
import { NextApiResponse } from 'next';
import { PriorArtReference } from './domain/priorArt';
import { InventionData } from './invention';
import { ProjectData } from './project';

// Re-export PriorArtReference
export type { PriorArtReference };

/**
 * Extended API request interface that includes properties added by middlewares
 */
export interface CustomApiRequest<T = unknown>
  extends Omit<NextApiRequest, 'body' | 'user'> {
  /** User information added by withAuth middleware */
  user?: {
    id: string;
    email?: string;
    tenantId?: string;
  };
  /** Tenant ID resolved by withTenantGuard middleware */
  tenantId?: string;
  /** Validated request body (typed by Zod schema) */
  body: T;
}

/**
 * API request with validated query parameters
 */
export interface ValidatedQueryApiRequest<TBody = unknown, TQuery = unknown>
  extends CustomApiRequest<TBody> {
  /** Validated query parameters (typed by Zod schema) */
  validatedQuery: TQuery;
}

/**
 * API request with validated body from Zod schema
 */
export interface ValidatedApiRequest<T> extends CustomApiRequest<T> {
  body: T; // Guaranteed to be validated and typed
}

/**
 * API request with authenticated user
 */
export interface AuthenticatedApiRequest<T = unknown>
  extends CustomApiRequest<T> {
  user: NonNullable<CustomApiRequest<T>['user']>; // User is guaranteed to exist
}

/**
 * API request with both auth and tenant validation
 */
export interface AuthenticatedTenantApiRequest<T = unknown>
  extends AuthenticatedApiRequest<T> {
  tenantId: string; // Tenant ID is guaranteed to exist
}

/**
 * Common API response shapes
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  message?: string;
  details?: unknown;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Helper type for API handlers with proper request typing
 */
export type TypedApiHandler<T = unknown> = (
  req: CustomApiRequest<T>,
  res: NextApiResponse<ApiResponse>
) => Promise<void>;

/**
 * Helper type for authenticated API handlers
 */
export type AuthenticatedApiHandler<T = unknown> = (
  req: AuthenticatedApiRequest<T>,
  res: NextApiResponse<ApiResponse>
) => Promise<void>;

/**
 * Helper type for tenant-aware API handlers
 */
export type TenantApiHandler<T = unknown> = (
  req: AuthenticatedTenantApiRequest<T>,
  res: NextApiResponse<ApiResponse>
) => Promise<void>;

/**
 * Common API types to replace 'any' usage across the codebase
 */

// Request body types
export interface UpdateFieldRequest {
  field: string;
  value: unknown;
  operation?: 'set' | 'append';
}

// Search related types
export interface SearchResult {
  id: string;
  referenceNumber: string;
  title: string;
  abstract?: string;
  relevance?: number;
  [key: string]: unknown;
}

// Project related types - REMOVED, now imported from ./project
export type { ProjectData };

// Citation types
export interface CitationResult {
  id: string;
  referenceNumber: string;
  status?: string;
  result?: unknown;
  [key: string]: unknown;
}

export interface CitationJob {
  id: string;
  referenceNumber: string;
  status: string;
  parsedElements?: string[]; // Updated to V2 format
  [key: string]: unknown;
}

// Error types
export interface ApiError {
  statusCode: number;
  message: string;
  details?: unknown;
}

/**
 * API type re-exports for backward compatibility
 */
export * from './api/responses';
export * from './api/citations';
export * from './api/invention';
export * from './api/citation';

// Prisma model types - can be imported directly from @prisma/client
export type {
  User,
  Project,
  SearchHistory,
  CitationMatch,
  SavedPriorArt,
  ChatMessage,
  Invention,
} from '@prisma/client';

// Basic types for API requests
export interface ApiRequest {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ApiRequestWithPagination extends ApiRequest {
  query?: PaginationParams & SortParams;
}
