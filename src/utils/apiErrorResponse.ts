import { NextApiResponse } from 'next';
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { getClientIp } from '@/utils/network';
import type { NextApiRequest } from 'next';

/**
 * Error response utility for consistent, secure error handling in API routes.
 *
 * Key features:
 * - Never exposes raw error messages to clients
 * - Logs full error details server-side for debugging
 * - Returns user-friendly, sanitized messages
 * - Consistent error format across all endpoints
 */

interface ErrorResponse {
  error: string;
  code?: string;
  statusCode: number;
}

// User-friendly error messages that don't leak implementation details
const ERROR_MESSAGES: Record<string, string> = {
  [ErrorCode.VALIDATION_FAILED]: 'Invalid request data',
  [ErrorCode.VALIDATION_REQUIRED_FIELD]: 'Required fields are missing',
  [ErrorCode.VALIDATION_INVALID_FORMAT]: 'Invalid data format',
  [ErrorCode.INVALID_INPUT]: 'Invalid input provided',
  [ErrorCode.AUTH_UNAUTHORIZED]: 'Authentication required',
  [ErrorCode.AUTH_TOKEN_INVALID]: 'Invalid authentication token',
  [ErrorCode.AUTH_SESSION_EXPIRED]: 'Session expired',
  [ErrorCode.AUTH_FORBIDDEN]: 'Access denied',
  [ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS]: 'Insufficient permissions',
  [ErrorCode.PROJECT_NOT_FOUND]: 'Project not found',
  [ErrorCode.TENANT_NOT_FOUND]: 'Tenant not found',
  [ErrorCode.DB_RECORD_NOT_FOUND]: 'Resource not found',
  [ErrorCode.DB_DUPLICATE_ENTRY]: 'Resource already exists',
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 'Too many requests, please try again later',
  [ErrorCode.DB_QUERY_ERROR]: 'Database operation failed',
  [ErrorCode.DB_CONNECTION_ERROR]: 'Database connection failed',
  [ErrorCode.API_NETWORK_ERROR]: 'External service unavailable',
  [ErrorCode.INTERNAL_ERROR]: 'Internal server error',
};

// Map error codes to HTTP status codes
const STATUS_CODE_MAP: Record<string, number> = {
  [ErrorCode.VALIDATION_FAILED]: 400,
  [ErrorCode.VALIDATION_REQUIRED_FIELD]: 400,
  [ErrorCode.VALIDATION_INVALID_FORMAT]: 400,
  [ErrorCode.INVALID_INPUT]: 400,
  [ErrorCode.AUTH_UNAUTHORIZED]: 401,
  [ErrorCode.AUTH_TOKEN_INVALID]: 401,
  [ErrorCode.AUTH_SESSION_EXPIRED]: 401,
  [ErrorCode.AUTH_FORBIDDEN]: 403,
  [ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS]: 403,
  [ErrorCode.PROJECT_ACCESS_DENIED]: 403,
  [ErrorCode.TENANT_ACCESS_DENIED]: 403,
  [ErrorCode.PROJECT_NOT_FOUND]: 404,
  [ErrorCode.TENANT_NOT_FOUND]: 404,
  [ErrorCode.DB_RECORD_NOT_FOUND]: 404,
  [ErrorCode.DB_DUPLICATE_ENTRY]: 409,
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 429,
  [ErrorCode.DB_QUERY_ERROR]: 500,
  [ErrorCode.DB_CONNECTION_ERROR]: 500,
  [ErrorCode.API_NETWORK_ERROR]: 502,
  [ErrorCode.INTERNAL_ERROR]: 500,
};

/**
 * Send a sanitized error response to the client
 *
 * @param req - Next.js API request
 * @param res - Next.js API response
 * @param error - The error that occurred
 * @param context - Additional context for logging
 */
export function sendErrorResponse(
  req: NextApiRequest,
  res: NextApiResponse,
  error: unknown,
  context?: Record<string, unknown>
): void {
  // Extract request metadata for logging
  const requestMeta = {
    method: req.method,
    url: req.url,
    ip: getClientIp(req),
    userId: (req as any).user?.id,
    tenantId: (req as any).tenantId,
    ...context,
  };

  // Handle ApplicationError instances
  if (error instanceof ApplicationError) {
    const statusCode = STATUS_CODE_MAP[error.code] || 500;
    const message = ERROR_MESSAGES[error.code] || 'An error occurred';

    // Log full error details server-side
    logger.error('API error occurred', {
      ...requestMeta,
      errorCode: error.code,
      errorMessage: error.message,
      statusCode,
      stack: error.stack,
    });

    res.status(statusCode).json({
      error: message,
      code: error.code,
      statusCode,
    } as ErrorResponse);
    return;
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    // Log the actual error message server-side
    logger.error('Unhandled error in API route', {
      ...requestMeta,
      errorMessage: error.message,
      errorName: error.name,
      stack: error.stack,
    });

    // Check for specific error patterns (without exposing details)
    if (
      error.message.includes('constraint') ||
      error.message.includes('duplicate')
    ) {
      res.status(409).json({
        error: 'Resource already exists',
        code: ErrorCode.DB_DUPLICATE_ENTRY,
        statusCode: 409,
      } as ErrorResponse);
      return;
    }

    if (error.message.includes('not found')) {
      res.status(404).json({
        error: 'Resource not found',
        code: ErrorCode.DB_RECORD_NOT_FOUND,
        statusCode: 404,
      } as ErrorResponse);
      return;
    }

    // Default to generic error
    res.status(500).json({
      error: 'Internal server error',
      code: ErrorCode.INTERNAL_ERROR,
      statusCode: 500,
    } as ErrorResponse);
    return;
  }

  // Handle unknown error types
  logger.error('Unknown error type in API route', {
    ...requestMeta,
    error: String(error),
    errorType: typeof error,
  });

  res.status(500).json({
    error: 'Internal server error',
    code: ErrorCode.INTERNAL_ERROR,
    statusCode: 500,
  } as ErrorResponse);
}

/**
 * Wrapper for common HTTP error responses
 */
export const apiError = {
  badRequest: (res: NextApiResponse, message = 'Invalid request') =>
    res.status(400).json({ error: message, statusCode: 400 }),

  unauthorized: (res: NextApiResponse, message = 'Authentication required') =>
    res.status(401).json({ error: message, statusCode: 401 }),

  forbidden: (res: NextApiResponse, message = 'Access denied') =>
    res.status(403).json({ error: message, statusCode: 403 }),

  notFound: (res: NextApiResponse, message = 'Resource not found') =>
    res.status(404).json({ error: message, statusCode: 404 }),

  methodNotAllowed: (res: NextApiResponse, method?: string) =>
    res.status(405).json({
      error: method ? `Method ${method} not allowed` : 'Method not allowed',
      statusCode: 405,
    }),

  conflict: (res: NextApiResponse, message = 'Resource already exists') =>
    res.status(409).json({ error: message, statusCode: 409 }),

  tooManyRequests: (res: NextApiResponse, message = 'Too many requests') =>
    res.status(429).json({ error: message, statusCode: 429 }),

  internalError: (res: NextApiResponse, message = 'Internal server error') =>
    res.status(500).json({ error: message, statusCode: 500 }),
};
