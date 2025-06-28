/**
 * Error Handling and Logging Module for Patent Drafter
 *
 * This module provides centralized error handling, logging, and cost tracking.
 * It ensures consistent error responses across the application and proper logging
 * for debugging and monitoring in production.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '@/lib/monitoring/logger';
import { randomBytes } from 'crypto';
import { env } from '@/config/env';

// Error codes for consistent error responses
export enum ErrorCode {
  UNAUTHORIZED = 'unauthorized',
  FORBIDDEN = 'forbidden',
  NOT_FOUND = 'not_found',
  BAD_REQUEST = 'bad_request',
  INTERNAL_ERROR = 'internal_error',
  VALIDATION_ERROR = 'validation_error',
  SERVICE_UNAVAILABLE = 'service_unavailable',
  API_LIMIT_EXCEEDED = 'api_limit_exceeded',
}

// Error types mapped to HTTP status codes
const ERROR_STATUS_CODES: Record<ErrorCode, number> = {
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.BAD_REQUEST]: 400,
  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.VALIDATION_ERROR]: 422,
  [ErrorCode.SERVICE_UNAVAILABLE]: 503,
  [ErrorCode.API_LIMIT_EXCEEDED]: 429,
};

// Error interface for consistent error structure
interface ApiErrorArgs {
  code: ErrorCode;
  message: string;
  details?: unknown;
  requestId?: string;
}

/**
 * Generate a unique request ID
 * @returns Unique request ID
 */
function generateRequestId(): string {
  const randomStr = randomBytes(8).toString('hex');
  return `req_${Date.now()}_${randomStr}`;
}

/**
 * Log an error with consistent format
 * @param error Error to log
 * @param req Optional request object
 * @param additionalInfo Additional information to log
 */
function logError(
  error: Error | string,
  req?: NextApiRequest,
  additionalInfo?: Record<string, unknown>
): void {
  const timestamp = new Date().toISOString();
  const errorMessage = typeof error === 'string' ? error : error.message;
  const stack = error instanceof Error ? error.stack : undefined;

  const logData = {
    timestamp,
    message: errorMessage,
    stack,
    path: req?.url,
    method: req?.method,
    ...additionalInfo,
  };

  // Log to console
  logger.error(`API Error: ${errorMessage}`, logData);

  // In production, you could also log to a monitoring service
  // if (env.NODE_ENV === 'production') {
  //   sendToMonitoringService(logData);
  // }
}

/**
 * Handle errors and send consistent response
 * @param res Response object
 * @param error Error to handle
 * @param req Optional request object
 */
function handleApiError(
  res: NextApiResponse,
  error: Error | ApiErrorArgs | string,
  req?: NextApiRequest
): void {
  // Generate request ID for tracking
  const requestId = generateRequestId();

  // Determine error code and status
  let errorCode = ErrorCode.INTERNAL_ERROR;
  let message = 'An unexpected error occurred';
  let details = undefined;

  // Handle ApiError objects
  if (typeof error === 'object' && 'code' in error) {
    errorCode = error.code;
    message = error.message;
    details = error.details;
  }
  // Handle standard Error objects
  else if (error instanceof Error) {
    message = error.message;
    // Only include stack trace in development
    if (env.NODE_ENV === 'development') {
      details = error.stack;
    }
  }
  // Handle string errors
  else if (typeof error === 'string') {
    message = error;
  }

  // Construct error response
  const errorResponse = {
    error: {
      code: errorCode,
      message,
      requestId,
      ...(details ? { details } : {}),
    },
  };

  // Log the error
  logError(error instanceof Error ? error : message, req, {
    requestId,
    errorCode,
    statusCode: ERROR_STATUS_CODES[errorCode],
  });

  // Send error response
  res.status(ERROR_STATUS_CODES[errorCode]).json(errorResponse);
}

/**
 * Higher-order function to wrap API handlers with error handling
 * @param handler API request handler
 * @returns Wrapped handler with error handling
 */
export function withErrorHandling(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handler(req, res);
    } catch (error) {
      handleApiError(res, error as Error, req);
    }
  };
}

/**
 * Create a new API error
 * @param code Error code
 * @param message Error message
 * @param details Optional details
 * @returns API error object
 */
export function createApiError(
  code: ErrorCode,
  message: string,
  details?: unknown
): ApiErrorArgs {
  return {
    code,
    message,
    details,
  };
}
