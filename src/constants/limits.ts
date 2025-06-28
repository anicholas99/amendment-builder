/**
 * Application-wide numerical limits and constants.
 * This file centralizes all "magic numbers" to ensure consistency and
 * make configuration changes easier and safer.
 */

// --- Rate Limiting ---
// All 'max' values represent the number of requests per window.
export const RATE_LIMITS = {
  AUTH: {
    max: 10,
  },
  AI: {
    max: 20,
  },
  SEARCH: {
    max: 50,
  },
  UPLOAD: {
    max: 30,
  },
  API_STANDARD: {
    max: 300,
  },
  READ_ONLY: {
    max: 500,
  },
  ADMIN: {
    max: 50,
  },
  POLLING: {
    max: 20,
  },
} as const;

// --- Other Application Limits ---

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 25,
  MAX_PAGE_SIZE: 100,
} as const;

export const THRESHOLDS = {
  DEFAULT_RELEVANCE: 20,
} as const;

// --- Polling and Retry Limits ---
export const POLLING = {
  MAX_ATTEMPTS: 10,
} as const;

// --- API Specific Limits ---
export const API_CONFIG = {
  PARALLEL_SEARCH_PAGE_SIZE: 25,
};
