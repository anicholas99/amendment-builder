/**
 * Performance monitoring utilities for project switching
 */
import { logger } from '@/lib/monitoring/logger';

interface PerformanceTimer {
  start: number;
  operation: string;
}

class PerformanceMonitor {
  private timers: Map<string, PerformanceTimer> = new Map();

  startTimer(operation: string, id?: string): string {
    const timerId = id || `${operation}-${Date.now()}`;
    this.timers.set(timerId, {
      start: performance.now(),
      operation,
    });
    logger.debug(`[Performance] Started: ${operation}`, { timerId });
    return timerId;
  }

  endTimer(timerId: string): number | null {
    const timer = this.timers.get(timerId);
    if (!timer) {
      logger.warn(`[Performance] Timer not found: ${timerId}`);
      return null;
    }

    const duration = performance.now() - timer.start;
    this.timers.delete(timerId);

    logger.debug(`[Performance] Completed: ${timer.operation}`, {
      duration: `${duration.toFixed(2)}ms`,
      timerId,
    });

    return duration;
  }

  timeAsync<T>(operation: string, asyncFn: () => Promise<T>): Promise<T> {
    const timerId = this.startTimer(operation);
    return asyncFn().finally(() => {
      this.endTimer(timerId);
    });
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Convenience functions
export const timeProjectSwitch = (projectId: string) =>
  performanceMonitor.startTimer('Project Switch', `switch-${projectId}`);

export const endProjectSwitch = (timerId: string) =>
  performanceMonitor.endTimer(timerId);

export const timeAsyncOperation = <T>(
  operation: string,
  asyncFn: () => Promise<T>
) => performanceMonitor.timeAsync(operation, asyncFn);
