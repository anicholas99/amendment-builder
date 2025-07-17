import { logger } from '@/utils/clientLogger';
import { rateLimitMonitor } from './rateLimitMonitor';

interface PendingRequest {
  promise: Promise<Response>;
  timestamp: number;
}

interface CachedResponse {
  data: any;
  timestamp: number;
  headers?: Record<string, string>;
}

class RequestManager {
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private responseCache: Map<string, CachedResponse> = new Map();
  private requestQueue: Array<() => Promise<void>> = [];
  private isProcessingQueue = false;

  // Configuration
  private readonly REQUEST_DELAY_MS = 100; // Minimum delay between requests
  private readonly CACHE_DURATION_MS = 30000; // Cache responses for 30 seconds
  private readonly PENDING_REQUEST_TIMEOUT = 5000; // Clear pending requests after 5 seconds
  private readonly MAX_CONCURRENT_REQUESTS = 3; // Limit concurrent requests

  private activeRequests = 0;

  /**
   * Get a unique key for the request
   */
  private getRequestKey(url: string, options?: RequestInit): string {
    const method = options?.method || 'GET';
    const body = options?.body ? JSON.stringify(options.body) : '';
    return `${method}:${url}:${body}`;
  }

  /**
   * Check if we have a valid cached response
   */
  private getCachedResponse(key: string): CachedResponse | null {
    const cached = this.responseCache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > this.CACHE_DURATION_MS;
    if (isExpired) {
      this.responseCache.delete(key);
      return null;
    }

    return cached;
  }

  /**
   * Process the request queue with rate limiting
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (
      this.requestQueue.length > 0 &&
      this.activeRequests < this.MAX_CONCURRENT_REQUESTS
    ) {
      const request = this.requestQueue.shift();
      if (request) {
        this.activeRequests++;
        request().finally(() => {
          this.activeRequests--;
        });

        // Add delay between requests to prevent rate limiting
        if (this.requestQueue.length > 0) {
          await new Promise(resolve =>
            setTimeout(resolve, this.REQUEST_DELAY_MS)
          );
        }
      }
    }

    this.isProcessingQueue = false;

    // Continue processing if there are more requests
    if (this.requestQueue.length > 0) {
      setTimeout(() => this.processQueue(), this.REQUEST_DELAY_MS);
    }
  }

  /**
   * Clean up old pending requests
   */
  private cleanupPendingRequests(): void {
    const now = Date.now();
    Array.from(this.pendingRequests.entries()).forEach(([key, pending]) => {
      if (now - pending.timestamp > this.PENDING_REQUEST_TIMEOUT) {
        this.pendingRequests.delete(key);
      }
    });
  }

  /**
   * Make a deduplicated, throttled request
   */
  async fetch(
    url: string,
    options?: RequestInit & { skipCache?: boolean; skipDedup?: boolean }
  ): Promise<Response> {
    const key = this.getRequestKey(url, options);

    // Clean up old pending requests periodically
    this.cleanupPendingRequests();

    // Check cache first (unless explicitly skipped)
    if (!options?.skipCache && (!options?.method || options.method === 'GET')) {
      const cachedResponse = this.getCachedResponse(key);
      if (cachedResponse) {
        // logger.debug('[RequestManager] Returning cached response', { url });
        return new Response(JSON.stringify(cachedResponse.data), {
          status: 200,
          headers: cachedResponse.headers || {},
        });
      }
    }

    // Check for pending request (deduplication)
    if (!options?.skipDedup) {
      const pending = this.pendingRequests.get(key);
      if (pending) {
        // logger.debug('[RequestManager] Deduplicating request', { url });
        return pending.promise.then(response => response.clone());
      }
    }

    // Create the request function
    const makeRequest = async (): Promise<Response> => {
      try {
        // Track the request for rate limiting
        rateLimitMonitor.trackRequest(url);

        // Add delay if we're approaching rate limits
        const delayTime = rateLimitMonitor.getDelayTime(url);
        if (delayTime > 0) {
          logger.debug(
            `[RequestManager] Delaying request by ${delayTime}ms to avoid rate limit`,
            { url }
          );
          await new Promise(resolve => setTimeout(resolve, delayTime));
        }

        // Ensure we have an absolute URL
        let absoluteUrl = url;
        if (url.startsWith('/')) {
          // If it's a relative URL and we're in a browser context, use the current origin
          if (typeof window !== 'undefined') {
            const origin = window.location.origin;

            // Debug logging to understand the URL construction issue
            if (url.includes('/versions/latest')) {
              logger.debug('[RequestManager] URL construction debug', {
                originalUrl: url,
                windowOrigin: origin,
                windowLocation: window.location.href,
                hostname: window.location.hostname,
                port: window.location.port,
                protocol: window.location.protocol,
              });
            }

            // Ensure we have a proper origin - be more strict about validation
            if (
              !origin ||
              origin === 'null' ||
              origin.includes('undefined') ||
              !origin.includes('://') ||
              origin.length < 10
            ) {
              // Minimum length for a valid origin

              // Try to construct origin from individual parts
              const protocol = window.location.protocol || 'http:';
              const hostname = window.location.hostname || 'localhost';
              const port = window.location.port || '3000';

              const reconstructedOrigin = `${protocol}//${hostname}${port ? ':' + port : ''}`;

              logger.warn(
                '[RequestManager] Invalid origin detected, reconstructing',
                {
                  originalOrigin: origin,
                  protocol,
                  hostname,
                  port,
                  reconstructedOrigin,
                }
              );

              absoluteUrl = `${reconstructedOrigin}${url}`;
            } else {
              absoluteUrl = `${origin}${url}`;
            }

            // Additional validation to prevent malformed URLs
            if (
              !absoluteUrl.startsWith('http://') &&
              !absoluteUrl.startsWith('https://')
            ) {
              logger.error(
                '[RequestManager] Malformed URL detected, using fallback',
                {
                  malformedUrl: absoluteUrl,
                  originalUrl: url,
                  origin,
                }
              );
              absoluteUrl = `http://localhost:3000${url}`;
            }

            // Remove any trailing colons or unexpected characters
            absoluteUrl = absoluteUrl.replace(/:(\d+):\d+$/, ':$1'); // Fix :3000:1 -> :3000
          } else {
            // In server context, this module shouldn't be used
            // RequestManager is for client-side request management only
            throw new Error(
              '[RequestManager] Cannot resolve relative URLs in server context. This module is for client-side use only.'
            );
          }
        }

        // Final URL validation before making the request
        try {
          const testUrl = new URL(absoluteUrl);
          // Additional check to ensure the URL looks correct
          if (!testUrl.protocol || !testUrl.hostname) {
            throw new Error('Invalid URL components');
          }
        } catch (urlError) {
          logger.error(
            '[RequestManager] Invalid URL constructed, using fallback',
            {
              invalidUrl: absoluteUrl,
              originalUrl: url,
              error: urlError,
            }
          );
          // Fallback to localhost with clean URL
          absoluteUrl = `http://localhost:3000${url}`;
        }

        const response = await fetch(absoluteUrl, options);

        // Log successful URL construction for debugging
        if (url.includes('/versions/latest')) {
          logger.debug('[RequestManager] Successful URL construction', {
            originalUrl: url,
            absoluteUrl,
            responseStatus: response.status,
            responseOk: response.ok,
          });
        }

        // Cache successful GET responses
        if (response.ok && (!options?.method || options.method === 'GET')) {
          const data = await response.clone().json();
          this.responseCache.set(key, {
            data,
            timestamp: Date.now(),
            headers: Object.fromEntries(response.headers.entries()),
          });
        }

        // Remove from pending
        this.pendingRequests.delete(key);

        return response;
      } catch (error) {
        // Remove from pending on error
        this.pendingRequests.delete(key);
        throw error;
      }
    };

    // For non-GET requests, execute immediately
    if (options?.method && options.method !== 'GET') {
      const promise = makeRequest();
      this.pendingRequests.set(key, { promise, timestamp: Date.now() });
      return promise;
    }

    // For GET requests, add to queue for rate limiting
    return new Promise((resolve, reject) => {
      const requestPromise = new Promise<Response>(
        (resolveRequest, rejectRequest) => {
          this.requestQueue.push(async () => {
            try {
              const response = await makeRequest();
              resolveRequest(response);
              resolve(response);
            } catch (error) {
              rejectRequest(error);
              reject(error);
            }
          });
        }
      );

      // Store as pending request for deduplication
      this.pendingRequests.set(key, {
        promise: requestPromise,
        timestamp: Date.now(),
      });

      // Start processing the queue
      this.processQueue();
    });
  }

  /**
   * Pre-warm the cache with critical requests during app initialization
   */
  async prewarmCache(): Promise<void> {
    try {
      // Only pre-warm in browser context
      if (typeof window === 'undefined') return;

      // Critical requests that are always needed
      const criticalRequests = ['/api/csrf-token', '/api/auth/session'];

      // Execute all critical requests in parallel
      await Promise.all(
        criticalRequests.map(url =>
          this.fetch(url, {
            method: 'GET',
            credentials: 'same-origin',
          }).catch(err => {
            logger.warn(`Failed to pre-warm cache for ${url}:`, err);
          })
        )
      );

      logger.info('[RequestManager] Cache pre-warmed with critical requests');
    } catch (error) {
      logger.error('[RequestManager] Failed to pre-warm cache:', error);
    }
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.responseCache.clear();
    this.pendingRequests.clear();
    logger.info('[RequestManager] Cache cleared');
  }

  /**
   * Clear cache for a specific URL pattern
   */
  clearCacheForUrl(urlPattern: string): void {
    Array.from(this.responseCache.keys()).forEach(key => {
      if (key.includes(urlPattern)) {
        this.responseCache.delete(key);
      }
    });
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    cacheSize: number;
    pendingRequests: number;
    queueLength: number;
  } {
    return {
      cacheSize: this.responseCache.size,
      pendingRequests: this.pendingRequests.size,
      queueLength: this.requestQueue.length,
    };
  }
}

// Export the class for context-based instantiation
export { RequestManager };
