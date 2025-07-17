import { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '@/server/logger';

/**
 * Security headers middleware
 * Implements OWASP security best practices for HTTP headers
 */

export interface SecurityHeaderOptions {
  /** Allow frames from same origin. Default: false (DENY) */
  allowFraming?: boolean;
  /** Enable HSTS. Default: true */
  enableHSTS?: boolean;
  /** HSTS max age in seconds. Default: 31536000 (1 year) */
  hstsMaxAge?: number;
  /** Include subdomains in HSTS. Default: true */
  hstsIncludeSubDomains?: boolean;
  /** Enable HSTS preload. Default: false */
  hstsPreload?: boolean;
  /** Custom CSP directives to merge with defaults */
  customCSP?: Record<string, string[]>;
}

const DEFAULT_OPTIONS: Required<SecurityHeaderOptions> = {
  allowFraming: false,
  enableHSTS: true,
  hstsMaxAge: 31536000, // 1 year
  hstsIncludeSubDomains: true,
  hstsPreload: false,
  customCSP: {},
};

/**
 * Content Security Policy directives
 * Configured for a React SPA with API backend
 */
const DEFAULT_CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // React dev tools need unsafe-eval
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'img-src': ["'self'", 'data:', 'blob:', 'https:'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'connect-src': ["'self'", 'https://api.auth0.com', 'wss://localhost:*'], // Auth0 and dev websockets
  'media-src': ["'self'"],
  'object-src': ["'none'"],
  'child-src': ["'self'"],
  'frame-src': ["'self'", 'https://auth0.com'],
  'frame-ancestors': ["'none'"],
  'form-action': ["'self'"],
  'base-uri': ["'self'"],
  'manifest-src': ["'self'"],
  'upgrade-insecure-requests': [],
};

/**
 * Builds CSP header string from directives
 */
function buildCSPHeader(
  directives: Record<string, string[]>,
  customDirectives: Record<string, string[]>
): string {
  const merged = { ...directives };

  // Merge custom directives
  for (const [key, values] of Object.entries(customDirectives)) {
    if (merged[key]) {
      merged[key] = Array.from(new Set([...merged[key], ...values]));
    } else {
      merged[key] = values;
    }
  }

  return Object.entries(merged)
    .map(([directive, values]) => {
      if (values.length === 0) {
        return directive;
      }
      return `${directive} ${values.join(' ')}`;
    })
    .join('; ');
}

/**
 * Apply security headers to API responses
 */
export function withSecurityHeaders(options: SecurityHeaderOptions = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };

  return (
      handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
    ) =>
    async (req: NextApiRequest, res: NextApiResponse) => {
      try {
        // X-Frame-Options
        res.setHeader(
          'X-Frame-Options',
          config.allowFraming ? 'SAMEORIGIN' : 'DENY'
        );

        // X-Content-Type-Options
        res.setHeader('X-Content-Type-Options', 'nosniff');

        // X-XSS-Protection (legacy but still useful for older browsers)
        res.setHeader('X-XSS-Protection', '1; mode=block');

        // Referrer-Policy
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Permissions-Policy (replaces Feature-Policy)
        res.setHeader(
          'Permissions-Policy',
          'camera=(), microphone=(), geolocation=(), payment=()'
        );

        // Strict-Transport-Security (HSTS)
        if (config.enableHSTS && process.env.NODE_ENV === 'production') {
          let hstsValue = `max-age=${config.hstsMaxAge}`;
          if (config.hstsIncludeSubDomains) {
            hstsValue += '; includeSubDomains';
          }
          if (config.hstsPreload) {
            hstsValue += '; preload';
          }
          res.setHeader('Strict-Transport-Security', hstsValue);
        }

        // Content-Security-Policy
        const cspHeader = buildCSPHeader(
          DEFAULT_CSP_DIRECTIVES,
          config.customCSP
        );
        res.setHeader('Content-Security-Policy', cspHeader);

        // Remove potentially dangerous headers
        res.removeHeader('X-Powered-By');
        res.removeHeader('Server');

        // Call the actual handler
        return await handler(req, res);
      } catch (error) {
        logger.error('Security headers middleware error', {
          error: error instanceof Error ? error.message : String(error),
          path: req.url,
        });
        throw error; // Re-throw to let error handlers deal with it
      }
    };
}

/**
 * Apply security headers globally (for _app.tsx or middleware)
 */
export function applySecurityHeaders(
  res: NextApiResponse,
  options: SecurityHeaderOptions = {}
) {
  const config = { ...DEFAULT_OPTIONS, ...options };

  // Apply all security headers
  res.setHeader('X-Frame-Options', config.allowFraming ? 'SAMEORIGIN' : 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );

  if (config.enableHSTS && process.env.NODE_ENV === 'production') {
    let hstsValue = `max-age=${config.hstsMaxAge}`;
    if (config.hstsIncludeSubDomains) {
      hstsValue += '; includeSubDomains';
    }
    if (config.hstsPreload) {
      hstsValue += '; preload';
    }
    res.setHeader('Strict-Transport-Security', hstsValue);
  }

  const cspHeader = buildCSPHeader(DEFAULT_CSP_DIRECTIVES, config.customCSP);
  res.setHeader('Content-Security-Policy', cspHeader);

  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
}
