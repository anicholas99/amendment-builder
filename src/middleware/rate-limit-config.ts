import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';
import { getClientIp } from '@/utils/network';
import { environment } from '@/config/environment';
import { RATE_LIMIT_WINDOW } from '@/constants/time';
import { RATE_LIMITS } from '@/constants/limits';
import { logger } from '@/server/logger';

/**
 * SOC 2 Compliant Rate Limiting Configuration
 *
 * Different rate limits for different types of endpoints:
 * - Auth: 10 requests per hour
 * - AI/ML endpoints: 20 requests per hour
 * - Search endpoints: 50 requests per hour
 * - Standard API: 100 requests per 15 minutes
 * - Read-only endpoints: 200 requests per 15 minutes
 */

// Initialize Redis client for rate limiting
let redisClient: Redis | null = null;

if (environment.redis.url && !environment.isTest) {
  try {
    redisClient = new Redis(environment.redis.url, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      connectTimeout: 10000,
      retryStrategy: (times: number) => {
        if (times > 3) {
          logger.error('Redis rate limiter: Connection failed after 3 retries');
          return null;
        }
        return Math.min(times * 50, 2000);
      },
    });

    redisClient.on('error', err => {
      logger.error('Redis rate limiter error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('Redis rate limiter: Connected successfully');
    });
  } catch (error) {
    logger.error('Failed to initialize Redis for rate limiting:', error);
    redisClient = null;
  }
}

// Helper to create rate limiter with common settings
const createLimiter = (
  options: Partial<Parameters<typeof rateLimit>[0]> & { prefix?: string }
) => {
  // Create a new Redis store instance for each limiter if Redis is available
  let store = undefined;
  if (redisClient && !environment.isTest) {
    try {
      store = new RedisStore({
        // @ts-expect-error - rate-limit-redis types might be outdated
        client: redisClient,
        prefix: options.prefix || 'rl:', // Use unique prefix for each limiter
      });
    } catch (error) {
      logger.error('Failed to create Redis store for rate limiter:', error);
    }
  }

  const { prefix, ...rateLimitOptions } = options; // Remove prefix from options

  return rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: req => getClientIp(req) || 'unknown',
    skip: () => environment.isTest,
    message: { error: 'Too many requests, please try again later.' },
    store, // Use the newly created store instance
    ...rateLimitOptions,
  });
};

// Authentication endpoints (login, register, password reset)
export const authLimiter = createLimiter({
  windowMs: RATE_LIMIT_WINDOW.STRICT,
  max: RATE_LIMITS.AUTH.max,
  prefix: 'rl:auth:',
  message: {
    error: 'Too many authentication attempts, please try again later.',
  },
});

// AI/ML endpoints (generate, analyze, etc.)
export const aiLimiter = createLimiter({
  windowMs: RATE_LIMIT_WINDOW.STRICT,
  max: RATE_LIMITS.AI.max,
  prefix: 'rl:ai:',
  message: { error: 'AI processing limit reached, please try again later.' },
});

// Search endpoints
export const searchLimiter = createLimiter({
  windowMs: RATE_LIMIT_WINDOW.STRICT,
  max: RATE_LIMITS.SEARCH.max,
  prefix: 'rl:search:',
  message: { error: 'Search rate limit exceeded, please try again later.' },
});

// File upload endpoints
export const uploadLimiter = createLimiter({
  windowMs: RATE_LIMIT_WINDOW.STRICT,
  max: RATE_LIMITS.UPLOAD.max,
  prefix: 'rl:upload:',
  message: { error: 'Upload limit reached, please try again later.' },
});

// Standard API endpoints (mutations)
export const apiLimiter = createLimiter({
  windowMs: RATE_LIMIT_WINDOW.DEFAULT,
  max: RATE_LIMITS.API_STANDARD.max,
  prefix: 'rl:api:',
});

// Read-only endpoints
export const readLimiter = createLimiter({
  windowMs: RATE_LIMIT_WINDOW.DEFAULT,
  max: RATE_LIMITS.READ_ONLY.max,
  prefix: 'rl:read:',
});

// Administrative endpoints
export const adminLimiter = createLimiter({
  windowMs: RATE_LIMIT_WINDOW.DEFAULT,
  max: RATE_LIMITS.ADMIN.max,
  prefix: 'rl:admin:',
  message: { error: 'Administrative rate limit exceeded.' },
});

// Polling endpoints (status checks, etc.)
export const pollingLimiter = createLimiter({
  windowMs: RATE_LIMIT_WINDOW.POLLING,
  max: RATE_LIMITS.POLLING.max,
  prefix: 'rl:poll:',
  message: {
    error:
      'Polling rate limit exceeded. Please wait before checking status again.',
  },
});

// Browser-accessible resources (images, downloads)
export const resourceLimiter = createLimiter({
  windowMs: RATE_LIMIT_WINDOW.DEFAULT,
  max: 300, // Higher limit for browser resources but not excessive
  prefix: 'rl:resource:',
  message: {
    error: 'Resource download limit exceeded, please try again later.',
  },
});

// Critical auth endpoints (CSRF, session)
export const criticalAuthLimiter = createLimiter({
  windowMs: RATE_LIMIT_WINDOW.DEFAULT,
  max: 200, // Double the standard API limit but still secure
  prefix: 'rl:critical:',
  message: { error: 'Auth endpoint limit exceeded.' },
});

// Export rate limit types for middleware
export type RateLimitType =
  | 'auth'
  | 'ai'
  | 'search'
  | 'upload'
  | 'api'
  | 'read'
  | 'admin'
  | 'polling'
  | 'resource'
  | 'critical-auth';

// Map of rate limit types to limiters
export const rateLimiters: Record<
  RateLimitType,
  ReturnType<typeof rateLimit>
> = {
  auth: authLimiter,
  ai: aiLimiter,
  search: searchLimiter,
  upload: uploadLimiter,
  api: apiLimiter,
  read: readLimiter,
  admin: adminLimiter,
  polling: pollingLimiter,
  resource: resourceLimiter,
  'critical-auth': criticalAuthLimiter,
};
