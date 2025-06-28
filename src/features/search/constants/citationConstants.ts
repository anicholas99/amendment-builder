/**
 * Common stop words used for citation text analysis and highlighting
 * These words are filtered out when extracting keywords for highlighting
 */
export const CITATION_STOP_WORDS = new Set([
  'a',
  'an',
  'the',
  'is',
  'are',
  'was',
  'were',
  'in',
  'on',
  'at',
  'to',
  'for',
  'of',
  'and',
  'or',
  'but',
  'system',
  'method',
  'device',
  'apparatus',
  'comprising',
  'including',
  'having',
  'configured',
  'based',
  'least',
  'such',
  'as',
  'it',
  'its',
  'be',
  'by',
  'with',
  'from',
  'that',
  'this',
  'which',
  'said',
  'item',
  'items',
  'one',
  'more',
  'first',
  'second',
  'data',
  'unit',
  'module',
  'component',
  'element',
  'present',
  'invention',
]);

/**
 * Score thresholds for citation relevance
 */
export const SCORE_THRESHOLDS = {
  HIGH: 0.7,
  MEDIUM: 0.4,
} as const;

/**
 * Reasoning score thresholds
 */
export const REASONING_SCORE_THRESHOLDS = {
  HIGH: 0.75,
  MEDIUM: 0.4,
} as const;

/**
 * Default values for citation display
 */
export const CITATION_DEFAULTS = {
  NOT_AVAILABLE: 'N/A',
  NO_CITATION_TEXT: 'No relevant citation found.',
  NOT_FOUND: 'Not Found',
  PARSE_ERROR: 'Parse Error',
} as const;

/**
 * Publication types for citation location formatting
 */
export const PUBLICATION_TYPES = {
  GRANTED: ['G', 'GRANTED'],
  APPLICATION: ['A', 'APPLICATION'],
} as const;

/**
 * Status values for citation processing
 */
export const CITATION_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  ERROR: 'ERROR',
} as const;

/**
 * Temporary set timeout for UI feedback (milliseconds)
 */
export const SAVING_FEEDBACK_DURATION = 300;

/**
 * Default fallback version ID for development
 */
export const FALLBACK_VERSION_ID = '2c30f47c-c1a0-47df-9091-ff46f6a37ecf';
