/**
 * Global variables and types for citation extraction background polling.
 */

// Type for job tracking
export interface BackgroundJob {
  externalJobId: number;
  searchHistoryId: string;
  referenceNumber: string;
  internalJobId: string;
  lastChecked: number;
  status: 'pending' | 'completed' | 'failed';
}

// Global background tracking object
// Stores active polling jobs, accessible across the application
export const backgroundPollingJobs: Record<string, BackgroundJob> = {};

// Polling interval constant (in milliseconds)
export const POLLING_INTERVAL = 10000; // 10 seconds
