/**
 * Performance monitoring utility for tracking slow API calls
 *
 * This utility helps identify performance bottlenecks in production
 * by tracking API call durations and logging slow requests.
 */

import { logger } from '@/utils/clientLogger';

interface PerformanceMetric {
  endpoint: string;
  duration: number;
  timestamp: number;
  method: string;
}

// Thresholds for logging (in milliseconds)
const SLOW_REQUEST_THRESHOLD = 1000; // 1 second
const VERY_SLOW_REQUEST_THRESHOLD = 3000; // 3 seconds

// Store recent metrics for analysis (in-memory, cleared on page refresh)
const recentMetrics: PerformanceMetric[] = [];
const MAX_METRICS_STORED = 100;

/**
 * Sanitize endpoint URL to remove sensitive data
 */
function sanitizeEndpoint(endpoint: string): string {
  return endpoint
    .replace(
      /\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi,
      '/[ID]'
    )
    .replace(/\/\d{4,}/g, '/[NUM]') // Replace long numbers
    .replace(/\?.*$/, '') // Remove query parameters
    .replace(/\/auth0\|[a-zA-Z0-9]+/g, '/[USER]'); // Remove auth0 user IDs
}

/**
 * Track an API call's performance
 * @param endpoint - The API endpoint being called
 * @param method - HTTP method (GET, POST, etc.)
 * @param startTime - When the request started (from performance.now())
 */
export function trackApiPerformance(
  endpoint: string,
  method: string,
  startTime: number
): void {
  const duration = performance.now() - startTime;
  const sanitizedEndpoint = sanitizeEndpoint(endpoint);

  const metric: PerformanceMetric = {
    endpoint: sanitizedEndpoint,
    method,
    duration,
    timestamp: Date.now(),
  };

  // Store metric
  recentMetrics.push(metric);
  if (recentMetrics.length > MAX_METRICS_STORED) {
    recentMetrics.shift(); // Remove oldest
  }

  // Use the logger's performance method for consistent formatting
  logger.performance(`${method} ${sanitizedEndpoint}`, duration);
}

/**
 * Get performance statistics for recent API calls
 */
export function getPerformanceStats() {
  if (recentMetrics.length === 0) {
    return null;
  }

  const durations = recentMetrics.map(m => m.duration);
  const sorted = [...durations].sort((a, b) => a - b);

  return {
    count: recentMetrics.length,
    average: Math.round(
      durations.reduce((a, b) => a + b, 0) / durations.length
    ),
    median: Math.round(sorted[Math.floor(sorted.length / 2)]),
    p95: Math.round(sorted[Math.floor(sorted.length * 0.95)]),
    slowest: Math.round(Math.max(...durations)),
    slowRequests: recentMetrics.filter(
      m => m.duration >= SLOW_REQUEST_THRESHOLD
    ).length,
  };
}

/**
 * Get the slowest endpoints from recent metrics
 */
export function getSlowestEndpoints(limit: number = 5) {
  const endpointStats = new Map<
    string,
    { total: number; count: number; max: number }
  >();

  recentMetrics.forEach(metric => {
    const key = `${metric.method} ${metric.endpoint}`;
    const existing = endpointStats.get(key) || { total: 0, count: 0, max: 0 };

    endpointStats.set(key, {
      total: existing.total + metric.duration,
      count: existing.count + 1,
      max: Math.max(existing.max, metric.duration),
    });
  });

  const endpoints = Array.from(endpointStats.entries())
    .map(([endpoint, stats]) => ({
      endpoint,
      avgDuration: Math.round(stats.total / stats.count),
      maxDuration: Math.round(stats.max),
      count: stats.count,
    }))
    .sort((a, b) => b.avgDuration - a.avgDuration)
    .slice(0, limit);

  return endpoints;
}

/**
 * Clear all stored metrics
 */
export function clearPerformanceMetrics(): void {
  recentMetrics.length = 0;
}

/**
 * Log current performance stats (useful for debugging)
 * This method sanitizes all output to prevent information leakage
 */
export function logPerformanceReport(): void {
  const stats = getPerformanceStats();
  const slowest = getSlowestEndpoints();

  if (!stats) {
    logger.info('No performance metrics collected yet');
    return;
  }

  logger.info('API Performance Summary', {
    totalRequests: stats.count,
    avgDuration: `${stats.average}ms`,
    p95Duration: `${stats.p95}ms`,
    slowRequests: stats.slowRequests,
  });

  if (slowest.length > 0) {
    logger.info('Slowest endpoints', {
      endpoints: slowest.map(e => ({
        endpoint: e.endpoint,
        avgTime: `${e.avgDuration}ms`,
        calls: e.count,
      })),
    });
  }
}
