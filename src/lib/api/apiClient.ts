/**
 * Centralized API Client (Fetch Wrapper)
 *
 * This module provides a wrapper around the native fetch function
 * to automatically add required headers (like tenant slug) to API requests.
 */
import { addTenantToHeaders } from '@/utils/tenant';
import { logger } from '@/utils/clientLogger';
import { CSRF_CONFIG } from '@/config/security';
import { RequestManager } from './requestManager';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { API_ROUTES } from '@/constants/apiRoutes';
import { isDevelopment } from '@/config/environment.client';
import { rateLimitMonitor } from './rateLimitMonitor';
import { trackApiPerformance } from '@/utils/performanceMonitor';

// Create a module-scoped instance for backward compatibility
// This is safe for client-side usage as it's tied to the browser session
const requestManager = new RequestManager();

// CSRF handling logic moved from src/utils/security.ts
let csrfTokenInternal: string | null = null;
let csrfTokenPromise: Promise<void> | null = null;
let lastCsrfWarningTime = 0;
const CSRF_WARNING_THROTTLE = 60000; // 1 minute

/**
 * Extract CSRF token from a Response object (if present in headers)
 */
function captureTokenFromResponse(res: Response) {
  const headerName = CSRF_CONFIG.HEADER_NAME;
  const tokenFromHeader = res.headers.get(headerName);
  if (tokenFromHeader) {
    csrfTokenInternal = tokenFromHeader;
    // Removed debug logging for performance
    // logger.debug('[apiFetch] Captured new CSRF token from response.');
  }
}

/**
 * Ensure we have a CSRF token cached. If not, issue a lightweight GET request
 * to `/api/csrf-token`.
 */
async function ensureCsrfTokenInternal(): Promise<void> {
  if (csrfTokenInternal) return;

  // If there's already a promise in flight, wait for it (deduplication)
  if (csrfTokenPromise) {
    await csrfTokenPromise;
    return;
  }

  // Create a new promise and store it for deduplication
  csrfTokenPromise = (async () => {
    try {
      // Use requestManager for deduplication and rate limiting
      const res = await requestManager.fetch(API_ROUTES.MISC.CSRF_TOKEN, {
        credentials: 'same-origin',
        skipCache: true, // CSRF tokens should not be cached
      });

      if (!res.ok) {
        throw new ApplicationError(
          ErrorCode.AUTH_TOKEN_INVALID,
          `CSRF token fetch failed with status: ${res.status}`
        );
      }

      captureTokenFromResponse(res);
      if (!csrfTokenInternal) {
        // Throttle this warning in development
        const now = Date.now();
        if (
          process.env.NODE_ENV !== 'development' ||
          now - lastCsrfWarningTime > CSRF_WARNING_THROTTLE
        ) {
          logger.warn('[apiFetch] CSRF token endpoint did not return a token.');
          lastCsrfWarningTime = now;
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('[apiFetch] Failed to retrieve CSRF token', {
        error: error.message,
      });
      // Don't re-throw here, allow the main request to proceed (it might not need CSRF)
      // or fail due to missing token if server enforces it.
    } finally {
      // Clear the promise so future calls can retry if needed
      csrfTokenPromise = null;
    }
  })();

  await csrfTokenPromise;
}

/**
 * Retrieve cached CSRF token.
 * Exported for potential use in other specific, non-apiFetch scenarios (rare).
 */
export function getApiClientCsrfToken(): string | null {
  return csrfTokenInternal;
}

/**
 * Initializes the CSRF token. Call this during app startup.
 */
export async function initializeApiSecurity(): Promise<void> {
  await ensureCsrfTokenInternal();
}

/**
 * Calculate exponential backoff delay
 */
function getBackoffDelay(attempt: number): number {
  // Base delay of 1 second, exponentially increasing with jitter
  const baseDelay = 1000;
  const maxDelay = 30000; // 30 seconds max

  // Use crypto-secure random for jitter
  const randomArray = new Uint32Array(1);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(randomArray);
  } else if (typeof global !== 'undefined' && global.crypto) {
    (global.crypto as any).getRandomValues(randomArray);
  } else {
    // Fallback for environments without crypto (should be rare)
    randomArray[0] = Date.now();
  }

  const jitter = (randomArray[0] / 0xffffffff) * 0.3; // 0-30% jitter
  const delay = Math.min(
    baseDelay * Math.pow(2, attempt) * (1 + jitter),
    maxDelay
  );
  return Math.floor(delay);
}

/**
 * Wrapper for the native fetch function to automatically add tenant context and CSRF token.
 *
 * @param url - The URL to fetch.
 * @param options - Optional fetch options (method, body, headers, etc.).
 * @param internalOptions - Internal options for controlling fetch behavior e.g. CSRF retries.
 * @returns A promise resolving to the Fetch Response object.
 * @throws ApplicationError if the fetch request fails or if the response status indicates an error (>= 400).
 */
export async function apiFetch(
  url: string,
  options: RequestInit = {},
  internalOptions: {
    retries?: number;
    isStream?: boolean;
    retryCount?: number;
    startTime?: number; // Add startTime to track across retries
  } = {}
): Promise<Response> {
  const { retries = 3, isStream = false, retryCount = 0 } = internalOptions;

  // Track performance - use existing startTime if this is a retry
  const startTime = internalOptions.startTime || performance.now();

  const method = (options.method || 'GET').toUpperCase();

  // Ensure we have a CSRF token (fetch once and reuse to prevent 429s)
  await ensureCsrfTokenInternal();

  const currentHeaders = new Headers(options.headers);

  // Add tenant slug header
  const pathname =
    typeof window !== 'undefined' ? window.location.pathname : '';
  const tenantHeaders = addTenantToHeaders(pathname, {});

  for (const key in tenantHeaders) {
    if (Object.prototype.hasOwnProperty.call(tenantHeaders, key)) {
      currentHeaders.set(key, tenantHeaders[key]);
    }
  }

  // Add CSRF token to header if available
  if (csrfTokenInternal && !currentHeaders.has(CSRF_CONFIG.HEADER_NAME)) {
    currentHeaders.set(CSRF_CONFIG.HEADER_NAME, csrfTokenInternal);
    // Removed debug logging for performance
    // logger.debug('[apiFetch] Added CSRF token to request headers.');
  }

  // Add Content-Type header for JSON body if not already set
  if (options.body && !currentHeaders.has('Content-Type')) {
    // Check if body is a string (likely JSON)
    if (typeof options.body === 'string') {
      // Try to parse to verify it's JSON
      try {
        JSON.parse(options.body);
        currentHeaders.set('Content-Type', 'application/json');
      } catch {
        // Not JSON, don't set Content-Type
      }
    }
  }

  const finalOptions: RequestInit = {
    ...options,
    headers: currentHeaders,
    credentials: 'same-origin',
  };

  // logger.debug(`[apiFetch] Making request to: ${url}`, {
  //   method: finalOptions.method || 'GET',
  //   isStream,
  // });

  try {
    // Use request manager for GET requests to handle deduplication and rate limiting
    // For other methods, use direct fetch to avoid complications with CSRF and body streaming
    const response =
      method === 'GET' && !isStream
        ? await requestManager.fetch(url, finalOptions)
        : await fetch(url, finalOptions);

    captureTokenFromResponse(response);

    // Check if response is successful (2xx status)
    if (response.ok) {
      // Track successful performance
      trackApiPerformance(url, method, startTime);

      // logger.debug(`[apiFetch] Request successful: ${url}`, {
      //   status: response.status,
      // });
      return response;
    }

    // Handle rate limiting with retry
    if (response.status === 429 && retryCount < retries) {
      const retryAfterHeader = response.headers.get('Retry-After');
      let retryDelay: number;

      if (retryAfterHeader) {
        // If server provides retry-after, use it
        const retryAfterSeconds = parseInt(retryAfterHeader, 10);
        retryDelay = isNaN(retryAfterSeconds)
          ? getBackoffDelay(retryCount)
          : retryAfterSeconds * 1000;
      } else {
        // Otherwise use exponential backoff
        retryDelay = getBackoffDelay(retryCount);
      }

      logger.warn(
        `[apiFetch] Rate limited on ${url}, retrying in ${retryDelay}ms (attempt ${retryCount + 1}/${retries})`
      );

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay));

      // Retry the request - pass the original startTime
      return apiFetch(url, options, {
        ...internalOptions,
        retryCount: retryCount + 1,
        startTime, // Preserve original start time
      });
    }

    // Handle error response
    const errorBody = !isStream
      ? await response.text().catch(() => null)
      : null;

    // Try to parse error data
    let errorData: any = null;
    if (errorBody && !isStream) {
      try {
        errorData = JSON.parse(errorBody);
      } catch {
        // Not JSON, that's ok
      }
    }

    // Handle 401 Unauthorized globally - redirect to login
    if (response.status === 401 && typeof window !== 'undefined') {
      // Don't redirect on CSRF token endpoint to avoid infinite loop
      if (!url.includes('/api/csrf-token')) {
        logger.info('[apiFetch] Session expired (401), redirecting to login', {
          url,
        });
        // Small delay to allow current operations to complete
        setTimeout(() => {
          window.location.href = '/api/auth/login';
        }, 100);
      }
    }

    // Log the error (but be less noisy for expected 404s)
    const isExpected404 =
      response.status === 404 &&
      (url.includes('/versions/latest') || url.includes('/api/claims/'));

    if (!isExpected404) {
      logger.error(`[apiFetch] API request failed`, {
        url,
        status: response.status,
        statusText: response.statusText,
        errorBody: isStream ? 'N/A (stream)' : errorBody?.substring(0, 500),
      });
    }

    // Create appropriate error based on status
    let errorCode: (typeof ErrorCode)[keyof typeof ErrorCode];
    if (response.status === 401) {
      errorCode = ErrorCode.AUTH_UNAUTHORIZED;
    } else if (response.status === 403) {
      errorCode = ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS;
    } else if (response.status === 404) {
      errorCode = ErrorCode.DB_RECORD_NOT_FOUND;
    } else if (response.status === 429) {
      errorCode = ErrorCode.RATE_LIMIT_EXCEEDED;
    } else if (response.status >= 500) {
      errorCode = ErrorCode.INTERNAL_ERROR;
    } else {
      errorCode = ErrorCode.API_INVALID_RESPONSE;
    }

    // Add specific CSRF error detection
    if (response.status === 403 && errorBody?.toLowerCase().includes('csrf')) {
      errorCode = ErrorCode.AUTH_TOKEN_INVALID;
    }

    // Track performance even on errors
    trackApiPerformance(url, method, startTime);

    throw new ApplicationError(
      errorCode,
      errorData?.message ||
        errorData?.error ||
        `Request failed: ${response.statusText}`,
      response.status
    );
  } catch (error: unknown) {
    // Track performance on exceptions too
    trackApiPerformance(url, method, startTime);

    if (error instanceof ApplicationError) {
      throw error;
    }
    // Handle network errors (e.g., failed to fetch)
    logger.error(`[apiFetch] Network or unknown error for ${url}`, {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new ApplicationError(
      ErrorCode.API_NETWORK_ERROR,
      `Network request failed: ${error instanceof Error ? error.message : 'Unknown'}`
    );
  }

  // Handle non-error case (should not happen with current logic, but for type safety)
  throw new ApplicationError(
    ErrorCode.INTERNAL_ERROR,
    'apiFetch completed without returning a response or throwing an error.'
  );
}

// Example of how to call for a streaming response:
// await apiFetch('/api/stream-endpoint', {}, { isStream: true });

/**
 * Clear all cached API responses
 */
export function clearApiCache(): void {
  requestManager.clearCache();
}

/**
 * Clear cached responses for a specific URL pattern
 */
export function clearApiCacheForUrl(urlPattern: string): void {
  requestManager.clearCacheForUrl(urlPattern);
}

/**
 * Get cache statistics for debugging
 */
export function getApiCacheStats() {
  return requestManager.getCacheStats();
}

/**
 * Get rate limit metrics for debugging
 */
export function getRateLimitMetrics() {
  return rateLimitMonitor.getMetrics();
}

// Add debug functions to window in development
if (typeof window !== 'undefined' && isDevelopment) {
  (window as any).__apiDebug = {
    getCacheStats: getApiCacheStats,
    getRateLimitMetrics: getRateLimitMetrics,
    clearCache: clearApiCache,
    requestManager,
    rateLimitMonitor,
  };
}
