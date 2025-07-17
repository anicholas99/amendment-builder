import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest, NextResponse } from 'next/server';
import { SECURITY_HEADERS } from '../config/security';
import { v4 as uuidv4 } from 'uuid';
import { environment } from '@/config/environment';

/**
 * Middleware to enforce security headers for Next.js API routes
 */
export function withSecurityHeaders(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<unknown>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Add security headers
    res.setHeader(
      'X-Content-Type-Options',
      SECURITY_HEADERS.X_CONTENT_TYPE_OPTIONS
    );
    res.setHeader('X-Frame-Options', SECURITY_HEADERS.X_FRAME_OPTIONS);
    res.setHeader('Referrer-Policy', SECURITY_HEADERS.REFERRER_POLICY);
    res.setHeader('Permissions-Policy', SECURITY_HEADERS.PERMISSIONS_POLICY);

    // Only set HSTS in production
    if (environment.isProduction) {
      res.setHeader(
        'Strict-Transport-Security',
        SECURITY_HEADERS.STRICT_TRANSPORT_SECURITY
      );
    }

    // Generate unique request ID for tracing/logging
    const requestId = uuidv4();
    res.setHeader('X-Request-Id', requestId);

    return handler(req, res);
  };
}

/**
 * Middleware function for Next.js Middleware API (Edge runtime)
 */
export function securityMiddleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add security headers
  response.headers.set(
    'X-Content-Type-Options',
    SECURITY_HEADERS.X_CONTENT_TYPE_OPTIONS
  );
  response.headers.set('X-Frame-Options', SECURITY_HEADERS.X_FRAME_OPTIONS);
  response.headers.set('Referrer-Policy', SECURITY_HEADERS.REFERRER_POLICY);
  response.headers.set(
    'Permissions-Policy',
    SECURITY_HEADERS.PERMISSIONS_POLICY
  );

  // Only set CSP and HSTS in production
  if (environment.isProduction) {
    response.headers.set(
      'Content-Security-Policy',
      SECURITY_HEADERS.CONTENT_SECURITY_POLICY
    );
    response.headers.set(
      'Strict-Transport-Security',
      SECURITY_HEADERS.STRICT_TRANSPORT_SECURITY
    );
  }

  // Generate unique request ID for tracing/logging
  const requestId = uuidv4();
  response.headers.set('X-Request-Id', requestId);

  return response;
}

/**
 * Verify that the request origin matches the expected origin to prevent CSRF
 */
export function verifyOrigin(req: NextApiRequest): boolean {
  const origin = req.headers.origin;
  const referer = req.headers.referer;
  const host = req.headers.host;

  // Skip origin check in development (allows testing from different origins)
  if (environment.isDevelopment) {
    return true;
  }

  // Extract base URL from redirectUri (removing the /api/auth/callback part)
  const baseUrl =
    environment.auth.redirectUri?.replace('/api/auth/callback', '') || '';

  // Expected origins based on environment
  const allowedOrigins = [
    baseUrl,
    `https://${host}`,
    // Add any other trusted origins here
  ].filter(Boolean);

  // Check if the request origin is in our allowed list
  if (
    origin &&
    allowedOrigins.some(allowed => origin.startsWith(allowed as string))
  ) {
    return true;
  }

  // Check referer as a fallback
  if (
    !origin &&
    referer &&
    allowedOrigins.some(allowed => referer.startsWith(allowed as string))
  ) {
    return true;
  }

  // Origin verification failed
  return false;
}

/**
 * Middleware to verify that the request origin is from a trusted source
 */
export function withOriginProtection(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<unknown>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Skip for preflight requests
    if (req.method === 'OPTIONS') {
      return handler(req, res);
    }

    // Verify the origin for all non-GET requests to protect from CSRF
    if (req.method !== 'GET' && !verifyOrigin(req)) {
      return res.status(403).json({
        error: 'Forbidden: Cross-site request not allowed',
      });
    }

    return handler(req, res);
  };
}

export function securityHeaders(
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) {
  // Set security headers
  if (environment.isProduction) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=()'
    );
  }

  next();
}

export function corsMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) {
  // CORS configuration
  const allowedOrigins = environment.isProduction
    ? ['https://patentdraft.ipdashboard.com']
    : ['http://localhost:3000', 'http://localhost:3001'];

  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With'
  );
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  next();
}
