import { NextApiRequest, NextApiResponse } from 'next';

import { getClientIp } from '@/utils/network';
import { environment } from '@/config/environment';
import crypto from 'crypto';
import { AuthenticatedRequest } from '@/types/middleware';

/**
 * Enhanced rate limit configuration
 */
export interface EnhancedRateLimitConfig {
  /** Base request limit */
  points: number;
  /** Time window in seconds */
  duration: number;
  /** Block duration for exceeded limits (seconds) */
  blockDuration?: number;
  /** Cost multiplier for expensive operations */
  costMultiplier?: number;
  /** Progressive penalty multiplier */
  penaltyMultiplier?: number;
  /** Skip rate limiting for these IPs/tokens */
  skipList?: string[];
}

/**
 * Client fingerprint for better identification
 */
interface ClientFingerprint {
  ip: string;
  userAgent: string;
  userId?: string;
  apiKey?: string;
  fingerprint: string;
}

/**
 * Rate limit violation tracking
 */
interface ViolationRecord {
  count: number;
  firstViolation: number;
  lastViolation: number;
  penaltyLevel: number;
}

/**
 * Enhanced rate limiter with better security
 */
export class EnhancedRateLimiter {
  private storage = new Map<
    string,
    { points: number; expire: number; violations?: ViolationRecord }
  >();
  private violations = new Map<string, ViolationRecord>();

  constructor(private config: EnhancedRateLimitConfig) {
    // Cleanup expired entries every 5 minutes
    setInterval(
      () => {
        const now = Date.now();
        Array.from(this.storage.entries()).forEach(([key, value]) => {
          if (value.expire < now) {
            this.storage.delete(key);
          }
        });
        // Clean old violations (>24 hours)
        Array.from(this.violations.entries()).forEach(([key, record]) => {
          if (record.lastViolation < now - 24 * 60 * 60 * 1000) {
            this.violations.delete(key);
          }
        });
      },
      5 * 60 * 1000
    );
  }

  /**
   * Generate a fingerprint for the client
   */
  private generateFingerprint(req: NextApiRequest): ClientFingerprint {
    const ip = getClientIp(req) || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const userId = (req as AuthenticatedRequest).user?.id;
    const apiKey = req.headers['x-api-key'] as string | undefined;

    // Create a fingerprint combining multiple signals
    const components = [
      ip,
      userAgent.substring(0, 50), // Limit UA length
      userId || '',
      apiKey || '',
      req.headers['accept-language'] || '',
      req.headers['accept-encoding'] || '',
    ];

    const fingerprint = crypto
      .createHash('sha256')
      .update(components.join('|'))
      .digest('hex')
      .substring(0, 16);

    return {
      ip,
      userAgent,
      userId,
      apiKey,
      fingerprint,
    };
  }

  /**
   * Check if request should skip rate limiting
   */
  private shouldSkip(fingerprint: ClientFingerprint): boolean {
    if (!this.config.skipList || this.config.skipList.length === 0) {
      return false;
    }

    // Check various skip conditions
    return this.config.skipList.some(
      item =>
        item === fingerprint.ip ||
        item === fingerprint.userId ||
        item === fingerprint.apiKey ||
        (item.includes('*') &&
          new RegExp(item.replace('*', '.*')).test(fingerprint.ip))
    );
  }

  /**
   * Calculate cost for the request
   */
  private calculateCost(req: NextApiRequest, basePoints: number = 1): number {
    let cost = basePoints;

    // Apply cost multiplier for expensive operations
    if (this.config.costMultiplier) {
      const path = req.url || '';

      // AI endpoints cost more
      if (
        path.includes('/generate') ||
        path.includes('/analyze') ||
        path.includes('/ai/')
      ) {
        cost *= this.config.costMultiplier;
      }

      // Batch operations cost more
      if (path.includes('/batch') || req.body?.batch) {
        cost *= 2;
      }

      // Large payloads cost more
      const contentLength = parseInt(req.headers['content-length'] || '0');
      if (contentLength > 1024 * 1024) {
        // > 1MB
        cost *= Math.ceil(contentLength / (1024 * 1024));
      }
    }

    return Math.ceil(cost);
  }

  /**
   * Get progressive penalty for repeat offenders
   */
  private getProgressivePenalty(key: string): number {
    const violationRecord = this.violations.get(key);
    if (!violationRecord || !this.config.penaltyMultiplier) {
      return 1;
    }

    // Exponential backoff: 1x, 2x, 4x, 8x...
    return Math.pow(
      this.config.penaltyMultiplier,
      violationRecord.penaltyLevel
    );
  }

  /**
   * Record a rate limit violation
   */
  private recordViolation(key: string): void {
    const now = Date.now();
    const existing = this.violations.get(key);

    if (existing) {
      existing.count++;
      existing.lastViolation = now;
      // Increase penalty level if violations are frequent
      if (now - existing.lastViolation < 60 * 60 * 1000) {
        // Within 1 hour
        existing.penaltyLevel = Math.min(existing.penaltyLevel + 1, 4); // Max 16x penalty
      }
    } else {
      this.violations.set(key, {
        count: 1,
        firstViolation: now,
        lastViolation: now,
        penaltyLevel: 0,
      });
    }
  }

  /**
   * Consume rate limit points
   */
  async consume(
    req: NextApiRequest,
    points?: number
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: Date;
    retryAfter?: number;
  }> {
    const fingerprint = this.generateFingerprint(req);

    // Skip rate limiting for trusted sources
    if (this.shouldSkip(fingerprint)) {
      return {
        allowed: true,
        remaining: this.config.points,
        resetAt: new Date(Date.now() + this.config.duration * 1000),
      };
    }

    const key = fingerprint.fingerprint;
    const cost = this.calculateCost(req, points);
    const now = Date.now();
    const penalty = this.getProgressivePenalty(key);
    const effectiveCost = Math.ceil(cost * penalty);

    const record = this.storage.get(key);

    if (!record || record.expire < now) {
      // New window
      const expire = now + this.config.duration * 1000;
      this.storage.set(key, {
        points: this.config.points - effectiveCost,
        expire,
      });

      return {
        allowed: true,
        remaining: this.config.points - effectiveCost,
        resetAt: new Date(expire),
      };
    }

    if (record.points < effectiveCost) {
      // Rate limit exceeded
      this.recordViolation(key);

      // Apply progressive block duration
      const violationCount = this.violations.get(key)?.count || 1;
      const blockMultiplier = Math.min(violationCount, 5); // Max 5x block duration
      const blockDuration =
        (this.config.blockDuration || this.config.duration) * blockMultiplier;

      record.expire = now + blockDuration * 1000;
      this.storage.set(key, record);
      // Warning logging removed for client compatibility

      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(record.expire),
        retryAfter: Math.ceil((record.expire - now) / 1000),
      };
    }

    // Consume points
    record.points -= effectiveCost;
    this.storage.set(key, record);

    return {
      allowed: true,
      remaining: record.points,
      resetAt: new Date(record.expire),
    };
  }

  /**
   * Get current limit status without consuming
   */
  async status(req: NextApiRequest): Promise<{
    limit: number;
    remaining: number;
    resetAt: Date;
  }> {
    const fingerprint = this.generateFingerprint(req);
    const key = fingerprint.fingerprint;
    const record = this.storage.get(key);
    const now = Date.now();

    if (!record || record.expire < now) {
      return {
        limit: this.config.points,
        remaining: this.config.points,
        resetAt: new Date(now + this.config.duration * 1000),
      };
    }

    return {
      limit: this.config.points,
      remaining: record.points,
      resetAt: new Date(record.expire),
    };
  }
}

/**
 * Enhanced rate limit configurations
 */
export const ENHANCED_RATE_LIMITS = {
  auth: {
    points: 5,
    duration: 300, // 5 minutes
    blockDuration: 900, // 15 minutes
    penaltyMultiplier: 2,
  },
  api: {
    points: 100,
    duration: 60, // 1 minute
    costMultiplier: 1,
  },
  ai: {
    points: 50, // Base points
    duration: 300, // 5 minutes
    costMultiplier: 5, // AI calls cost 5x
    penaltyMultiplier: 1.5,
  },
  upload: {
    points: 10,
    duration: 300,
    blockDuration: 600,
    costMultiplier: 3, // Uploads cost 3x
  },
  search: {
    points: 50,
    duration: 60,
    costMultiplier: 2, // Searches cost 2x
  },
} as const;

/**
 * Rate limiter instances
 */
const limiters = new Map<string, EnhancedRateLimiter>();

/**
 * Get or create a rate limiter
 */
function getRateLimiter(
  name: keyof typeof ENHANCED_RATE_LIMITS
): EnhancedRateLimiter {
  if (!limiters.has(name)) {
    const config = ENHANCED_RATE_LIMITS[name];
    // Add trusted IPs from environment (if we add them later)
    // For now, we'll use an empty array but this can be extended
    const trustedIPs: string[] = [];
    limiters.set(
      name,
      new EnhancedRateLimiter({
        ...config,
        skipList: [...trustedIPs],
      })
    );
  }
  return limiters.get(name)!;
}

/**
 * Enhanced rate limiting middleware
 */
export function withEnhancedRateLimit(
  limiterType: keyof typeof ENHANCED_RATE_LIMITS = 'api'
) {
  return (
    handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
  ) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      // Skip in test environment
      if (environment.isTest) {
        return handler(req, res);
      }

      const limiter = getRateLimiter(limiterType);
      const result = await limiter.consume(req);

      // Set rate limit headers
      const status = await limiter.status(req);
      res.setHeader('X-RateLimit-Limit', status.limit.toString());
      res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
      res.setHeader('X-RateLimit-Reset', result.resetAt.toISOString());

      if (!result.allowed) {
        res.setHeader('Retry-After', result.retryAfter!.toString());
        return res.status(429).json({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: result.retryAfter,
          resetAt: result.resetAt.toISOString(),
        });
      }

      return handler(req, res);
    };
  };
}

/**
 * Cost-based rate limiting for dynamic costs
 */
export function withCostBasedRateLimit(
  limiterType: keyof typeof ENHANCED_RATE_LIMITS = 'api',
  getCost: (req: NextApiRequest) => number
) {
  return (
    handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
  ) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      if (environment.isTest) {
        return handler(req, res);
      }

      const limiter = getRateLimiter(limiterType);
      const cost = getCost(req);
      const result = await limiter.consume(req, cost);

      // Set headers including cost
      const status = await limiter.status(req);
      res.setHeader('X-RateLimit-Limit', status.limit.toString());
      res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
      res.setHeader('X-RateLimit-Reset', result.resetAt.toISOString());
      res.setHeader('X-RateLimit-Cost', cost.toString());

      if (!result.allowed) {
        res.setHeader('Retry-After', result.retryAfter!.toString());
        return res.status(429).json({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
          cost,
          retryAfter: result.retryAfter,
          resetAt: result.resetAt.toISOString(),
        });
      }

      return handler(req, res);
    };
  };
}
