import { NextApiRequest, NextApiResponse } from 'next';
import {
  withEnhancedRateLimit,
  ENHANCED_RATE_LIMITS,
} from '@/lib/security/enhancedRateLimit';
import { RateLimitType } from './rate-limit-config';
import { environment } from '@/config/environment';

/**
 * Map old rate limit types to new enhanced rate limit types
 */
const RATE_LIMIT_TYPE_MAP: Partial<
  Record<RateLimitType, keyof typeof ENHANCED_RATE_LIMITS>
> = {
  api: 'api',
  auth: 'auth',
  ai: 'ai',
  search: 'search',
  upload: 'upload',
  read: 'api', // Map to api with higher limits
  admin: 'api',
  polling: 'api',
  'critical-auth': 'auth',
  resource: 'api',
};

/**
 * Backward-compatible rate limiting middleware that uses the enhanced rate limiter
 * This allows gradual migration from the old system
 *
 * @param handler - The API request handler function to wrap
 * @param limitConfig - Either a string preset or custom config
 * @param windowMs - Optional override for time window (ignored, for compatibility)
 */
export function withRateLimitEnhanced(
  handler: (
    req: NextApiRequest,
    res: NextApiResponse
  ) => Promise<void | NextApiResponse>,
  limitConfig: number | string | { requests: number; windowMs: number } = 'api',
  windowMs?: number // Ignored, kept for backward compatibility
) {
  // Skip in test environment
  if (environment.isTest) {
    return handler;
  }

  // Determine the rate limiter type
  let limiterType: keyof typeof ENHANCED_RATE_LIMITS = 'api';

  if (typeof limitConfig === 'string') {
    // Map old preset to new type
    limiterType = RATE_LIMIT_TYPE_MAP[limitConfig as RateLimitType] || 'api';
  } else if (typeof limitConfig === 'object' && 'requests' in limitConfig) {
    // For custom configs, use 'api' type
    // In future, we could create dynamic configs
    limiterType = 'api';
  } else if (typeof limitConfig === 'number') {
    // Legacy numeric config, use 'api' type
    limiterType = 'api';
  }

  // Use the enhanced rate limiter with a wrapper to handle the return type difference
  const enhancedHandler = withEnhancedRateLimit(limiterType);

  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Wrap the original handler to ensure it returns void
    const wrappedHandler = async (
      req: NextApiRequest,
      res: NextApiResponse
    ): Promise<void> => {
      await handler(req, res);
      // Explicitly return void
    };

    return enhancedHandler(wrappedHandler)(req, res);
  };
}

/**
 * Export as the standard withRateLimit for drop-in replacement
 * To migrate:
 * 1. Import from '@/middleware/enhancedRateLimiter' instead of '@/middleware/rateLimiter'
 * 2. No other code changes needed
 */
export { withRateLimitEnhanced as withRateLimit };
