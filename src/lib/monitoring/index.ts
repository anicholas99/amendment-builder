import { logger as appLogger } from './logger';
import { performanceMonitor } from './performance';

// Re-export for easy access
export const logger = appLogger;
export const performance = performanceMonitor;

/**
 * Safely convert an object to a string for logging
 * Prevents circular references from causing huge object dumps
 */
export function safeStringify(obj: unknown): string {
  try {
    // Handle circular references with a cache
    const cache: unknown[] = [];
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        // Check for circular references
        if (cache.includes(value)) {
          return '[Circular Reference]';
        }
        cache.push(value);
      }
      return value;
    });
  } catch (error) {
    return '[Object could not be stringified]';
  }
}

// Add the safeStringify call to all logging functions that handle objects
// e.g., where logger.log(obj) is called, replace with logger.log(safeStringify(obj))
