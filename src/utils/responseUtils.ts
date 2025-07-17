import { NextApiResponse } from 'next';
import { logger } from '@/utils/clientLogger';
import { Suggestion } from '../types/citationTypes';
import { CostTracker } from '@/lib/cost-tracking';
import { isDevelopment } from '@/config/environment.client';

interface SuccessResponse<T = unknown> {
  success: true;
  data?: T;
  message?: string;
  [key: string]: unknown;
}

interface ErrorResponse {
  error: true;
  message: string;
  code?: string;
  details?: unknown;
  [key: string]: unknown;
}

interface SuggestionResponse {
  suggestions: Suggestion[];
  searchId: string | null;
  timestamp: string;
  costSummary: {
    totalCost: number;
    inputTokens: number;
    outputTokens: number;
    processTime: number;
  };
}

/**
 * Format the API response with suggestions
 */
export function formatSuggestionResponse(
  suggestions: Suggestion[],
  searchId: string | null,
  costTracker: CostTracker,
  processTime: number
): SuggestionResponse {
  return {
    suggestions,
    searchId: searchId || null,
    timestamp: new Date().toISOString(),
    costSummary: {
      totalCost: costTracker.totalCost,
      inputTokens: costTracker.inputTokens,
      outputTokens: costTracker.outputTokens,
      processTime: processTime,
    },
  };
}

/**
 * Send a standardized success response
 * @param res - Next.js API response object
 * @param data - Data to include in the response
 * @param message - Optional success message
 * @param statusCode - HTTP status code (default: 200)
 */
export function sendSuccess<T = unknown>(
  res: NextApiResponse,
  data: T,
  message?: string,
  statusCode: number = 200
): void {
  const response: SuccessResponse<T> = {
    success: true,
    ...(data !== undefined && { data }),
    ...(message && { message }),
  };

  res.status(statusCode).json(response);
}

/**
 * Send a standardized error response
 * @param res - Next.js API response object
 * @param error - Error object or string
 * @param statusCode - HTTP status code (default: 500)
 */
export function sendError(
  res: NextApiResponse,
  error: unknown,
  statusCode: number = 500
): void {
  let errorMessage: string;
  let errorCode: string | undefined;
  let errorDetails: unknown;

  if (error instanceof Error) {
    errorMessage = error.message;
    errorCode = (error as Error & { code?: string }).code; // Some errors have a code property
    errorDetails = isDevelopment ? error.stack : undefined;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && typeof error === 'object' && 'message' in error) {
    errorMessage = String((error as { message: unknown }).message);
    errorCode =
      'code' in error ? String((error as { code: unknown }).code) : undefined;
  } else {
    errorMessage = 'An unexpected error occurred';
  }

  // Log the error for monitoring
  logger.error('API Error Response', {
    statusCode,
    message: errorMessage,
    code: errorCode,
    error: error instanceof Error ? error : new Error(String(error)),
  });

  const response: ErrorResponse = {
    error: true,
    message: errorMessage,
  };

  if (errorCode) {
    response.code = errorCode;
  }

  if (errorDetails) {
    response.details = errorDetails;
  }

  res.status(statusCode).json(response);
}

/**
 * Type guard to check if a response is an error response
 */
export function isErrorResponse(response: unknown): response is ErrorResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'error' in response &&
    (response as { error: unknown }).error === true
  );
}

/**
 * Type guard to check if a response is a success response
 */
export function isSuccessResponse<T = unknown>(
  response: unknown
): response is SuccessResponse<T> {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    (response as { success: unknown }).success === true
  );
}

export function createErrorResponse(
  error: unknown,
  statusCode: number = 500
): ErrorResponse {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack =
    error instanceof Error && error.stack
      ? isDevelopment
        ? error.stack
        : undefined
      : undefined;

  return {
    error: true,
    message: errorMessage,
    ...(errorStack && { details: errorStack }),
  };
}
