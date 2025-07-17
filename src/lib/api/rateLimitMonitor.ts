import { logger } from '@/utils/clientLogger';
import { toast } from '@/hooks/use-toast';

interface RequestMetrics {
  count: number;
  windowStart: number;
}

class RateLimitMonitor {
  private requestCounts: Map<string, RequestMetrics> = new Map();
  private readonly WINDOW_SIZE_MS = 60000; // 1 minute window
  private readonly WARNING_THRESHOLD = 40; // Warn after 40 requests/min
  private readonly CRITICAL_THRESHOLD = 60; // Critical at 60 requests/min
  private hasShownWarning = false;
  private hasShownCritical = false;

  /**
   * Track a request
   */
  trackRequest(url: string): void {
    const now = Date.now();
    const endpoint = this.getEndpointFromUrl(url);

    let metrics = this.requestCounts.get(endpoint);

    // Initialize or reset if window expired
    if (!metrics || now - metrics.windowStart > this.WINDOW_SIZE_MS) {
      metrics = { count: 0, windowStart: now };
      this.requestCounts.set(endpoint, metrics);
      this.hasShownWarning = false;
      this.hasShownCritical = false;
    }

    metrics.count++;

    // Check thresholds
    if (metrics.count >= this.CRITICAL_THRESHOLD && !this.hasShownCritical) {
      this.hasShownCritical = true;
      logger.warn('[RateLimitMonitor] Critical request rate detected', {
        endpoint,
        count: metrics.count,
        window: `${this.WINDOW_SIZE_MS / 1000}s`,
      });

      // Show critical toast
      if (typeof window !== 'undefined') {
        toast({
          title: 'High Request Rate',
          description:
            'You are approaching the rate limit. Please wait a moment before continuing.',
          variant: 'destructive',
        });
      }
    } else if (
      metrics.count >= this.WARNING_THRESHOLD &&
      !this.hasShownWarning
    ) {
      this.hasShownWarning = true;
      logger.info('[RateLimitMonitor] Warning threshold reached', {
        endpoint,
        count: metrics.count,
        window: `${this.WINDOW_SIZE_MS / 1000}s`,
      });

      // Show warning toast
      if (typeof window !== 'undefined') {
        toast({
          title: 'Request Rate Warning',
          description:
            'You are making many requests. The app may slow down to prevent rate limiting.',
        });
      }
    }
  }

  /**
   * Get request count for an endpoint
   */
  getRequestCount(endpoint: string): number {
    const metrics = this.requestCounts.get(endpoint);
    if (!metrics) return 0;

    const now = Date.now();
    if (now - metrics.windowStart > this.WINDOW_SIZE_MS) {
      return 0;
    }

    return metrics.count;
  }

  /**
   * Check if we should delay a request
   */
  shouldDelayRequest(url: string): boolean {
    const endpoint = this.getEndpointFromUrl(url);
    const count = this.getRequestCount(endpoint);
    return count >= this.WARNING_THRESHOLD;
  }

  /**
   * Get delay time in ms based on current rate
   */
  getDelayTime(url: string): number {
    const endpoint = this.getEndpointFromUrl(url);
    const count = this.getRequestCount(endpoint);

    if (count >= this.CRITICAL_THRESHOLD) {
      return 5000; // 5 second delay when critical
    } else if (count >= this.WARNING_THRESHOLD) {
      return 2000; // 2 second delay when warning
    }

    return 0;
  }

  /**
   * Reset all counts
   */
  reset(): void {
    this.requestCounts.clear();
    this.hasShownWarning = false;
    this.hasShownCritical = false;
  }

  /**
   * Get metrics for debugging
   */
  getMetrics(): Record<string, { count: number; timeRemaining: number }> {
    const now = Date.now();
    const result: Record<string, { count: number; timeRemaining: number }> = {};

    for (const [endpoint, metrics] of Array.from(
      this.requestCounts.entries()
    )) {
      const timeElapsed = now - metrics.windowStart;
      const timeRemaining = Math.max(0, this.WINDOW_SIZE_MS - timeElapsed);

      if (timeRemaining > 0) {
        result[endpoint] = {
          count: metrics.count,
          timeRemaining: Math.ceil(timeRemaining / 1000), // Convert to seconds
        };
      }
    }

    return result;
  }

  /**
   * Extract endpoint pattern from URL
   */
  private getEndpointFromUrl(url: string): string {
    try {
      // Remove query params and extract path
      const urlObj = new URL(url, window.location.origin);
      const path = urlObj.pathname;

      // Group similar endpoints
      if (path.includes('/api/projects/') && path.includes('/versions')) {
        return '/api/projects/*/versions';
      } else if (
        path.includes('/api/projects/') &&
        path.includes('/prior-art')
      ) {
        return '/api/projects/*/prior-art';
      } else if (
        path.includes('/api/projects/') &&
        path.includes('/exclusions')
      ) {
        return '/api/projects/*/exclusions';
      } else if (
        path.includes('/api/projects/') &&
        path.includes('/claim-set-versions')
      ) {
        return '/api/projects/*/claim-set-versions';
      } else if (path.includes('/api/projects/')) {
        return '/api/projects/*';
      } else if (path.includes('/api/search-history')) {
        return '/api/search-history';
      } else if (path.includes('/api/tenants')) {
        return '/api/tenants';
      }

      return path;
    } catch {
      return url;
    }
  }
}

// Export singleton instance
export const rateLimitMonitor = new RateLimitMonitor();
