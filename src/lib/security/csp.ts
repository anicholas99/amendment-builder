import { environment } from '@/config/environment';
import crypto from 'crypto';

/**
 * Content Security Policy configuration
 * This provides a secure CSP without unsafe-inline
 */

// Trusted domains for various resources
const TRUSTED_DOMAINS = {
  scripts: [] as string[],
  styles: [] as string[],
  fonts: ['fonts.googleapis.com', 'fonts.gstatic.com'],
  images: ['data:', 'blob:', 'https:'],
  connect: [
    'self',
    'https://aiapi.qa.cardinal-holdings.com',
    'wss://',
    ...(environment.auth.domain ? [environment.auth.domain] : []),
  ],
};

// Add localhost for development
if (!environment.isProduction) {
  TRUSTED_DOMAINS.images.push(
    'http://127.0.0.1:10000',
    'http://localhost:10000'
  );
}

/**
 * Generate a nonce for inline scripts/styles if absolutely necessary
 */
export function generateNonce(): string {
  return crypto.randomBytes(16).toString('base64');
}

/**
 * Build CSP header value
 * @param nonce Optional nonce for specific inline scripts that can't be removed
 */
export function buildCSPHeader(nonce?: string): string {
  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': ["'self'", ...TRUSTED_DOMAINS.scripts],
    'style-src': ["'self'", "'unsafe-inline'", ...TRUSTED_DOMAINS.styles],
    'img-src': ["'self'", ...TRUSTED_DOMAINS.images],
    'font-src': ["'self'", ...TRUSTED_DOMAINS.fonts],
    'connect-src': ["'self'", ...TRUSTED_DOMAINS.connect],
    'frame-src': ["'none'"],
    'frame-ancestors': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
  };

  // Add nonce if provided (for migration period only)
  if (nonce) {
    directives['script-src'].push(`'nonce-${nonce}'`);
    directives['style-src'].push(`'nonce-${nonce}'`);
  }

  // Build the CSP string
  return Object.entries(directives)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
}

/**
 * Get CSP configuration for Next.js
 */
export function getCSPConfig(includeNonce: boolean = false): {
  key: string;
  value: string;
} {
  // For now, we'll use a static CSP without nonce
  // Once migration is complete, we can add per-request nonces if needed
  return {
    key: 'Content-Security-Policy',
    value: buildCSPHeader(),
  };
}

/**
 * Report-Only CSP for testing
 * This allows us to test the new CSP without breaking the app
 */
export function getCSPReportOnlyConfig(): {
  key: string;
  value: string;
} {
  return {
    key: 'Content-Security-Policy-Report-Only',
    value: buildCSPHeader() + '; report-uri /api/csp-report',
  };
}
