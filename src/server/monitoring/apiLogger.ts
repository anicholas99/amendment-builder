import { NextApiRequest } from 'next';
import { logger } from '@/server/logger';
import { safeStringify } from '@/server/logger';
import { CustomApiRequest } from '@/types/api';
import crypto from 'crypto';
import { environment } from '@/config/environment';

export interface ApiLogContext {
  method?: string;
  url?: string;
  query?: Record<string, unknown>;
  body?: unknown;
  userId?: string;
  errorMessage?: string;
  errorDetails?: unknown;
  stack?: string;
  [key: string]: unknown;
}

export class ApiLogger {
  private routeName: string;
  private requestId: string;
  private startTime: number;

  constructor(routeName: string) {
    this.routeName = routeName;
    this.requestId = crypto.randomUUID();
    this.startTime = Date.now();
  }

  private enrichContext(context?: ApiLogContext): ApiLogContext {
    return {
      routeName: this.routeName,
      requestId: this.requestId,
      timestamp: new Date().toISOString(),
      ...context,
    };
  }

  debug(message: string, context?: ApiLogContext) {
    logger.debug(`[API] ${message}`, this.enrichContext(context));
  }

  info(message: string, context?: ApiLogContext) {
    logger.info(`[API] ${message}`, this.enrichContext(context));
  }

  warn(message: string, context?: ApiLogContext) {
    logger.warn(`[API] ${message}`, this.enrichContext(context));
  }

  error(message: string, context?: ApiLogContext) {
    logger.error(`[API] ${message}`, this.enrichContext(context));
  }

  errorSafe(
    message: string,
    errorData: Error | string,
    context?: ApiLogContext
  ) {
    if (errorData instanceof Error) {
      this.error(message, {
        ...context,
        errorMessage: errorData.message,
        errorDetails: errorData.name,
        stack: errorData.stack?.substring(0, 1000),
      });
    } else {
      this.error(message, {
        ...context,
        errorMessage: errorData,
      });
    }
  }

  private getCleanHeaders(
    headers: Record<string, string | string[] | undefined>
  ): Record<string, unknown> {
    // Only log meaningful headers, exclude noisy ones
    const meaningfulHeaders = [
      'content-type',
      'x-tenant-slug',
      'x-api-key',
      'authorization',
      'x-request-id',
      'x-forwarded-for',
      'x-real-ip',
    ];

    const cleanHeaders: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(headers)) {
      const lowerKey = key.toLowerCase();
      if (meaningfulHeaders.includes(lowerKey)) {
        // Redact sensitive values
        if (lowerKey === 'authorization' || lowerKey === 'x-api-key') {
          cleanHeaders[key] = '[REDACTED]';
        } else {
          cleanHeaders[key] = value;
        }
      }
    }

    return cleanHeaders;
  }

  logRequest(req: NextApiRequest | CustomApiRequest) {
    // Only log request details for non-GET requests or when there are errors
    // GET requests with successful responses are too noisy
    if (req.method !== 'GET' || !environment.isProduction) {
      const context: ApiLogContext = {
        method: req.method,
        url: req.url,
      };

      // Only include query params if they contain meaningful information
      if (req.query && Object.keys(req.query).length > 0) {
        context.query = req.query;
      }

      // Only include headers if they contain meaningful information
      const cleanHeaders = this.getCleanHeaders(
        req.headers as Record<string, string | string[] | undefined>
      );
      if (Object.keys(cleanHeaders).length > 0) {
        context.headers = cleanHeaders;
      }

      // Only include body for mutation requests
      if (req.method !== 'GET' && req.body) {
        context.body = req.body;
      }

      // Only log if it's a mutation or has meaningful context
      if (req.method !== 'GET' || Object.keys(context).length > 2) {
        this.debug('Request', this.enrichContext(context));
      }
    }
  }

  logResponse(statusCode: number, body?: unknown) {
    const duration = Date.now() - this.startTime;

    // Only log responses that are interesting (errors, slow requests, mutations)
    const isError = statusCode >= 400;
    const isSlow = duration > 1000; // Slow if > 1 second
    const isMutation =
      this.routeName?.includes('POST') ||
      this.routeName?.includes('PUT') ||
      this.routeName?.includes('DELETE');

    if (isError || isSlow || isMutation || !environment.isProduction) {
      const context: ApiLogContext = {
        statusCode,
        duration: `${duration}ms`,
      };

      // Include body details for errors
      if (isError && body) {
        context.body = safeStringify(body).substring(0, 500);
      }

      // Use appropriate log level
      if (isError) {
        this.error('Request failed', context);
      } else if (isSlow) {
        this.warn('Slow response', context);
      } else {
        this.info('Response', context);
      }
    }
  }

  logError(error: Error, context?: ApiLogContext) {
    this.error('Request failed', {
      ...context,
      errorMessage: error.message,
      errorDetails: error.name,
      stack: error.stack?.substring(0, 1000),
      duration: `${Date.now() - this.startTime}ms`,
    });
  }
}

export function createApiLogger(routeName: string): ApiLogger {
  return new ApiLogger(routeName);
}
