import { z } from 'zod';

/**
 * Shared query parameter schemas for API routes
 * These schemas validate common query parameters used across multiple endpoints
 */

// Single ID parameter (for routes like /api/something/[id])
export const idQuerySchema = z.object({
  id: z.string().min(1, 'ID is required'),
});

// Project ID parameter
export const projectIdQuerySchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
});

// Project ID with optional parameters
export const projectIdWithOptionsQuerySchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  limit: z.coerce.number().int().positive().optional().default(10),
  includeResults: z.coerce.boolean().optional().default(false),
});

// Search history query parameters
export const searchHistoryQuerySchema = z.object({
  projectId: z.string().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

// Delete figure query schema
export const deleteFigureQuerySchema = z.object({
  url: z.string().url('Invalid URL format').min(1, 'URL is required'),
});

// Citation job query schema
export const citationJobQuerySchema = z.object({
  searchHistoryId: z.string().min(1, 'Search history ID is required'),
});

// Citation job ID query schema
export const citationJobIdQuerySchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
});

// PatBase reference query schema
export const patbaseReferenceQuerySchema = z.object({
  reference: z.string().min(1, 'Reference is required'),
});

// Version query schema
export const versionQuerySchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  versionId: z.string().min(1, 'Version ID is required'),
});

// Latest version query schema
export const latestQuerySchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  latest: z.coerce.boolean().optional().default(false),
});

// Document type query schema
export const documentTypeQuerySchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  documentType: z.string().min(1, 'Document type is required'),
});

// PatBase search query schema
export const patbaseSearchQuerySchema = z.object({
  query: z.string().min(1, 'Query is required'),
  maxResults: z.coerce.number().int().positive().optional(),
  max: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  filterByFamily: z.coerce.boolean().optional(),
  family: z.coerce.boolean().optional(),
});

// Citation reasoning status query
export const citationReasoningStatusQuerySchema = z.object({
  searchHistoryId: z.string().min(1, 'Search history ID is required'),
  matchIds: z.string().optional(), // comma-separated list
});

// Deep analysis query schema
export const deepAnalysisQuerySchema = z.object({
  id: z.string().min(1, 'ID is required'),
  force: z.coerce.boolean().optional().default(false),
});

// Debug find job query schema
export const debugFindJobQuerySchema = z.object({
  reference: z.string().optional(),
  searchId: z.string().optional(),
  versionId: z.string().optional(),
});

// Patentability scores history query
export const patentabilityScoresQuerySchema = z.object({
  projectId: z.string().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

// Citation matches by search query
export const citationMatchesBySearchQuerySchema = z.object({
  searchHistoryId: z.string().min(1, 'Search history ID is required'),
  elementText: z.string().optional(),
  referenceNumber: z.string().optional(),
  includeLocationData: z.coerce.boolean().optional().default(false),
});

// Search ID query schema
export const searchIdQuerySchema = z.object({
  searchId: z.string().min(1, 'Search ID is required'),
});

// Exclusion query schema (for DELETE requests)
export const exclusionQuerySchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  exclusionId: z.string().optional(),
  patentNumber: z.string().optional(),
});
