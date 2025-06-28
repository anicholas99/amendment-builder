/**
 * Type definitions for citation-related functionality
 */

/**
 * Represents a citation job with its potential result
 */
export interface JobWithResult {
  id: string;
  searchHistoryId: string;
  status: string;
  externalJobId?: number | null;
  referenceNumber?: string | null;
  createdAt: Date;
  startedAt?: Date | null;
  completedAt?: Date | null;
  error?: string | null;
  results?: {
    resultsData: string;
  } | null;
}
