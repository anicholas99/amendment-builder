import type { NextApiRequest, NextApiResponse } from 'next';
import { environment } from '@/config/environment';

// Track request counts per IP
const requestCounts = new Map<string, { count: number; resetTime: number }>();

/**
 * Test endpoint to simulate rate limiting (429 errors)
 * Only available in development mode
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow in development
  if (!environment.isDevelopment) {
    return res.status(404).json({ error: 'Not found' });
  }

  const clientIp =
    req.headers['x-forwarded-for'] ||
    req.headers['x-real-ip'] ||
    req.socket.remoteAddress ||
    'unknown';

  // Ensure clientIp is a string (headers can return string arrays)
  const ipAddress = Array.isArray(clientIp) ? clientIp[0] : clientIp;

  const now = Date.now();
  const window = 60000; // 1 minute window
  const limit = parseInt(req.query.limit as string) || 5; // Default 5 requests per minute

  // Get or create client record
  let clientRecord = requestCounts.get(ipAddress);
  if (!clientRecord || clientRecord.resetTime < now) {
    clientRecord = { count: 0, resetTime: now + window };
    requestCounts.set(ipAddress, clientRecord);
  }

  clientRecord.count++;

  // Check if rate limited
  if (clientRecord.count > limit) {
    const retryAfter = Math.ceil((clientRecord.resetTime - now) / 1000);

    res.setHeader('Retry-After', retryAfter.toString());
    res.setHeader('X-RateLimit-Limit', limit.toString());
    res.setHeader('X-RateLimit-Remaining', '0');
    res.setHeader(
      'X-RateLimit-Reset',
      new Date(clientRecord.resetTime).toISOString()
    );

    return res.status(429).json({
      error: 'Too many requests',
      message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
      retryAfter,
    });
  }

  // Success response
  res.setHeader('X-RateLimit-Limit', limit.toString());
  res.setHeader(
    'X-RateLimit-Remaining',
    (limit - clientRecord.count).toString()
  );
  res.setHeader(
    'X-RateLimit-Reset',
    new Date(clientRecord.resetTime).toISOString()
  );

  return res.status(200).json({
    message: 'Request successful',
    requestCount: clientRecord.count,
    limit,
    remaining: limit - clientRecord.count,
  });
}
