/**
 * Performance Monitoring Utilities
 *
 * Provides tools for measuring and tracking application performance metrics
 */

import { logger } from './logger';

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

interface PerformanceThresholds {
  warning: number;
  error: number;
}

// Type for class constructor
type Constructor = new (...args: unknown[]) => unknown;

// Custom types for Express-like middleware
interface ExpressRequest {
  method: string;
  route?: { path: string };
  path: string;
  [key: string]: unknown;
}

interface ExpressResponse {
  statusCode: number;
  on(event: string, listener: () => void): void;
  [key: string]: unknown;
}

type NextFunction = () => void;

/**
 * Performance monitor class for tracking operation timings
 */
export class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private activeTimers: Map<string, number> = new Map();
  private thresholds: Map<string, PerformanceThresholds> = new Map();

  /**
   * Start timing an operation
   * @param name - Name of the operation
   * @param metadata - Optional metadata to attach to the metric
   */
  startTimer(name: string, metadata?: Record<string, unknown>): void {
    const startTime = performance.now();
    const key = this.generateKey(name, metadata);
    this.activeTimers.set(key, startTime);
  }

  /**
   * End timing an operation and record the metric
   * @param name - Name of the operation
   * @param metadata - Optional metadata (should match startTimer)
   * @returns Duration in milliseconds
   */
  endTimer(name: string, metadata?: Record<string, unknown>): number {
    const key = this.generateKey(name, metadata);
    const startTime = this.activeTimers.get(key);

    if (!startTime) {
      logger.warn(`No active timer found for operation: ${name}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.activeTimers.delete(key);

    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: new Date(),
      metadata,
    };

    this.recordMetric(metric);
    this.checkThresholds(metric);

    return duration;
  }

  /**
   * Measure an async operation
   * @param name - Name of the operation
   * @param operation - Async function to measure
   * @param metadata - Optional metadata
   * @returns Result of the operation
   */
  async measure<T>(
    name: string,
    operation: () => Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    this.startTimer(name, metadata);
    try {
      const result = await operation();
      const duration = this.endTimer(name, metadata);

      logger.debug(`Operation "${name}" completed`, {
        duration: `${duration.toFixed(2)}ms`,
        metadata,
      });

      return result;
    } catch (error) {
      const duration = this.endTimer(name, metadata);

      logger.error(`Operation "${name}" failed`, {
        duration: `${duration.toFixed(2)}ms`,
        error: error instanceof Error ? error.message : String(error),
        metadata,
      });

      throw error;
    }
  }

  /**
   * Set performance thresholds for a specific operation
   * @param name - Name of the operation
   * @param thresholds - Warning and error thresholds in milliseconds
   */
  setThresholds(name: string, thresholds: PerformanceThresholds): void {
    this.thresholds.set(name, thresholds);
  }

  /**
   * Get performance statistics for an operation
   * @param name - Name of the operation
   * @returns Performance statistics
   */
  getStats(name: string): {
    count: number;
    average: number;
    min: number;
    max: number;
    p95: number;
    p99: number;
  } | null {
    const metrics = this.metrics.get(name);
    if (!metrics || metrics.length === 0) {
      return null;
    }

    const durations = metrics.map(m => m.duration).sort((a, b) => a - b);
    const count = durations.length;
    const sum = durations.reduce((acc, d) => acc + d, 0);

    return {
      count,
      average: sum / count,
      min: durations[0],
      max: durations[count - 1],
      p95: this.percentile(durations, 0.95),
      p99: this.percentile(durations, 0.99),
    };
  }

  /**
   * Clear all recorded metrics
   */
  clear(): void {
    this.metrics.clear();
    this.activeTimers.clear();
  }

  /**
   * Export all metrics as JSON
   */
  export(): Record<string, PerformanceMetric[]> {
    const result: Record<string, PerformanceMetric[]> = {};
    this.metrics.forEach((metrics, name) => {
      result[name] = metrics;
    });
    return result;
  }

  private generateKey(
    name: string,
    metadata?: Record<string, unknown>
  ): string {
    if (!metadata) return name;
    const metaStr = JSON.stringify(metadata, Object.keys(metadata).sort());
    return `${name}:${metaStr}`;
  }

  recordMetric(metric: PerformanceMetric): void {
    const metrics = this.metrics.get(metric.name) || [];
    metrics.push(metric);

    // Keep only last 1000 metrics per operation
    if (metrics.length > 1000) {
      metrics.shift();
    }

    this.metrics.set(metric.name, metrics);
  }

  private checkThresholds(metric: PerformanceMetric): void {
    const threshold = this.thresholds.get(metric.name);
    if (!threshold) return;

    if (metric.duration > threshold.error) {
      logger.error(`Performance threshold exceeded for "${metric.name}"`, {
        duration: `${metric.duration.toFixed(2)}ms`,
        threshold: `${threshold.error}ms`,
        metadata: metric.metadata,
      });
    } else if (metric.duration > threshold.warning) {
      logger.warn(`Performance warning for "${metric.name}"`, {
        duration: `${metric.duration.toFixed(2)}ms`,
        threshold: `${threshold.warning}ms`,
        metadata: metric.metadata,
      });
    }
  }

  private percentile(sortedValues: number[], p: number): number {
    const index = Math.ceil(sortedValues.length * p) - 1;
    return sortedValues[Math.max(0, index)];
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Decorator for measuring method performance
 * @param name - Optional name for the metric (defaults to method name)
 */
export function MeasurePerformance(name?: string) {
  return function (
    target: object,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const metricName = name || `${target.constructor.name}.${propertyName}`;

    descriptor.value = async function (this: unknown, ...args: unknown[]) {
      return performanceMonitor.measure(
        metricName,
        () => originalMethod.apply(this, args),
        { className: target.constructor.name, method: propertyName }
      );
    };

    return descriptor;
  };
}

/**
 * Express middleware for tracking route performance
 */
export function performanceMiddleware() {
  return (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
    const start = performance.now();
    const route = `${req.method} ${req.route?.path || req.path}`;

    res.on('finish', () => {
      const duration = performance.now() - start;
      performanceMonitor.recordMetric({
        name: 'http_request',
        duration,
        timestamp: new Date(),
        metadata: {
          method: req.method,
          path: req.route?.path || req.path,
          statusCode: res.statusCode,
          route,
        },
      });

      if (duration > 1000) {
        logger.warn('Slow API request', {
          route,
          duration: `${duration.toFixed(2)}ms`,
          statusCode: res.statusCode,
        });
      }
    });

    next();
  };
}

// Set default thresholds for common operations
performanceMonitor.setThresholds('database_query', {
  warning: 100,
  error: 500,
});
performanceMonitor.setThresholds('api_request', { warning: 500, error: 2000 });
performanceMonitor.setThresholds('ai_completion', {
  warning: 5000,
  error: 30000,
});
