/**
 * Security configuration for the application
 */
import environment from './environment';

// Password policy
const PASSWORD_POLICY = {
  MIN_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL: true,
};

// CSRF protection
export const CSRF_CONFIG = {
  COOKIE_NAME: 'csrf-token',
  HEADER_NAME: 'x-csrf-token',
  COOKIE_OPTIONS: {
    httpOnly: true,
    secure: environment.isProduction,
    sameSite: 'strict' as const,
    path: '/',
    maxAge: 60 * 60, // 1 hour
  },
};

// API rate limiting
const RATE_LIMIT_CONFIG = {
  STANDARD: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
  },
  AUTH: {
    WINDOW_MS: 60 * 60 * 1000, // 1 hour
    MAX_REQUESTS: 10,
  },
};

// Auth0 configuration
const AUTH0_CONFIG = {
  DOMAIN: environment.auth?.domain || '',
  CLIENT_ID: environment.auth?.clientId || '',
  CLIENT_SECRET: environment.auth?.clientSecret || '',
  AUDIENCE: environment.auth?.audience || '',
  SCOPE: 'openid profile email',
  SESSION_SECRET: environment.auth?.sessionSecret || '',
};

// Security headers
export const SECURITY_HEADERS = {
  // Content Security Policy
  CONTENT_SECURITY_POLICY: `
    default-src 'self';
    script-src 'self';
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: blob:;
    font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com;
    connect-src 'self' https://api.openai.com ${environment.auth?.domain || ''};
    frame-src 'none';
    object-src 'none';
  `
    .replace(/\s+/g, ' ')
    .trim(),

  // Other security headers
  X_FRAME_OPTIONS: 'DENY',
  X_CONTENT_TYPE_OPTIONS: 'nosniff',
  REFERRER_POLICY: 'strict-origin-when-cross-origin',
  PERMISSIONS_POLICY: 'camera=(), microphone=(), geolocation=()',
  STRICT_TRANSPORT_SECURITY: 'max-age=63072000; includeSubDomains; preload',
};

// Cookie settings
const COOKIE_CONFIG = {
  AUTH: {
    httpOnly: true,
    secure: environment.isProduction,
    sameSite: 'strict' as const,
    path: '/',
    maxAge: 12 * 60 * 60, // 12 hours
  },
};

// Sanitization options
const SANITIZATION_CONFIG = {
  ALLOWED_HTML_TAGS: [],
  ALLOWED_HTML_ATTRS: [],
  STRIP_HTML: true,
};

// File upload restrictions
const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_MIME_TYPES: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain',
  ],
};
