/**
 * Unified Error Handling Middleware
 *
 * This middleware provides consistent error handling across all API routes
 * using the ApplicationError system.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/lib/monitoring/logger';
import { ZodError } from 'zod';

/**
 * Extract request metadata for logging
 */
function getRequestMetadata(req: NextApiRequest) {
  return {
    method: req.method,
    url: req.url,
    query: req.query,
    userId: (req as any).user?.id,
    tenantId: (req as any).user?.tenantId,
  };
}

/**
 * Error handling middleware
 */
export function withErrorHandling<T extends NextApiRequest = NextApiRequest>(
  handler: (req: T, res: NextApiResponse) => Promise<void>
) {
  return async (req: T, res: NextApiResponse) => {
    try {
      await handler(req, res);
    } catch (error) {
      const requestMetadata = getRequestMetadata(req);

      let appError: ApplicationError;

      if (error instanceof ApplicationError) {
        appError = error;
      } else if (error instanceof ZodError) {
        appError = new ApplicationError(
          ErrorCode.INVALID_INPUT,
          error.message,
          400
        );
      } else if (error instanceof Error) {
        appError = new ApplicationError(
          ErrorCode.INTERNAL_ERROR,
          error.message,
          500
        );
      } else {
        appError = new ApplicationError(
          ErrorCode.UNKNOWN_ERROR,
          'An unknown error occurred',
          500
        );
      }

      logger.error('[API Error]', {
        code: appError.code,
        message: appError.message,
        statusCode: appError.statusCode,
        request: requestMetadata,
        stack: appError.stack,
      });

      res.status(appError.statusCode).json({
        error: {
          code: appError.code,
          message: appError.message,
        },
      });
    }
  };
}

/**
 * Create typed error thrower functions for common scenarios
 */
export const throwNotFound = (resource: string, id?: string) => {
  throw new ApplicationError(
    ErrorCode.DB_RECORD_NOT_FOUND,
    id ? `${resource} with ID ${id} not found` : `${resource} not found`
  );
};

export const throwUnauthorized = (message?: string) => {
  throw new ApplicationError(
    ErrorCode.AUTH_UNAUTHORIZED,
    message || 'You are not authorized to perform this action'
  );
};

export const throwForbidden = (message?: string) => {
  throw new ApplicationError(
    ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS,
    message || 'You do not have permission to access this resource'
  );
};

export const throwValidationError = (message: string, details?: any) => {
  throw new ApplicationError(ErrorCode.VALIDATION_FAILED, message, details);
};

export const throwTenantError = (message?: string) => {
  throw new ApplicationError(
    ErrorCode.TENANT_ACCESS_DENIED,
    message || 'You do not have access to this organization'
  );
};
