/**
 * Client-safe logger utility
 *
 * This logger is designed for use in client-side code where Node.js modules
 * like Winston are not available. It provides a consistent API with the
 * server logger but only outputs to console in development mode.
 *
 * Security: No sensitive data should be logged on the client side.
 * Performance: All logging is disabled in production builds.
 */

import { environment } from '@/config/environment';

// Client-side logger that respects environment settings
const isProduction = environment.isProduction;
const isDevelopment = environment.isDevelopment;

// Log levels
enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

// Get current log level from environment or localStorage
function getCurrentLogLevel(): LogLevel {
  if (isProduction) return LogLevel.ERROR;

  // Check localStorage first for runtime control
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('logLevel');
    if (stored) {
      const level = parseInt(stored, 10);
      if (!isNaN(level) && level >= 0 && level <= 3) {
        return level;
      }
    }
  }

  // Default to WARN in development to reduce noise
  return LogLevel.WARN;
}

// Helper to check if a log level is enabled
function isLogLevelEnabled(level: LogLevel): boolean {
  return level <= getCurrentLogLevel();
}

// Security: Filter out sensitive patterns from logs
const SENSITIVE_PATTERNS = [
  /\b(password|secret|token|key|auth|session|cookie)\b/gi,
  /\b(database|query|sql|prisma|repository)\b/gi,
  /\b(tenant|user)Id\s*:\s*["']?[\w-]+["']?/gi,
  /\b\d{4,}/g, // Long numbers that might be IDs
  /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, // UUIDs
];

// Sanitize log data to prevent information leakage
function sanitizeForClient(args: unknown[]): unknown[] {
  if (isProduction) return ['[REDACTED]'];

  return args.map(arg => {
    if (typeof arg === 'string') {
      let sanitized = arg;
      SENSITIVE_PATTERNS.forEach(pattern => {
        sanitized = sanitized.replace(pattern, '[FILTERED]');
      });
      return sanitized;
    }

    if (typeof arg === 'object' && arg !== null) {
      // Deep clone and sanitize objects
      try {
        const str = JSON.stringify(arg, (key, value) => {
          // Filter out sensitive keys
          if (
            /^(password|secret|token|key|auth|cookie|tenant|user)/.test(key)
          ) {
            return '[FILTERED]';
          }
          // Filter out internal implementation details
          if (/^(repository|database|query|sql|prisma)/.test(key)) {
            return '[INTERNAL]';
          }
          // Limit string lengths to prevent large dumps
          if (typeof value === 'string' && value.length > 200) {
            return value.substring(0, 200) + '...[truncated]';
          }
          return value;
        });
        return JSON.parse(str);
      } catch {
        return '[Complex Object]';
      }
    }

    return arg;
  });
}

// Performance tracking without exposing internals
const performanceThresholds = {
  fast: 200, // < 200ms
  normal: 1000, // < 1s
  slow: 3000, // < 3s
  verySlow: 5000, // >= 5s
};

export const clientLogger = {
  debug: (...args: unknown[]) => {
    if (isLogLevelEnabled(LogLevel.DEBUG)) {
      const sanitized = sanitizeForClient(args);
      console.debug('[DEBUG]', ...sanitized);
    }
  },

  info: (...args: unknown[]) => {
    if (isLogLevelEnabled(LogLevel.INFO)) {
      const sanitized = sanitizeForClient(args);
      console.info('[INFO]', ...sanitized);
    }
  },

  warn: (...args: unknown[]) => {
    if (isLogLevelEnabled(LogLevel.WARN)) {
      const sanitized = sanitizeForClient(args);
      console.warn('[WARN]', ...sanitized);
    }
  },

  error: (...args: unknown[]) => {
    if (isLogLevelEnabled(LogLevel.ERROR)) {
      const sanitized = sanitizeForClient(args);
      console.error('[ERROR]', ...sanitized);
    }
  },

  // Performance logging helper - sanitizes timing data
  performance: (operation: string, duration: number) => {
    if (!isLogLevelEnabled(LogLevel.INFO)) return;

    let level: 'info' | 'warn' = 'info';
    let status = 'completed';

    if (duration >= performanceThresholds.verySlow) {
      level = 'warn';
      status = 'very slow';
    } else if (duration >= performanceThresholds.slow) {
      level = 'warn';
      status = 'slow';
    } else if (duration >= performanceThresholds.normal) {
      status = 'normal';
    } else {
      status = 'fast';
    }

    const message = `[PERF] ${operation} ${status} (${duration}ms)`;

    if (level === 'warn' && isLogLevelEnabled(LogLevel.WARN)) {
      console.warn(message);
    } else if (isLogLevelEnabled(LogLevel.INFO)) {
      console.info(message);
    }
  },

  // Utility to set log level at runtime
  setLogLevel: (level: 'error' | 'warn' | 'info' | 'debug') => {
    if (typeof window === 'undefined') return;

    const levelMap = {
      error: LogLevel.ERROR,
      warn: LogLevel.WARN,
      info: LogLevel.INFO,
      debug: LogLevel.DEBUG,
    };

    localStorage.setItem('logLevel', String(levelMap[level]));
    console.log(`[Logger] Log level set to: ${level}`);
  },

  // Remove the non-standard 'log' alias
  // Use proper log levels instead
};

// Type for the logger
export type ClientLogger = typeof clientLogger;

// Re-export as logger for easy drop-in replacement
export const logger = clientLogger;

// Add helper to window in development for easy access
if (typeof window !== 'undefined' && isDevelopment) {
  (window as any).setLogLevel = clientLogger.setLogLevel;
  console.info(
    '[Logger] Set log level with: window.setLogLevel("error" | "warn" | "info" | "debug")'
  );
}
