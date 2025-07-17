/**
 * Citation Extraction API Response Schemas
 *
 * Schemas related to citation extraction jobs and queuing
 */

import { z } from 'zod';

// ============================================
// Citation Extraction Schemas
// ============================================

export const CitationQueueRequestSchema = z.object({
  searchInputs: z.array(z.string()),
  filterReferenceNumber: z.string(),
  threshold: z.number().optional(),
  searchHistoryId: z.string(),
});

export const ActualCitationQueueApiResponseSchema = z.object({
  success: z.boolean(),
  jobId: z.string(),
  externalJobId: z.number(),
  errorMessage: z.string().optional(),
});

// --- Inferred Types ---
export type CitationQueueRequest = z.infer<typeof CitationQueueRequestSchema>;
export type ActualCitationQueueApiResponse = z.infer<
  typeof ActualCitationQueueApiResponseSchema
>;
