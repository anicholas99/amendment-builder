import { NextApiRequest, NextApiResponse } from 'next';
import rateLimit from 'express-rate-limit';
import { getClientIp } from '@/utils/network';
import { logger } from '@/server/logger';
import { rateLimiters, RateLimitType } from './rate-limit-config';
import { environment } from '@/config/environment';

// Legacy support - maintain backward compatibility
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 100; // Max requests per window

/**
 * Rate limiting middleware for Next.js API routes
 * Supports both object configuration and string presets for SOC 2 compliance
 *
 * @param handler - The API request handler function to wrap
 * @param limitConfig - Either a string preset ('api', 'auth', etc.) or an object with requests/windowMs
 * @param windowMs - Optional override for time window (only used with numeric limit)
 */
export function withRateLimit(
  handler: (
    req: NextApiRequest,
    res: NextApiResponse
  ) => Promise<void | NextApiResponse>,
  limitConfig:
    | number
    | string
    | { requests: number; windowMs: number } = RATE_LIMIT_MAX_REQUESTS,
  windowMs: number = RATE_LIMIT_WINDOW_MS
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Skip rate limiting in test environment
    if (environment.isTest) {
      return handler(req, res);
    }

    let limiter: ReturnType<typeof rateLimit>;

    // Handle different configuration types
    if (typeof limitConfig === 'string') {
      // Use preset configuration
      const preset = limitConfig as RateLimitType;
      limiter = rateLimiters[preset];

      if (!limiter) {
        logger.warn(
          `Invalid rate limit preset: ${preset}, using default 'api' limiter`
        );
        limiter = rateLimiters.api;
      }
    } else if (typeof limitConfig === 'object' && 'requests' in limitConfig) {
      // Use object configuration
      limiter = rateLimit({
        windowMs: limitConfig.windowMs,
        max: limitConfig.requests,
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: req => getClientIp(req) || 'unknown',
        skip: () => environment.isTest,
        message: { error: 'Too many requests, please try again later.' },
      });
    } else {
      // Legacy numeric configuration
      limiter = rateLimit({
        windowMs,
        max:
          typeof limitConfig === 'number'
            ? limitConfig
            : RATE_LIMIT_MAX_REQUESTS,
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: req => getClientIp(req) || 'unknown',
        skip: () => environment.isTest,
        message: { error: 'Too many requests, please try again later.' },
      });
    }

    // Apply rate limiting
    return new Promise((resolve, reject) => {
      limiter(req as any, res as any, (err: unknown) => {
        if (err) {
          logger.error('Rate limiting error:', err);
          reject(err);
        } else {
          // Rate limit check passed, continue with handler
          resolve(handler(req, res));
        }
      });
    });
  };
}

// Export rate limit types for easy use
export type { RateLimitType } from './rate-limit-config';

export const apiRateLimiter = {
  // ... existing code ...
  skip: () => environment.isTest,
  // ... existing code ...
};

export const authRateLimiter = {
  // ... existing code ...
  skip: () => environment.isTest,
  // ... existing code ...
};
