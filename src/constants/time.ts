/**
 * Time-related constants used throughout the application
 * All values are in milliseconds unless otherwise specified
 */

// Base time units
export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

// React Query stale times
export const STALE_TIME = {
  IMMEDIATE: 1 * SECOND, // For data that needs immediate updates
  TEN_SECONDS: 10 * SECOND, // For very frequent updates
  SHORT: 30 * SECOND, // For frequently changing data
  ONE_MINUTE: 1 * MINUTE, // For fresh lists
  MEDIUM: 2 * MINUTE, // For moderately changing data
  DEFAULT: 5 * MINUTE, // Default stale time
  LONG: 15 * MINUTE, // For rarely changing data
} as const;

// React Query garbage collection times
export const GC_TIME = {
  SHORT: 5 * MINUTE,
  DEFAULT: 10 * MINUTE,
  LONG: 30 * MINUTE,
} as const;

// Rate limiting windows
export const RATE_LIMIT_WINDOW = {
  DEFAULT: 15 * MINUTE,
  STRICT: 1 * HOUR,
  POLLING: 1 * MINUTE,
} as const;

// Session and auth timeouts
export const SESSION_TIMEOUT = 30 * MINUTE;
export const AUTH_TOKEN_EXPIRY = 24 * HOUR;

// Time ranges for analytics/reporting
export const TIME_RANGE = {
  LAST_24_HOURS: 24 * HOUR,
  LAST_48_HOURS: 48 * HOUR,
  LAST_7_DAYS: 7 * DAY,
  LAST_30_DAYS: 30 * DAY,
} as const;

// Processing timeouts
export const PROCESSING_TIMEOUT = {
  CITATION_JOB: 5 * MINUTE,
} as const;

// Polling delays
export const POLLING_DELAY = {
  INITIAL: 2 * SECOND,
  MAX: 10 * SECOND,
} as const;
