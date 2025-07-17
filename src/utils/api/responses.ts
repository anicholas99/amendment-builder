/**
 * Centralized API Response Utilities
 *
 * This module provides consistent response patterns for all API endpoints,
 * leveraging existing error handling infrastructure while ensuring security
 * and maintainability.
 */

import { NextApiResponse } from 'next';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/server/logger';
import { ZodError } from 'zod';

/**
 * Standard API response structure
 */
interface ApiSuccessResponse<T = any> {
  data: T;
  meta?: {
    timestamp?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

interface ApiErrorResponse {
  error: string;
  code: ErrorCode;
  details?: Record<string, any>;
}

/**
 * Send a standardized success response
 */
export function sendSuccess<T>(
  res: NextApiResponse,
  data: T,
  meta?: ApiSuccessResponse<T>['meta']
): void {
  const response: ApiSuccessResponse<T> = {
    data,
    ...(meta && { meta }),
  };

  res.status(200).json(response);
}

/**
 * Send a standardized created response (201)
 */
export function sendCreated<T>(
  res: NextApiResponse,
  data: T,
  meta?: ApiSuccessResponse<T>['meta']
): void {
  const response: ApiSuccessResponse<T> = {
    data,
    ...(meta && { meta }),
  };

  res.status(201).json(response);
}

/**
 * Send a standardized error response
 * Maps ApplicationError to consistent format with appropriate status codes
 */
export function sendError(
  res: NextApiResponse,
  error: unknown,
  context?: Record<string, any>
): void {
  let appError: ApplicationError;

  // Convert various error types to ApplicationError
  if (error instanceof ApplicationError) {
    appError = error;
  } else if (error instanceof ZodError) {
    // Validation errors
    appError = new ApplicationError(
      ErrorCode.VALIDATION_FAILED,
      'Validation failed',
      400
    );
    // Add validation details
    context = {
      ...context,
      validationErrors: error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message,
      })),
    };
  } else if (error instanceof Error) {
    // Check for specific error patterns
    if (error.message.includes('not found')) {
      appError = new ApplicationError(
        ErrorCode.DB_RECORD_NOT_FOUND,
        'Resource not found',
        404
      );
    } else if (
      error.message.includes('duplicate') ||
      error.message.includes('constraint')
    ) {
      appError = new ApplicationError(
        ErrorCode.DB_DUPLICATE_ENTRY,
        'Resource already exists',
        409
      );
    } else {
      appError = new ApplicationError(
        ErrorCode.INTERNAL_ERROR,
        'An error occurred while processing your request',
        500
      );
    }
  } else {
    appError = new ApplicationError(
      ErrorCode.UNKNOWN_ERROR,
      'An unexpected error occurred',
      500
    );
  }

  // Log the full error details server-side
  logger.error('API Error', {
    code: appError.code,
    message: appError.message,
    originalError: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...context,
  });

  // Send safe error response
  const response: ApiErrorResponse = {
    error: getSafeErrorMessage(appError.code),
    code: appError.code,
    ...(context?.validationErrors && {
      details: { validation: context.validationErrors },
    }),
  };

  res.status(appError.statusCode).json(response);
}

/**
 * Get a safe, user-friendly error message based on error code
 */
function getSafeErrorMessage(code: ErrorCode): string {
  const messages: Record<ErrorCode, string> = {
    // General Errors
    [ErrorCode.UNKNOWN_ERROR]: 'An unexpected error occurred',
    [ErrorCode.INTERNAL_ERROR]: 'Internal server error',
    [ErrorCode.INVALID_INPUT]: 'Invalid input provided',
    [ErrorCode.VALIDATION_FAILED]: 'Validation failed',
    [ErrorCode.VALIDATION_REQUIRED_FIELD]: 'Required fields are missing',
    [ErrorCode.VALIDATION_INVALID_FORMAT]: 'Invalid data format',
    [ErrorCode.VALIDATION_OUT_OF_RANGE]: 'Value out of allowed range',
    [ErrorCode.DEPRECATED_ENDPOINT]: 'This endpoint is deprecated',
    [ErrorCode.NOT_IMPLEMENTED]: 'Feature not implemented',

    // Environment Errors
    [ErrorCode.ENV_VAR_MISSING]: 'Configuration error',
    [ErrorCode.ENV_VAR_INVALID]: 'Configuration error',
    [ErrorCode.CONFIG_MISSING]: 'Configuration error',

    // File Processing Errors
    [ErrorCode.FILE_PROCESSING_ERROR]: 'File processing failed',

    // Storage Errors
    [ErrorCode.STORAGE_FILE_NOT_FOUND]: 'File not found',
    [ErrorCode.STORAGE_INVALID_FILE_TYPE]: 'Invalid file type',
    [ErrorCode.STORAGE_UPLOAD_FAILED]: 'File upload failed',
    [ErrorCode.STORAGE_DOWNLOAD_FAILED]: 'File download failed',

    // Security Errors
    [ErrorCode.SECURITY_MALWARE_DETECTED]: 'Security threat detected',

    // AI Errors
    [ErrorCode.AI_INVALID_RESPONSE]: 'AI service error',
    [ErrorCode.AI_GENERATION_FAILED]: 'Content generation failed',
    [ErrorCode.AI_SERVICE_ERROR]: 'AI service unavailable',
    [ErrorCode.AI_MAX_ITERATIONS]: 'Processing limit exceeded',

    // Auth Errors
    [ErrorCode.AUTH_UNAUTHORIZED]: 'Authentication required',
    [ErrorCode.AUTH_FORBIDDEN]: 'Access denied',
    [ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS]: 'Insufficient permissions',
    [ErrorCode.AUTH_TOKEN_INVALID]: 'Invalid authentication token',
    [ErrorCode.AUTH_SESSION_EXPIRED]: 'Session expired',

    // Network & API Errors
    [ErrorCode.API_INVALID_RESPONSE]: 'Invalid response from external service',
    [ErrorCode.API_NETWORK_ERROR]: 'External service unavailable',
    [ErrorCode.RATE_LIMIT_EXCEEDED]:
      'Too many requests, please try again later',

    // Citation & External API Errors
    [ErrorCode.CITATION_EXTERNAL_API_ERROR]: 'Citation service error',
    [ErrorCode.CITATION_JOB_NOT_FOUND]: 'Citation job not found',

    // Cache Errors
    [ErrorCode.CACHE_INVALIDATION_ERROR]: 'Cache error',

    // Tenant Errors
    [ErrorCode.TENANT_NOT_FOUND]: 'Tenant not found',
    [ErrorCode.TENANT_ACCESS_DENIED]: 'Tenant access denied',
    [ErrorCode.TENANT_RESOLUTION_FAILED]: 'Tenant resolution failed',

    // Project Errors
    [ErrorCode.PROJECT_NOT_FOUND]: 'Project not found',
    [ErrorCode.PROJECT_ACCESS_DENIED]: 'Project access denied',
    [ErrorCode.PROJECT_ID_REQUIRED]: 'Project ID is required',

    // Database Errors
    [ErrorCode.DB_QUERY_ERROR]: 'Database operation failed',
    [ErrorCode.DB_CONNECTION_ERROR]: 'Database connection failed',
    [ErrorCode.DB_TRANSACTION_FAILED]: 'Transaction failed',
    [ErrorCode.DB_CONSTRAINT_VIOLATION]: 'Data constraint violation',
    [ErrorCode.DB_DUPLICATE_ENTRY]: 'Resource already exists',
    [ErrorCode.DB_RECORD_NOT_FOUND]: 'Resource not found',

    // API Service Errors
    [ErrorCode.API_TIMEOUT]: 'Request timeout',
    [ErrorCode.API_SERVICE_UNAVAILABLE]: 'Service temporarily unavailable',
  };

  return messages[code] || 'An error occurred';
}

/**
 * Convenience methods for common HTTP responses
 */
export const apiResponse = {
  // Success responses
  ok: <T>(
    res: NextApiResponse,
    data: T,
    meta?: ApiSuccessResponse<T>['meta']
  ) => sendSuccess(res, data, meta),

  created: <T>(
    res: NextApiResponse,
    data: T,
    meta?: ApiSuccessResponse<T>['meta']
  ) => sendCreated(res, data, meta),

  // Error responses
  badRequest: (res: NextApiResponse, message = 'Bad request') =>
    sendError(res, new ApplicationError(ErrorCode.INVALID_INPUT, message, 400)),

  unauthorized: (res: NextApiResponse, message = 'Authentication required') =>
    sendError(
      res,
      new ApplicationError(ErrorCode.AUTH_UNAUTHORIZED, message, 401)
    ),

  forbidden: (res: NextApiResponse, message = 'Access denied') =>
    sendError(
      res,
      new ApplicationError(ErrorCode.AUTH_FORBIDDEN, message, 403)
    ),

  notFound: (res: NextApiResponse, message = 'Resource not found') =>
    sendError(
      res,
      new ApplicationError(ErrorCode.DB_RECORD_NOT_FOUND, message, 404)
    ),

  methodNotAllowed: (res: NextApiResponse, allowed: string[]) => {
    res.setHeader('Allow', allowed);
    sendError(
      res,
      new ApplicationError(
        ErrorCode.VALIDATION_FAILED,
        `Method not allowed. Allowed methods: ${allowed.join(', ')}`,
        405
      )
    );
  },

  conflict: (res: NextApiResponse, message = 'Resource already exists') =>
    sendError(
      res,
      new ApplicationError(ErrorCode.DB_DUPLICATE_ENTRY, message, 409)
    ),

  tooManyRequests: (res: NextApiResponse) =>
    sendError(
      res,
      new ApplicationError(
        ErrorCode.RATE_LIMIT_EXCEEDED,
        'Too many requests',
        429
      )
    ),

  serverError: (res: NextApiResponse, error: unknown) => sendError(res, error),
};
