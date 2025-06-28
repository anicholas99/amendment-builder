/**
 * Constants for the Claim Refinement feature
 */

export const CLAIM_VIEW_MODES = {
  LIST: 'list',
  BOX: 'box',
} as const;

export type ClaimViewMode =
  (typeof CLAIM_VIEW_MODES)[keyof typeof CLAIM_VIEW_MODES];

export const SEARCH_MODES = {
  BASIC: 'basic',
  ADVANCED: 'advanced',
} as const;

export type SearchMode = (typeof SEARCH_MODES)[keyof typeof SEARCH_MODES];

export const MESSAGE_ROLES = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system',
} as const;

export type MessageRole = (typeof MESSAGE_ROLES)[keyof typeof MESSAGE_ROLES];

export const TOAST_DURATIONS = {
  SHORT: 2000,
  MEDIUM: 3000,
  LONG: 6000,
} as const;

export const TOAST_MESSAGES = {
  ERRORS: {
    NO_SEARCH_HISTORY: 'No search history entry selected.',
    NO_REFERENCES: 'No references selected for analysis.',
    NO_CLAIM_1:
      'Claim 1 text is not available or is not in the expected string format.',
    NO_PROJECT_ID: 'No project ID available',
  },
  SUCCESS: {
    UNDO: 'Undo Successful',
    REDO: 'Redo Successful',
  },
  INFO: {
    ANALYZING: 'Analyzing prior art...',
  },
  WARNING: {
    PARTIAL_ANALYSIS: (analyzed: number, requested: number) =>
      `Some references could not be retrieved. Analysis is based on ${analyzed} of ${requested} references.`,
  },
} as const;

export const TABS = {
  SEARCH: '0',
  ASSISTANT: '1',
  PRIOR_ART: '2',
} as const;

export const CLAIM_NUMBERS = {
  FIRST: '1',
} as const;

export const DEFAULT_VALUES = {
  TOP_REFERENCES_COUNT: 5,
  COMPONENT_VISIBILITY_DELAY: 100,
} as const;
