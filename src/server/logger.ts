/**
 * Server-side logger for the Patent Drafter application
 *
 * This is the ONLY logger that should be used in server-side code:
 * - API routes (src/pages/api/*)
 * - Server services (src/server/*)
 * - Repositories (src/repositories/*)
 * - Server middleware
 *
 * DO NOT use clientLogger in server code!
 */

import winston from 'winston';
import { environment } from '@/config/environment';
import { createTransports, sanitizeLogData } from './monitoring/logger-config';

// Create the Winston logger instance
const winstonLogger = winston.createLogger({
  level: environment.logging.level || 'info',
  transports: createTransports(environment.env),
  exitOnError: false,
});

// Export LogLevel type for compatibility
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Simple, clean logger interface matching client logger API
export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => {
    winstonLogger.debug(message, sanitizeLogData(context));
  },

  info: (message: string, context?: Record<string, unknown>) => {
    winstonLogger.info(message, sanitizeLogData(context));
  },

  warn: (message: string, context?: Record<string, unknown>) => {
    winstonLogger.warn(message, sanitizeLogData(context));
  },

  error: (message: string, errorOrContext?: unknown) => {
    if (errorOrContext instanceof Error) {
      winstonLogger.error(message, {
        error: sanitizeLogData({
          name: errorOrContext.name,
          message: errorOrContext.message,
          stack: errorOrContext.stack,
        }),
      });
    } else {
      winstonLogger.error(message, sanitizeLogData(errorOrContext));
    }
  },

  // Alias for compatibility
  log: (message: string, context?: Record<string, unknown>) => {
    winstonLogger.info(message, sanitizeLogData(context));
  },
};

// Type for logger interface (shared between client and server)
export type Logger = typeof logger;

/**
 * Safely convert an object to a string for logging
 * Prevents circular references from causing errors or huge object dumps
 */
export function safeStringify(obj: unknown): string {
  const maxDepth = 3;
  const maxArrayItems = 5;
  const maxStringLength = 500;

  try {
    // For simple non-objects, just return
    if (obj === null || obj === undefined || typeof obj !== 'object') {
      if (typeof obj === 'string' && obj.length > maxStringLength) {
        return obj.substring(0, maxStringLength) + '... [truncated]';
      }
      return String(obj);
    }

    // Handle Error objects specially
    if (obj instanceof Error) {
      return JSON.stringify({
        name: obj.name,
        message: obj.message.substring(0, maxStringLength),
        stack: obj.stack?.split('\n').slice(0, 3).join('\n'), // Only include first 3 lines of stack
      });
    }

    // Handle circular references with a cache and depth tracking
    const cache: unknown[] = [];
    let depth = 0;

    const result = JSON.stringify(
      obj,
      (key, value) => {
        // Skip internal Node.js or network stack properties that often lead to circular refs
        if (
          key === '_httpMessage' ||
          key === 'socket' ||
          key === 'connection' ||
          key === 'req' ||
          key === 'res' ||
          key === 'parser' ||
          key === '_events' ||
          key === '_eventsCount' ||
          key === '_idleNext' ||
          key === '_idlePrev' ||
          key === 'client' ||
          key === '_writableState' ||
          key === '_readableState'
        ) {
          return '[Internal]';
        }

        // Skip very large string values
        if (typeof value === 'string' && value.length > maxStringLength) {
          return value.substring(0, maxStringLength) + '... [truncated]';
        }

        // Truncate large arrays
        if (Array.isArray(value) && value.length > maxArrayItems) {
          return [
            ...value.slice(0, maxArrayItems),
            `... and ${value.length - maxArrayItems} more items`,
          ];
        }

        if (typeof value === 'object' && value !== null) {
          // Check depth
          if (depth > maxDepth) {
            return '[Max Depth Reached]';
          }

          // Check for circular references
          if (cache.includes(value)) {
            return '[Circular Reference]';
          }
          cache.push(value);
          depth++;
        }
        return value;
      },
      2
    );

    // Limit the length if it's extremely long
    const maxLength = 1000;
    if (result && result.length > maxLength) {
      return result.substring(0, maxLength) + '... [truncated]';
    }

    return result;
  } catch (error) {
    return `[Object could not be stringified: ${error instanceof Error ? error.message : String(error)}]`;
  }
}
