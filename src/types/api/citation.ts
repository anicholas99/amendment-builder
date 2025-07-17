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

// Location schema for citation matches
export const CitationLocationSchema = z.object({
  pageNumber: z.number().optional(),
  section: z.string().optional(),
  paragraph: z.string().optional(),
  lineNumbers: z.array(z.number()).optional(),
  columnId: z.string().optional(),
  claimNumber: z.string().optional(),
});

// Deep analysis schema for citation jobs
export const DeepAnalysisSchema = z.object({
  overallNoveltyScore: z.number().min(0).max(100).optional(),
  keyFindings: z.array(z.string()).optional(),
  patentabilityAssessment: z.string().optional(),
  recommendations: z.array(z.string()).optional(),
  elementAnalysis: z
    .array(
      z.object({
        elementId: z.string(),
        score: z.number(),
        reasoning: z.string(),
      })
    )
    .optional(),
});

// Citation result schema
export const CitationResultSchema = z.object({
  referenceNumber: z.string(),
  relevanceScore: z.number(),
  matchedText: z.string().optional(),
  analysis: z.string().optional(),
});

// Citation match schema
export const CitationMatchSchema = z.object({
  id: z.string(),
  searchHistoryId: z.string(),
  referenceNumber: z.string(),
  citationText: z.string(),
  relevanceScore: z.number(),
  location: CitationLocationSchema.nullable().optional(), // Now properly typed
  elementOrder: z.number().nullable().optional(),
  reasoning: z.string().nullable().optional(),
  parsedElementText: z.string().nullable().optional(),
  referenceMetadata: z.any().nullable().optional(), // Keep as any for now, complex metadata
  claimSetVersionId: z.string().nullable().optional(),
  citationJobId: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Citation job schema
export const CitationJobSchema = z.object({
  id: z.string(),
  userId: z.string(),
  searchHistoryId: z.string(),
  type: z.enum(['CITATION_EXTRACTION', 'DEEP_ANALYSIS']).optional(),
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']),
  filterReferenceNumber: z.string().nullable().optional(),
  searchInputs: z.array(z.string()).nullable().optional(),
  deepAnalysisEnabled: z.boolean().optional(),
  deepAnalysisJson: z.string().nullable().optional(), // JSON string
  examinerAnalysisJson: z.string().nullable().optional(), // JSON string
  combinedExaminerAnalysisJson: z.string().nullable().optional(), // JSON string
  rawResultData: z.any().nullable().optional(), // Keep as any, various vendor formats
  errorMessage: z.string().nullable().optional(),
  threshold: z.number().nullable().optional(),
  progress: z.number().nullable().optional(),
  claimSetVersionId: z.string().nullable().optional(),
  lastCheckedAt: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  matches: z.array(CitationMatchSchema).optional(),
  deepAnalysis: DeepAnalysisSchema.nullable().optional(), // Now properly typed
  results: z.array(CitationResultSchema).nullable().optional(), // Now properly typed
});

/**
 * Client-safe citation job type for UI components
 * Used in CombinedAnalysisInTabView and similar components
 */
export interface CitationJobForAnalysis {
  id: string;
  referenceNumber?: string;
  deepAnalysisJson?: string | null;
  status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt?: string;
  updatedAt?: string;
  error?: string | null;
}

/**
 * Extended citation job with additional UI fields
 */
export interface CitationJobWithAnalysis extends CitationJobForAnalysis {
  referenceTitle?: string;
  referenceApplicant?: string;
}

// Type guard for citation job with analysis
