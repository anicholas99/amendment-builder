import { NextApiRequest, NextApiResponse } from 'next';
import { randomUUID } from 'crypto';
import { ComposedHandler } from '@/types/middleware.d';
import { logger } from '@/server/logger';

// Extend NextApiRequest to include requestId
declare module 'next' {
  interface NextApiRequest {
    requestId?: string;
    logger?: {
      debug: (message: string, context?: Record<string, unknown>) => void;
      info: (message: string, context?: Record<string, unknown>) => void;
      warn: (message: string, context?: Record<string, unknown>) => void;
      error: (message: string, context?: unknown) => void;
    };
  }
}

/**
 * Middleware that adds a unique request ID to each request for tracking and correlation
 */
export function withRequestTracking<T = unknown>(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void
): ComposedHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Generate or extract request ID
    const requestId =
      (req.headers['x-request-id'] as string) ||
      (req.headers['x-correlation-id'] as string) ||
      randomUUID();

    // Add to request object
    req.requestId = requestId;

    // Add to response headers for client correlation
    res.setHeader('x-request-id', requestId);

    // Create a child logger with request context
    const requestLogger = {
      debug: (message: string, context?: Record<string, unknown>) =>
        logger.debug(message, { requestId, ...context }),
      info: (message: string, context?: Record<string, unknown>) =>
        logger.info(message, { requestId, ...context }),
      warn: (message: string, context?: Record<string, unknown>) =>
        logger.warn(message, { requestId, ...context }),
      error: (message: string, context?: unknown) => {
        if (typeof context === 'object' && context !== null) {
          logger.error(message, { requestId, ...context });
        } else {
          logger.error(message, { requestId, context });
        }
      },
    };

    // Store logger in request for use by handlers
    req.logger = requestLogger;

    // Log request start
    const startTime = Date.now();
    requestLogger.info('API request started', {
      method: req.method,
      path: req.url,
      userAgent: req.headers['user-agent'],
      ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
    });

    // Wrap response.end to log completion
    const originalEnd = res.end.bind(res);
    (res as any).end = function (...args: any[]) {
      const duration = Date.now() - startTime;

      requestLogger.info('API request completed', {
        method: req.method,
        path: req.url,
        statusCode: res.statusCode,
        duration,
      });

      // Call original end with whatever arguments were passed
      return originalEnd(...args);
    };

    try {
      return await handler(req, res);
    } catch (error) {
      const duration = Date.now() - startTime;

      requestLogger.error('API request failed', {
        method: req.method,
        path: req.url,
        duration,
        error:
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
              }
            : error,
      });

      throw error;
    }
  };
}
