/**
 * Standardized API Response Types
 * Ensures consistent response format across all API endpoints
 */

/**
 * Base response structure for all API responses
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMetadata;
}

/**
 * Standardized error structure
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  field?: string; // For validation errors
  stack?: string; // Only in development
}

/**
 * Metadata for pagination, timing, etc.
 */
export interface ApiMetadata {
  timestamp?: string;
  duration?: number;
  pagination?: PaginationMeta;
  version?: string;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/**
 * Success response helper type
 */
export type SuccessResponse<T = unknown> = ApiResponse<T> & {
  success: true;
  data: T;
  error?: never;
};

/**
 * Error response helper type
 */
export type ErrorResponse = ApiResponse<never> & {
  success: false;
  data?: never;
  error: ApiError;
};

/**
 * Paginated response type
 */
export interface PaginatedResponse<T> extends SuccessResponse<T[]> {
  meta: ApiMetadata & {
    pagination: PaginationMeta;
  };
}

/**
 * Common error codes
 */
export enum ApiErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_TOKEN = 'INVALID_TOKEN',

  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',

  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',

  // Server errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',

  // Rate limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // Business logic
  INVALID_STATE = 'INVALID_STATE',
  OPERATION_FAILED = 'OPERATION_FAILED',
}

/**
 * Type guard for success responses
 */
export function isSuccessResponse<T>(
  response: ApiResponse<T>
): response is SuccessResponse<T> {
  return response.success === true && response.data !== undefined;
}

/**
 * Type guard for error responses
 */
export function isErrorResponse(
  response: ApiResponse
): response is ErrorResponse {
  return response.success === false && response.error !== undefined;
}
