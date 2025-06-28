/**
 * Centralized validation constants for consistent security across API routes
 * These limits help prevent DoS attacks and ensure data integrity
 */

export const VALIDATION_LIMITS = {
  // Text field lengths
  NAME: {
    MIN: 1,
    MAX: 100,
  },
  TITLE: {
    MIN: 1,
    MAX: 200,
  },
  DESCRIPTION: {
    MIN: 0,
    MAX: 1000,
  },
  SLUG: {
    MIN: 1,
    MAX: 50,
  },
  EMAIL: {
    MAX: 254, // RFC 5321 standard
  },
  URL: {
    MAX: 2048, // Common browser limit
  },

  // Patent-specific fields
  PATENT_NUMBER: {
    MIN: 1,
    MAX: 50,
  },
  CLAIM_TEXT: {
    MIN: 10,
    MAX: 5000, // ~1 page of text
  },
  INVENTION_TEXT: {
    MIN: 10,
    MAX: 100000, // ~25 pages
  },
  ABSTRACT: {
    MIN: 10,
    MAX: 2000, // ~0.5 page
  },

  // Search and query limits
  SEARCH_QUERY: {
    MIN: 1,
    MAX: 500,
  },

  // Array limits
  MAX_ARRAY_SIZE: 100,
  MAX_BATCH_SIZE: 50,
  MAX_TAGS: 20,
  MAX_CLAIMS_PER_REQUEST: 50,

  // File limits
  MAX_FILENAME_LENGTH: 255,
  MAX_FILE_SIZE_MB: 10,

  // Pagination
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE_SIZE: 20,
} as const;

// Regular expressions for common validations
export const VALIDATION_PATTERNS = {
  // Alphanumeric with hyphens (for slugs, IDs)
  SLUG: /^[a-z0-9-]+$/,

  // UUID v4
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,

  // Patent number patterns (supports various formats)
  PATENT_NUMBER: /^[A-Z]{0,2}\d{4,}[A-Z]?\d*$/,

  // Safe filename (no path traversal)
  SAFE_FILENAME: /^[a-zA-Z0-9_\-\.]+$/,

  // Hex color
  HEX_COLOR: /^#[0-9A-F]{6}$/i,
} as const;

// Content type limits for different fields
export const CONTENT_LIMITS = {
  // Prevent extremely long strings that could cause memory issues
  MAX_STRING_LENGTH: 1000000, // 1MB of text

  // JSON field limits
  MAX_JSON_DEPTH: 10,
  MAX_JSON_SIZE_KB: 1024, // 1MB

  // Rate limiting
  MAX_REQUESTS_PER_MINUTE: 60,
  MAX_REQUESTS_PER_HOUR: 1000,
} as const;
