import { NextRequest, NextResponse } from 'next/server';
import { environment } from '@/config/environment';

/**
 * Edge Runtime compatible rate limiting
 * Uses in-memory storage per edge instance
 *
 * This is explicitly for Edge Runtime (middleware.ts)
 * For API routes, use the full rateLimit.ts with Redis support
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory storage for Edge Runtime
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically
let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 60000; // 1 minute

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;

  lastCleanup = now;
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Rate limit configurations for different endpoints
 */
const RATE_LIMIT_CONFIGS = {
  auth: {
    points: 5, // 5 attempts
    duration: 300, // per 5 minutes
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
    points: 300, // 300 requests for system endpoints
    duration: 60, // per minute
  },
};

function getClientKey(req: NextRequest): string {
  // Get client IP from headers
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  const xAzureClientIp = req.headers.get('x-azure-clientip');
  const xVercelForwardedFor = req.headers.get('x-vercel-forwarded-for');

  // Use CDN-specific headers first
  let ip = cfConnectingIp || xAzureClientIp;

  if (!ip && xVercelForwardedFor) {
    ip = xVercelForwardedFor.split(',')[0].trim();
  }

  if (!ip && forwardedFor) {
    ip = forwardedFor.split(',')[0].trim();
  }

  if (!ip) {
    ip = realIp || 'unknown';
  }

  // Include user ID if authenticated
  const userId = req.headers.get('x-user-id');
  return userId ? `${ip}:user:${userId}` : `ip:${ip}`;
}

function getLimiterNameForPath(
  pathname: string
): keyof typeof RATE_LIMIT_CONFIGS {
  // System endpoints
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
 * Edge Runtime rate limiting function
 * Synchronous and compatible with Next.js middleware
 */
export function rateLimit(
  req: NextRequest,
  limiterName?: keyof typeof RATE_LIMIT_CONFIGS
): NextResponse | undefined {
  // Skip in test environment
  if (environment.isTest) {
    return undefined;
  }

  // Run cleanup occasionally
  cleanup();

  const detectedLimiterName =
    limiterName || getLimiterNameForPath(req.nextUrl.pathname);
  const config = RATE_LIMIT_CONFIGS[detectedLimiterName];
  const key = getClientKey(req);
  const now = Date.now();

  const entry = rateLimitStore.get(key);
  const windowMs = config.duration * 1000;

  if (!entry || entry.resetAt < now) {
    // New window
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return undefined; // Allow request
  }

  if (entry.count >= config.points) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);

    return new NextResponse(
      JSON.stringify({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': config.points.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(entry.resetAt).toISOString(),
        },
      }
    );
  }

  // Increment counter
  entry.count++;
  rateLimitStore.set(key, entry);

  return undefined; // Allow request
}

// Re-export the type for consistency
export type RateLimitType = keyof typeof RATE_LIMIT_CONFIGS;
