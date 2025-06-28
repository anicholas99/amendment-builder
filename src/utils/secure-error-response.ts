import { NextApiResponse } from 'next';
import { logger } from '@/lib/monitoring/logger';

export interface SafeErrorResponse {
  error: true;
  message: string;
  code?: string;
  requestId?: string;
}

/**
 * Create a safe error response that doesn't leak sensitive information
 * @param error - The error object
 * @param statusCode - HTTP status code
 * @param userMessage - Safe message to show to users
 * @param requestId - Optional request ID for tracking
 * @returns Safe error response object
 */
export function createSafeErrorResponse(
  error: unknown,
  statusCode: number,
  userMessage: string,
  requestId?: string
): SafeErrorResponse {
  // Log the full error internally
  if (error instanceof Error) {
    logger.error('API Error', {
      message: error.message,
      stack: error.stack,
      statusCode,
      requestId,
    });
  } else {
    logger.error('API Error', {
      error: String(error),
      statusCode,
      requestId,
    });
  }

  // Return safe response without sensitive details
  return {
    error: true,
    message: userMessage,
    ...(requestId && { requestId }),
  };
}

/**
 * Send a safe error response
 * @param res - Next.js API response object
 * @param error - The error object
 * @param statusCode - HTTP status code
 * @param userMessage - Safe message to show to users
 * @param requestId - Optional request ID for tracking
 */
export function sendSafeErrorResponse(
  res: NextApiResponse,
  error: unknown,
  statusCode: number,
  userMessage: string,
  requestId?: string
): void {
  const safeResponse = createSafeErrorResponse(
    error,
    statusCode,
    userMessage,
    requestId
  );
  res.status(statusCode).json(safeResponse);
}

/**
 * Get a user-friendly error message based on status code
 * @param statusCode - HTTP status code
 * @returns User-friendly error message
 */
export function getDefaultErrorMessage(statusCode: number): string {
  switch (statusCode) {
    case 400:
      return 'Bad request. Please check your input and try again.';
    case 401:
      return 'Authentication required. Please log in and try again.';
    case 403:
      return 'Access denied. You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'A conflict occurred. The resource may already exist.';
    case 422:
      return 'The request could not be processed. Please check your input.';
    case 429:
      return 'Too many requests. Please try again later.';
    case 500:
      return 'An internal server error occurred. Please try again later.';
    case 502:
      return 'Bad gateway. The server received an invalid response.';
    case 503:
      return 'Service temporarily unavailable. Please try again later.';
    default:
      return 'An error occurred. Please try again later.';
  }
}
