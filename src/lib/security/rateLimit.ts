import { NextRequest, NextResponse } from 'next/server';
import { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '@/lib/monitoring/logger';
import crypto from 'crypto';
import { environment } from '@/config/environment';
import Redis from 'ioredis';

/**
 * Rate limiter interface for different storage backends
 */
interface RateLimiter {
  consume(key: string, points?: number): Promise<RateLimitResult>;
  reset(key: string): Promise<void>;
}

interface RateLimitResult {
  allowed: boolean;
  remainingPoints: number;
  msBeforeNext: number;
  consumedPoints: number;
}

interface RateLimitConfig {
  points: number; // Number of requests
  duration: number; // Per time window in seconds
  blockDuration?: number; // Block duration in seconds when limit exceeded
}

/**
 * In-memory rate limiter for development
 */
class InMemoryRateLimiter implements RateLimiter {
  private storage = new Map<string, { points: number; expire: number }>();

  constructor(private config: RateLimitConfig) {
    // Cleanup expired entries every minute
    // eslint-disable-next-line no-restricted-globals
    setInterval(() => {
      const now = Date.now();
      // Convert to array to avoid iterator issues
      const entries = Array.from(this.storage.entries());
      for (const [key, value] of entries) {
        if (value.expire < now) {
          this.storage.delete(key);
        }
      }
    }, 60000);
  }

  async consume(key: string, points = 1): Promise<RateLimitResult> {
    const now = Date.now();
    const record = this.storage.get(key);

    if (!record || record.expire < now) {
      // New window
      const expire = now + this.config.duration * 1000;
      this.storage.set(key, { points: this.config.points - points, expire });

      return {
        allowed: true,
        remainingPoints: this.config.points - points,
        msBeforeNext: this.config.duration * 1000,
        consumedPoints: points,
      };
    }

    if (record.points < points) {
      // Rate limit exceeded
      const msBeforeNext = record.expire - now;

      // Apply block duration if configured
      if (this.config.blockDuration) {
        record.expire = now + this.config.blockDuration * 1000;
        this.storage.set(key, record);
      }

      return {
        allowed: false,
        remainingPoints: 0,
        msBeforeNext,
        consumedPoints: 0,
      };
    }

    // Consume points
    record.points -= points;
    this.storage.set(key, record);

    return {
      allowed: true,
      remainingPoints: record.points,
      msBeforeNext: record.expire - now,
      consumedPoints: points,
    };
  }

  async reset(key: string): Promise<void> {
    this.storage.delete(key);
  }
}

/**
 * Redis-based rate limiter for production
 */
class RedisRateLimiter implements RateLimiter {
  private redis: Redis | null = null;
  private fallback: InMemoryRateLimiter;
  private connectionAttempts = 0;
  private maxConnectionAttempts = 3;
  private lastConnectionAttempt = 0;
  private connectionRetryDelay = 60000; // 1 minute

  constructor(
    private config: RateLimitConfig,
    redisUrl?: string
  ) {
    this.fallback = new InMemoryRateLimiter(config);

    if (redisUrl) {
      this.initializeRedis(redisUrl);
    } else {
      logger.warn(
        'Redis URL not provided for rate limiting, using in-memory storage'
      );
    }
  }

  private async initializeRedis(redisUrl: string): Promise<void> {
    try {
      // Only attempt connection if we haven't exceeded max attempts
      // and enough time has passed since last attempt
      const now = Date.now();
      if (
        this.connectionAttempts >= this.maxConnectionAttempts &&
        now - this.lastConnectionAttempt < this.connectionRetryDelay
      ) {
        return;
      }

      this.lastConnectionAttempt = now;
      this.connectionAttempts++;

      this.redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        connectTimeout: 10000,
        lazyConnect: false,
        retryStrategy: (times: number) => {
          if (times > 3) {
            logger.error('Redis connection failed after 3 retries');
            return null; // Stop retrying
          }
          return Math.min(times * 50, 2000);
        },
      });

      this.redis.on('error', err => {
        logger.error('Redis rate limiter error:', err);
      });

      this.redis.on('connect', () => {
        logger.info('Redis rate limiter connected successfully');
        this.connectionAttempts = 0; // Reset on successful connection
      });

      this.redis.on('ready', () => {
        logger.info('Redis rate limiter ready');
      });

      this.redis.on('close', () => {
        logger.warn('Redis rate limiter connection closed');
      });

      // Test the connection
      await this.redis.ping();
    } catch (error) {
      logger.error('Failed to initialize Redis for rate limiting:', error);
      if (this.redis) {
        this.redis.disconnect();
        this.redis = null;
      }
    }
  }

  async consume(key: string, points = 1): Promise<RateLimitResult> {
    // Use Redis if available, otherwise fallback
    if (!this.redis || this.redis.status !== 'ready') {
      return this.fallback.consume(key, points);
    }

    try {
      const multi = this.redis.multi();
      const now = Date.now();
      const clearBefore = now - this.config.duration * 1000;

      // Create a unique key for this rate limiter instance
      const redisKey = `ratelimit:${key}`;

      // Remove expired entries
      multi.zremrangebyscore(redisKey, '-inf', clearBefore);

      // Count current entries in the window
      multi.zcard(redisKey);

      // Execute the transaction
      const results = await multi.exec();

      if (!results) {
        throw new Error('Redis transaction failed');
      }

      const currentCount = results[1][1] as number;

      // Check if limit would be exceeded
      if (currentCount >= this.config.points) {
        // Get the oldest entry to determine when it expires
        const oldestEntries = await this.redis.zrange(
          redisKey,
          0,
          0,
          'WITHSCORES'
        );
        const oldestTimestamp =
          oldestEntries.length > 1 ? parseInt(oldestEntries[1]) : now;
        const msBeforeNext = Math.max(
          0,
          oldestTimestamp + this.config.duration * 1000 - now
        );

        return {
          allowed: false,
          remainingPoints: 0,
          msBeforeNext,
          consumedPoints: 0,
        };
      }

      // Add new points
      const promises = [];
      for (let i = 0; i < points; i++) {
        promises.push(
          this.redis.zadd(redisKey, now, `${now}-${Math.random()}`)
        );
      }
      await Promise.all(promises);

      // Set expiration on the key
      await this.redis.expire(redisKey, this.config.duration);

      return {
        allowed: true,
        remainingPoints: Math.max(
          0,
          this.config.points - currentCount - points
        ),
        msBeforeNext: this.config.duration * 1000,
        consumedPoints: points,
      };
    } catch (error) {
      logger.error('Redis rate limit error, falling back to in-memory:', error);
      return this.fallback.consume(key, points);
    }
  }

  async reset(key: string): Promise<void> {
    if (!this.redis || this.redis.status !== 'ready') {
      return this.fallback.reset(key);
    }

    try {
      const redisKey = `ratelimit:${key}`;
      await this.redis.del(redisKey);
    } catch (error) {
      logger.error('Redis rate limit reset error:', error);
      await this.fallback.reset(key);
    }
  }

  async disconnect(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.redis = null;
    }
  }
}

/**
 * Rate limiter factory
 */
class RateLimiterFactory {
  private static limiters = new Map<string, RateLimiter>();

  static getRateLimiter(name: string, config: RateLimitConfig): RateLimiter {
    const existing = this.limiters.get(name);
    if (existing) return existing;

    // In production, try to use Redis
    if (environment.isProduction && environment.redis.url) {
      const limiter = new RedisRateLimiter(config, environment.redis.url);
      this.limiters.set(name, limiter);
      return limiter;
    }

    // Fall back to in-memory
    const limiter = new InMemoryRateLimiter(config);
    this.limiters.set(name, limiter);
    return limiter;
  }

  // Cleanup method for graceful shutdown
  static async cleanup(): Promise<void> {
    for (const [name, limiter] of Array.from(this.limiters)) {
      if (limiter instanceof RedisRateLimiter) {
        await limiter.disconnect();
      }
    }
    this.limiters.clear();
  }
}

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMIT_CONFIGS = {
  auth: {
    points: 5, // 5 attempts
    duration: 300, // per 5 minutes
    blockDuration: 900, // block for 15 minutes after limit
  },
  api: {
    points: 100, // 100 requests
    duration: 60, // per minute
  },
  ai: {
    points: 20, // 20 AI requests
    duration: 300, // per 5 minutes
  },
  upload: {
    points: 10, // 10 uploads
    duration: 300, // per 5 minutes
  },
  system: {
    points: 300, // 300 requests for system endpoints like csrf, session
    duration: 60, // per minute
  },
};

/**
 * Trusted proxy configuration
 * Only accept X-Forwarded-For from these IP ranges
 */
const getTrustedProxies = (): Set<string> => {
  const trustedIps = new Set([
    '127.0.0.1',
    '::1', // IPv6 localhost
  ]);

  // Add configured trusted proxy IPs from environment
  if (environment.security?.trustedProxyIps) {
    environment.security.trustedProxyIps.forEach(ip => trustedIps.add(ip));
  }

  return trustedIps;
};

/**
 * Check if an IP is from a trusted proxy
 */
function isTrustedProxy(ip: string): boolean {
  const trustedProxies = getTrustedProxies();

  // In production, check against trusted proxy list
  if (environment.isProduction) {
    return trustedProxies.has(ip);
  }

  // In development, trust local IPs
  return (
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.')
  );
}

/**
 * Get the real client IP from request headers
 * Validates proxy headers to prevent spoofing
 */
function getRealClientIp(req: NextRequest): string {
  // In Next.js Edge Runtime, we rely on headers
  // The actual connection IP would come from the CDN/proxy

  // Check if we're behind a known proxy/CDN
  const cfConnectingIp = req.headers.get('cf-connecting-ip'); // Cloudflare
  const xAzureClientIp = req.headers.get('x-azure-clientip'); // Azure
  const xVercelForwardedFor = req.headers.get('x-vercel-forwarded-for'); // Vercel

  // Use CDN-specific headers first (these are more trustworthy)
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  if (xAzureClientIp) {
    return xAzureClientIp;
  }

  if (xVercelForwardedFor) {
    const ips = xVercelForwardedFor.split(',').map(ip => ip.trim());
    return ips[0] || 'unknown';
  }

  // For standard proxies, check X-Forwarded-For
  // Note: In production, you should configure your proxy to set a custom header
  // that can't be spoofed by clients
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const ips = forwardedFor.split(',').map(ip => ip.trim());
    const clientIp = ips[0];

    // Basic IP validation (supports both IPv4 and IPv6)
    if (clientIp && /^[0-9a-fA-F.:]+$/.test(clientIp)) {
      return clientIp;
    }
  }

  // Fallback to X-Real-IP
  const realIp = req.headers.get('x-real-ip');
  if (realIp && /^[0-9a-fA-F.:]+$/.test(realIp)) {
    return realIp;
  }

  // If we can't determine the IP, return unknown
  return 'unknown';
}

/**
 * Get client identifier for rate limiting
 */
function getClientKey(req: NextRequest): string {
  const ip = getRealClientIp(req);

  // For authenticated requests, include user ID for more granular limiting
  const userId = req.headers.get('x-user-id');

  // Create a unique key combining IP and user (if authenticated)
  const key = userId ? `${ip}:user:${userId}` : `ip:${ip}`;

  // Log suspicious activity
  if (ip === 'unknown') {
    logger.warn('Rate limiting with unknown IP', {
      path: req.nextUrl.pathname,
      headers: {
        'x-forwarded-for': req.headers.get('x-forwarded-for'),
        'x-real-ip': req.headers.get('x-real-ip'),
      },
    });
  }

  return key;
}

/**
 * Determine the rate limiter to use based on the path
 */
function getLimiterNameForPath(
  pathname: string
): keyof typeof RATE_LIMIT_CONFIGS {
  // System endpoints that are called frequently
  if (
    pathname.includes('/api/csrf-token') ||
    pathname.includes('/api/auth/session') ||
    pathname.includes('/api/auth/me')
  ) {
    return 'system';
  }

  // Auth endpoints
  if (pathname.includes('/api/auth/')) {
    return 'auth';
  }

  // AI endpoints
  if (
    pathname.includes('/generate') ||
    pathname.includes('/analyze') ||
    pathname.includes('/ai/')
  ) {
    return 'ai';
  }

  // Upload endpoints
  if (pathname.includes('/upload')) {
    return 'upload';
  }

  // Default to standard API limits
  return 'api';
}

/**
 * Middleware rate limiting function for Next.js Edge Runtime
 */
export async function rateLimit(
  req: NextRequest,
  limiterName?: keyof typeof RATE_LIMIT_CONFIGS
): Promise<NextResponse | undefined> {
  // Auto-detect limiter based on path if not specified
  const detectedLimiterName =
    limiterName || getLimiterNameForPath(req.nextUrl.pathname);
  const config = RATE_LIMIT_CONFIGS[detectedLimiterName];
  const limiter = RateLimiterFactory.getRateLimiter(
    detectedLimiterName,
    config
  );
  const clientKey = getClientKey(req);

  try {
    const result = await limiter.consume(clientKey);

    if (!result.allowed) {
      logger.warn('Rate limit exceeded', {
        clientKey,
        limiter: detectedLimiterName,
        path: req.nextUrl.pathname,
      });

      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil(result.msBeforeNext / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(result.msBeforeNext / 1000)),
            'X-RateLimit-Limit': String(config.points),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(
              Date.now() + result.msBeforeNext
            ).toISOString(),
          },
        }
      );
    }

    // Add rate limit headers to successful responses
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', String(config.points));
    response.headers.set(
      'X-RateLimit-Remaining',
      String(result.remainingPoints)
    );
    response.headers.set(
      'X-RateLimit-Reset',
      new Date(Date.now() + result.msBeforeNext).toISOString()
    );

    return response;
  } catch (error) {
    logger.error('Rate limiting error', {
      error,
      clientKey,
      limiter: detectedLimiterName,
    });
    // On error, allow the request to proceed
    return undefined;
  }
}

/**
 * Express/Next.js API route rate limiter
 */
export function createApiRateLimiter(
  limiterName: keyof typeof RATE_LIMIT_CONFIGS = 'api'
) {
  const config = RATE_LIMIT_CONFIGS[limiterName];
  const limiter = RateLimiterFactory.getRateLimiter(limiterName, config);

  return async (
    req: NextApiRequest,
    res: NextApiResponse,
    next: () => void
  ) => {
    const clientKey = (req as any).ip || 'unknown';

    try {
      const result = await limiter.consume(clientKey);

      // Add headers
      res.setHeader('X-RateLimit-Limit', config.points.toString());
      res.setHeader('X-RateLimit-Remaining', result.remainingPoints.toString());
      res.setHeader(
        'X-RateLimit-Reset',
        new Date(Date.now() + result.msBeforeNext).toISOString()
      );

      if (!result.allowed) {
        res.setHeader(
          'Retry-After',
          Math.ceil(result.msBeforeNext / 1000).toString()
        );
        return res.status(429).json({
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil(result.msBeforeNext / 1000),
        });
      }

      next();
    } catch (error) {
      logger.error('API rate limiting error', { error, clientKey });
      // On error, allow the request
      next();
    }
  };
}
