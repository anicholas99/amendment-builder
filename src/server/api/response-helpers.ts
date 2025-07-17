import { NextApiResponse, NextApiRequest } from 'next';
import {
  ApiResponse,
  SuccessResponse,
  ErrorResponse,
  ApiError,
  ApiErrorCode,
  ApiMetadata,
  PaginatedResponse,
} from '@/lib/api/response-types';
import { logger } from '@/server/logger';
import { environment } from '@/config/environment';
import { ApplicationError, ErrorCode } from '@/lib/error';

/**
 * Send a successful response
 */
export function sendSuccess<T>(
  res: NextApiResponse<SuccessResponse<T>>,
  data: T,
  meta?: ApiMetadata
): void {
  const response: SuccessResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };

  res.status(200).json(response);
}

/**
 * Send a created response (201)
 */
export function sendCreated<T>(
  res: NextApiResponse<SuccessResponse<T>>,
  data: T,
  meta?: ApiMetadata
): void {
  const response: SuccessResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };

  res.status(201).json(response);
}

/**
 * Send a no content response (204)
 */
export function sendNoContent(res: NextApiResponse): void {
  res.status(204).end();
}

/**
 * Send an error response
 * @deprecated Use ApplicationError + withErrorHandling middleware instead
 */
export function sendError(
  res: NextApiResponse<ErrorResponse>,
  error: ApiError | Error | string,
  statusCode: number = 500,
  meta?: ApiMetadata
): void {
  let apiError: ApiError;

  if (typeof error === 'string') {
    apiError = {
      code: ApiErrorCode.INTERNAL_ERROR,
      message: error,
    };
  } else if (error instanceof Error) {
    apiError = {
      code: ApiErrorCode.INTERNAL_ERROR,
      message: error.message,
      stack: environment.isDevelopment ? error.stack : undefined,
    };
  } else {
    apiError = error;
  }

  // Log errors (except client errors)
  if (statusCode >= 500) {
    logger.error('API Error:', {
      error: apiError,
      statusCode,
      meta,
    });
  }

  const response: ErrorResponse = {
    success: false,
    error: apiError,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };

  res.status(statusCode).json(response);
}

/**
 * Send a not found error
 * @deprecated Use throwNotFound from errorHandling middleware
 */
export function sendNotFound(
  res: NextApiResponse<ErrorResponse>,
  resource: string = 'Resource'
): void {
  throw new ApplicationError(
    ErrorCode.DB_RECORD_NOT_FOUND,
    `${resource} not found`,
    404
  );
}

/**
 * Send an unauthorized error
 * @deprecated Use throwUnauthorized from errorHandling middleware
 */
export function sendUnauthorized(
  res: NextApiResponse<ErrorResponse>,
  message: string = 'Unauthorized'
): void {
  throw new ApplicationError(ErrorCode.AUTH_UNAUTHORIZED, message, 401);
}

/**
 * Send a forbidden error
 * @deprecated Use throwForbidden from errorHandling middleware
 */
export function sendForbidden(
  res: NextApiResponse<ErrorResponse>,
  message: string = 'Forbidden'
): void {
  throw new ApplicationError(
    ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS,
    message,
    403
  );
}

/**
 * Send a validation error
 * @deprecated Use throwValidationError from errorHandling middleware
 */
export function sendValidationError(
  res: NextApiResponse<ErrorResponse>,
  message: string,
  _field?: string,
  _details?: Record<string, unknown>
): void {
  throw new ApplicationError(ErrorCode.VALIDATION_FAILED, message, 400);
}

/**
 * Send a paginated response
 */
export function sendPaginated<T>(
  res: NextApiResponse<PaginatedResponse<T>>,
  data: T[],
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  },
  additionalMeta?: Omit<ApiMetadata, 'pagination'>
): void {
  const response: PaginatedResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...additionalMeta,
      pagination: {
        ...pagination,
        totalPages: Math.ceil(pagination.total / pagination.pageSize),
      },
    },
  };

  res.status(200).json(response);
}

/**
 * Handle async API route with error handling
 * @deprecated Use withErrorHandling middleware from @/middleware/errorHandling
 */
export function withApiHandler<T = unknown>(
  handler: (
    req: NextApiRequest,
    res: NextApiResponse<ApiResponse<T>>
  ) => Promise<void>
) {
  return async (
    req: NextApiRequest,
    res: NextApiResponse<ApiResponse<T>>
  ): Promise<void> => {
    try {
      await handler(req, res);
    } catch (error) {
      // Check if response was already sent
      if (res.headersSent) {
        logger.error('Error after response sent:', error);
        return;
      }

      // Handle different error types
      if (error instanceof ApplicationError) {
        res.status(error.statusCode).json({
          success: false,
          error: {
            code: error.code as any,
            message: error.message,
          },
        });
      } else if (error instanceof Error) {
        if (error.message.includes('Unauthorized')) {
          throw new ApplicationError(
            ErrorCode.AUTH_UNAUTHORIZED,
            error.message,
            401
          );
        } else if (error.message.includes('Forbidden')) {
          throw new ApplicationError(
            ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS,
            error.message,
            403
          );
        } else if (error.message.includes('not found')) {
          throw new ApplicationError(
            ErrorCode.DB_RECORD_NOT_FOUND,
            error.message,
            404
          );
        } else if (error.message.includes('Validation')) {
          throw new ApplicationError(
            ErrorCode.VALIDATION_FAILED,
            error.message,
            400
          );
        } else {
          throw new ApplicationError(
            ErrorCode.INTERNAL_ERROR,
            error.message,
            500
          );
        }
      } else {
        throw new ApplicationError(
          ErrorCode.UNKNOWN_ERROR,
          'An unexpected error occurred',
          500
        );
      }
    }
  };
}

// Re-export for convenience
export type { NextApiRequest } from 'next';
