import winston from 'winston';
import { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';
import {
  createTransports,
  LOG_LEVELS,
  sanitizeLogData,
  createContextLogger,
  LogContext,
} from './logger-config';
import { environment } from '@/config/environment';

// Custom interfaces
interface AuthenticatedRequest extends NextApiRequest {
  requestId?: string;
  logger?: winston.Logger;
  user?: {
    id: string;
    [key: string]: unknown;
  };
}

interface ErrorInfo {
  name?: string;
  message: string;
  stack?: string;
  type?: string;
  [key: string]: unknown;
}

// Get environment
const env = environment.env;

// Create the main logger instance
export const enhancedLogger = winston.createLogger({
  levels: LOG_LEVELS,
  level: environment.logging.level,
  transports: createTransports(env),
  exitOnError: false,
});

// Request logger middleware for Next.js API routes
export function createRequestLogger() {
  return function requestLogger(
    req: AuthenticatedRequest,
    res: NextApiResponse,
    next?: () => void
  ) {
    const start = Date.now();
    const requestId = req.requestId || uuidv4();
    req.requestId = requestId;

    // Extract context from request
    const context: LogContext = {
      requestId,
      method: req.method || 'UNKNOWN',
      path: req.url || '',
      ip:
        (req.headers['x-forwarded-for'] as string) || req.socket?.remoteAddress,
      userAgent: req.headers['user-agent'],
      userId: req.user?.id,
      tenantId: req.headers['x-tenant-slug'] as string,
    };

    // Create a child logger for this request
    const reqLogger = createContextLogger(enhancedLogger, context);
    req.logger = reqLogger;

    // Log request
    reqLogger.info('Incoming request', {
      query: sanitizeLogData(req.query),
      headers: sanitizeLogData(req.headers),
    });

    // For Next.js API routes, we need to intercept differently
    if (res && !next) {
      // Override res.json and res.send
      const originalJson = res.json.bind(res);
      const originalSend = res.send.bind(res);

      res.json = function <T = unknown>(data: T) {
        const duration = Date.now() - start;
        reqLogger.info('Request completed', {
          statusCode: res.statusCode || 200,
          duration,
          responseType: 'json',
        });
        return originalJson(data);
      };

      res.send = function (data: unknown) {
        const duration = Date.now() - start;
        reqLogger.info('Request completed', {
          statusCode: res.statusCode || 200,
          duration,
          responseType: 'send',
        });
        return originalSend(data);
      };
    }

    // If next is provided, call it (for middleware usage)
    if (next) {
      next();
    }
  };
}

// Performance logger
export class PerformanceLogger {
  private timers: Map<string, number> = new Map();

  start(operation: string, context?: LogContext) {
    const startTime = Date.now();
    this.timers.set(operation, startTime);

    enhancedLogger.debug(`Performance: Starting ${operation}`, context);
  }

  end(operation: string, context?: LogContext) {
    const startTime = this.timers.get(operation);
    if (!startTime) {
      enhancedLogger.warn(`Performance: No start time found for ${operation}`);
      return;
    }

    const duration = Date.now() - startTime;
    this.timers.delete(operation);

    const level = duration > 1000 ? 'warn' : 'debug';
    enhancedLogger.log(level, `Performance: ${operation} completed`, {
      ...context,
      duration,
      operation,
    });
  }
}

// Database query logger
export function logDatabaseQuery(
  query: string,
  params?: unknown[],
  duration?: number
) {
  const context: LogContext = {
    query: query.length > 200 ? query.substring(0, 200) + '...' : query,
    params: sanitizeLogData(params),
    duration,
  };

  if (duration && duration > 500) {
    enhancedLogger.warn('Slow database query detected', context);
  } else {
    enhancedLogger.debug('Database query executed', context);
  }
}

// API call logger
export function logApiCall(
  service: string,
  endpoint: string,
  method: string,
  statusCode?: number,
  duration?: number,
  error?: Error
) {
  const context: LogContext = {
    service,
    endpoint,
    method,
    statusCode,
    duration,
    error: error
      ? sanitizeLogData({
          message: error.message,
          stack: error.stack,
        })
      : undefined,
  };

  if (error || (statusCode && statusCode >= 400)) {
    enhancedLogger.error(`External API call failed: ${service}`, context);
  } else if (duration && duration > 2000) {
    enhancedLogger.warn(`Slow external API call: ${service}`, context);
  } else {
    enhancedLogger.info(`External API call: ${service}`, context);
  }
}

// Business event logger
export function logBusinessEvent(
  eventType: string,
  eventData: Record<string, unknown>,
  userId?: string,
  tenantId?: string
) {
  const context: LogContext = {
    eventType,
    eventData: sanitizeLogData(eventData),
    userId,
    tenantId,
    timestamp: new Date().toISOString(),
  };

  enhancedLogger.info(`Business event: ${eventType}`, context);
}

// Error logger with stack trace parsing
export function logError(error: Error | unknown, context?: LogContext) {
  let errorInfo: ErrorInfo;

  if (error instanceof Error) {
    errorInfo = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      // Include any custom error properties
      ...Object.getOwnPropertyNames(error).reduce(
        (acc, key) => {
          if (!['name', 'message', 'stack'].includes(key)) {
            acc[key] = (error as unknown as Record<string, unknown>)[key];
          }
          return acc;
        },
        {} as Record<string, unknown>
      ),
    };
  } else {
    errorInfo = {
      message: String(error),
      type: typeof error,
    };
  }

  enhancedLogger.error('Application error', {
    ...context,
    error: sanitizeLogData(errorInfo),
  });
}

// Audit logger for compliance
export function logAuditEvent(
  action: string,
  resourceType: string,
  resourceId: string,
  userId: string,
  tenantId: string,
  changes?: Record<string, unknown>
) {
  const context: LogContext = {
    action,
    resourceType,
    resourceId,
    userId,
    tenantId,
    changes: sanitizeLogData(changes),
    timestamp: new Date().toISOString(),
  };

  enhancedLogger.info(`Audit: ${action} on ${resourceType}`, context);
}

// Export performance logger instance
export const perfLogger = new PerformanceLogger();

// Backward compatibility wrapper for existing logger
export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => {
    enhancedLogger.debug(message, sanitizeLogData(context));
  },
  info: (message: string, context?: Record<string, unknown>) => {
    enhancedLogger.info(message, sanitizeLogData(context));
  },
  warn: (message: string, context?: Record<string, unknown>) => {
    enhancedLogger.warn(message, sanitizeLogData(context));
  },
  error: (message: string, errorOrContext?: unknown) => {
    if (errorOrContext instanceof Error) {
      logError(errorOrContext, { message });
    } else {
      enhancedLogger.error(message, sanitizeLogData(errorOrContext));
    }
  },
  log: (message: string, context?: Record<string, unknown>) => {
    enhancedLogger.info(message, sanitizeLogData(context));
  },
};
