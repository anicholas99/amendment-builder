import { environment } from '@/config/environment';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  deduplicationWindow: number;
  maxObjectDepth: number;
  maxArrayItems: number;
  maxStringLength: number;
}

// Log deduplication cache
interface LogEntry {
  message: string;
  level: LogLevel;
  contextHash: string;
  count: number;
  lastLogged: number;
}

// TODO: Optional Azure Application Insights Integration
// To integrate with Azure Application Insights:
// 1. Install the applicationinsights package: npm install applicationinsights
// 2. Initialize in pages/_app.tsx or server startup:
//    import * as appInsights from 'applicationinsights';
//    appInsights.setup(process.env.APPINSIGHTS_INSTRUMENTATIONKEY).start();
// 3. Enhance this logger to send telemetry to Application Insights
// Note: The current logger already outputs to console, which Azure App Service
// captures in stdout/stderr logs automatically.

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Create a simple hash of an object for deduplication
 */
function createContextHash(obj: unknown): string {
  try {
    if (!obj) return '';
    const str = JSON.stringify(obj, Object.keys(obj as any).sort());
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  } catch {
    return '';
  }
}

/**
 * Truncate large arrays for logging
 */
function truncateArray(arr: unknown[], maxItems: number): unknown[] {
  if (arr.length <= maxItems) return arr;
  return [
    ...arr.slice(0, maxItems),
    `... and ${arr.length - maxItems} more items`,
  ];
}

/**
 * Truncate long strings
 */
function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '... [truncated]';
}

/**
 * Safely convert an object to a string for logging
 * Prevents circular references from causing huge object dumps
 */
export function safeStringify(
  obj: unknown,
  config?: Partial<LoggerConfig>
): string {
  const maxDepth = config?.maxObjectDepth ?? 3;
  const maxArrayItems = config?.maxArrayItems ?? 5;
  const maxStringLength = config?.maxStringLength ?? 500;

  try {
    // For simple non-objects, just return
    if (obj === null || obj === undefined || typeof obj !== 'object') {
      if (typeof obj === 'string') {
        return truncateString(String(obj), maxStringLength);
      }
      return String(obj);
    }

    // Handle Error objects specially
    if (obj instanceof Error) {
      return JSON.stringify({
        name: obj.name,
        message: truncateString(obj.message, maxStringLength),
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
          return truncateString(value, maxStringLength);
        }

        // Truncate large arrays
        if (Array.isArray(value) && value.length > maxArrayItems) {
          return truncateArray(value, maxArrayItems);
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

function getEnvironmentConfig(): LoggerConfig {
  const env = environment.env || 'development';

  switch (env) {
    case 'production':
      return {
        minLevel: 'info', // Changed from 'error' to 'info' for production
        enableConsole: true,
        deduplicationWindow: 5000, // 5 seconds
        maxObjectDepth: 2,
        maxArrayItems: 3,
        maxStringLength: 200,
      };
    case 'qa':
      return {
        minLevel: 'info',
        enableConsole: true,
        deduplicationWindow: 3000, // 3 seconds
        maxObjectDepth: 3,
        maxArrayItems: 5,
        maxStringLength: 300,
      };
    case 'development':
    default:
      return {
        minLevel: 'info', // Changed from 'debug' to reduce noise in development
        enableConsole: true,
        deduplicationWindow: 1000, // 1 second
        maxObjectDepth: 3,
        maxArrayItems: 5,
        maxStringLength: 500,
      };
  }
}

class Logger {
  private config: LoggerConfig;
  private logCache: Map<string, LogEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.config = getEnvironmentConfig();

    // Clean up old log entries periodically
    if (typeof window !== 'undefined') {
      this.cleanupInterval = setInterval(() => {
        const now = Date.now();
        const entriesToDelete: string[] = [];

        this.logCache.forEach((entry, key) => {
          if (now - entry.lastLogged > this.config.deduplicationWindow * 2) {
            entriesToDelete.push(key);
          }
        });

        entriesToDelete.forEach(key => this.logCache.delete(key));
      }, 10000); // Clean up every 10 seconds
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.minLevel];
  }

  private isDuplicate(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>
  ): boolean {
    const contextHash = createContextHash(context);
    const cacheKey = `${level}:${message}:${contextHash}`;
    const now = Date.now();

    const existing = this.logCache.get(cacheKey);
    if (
      existing &&
      now - existing.lastLogged < this.config.deduplicationWindow
    ) {
      existing.count++;
      existing.lastLogged = now;
      return true;
    }

    this.logCache.set(cacheKey, {
      message,
      level,
      contextHash,
      count: 1,
      lastLogged: now,
    });

    return false;
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>
  ): string {
    const timestamp = new Date().toISOString();
    // Use safeStringify with config to prevent circular reference issues
    const contextStr = context
      ? ` | context: ${safeStringify(context, this.config)}`
      : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
  }

  private _logInternal(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>
  ) {
    if (!this.shouldLog(level)) {
      return;
    }

    // Check for duplicate logs
    if (level !== 'error' && this.isDuplicate(level, message, context)) {
      return;
    }

    const formattedMessage = this.formatMessage(level, message, context);

    // Console logging
    if (this.config.enableConsole) {
      switch (level) {
        case 'debug':
          // eslint-disable-next-line no-console, no-restricted-syntax
          console.debug(formattedMessage);
          break;
        case 'info':
          // eslint-disable-next-line no-console, no-restricted-syntax
          console.info(formattedMessage);
          break;
        case 'warn':
          // eslint-disable-next-line no-console, no-restricted-syntax
          console.warn(formattedMessage);
          break;
        case 'error':
          // eslint-disable-next-line no-console, no-restricted-syntax
          console.error(formattedMessage);
          break;
      }
    }
  }

  debug(message: string, context?: Record<string, unknown>) {
    this._logInternal('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>) {
    this._logInternal('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>) {
    this._logInternal('warn', message, context);
  }

  error(message: string, ...args: unknown[]) {
    if (this.shouldLog('error')) {
      // For errors, we want to see the full context
      const context =
        args.length === 1 && typeof args[0] === 'object' && args[0] !== null
          ? (args[0] as Record<string, unknown>)
          : undefined;

      if (context) {
        this._logInternal('error', message, context);
      } else {
        // eslint-disable-next-line no-console, no-restricted-syntax
        console.error(this.formatMessage('error', message), ...args);
      }
    }
  }

  // Allow direct console usage for specific cases
  logDirect(message: string, ...args: unknown[]) {
    // eslint-disable-next-line no-console, no-restricted-syntax
    console.log(message, ...args);
  }

  // Alias replicating console.log semantics mapped to info level
  log(message: string, context?: Record<string, unknown>) {
    this._logInternal('info', message, context);
  }
}

// Export a singleton instance
export const logger = new Logger();

// Declare global type for logger
declare global {
  // eslint-disable-next-line no-var
  var logger: Logger | undefined;
}

// Make logger globally available for legacy code paths that reference global `logger`
// eslint-disable-next-line no-undef
(globalThis as any).logger = logger;

/**
 * Safely wraps primitive values in an object for logger compatibility
 * This ensures all logger calls receive Record<string, unknown> as expected
 */
export function safeLog(
  message: string,
  data?: unknown
): Record<string, unknown> {
  // If data is already an object (and not null), return it as-is
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return data as Record<string, unknown>;
  }

  // If data is a primitive or array, wrap it
  if (data !== undefined) {
    return { value: data };
  }

  // If only message provided, wrap the message
  return { message };
}

/**
 * Helper to wrap multiple values into a logger-compatible object
 */
export function logData(...args: unknown[]): Record<string, unknown> {
  if (args.length === 0) return {};
  if (args.length === 1) return safeLog('', args[0]);

  // Multiple arguments - create indexed object
  const result: Record<string, unknown> = {};
  args.forEach((arg, index) => {
    result[`arg${index}`] = arg;
  });
  return result;
}
