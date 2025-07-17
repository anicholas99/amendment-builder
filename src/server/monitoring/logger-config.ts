import winston from 'winston';
import { env as envConfig } from '@/config/env';
import { LogLevel } from '@/server/logger';
import { environment } from '@/config/environment';

// Use string literal type instead of importing Environment
export type Environment = 'development' | 'test' | 'production' | 'qa';

// Define log levels with priorities
export const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
} as const;

// Define colors for each log level
export const LOG_COLORS = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
} as const;

// Add colors to winston
winston.addColors(LOG_COLORS);

// Custom timestamp format
const timestampFormat = winston.format.timestamp({
  format: 'YYYY-MM-DD HH:mm:ss.SSS',
});

// Development format with colors and pretty printing
const developmentFormat = winston.format.combine(
  timestampFormat,
  winston.format.colorize({ all: true }),
  winston.format.errors({ stack: true }),
  winston.format.printf(
    ({
      timestamp,
      level,
      message,
      ...metadata
    }: winston.Logform.TransformableInfo) => {
      let msg = `${timestamp} [${level}]: ${message}`;

      // Add metadata if present
      if (Object.keys(metadata).length > 0) {
        // Handle errors specially
        if (metadata.error && metadata.error instanceof Error) {
          const { error, ...otherMetadata } = metadata;
          msg += `\n${error.stack}`;
          if (Object.keys(otherMetadata).length > 0) {
            msg += `\n${JSON.stringify(otherMetadata, null, 2)}`;
          }
        } else {
          msg += `\n${JSON.stringify(metadata, null, 2)}`;
        }
      }

      return msg;
    }
  )
);

// Production format - structured JSON logs
const productionFormat = winston.format.combine(
  timestampFormat,
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create transports based on environment
export function createTransports(env: Environment) {
  const transports: winston.transport[] = [];

  if (env === 'production') {
    // Console output for production (structured JSON)
    transports.push(
      new winston.transports.Console({
        format: productionFormat,
        level: 'info',
      })
    );

    // Error log file
    transports.push(
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: productionFormat,
        maxsize: 10485760, // 10MB
        maxFiles: 5,
      })
    );

    // Combined log file
    transports.push(
      new winston.transports.File({
        filename: 'logs/combined.log',
        level: 'info',
        format: productionFormat,
        maxsize: 10485760, // 10MB
        maxFiles: 10,
      })
    );
  } else {
    // Development console output (pretty printed)
    transports.push(
      new winston.transports.Console({
        format: developmentFormat,
        level: 'info',
      })
    );

    // Development debug file (optional)
    if (envConfig.LOG_TO_FILE) {
      transports.push(
        new winston.transports.File({
          filename: 'logs/debug.log',
          level: 'debug',
          format: developmentFormat,
          maxsize: 5242880, // 5MB
          maxFiles: 3,
        })
      );
    }
  }

  return transports;
}

// Utility to sanitize sensitive data from logs
export function sanitizeLogData<T>(data: T): T {
  if (!data) return data;

  const sensitiveKeys = [
    'password',
    'token',
    'apiKey',
    'secret',
    'authorization',
    'cookie',
    'creditCard',
    'ssn',
    'pin',
  ];

  if (typeof data === 'string') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeLogData) as T;
  }

  if (typeof data === 'object') {
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(
      data as Record<string, unknown>
    )) {
      const lowerKey = key.toLowerCase();

      if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeLogData(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized as T;
  }

  return data;
}

// Log context enrichment
export interface LogContext {
  userId?: string;
  tenantId?: string;
  projectId?: string;
  requestId?: string;
  ip?: string;
  userAgent?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  duration?: number;
  [key: string]: unknown;
}

// Create child logger with context
export function createContextLogger(
  logger: winston.Logger,
  context: LogContext
): winston.Logger {
  return logger.child({
    ...sanitizeLogData(context),
  });
}

interface LoggerRuntimeConfig {
  enableVerboseLogging: boolean;
  logCategories: {
    navigation: boolean;
    dataFetching: boolean;
    performance: boolean;
    userActions: boolean;
    errors: boolean;
    debug: boolean;
  };
}

// Runtime configuration that can be modified via browser console
const runtimeConfig: LoggerRuntimeConfig = {
  enableVerboseLogging: false,
  logCategories: {
    navigation: true,
    dataFetching: false,
    performance: false,
    userActions: true,
    errors: true,
    debug: false,
  },
};

// Development utilities
if (typeof window !== 'undefined' && environment.isDevelopment) {
  (window as any).__LOGGER_CONFIG__ = runtimeConfig;

  // Enable/disable verbose logging at runtime
  (window as any).enableVerboseLogging = () => {
    runtimeConfig.enableVerboseLogging = true;
    runtimeConfig.logCategories = {
      navigation: true,
      dataFetching: true,
      performance: true,
      userActions: true,
      errors: true,
      debug: true,
    };
    // Since we're in a browser context, we'll use a safe log approach
    if (environment.isDevelopment) {
      // eslint-disable-next-line no-console
      console.log(
        'Verbose logging enabled. All log categories are now active.'
      );
    }
  };

  (window as any).disableVerboseLogging = () => {
    runtimeConfig.enableVerboseLogging = false;
    runtimeConfig.logCategories = {
      navigation: true,
      dataFetching: false,
      performance: false,
      userActions: true,
      errors: true,
      debug: false,
    };
    // Since we're in a browser context, we'll use a safe log approach
    if (environment.isDevelopment) {
      // eslint-disable-next-line no-console
      console.log('Verbose logging disabled. Only essential logs are active.');
    }
  };

  (window as any).loggerConfig = () => {
    // Since we're in a browser context, we'll use a safe log approach
    if (environment.isDevelopment) {
      // eslint-disable-next-line no-console
      console.log('Verbose logging:', runtimeConfig.enableVerboseLogging);
      // eslint-disable-next-line no-console
      console.table(runtimeConfig.logCategories);
    }
    return runtimeConfig;
  };
}

export function shouldLogCategory(
  category: keyof LoggerRuntimeConfig['logCategories']
): boolean {
  return (
    runtimeConfig.enableVerboseLogging || runtimeConfig.logCategories[category]
  );
}

export function getMinLogLevel(env: Environment): LogLevel {
  // Override with verbose logging if enabled
  if (runtimeConfig.enableVerboseLogging) {
    return 'debug';
  }

  switch (env) {
    case 'production':
      return 'info';
    case 'qa':
      return 'info';
    case 'development':
    default:
      return 'info'; // Changed from debug to reduce noise - use runtime config for detailed logging
  }
}

export { runtimeConfig };
