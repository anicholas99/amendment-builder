/**
 * Centralized status constants to replace magic strings
 */

// Citation Job Status
export const CITATION_JOB_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  PENDING_EXTERNAL: 'PENDING_EXTERNAL',
  COMPLETED_EXTERNAL: 'COMPLETED_EXTERNAL',
  FAILED_EXTERNAL: 'FAILED_EXTERNAL',
  ERROR_PROCESSING_RESULTS: 'ERROR_PROCESSING_RESULTS',
  QUEUE_FAILED: 'QUEUE_FAILED',
  // Legacy values for backwards compatibility
  pending: 'pending',
  processing: 'processing',
  completed: 'completed',
  failed: 'failed',
} as const;

export type CitationJobStatus =
  (typeof CITATION_JOB_STATUS)[keyof typeof CITATION_JOB_STATUS];

// Location Status
export const LOCATION_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const;

export type LocationStatus =
  (typeof LOCATION_STATUS)[keyof typeof LOCATION_STATUS];

// Reasoning Status
export const REASONING_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const;

export type ReasoningStatus =
  (typeof REASONING_STATUS)[keyof typeof REASONING_STATUS];

// Generic Status (for other uses)
export const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
  COMPLETE: 'complete',
} as const;

export type Status = (typeof STATUS)[keyof typeof STATUS];

// Helper function to normalize status values
export function normalizeJobStatus(status: string): CitationJobStatus {
  const upperStatus = status.toUpperCase();
  if (upperStatus in CITATION_JOB_STATUS) {
    return CITATION_JOB_STATUS[upperStatus as keyof typeof CITATION_JOB_STATUS];
  }
  // Return lowercase for backwards compatibility
  return status.toLowerCase() as CitationJobStatus;
}

// Type guards
export function isCitationJobStatus(value: string): value is CitationJobStatus {
  return Object.values(CITATION_JOB_STATUS).includes(
    value as CitationJobStatus
  );
}

export function isLocationStatus(value: string): value is LocationStatus {
  return Object.values(LOCATION_STATUS).includes(value as LocationStatus);
}

export function isReasoningStatus(value: string): value is ReasoningStatus {
  return Object.values(REASONING_STATUS).includes(value as ReasoningStatus);
}
