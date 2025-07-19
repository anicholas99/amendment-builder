/**
 * React Query Keys for USPTO API
 * 
 * Provides consistent, type-safe query keys for USPTO-related data fetching
 */

import { FetchOfficeActionsOptions } from '@/client/services/uspto.client-service';

export const usptoQueryKeys = {
  // Base key for all USPTO queries
  all: (applicationNumber: string) => ['uspto', applicationNumber] as const,

  // Office Actions list with optional filters
  officeActions: (applicationNumber: string, options?: FetchOfficeActionsOptions) => 
    ['uspto', applicationNumber, 'office-actions', options] as const,

  // Most recent Office Action
  mostRecent: (applicationNumber: string, includeContent: boolean) =>
    ['uspto', applicationNumber, 'most-recent', { includeContent }] as const,

  // Application status check
  status: (applicationNumber: string) =>
    ['uspto', applicationNumber, 'status'] as const,

  // Document download
  document: (documentId: string) =>
    ['uspto', 'documents', documentId] as const,

  // Processing job status
  processingJob: (jobId: string) =>
    ['uspto', 'processing', jobId] as const,
};