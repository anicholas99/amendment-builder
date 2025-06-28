/**
 * Centralized error handling utilities for consistent error message extraction
 * and type-safe error handling throughout the application.
 */

import { logger } from '@/lib/monitoring/logger';

/**
 * Safely extracts an error message from an unknown error type
 * @param error - The error object (could be anything)
 * @param defaultMessage - Fallback message if no error message can be extracted
 * @returns A string error message
 */
export function getErrorMessage(
  error: unknown,
  defaultMessage = 'An unexpected error occurred'
): string {
  // Handle Error instances
  if (error instanceof Error) {
    return error.message;
  }

  // Handle objects with message property
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Handle objects that can be stringified
  if (typeof error === 'object' && error !== null) {
    try {
      const stringified = JSON.stringify(error);
      if (stringified !== '{}') {
        return stringified;
      }
    } catch {
      // Ignore stringify errors
    }
  }

  return defaultMessage;
}

/**
 * Type guard to check if an error is an API error response
 */
export function isApiError(
  error: unknown
): error is { status: number; message: string; data?: unknown } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    'message' in error &&
    typeof (error as { status: unknown }).status === 'number' &&
    typeof (error as { message: unknown }).message === 'string'
  );
}

/**
 * Formats an API error for display
 */
export function formatApiError(error: unknown): {
  title: string;
  description: string;
  status: 'error' | 'warning';
} {
  if (isApiError(error)) {
    const statusCode = error.status;
    let title = 'Error';
    const status: 'error' | 'warning' = 'error';

    // Customize based on status code
    if (statusCode === 404) {
      title = 'Not Found';
    } else if (statusCode === 403) {
      title = 'Access Denied';
    } else if (statusCode === 401) {
      title = 'Authentication Required';
    } else if (statusCode >= 400 && statusCode < 500) {
      title = 'Request Error';
    } else if (statusCode >= 500) {
      title = 'Server Error';
    }

    return {
      title,
      description: error.message,
      status,
    };
  }

  return {
    title: 'Error',
    description: getErrorMessage(error),
    status: 'error',
  };
}

/**
 * Logs an error with context
 */
export function logError(
  context: string,
  error: unknown,
  additionalData?: Record<string, unknown>
): void {
  logger.error(`Error in ${context}`, {
    message: getErrorMessage(error),
    error,
    context,
    ...additionalData,
  });
}

// ApplicationError has been moved to @/lib/error, so this file now only
// contains utility functions for handling and logging errors.
