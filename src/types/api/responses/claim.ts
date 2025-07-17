/**
 * Claim API Response Schemas
 *
 * Schemas related to claim parsing, generation, and refinement
 */

import { z } from 'zod';

// ============================================
// Claim Schemas
// ============================================

export const GenerateDependentClaimsRequestSchema = z.object({
  projectId: z.string(),
  claim1Text: z.string(),
  existingDependentClaimsText: z.string().optional(),
  inventionDetailsContext: z.string(),
  selectedReferenceNumbers: z.array(z.string()),
});

export const GenerateDependentClaimsResponseSchema = z.object({
  dependentClaims: z.string(),
});

export const ParseClaimRequestSchema = z.object({
  claimOneText: z.string(),
  projectId: z.string(),
});

export const ParsedElementSchema = z.object({
  id: z.string(),
  text: z.string(),
  type: z.string().optional(),
  position: z.number().optional(),
});

export const ParseClaimResponseSchema = z.object({
  parsedElements: z.array(ParsedElementSchema),
});

export const GenerateQueriesRequestSchema = z.object({
  parsedElements: z.array(ParsedElementSchema),
  inventionData: z.unknown().optional(),
});

export const GenerateQueriesResponseSchema = z.object({
  queries: z.array(z.string()),
});

// ============================================
// V2 Claim Schemas (Migration)
// ============================================

export const ClaimElementV2Schema = z
  .string()
  .min(1, 'Claim element cannot be empty');

export const ParseClaimRequestV2Schema = z.object({
  claimText: z.string(),
  projectId: z.string(),
});

export const ParseClaimResponseV2Schema = z.object({
  elements: z.array(ClaimElementV2Schema),
  version: z.literal('2.0.0'),
});

export const GenerateQueriesRequestV2Schema = z.object({
  elements: z.array(ClaimElementV2Schema),
  inventionData: z.record(z.unknown()).optional(), // Accept any invention data shape
});

export const GenerateQueriesResponseV2Schema = z.object({
  searchQueries: z.array(z.string()),
  timestamp: z.string().optional(),
  projectId: z.string().optional(),
  usage: z
    .object({
      prompt_tokens: z.number(),
      completion_tokens: z.number(),
      total_tokens: z.number(),
      estimated_cost: z.number(),
      used_fallback: z.boolean().optional(),
    })
    .optional(),
});

export const ClaimRefinementAnalysisParamsSchema = z.object({
  projectId: z.string(),
  searchHistoryId: z.string(),
  claim1Text: z.string(),
  selectedReferenceNumbers: z.array(z.string()),
  forceRefresh: z.boolean(),
  existingDependentClaimsText: z.string(),
  inventionDetailsContext: z.string(),
});

export const ClaimRefinementAnalysisResultSchema = z
  .object({
    coverageMatrix: z.record(z.array(z.string())).optional(),
    analyses: z
      .array(
        z.object({
          referenceNumber: z.string(),
          analysis: z.string(),
          relevanceScore: z.number().optional(),
        })
      )
      .optional(),
    priorityActions: z.array(z.string()).optional(),
    structuringAdvice: z.array(z.string()).optional(),
    referencesAnalyzedCount: z.number().optional(),
    referencesRequestedCount: z.number().optional(),
  })
  .passthrough();

// --- Inferred Types ---
export type GenerateDependentClaimsRequest = z.infer<
  typeof GenerateDependentClaimsRequestSchema
>;
export type GenerateDependentClaimsResponse = z.infer<
  typeof GenerateDependentClaimsResponseSchema
>;
export type ParseClaimRequest = z.infer<typeof ParseClaimRequestSchema>;
export type ParsedElement = z.infer<typeof ParsedElementSchema>;
export type ParseClaimResponse = z.infer<typeof ParseClaimResponseSchema>;
export type GenerateQueriesRequest = z.infer<
  typeof GenerateQueriesRequestSchema
>;
export type GenerateQueriesResponse = z.infer<
  typeof GenerateQueriesResponseSchema
>;

// V2 Types
export type ClaimElementV2 = z.infer<typeof ClaimElementV2Schema>;
export type ParseClaimRequestV2 = z.infer<typeof ParseClaimRequestV2Schema>;
export type ParseClaimResponseV2 = z.infer<typeof ParseClaimResponseV2Schema>;
export type GenerateQueriesRequestV2 = z.infer<
  typeof GenerateQueriesRequestV2Schema
>;
export type GenerateQueriesResponseV2 = z.infer<
  typeof GenerateQueriesResponseV2Schema
>;
export type ClaimRefinementAnalysisParams = z.infer<
  typeof ClaimRefinementAnalysisParamsSchema
>;
export type ClaimRefinementAnalysisResult = z.infer<
  typeof ClaimRefinementAnalysisResultSchema
>;
