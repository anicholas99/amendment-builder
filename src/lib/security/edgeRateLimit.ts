import { NextRequest, NextResponse } from 'next/server';

/**
 * Edge Runtime compatible rate limiting
 * Uses in-memory storage since Edge Runtime doesn't support Redis
 * Note: This is per-edge-instance, not globally distributed
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Simple in-memory storage for Edge Runtime
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

function getClientKey(req: NextRequest): string {
  // Try to get client IP from various headers
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const cfConnectingIp = req.headers.get('cf-connecting-ip');

  const ip =
    cfConnectingIp || realIp || forwardedFor?.split(',')[0] || 'unknown';

  // For authenticated requests, include user ID
  const userId = req.headers.get('x-user-id');

  return userId ? `${ip}:user:${userId}` : `ip:${ip}`;
}

/**
 * Edge-compatible rate limiting function
 * @param req - The Next.js request
 * @param windowMs - Time window in milliseconds (default: 15 minutes)
 * @param maxRequests - Maximum requests per window (default: 100)
 */
export async function rateLimit(
  req: NextRequest,
  windowMs: number = 15 * 60 * 1000, // 15 minutes
  maxRequests: number = 100
): Promise<NextResponse | undefined> {
  // Run cleanup occasionally
  cleanup();

  const key = getClientKey(req);
  const now = Date.now();

  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt < now) {
    // New window
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return undefined; // Allow request
  }

  if (entry.count >= maxRequests) {
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
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(entry.resetAt).toISOString(),
        },
      }
    );
  }

  // Increment counter
  entry.count++;
  rateLimitStore.set(key, entry);

  // Set rate limit headers on the response
  // Note: We can't modify the response here, so we'll pass this info along
  // In a real implementation, you might want to handle this differently

  return undefined; // Allow request
}
