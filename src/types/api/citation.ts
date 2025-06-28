/**
 * Shared API response types for citation endpoints
 * These types are used to ensure consistency between frontend and backend
 */

import { z } from 'zod';

/**
 * Schema for processed citation match data in API responses
 * This ensures consistent data format across all endpoints
 */
export const ProcessedCitationMatchResponseSchema = z.object({
  id: z.string(),
  searchHistoryId: z.string(),
  citationJobId: z.string(),
  referenceNumber: z.string(),
  claimSetVersionId: z.string().nullable().optional(),
  citation: z.string(),
  paragraph: z.string().nullable().optional(),
  score: z.number().nullable().optional(),
  parsedElementText: z.string().nullable().optional(),

  // Location data
  locationStatus: z.enum([
    'PENDING',
    'PROCESSING',
    'COMPLETED',
    'FAILED',
    'NOT_FOUND',
  ]),
  locationJobId: z.number().nullable().optional(),
  location: z.any().nullable().optional(), // Complex object, validated separately if needed
  locationError: z.string().nullable().optional(),

  // Reasoning data - structured consistently
  reasoningStatus: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']),
  reasoningJobId: z.number().nullable().optional(),
  reasoning: z
    .object({
      score: z.number(),
      summary: z.string(),
      fullAnalysis: z.string().optional(),
      keyPoints: z.array(z.string()).optional(),
      timestamp: z.string(), // ISO date string
    })
    .nullable()
    .optional(),
  reasoningError: z.string().nullable().optional(),

  // Reference metadata
  referenceTitle: z.string().nullable().optional(),
  referenceApplicant: z.string().nullable().optional(),
  referenceAssignee: z.string().nullable().optional(),
  referencePublicationDate: z.string().nullable().optional(),

  // Timestamps
  createdAt: z.string(), // ISO date string
  updatedAt: z.string(), // ISO date string

  // Related job info
  jobStatus: z
    .enum([
      'PENDING',
      'PROCESSING',
      'COMPLETED',
      'FAILED',
      'PENDING_EXTERNAL',
      'COMPLETED_EXTERNAL',
      'FAILED_EXTERNAL',
      'ERROR_PROCESSING_RESULTS',
      'QUEUE_FAILED',
    ])
    .optional(),
  jobCompletedAt: z.string().nullable().optional(), // ISO date string

  // UI helpers
  isPlaceholder: z.boolean().optional(),
  hasLocation: z.boolean().optional(),
  hasReasoning: z.boolean().optional(),
});

/**
 * Type derived from the schema for TypeScript usage
 */
export type ProcessedCitationMatchResponse = z.infer<
  typeof ProcessedCitationMatchResponseSchema
>;

/**
 * Schema for citation matches by search endpoint response
 */
export const CitationMatchesBySearchResponseSchema = z.array(
  ProcessedCitationMatchResponseSchema
);

/**
 * Type for citation matches by search endpoint response
 */
export type CitationMatchesBySearchResponse = z.infer<
  typeof CitationMatchesBySearchResponseSchema
>;

/**
 * Schema for citation job response
 */
export const CitationJobResponseSchema = z.object({
  id: z.string(),
  searchHistoryId: z.string(),
  status: z.enum([
    'PENDING',
    'PROCESSING',
    'COMPLETED',
    'FAILED',
    'PENDING_EXTERNAL',
    'COMPLETED_EXTERNAL',
    'FAILED_EXTERNAL',
    'ERROR_PROCESSING_RESULTS',
    'QUEUE_FAILED',
  ]),
  externalJobId: z.number().nullable().optional(),
  referenceNumber: z.string().nullable().optional(),
  claimSetVersionId: z.string(),
  createdAt: z.string(), // ISO date string
  startedAt: z.string().nullable().optional(),
  completedAt: z.string().nullable().optional(),
  lastCheckedAt: z.string().nullable().optional(),
  error: z.string().nullable().optional(),
  errorMessage: z.string().nullable().optional(),
  deepAnalysis: z.any().nullable().optional(), // Complex object
  results: z.array(z.any()).nullable().optional(), // Array of results
  duration: z.number().optional(),
  isComplete: z.boolean(),
  hasResults: z.boolean(),
  hasDeepAnalysis: z.boolean(),
});

/**
 * Type for citation job response
 */
export type CitationJobResponse = z.infer<typeof CitationJobResponseSchema>;

/**
 * Validation utilities
 */
export const validateCitationMatchResponse = (
  data: unknown
): ProcessedCitationMatchResponse => {
  return ProcessedCitationMatchResponseSchema.parse(data);
};

export const validateCitationMatchesArrayResponse = (
  data: unknown
): CitationMatchesBySearchResponse => {
  return CitationMatchesBySearchResponseSchema.parse(data);
};

export const validateCitationJobResponse = (
  data: unknown
): CitationJobResponse => {
  return CitationJobResponseSchema.parse(data);
};
