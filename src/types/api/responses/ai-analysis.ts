/**
 * AI & Analysis API Response Schemas
 *
 * Schemas related to AI-powered analysis, suggestions, and combined analysis
 */

import { z } from 'zod';
import { InventionDataSchema } from './invention-figure';

// ============================================
// AI & Analysis Schemas
// ============================================

export const CombinedAnalysisParamsSchema = z.object({
  claim1Text: z.string(),
  referenceIds: z.array(z.string()),
  referenceNumbers: z.array(z.string()).optional(),
  searchHistoryId: z.string(),
  projectId: z.string().optional(), // Keep for backward compatibility
  allClaims: z
    .array(
      z.object({
        number: z.number(),
        text: z.string(),
        id: z.string().optional(),
      })
    )
    .optional(), // All current claims for context
});

export const CombinedAnalysisResultSchema = z.object({
  analysis: z.object({
    patentabilityDetermination: z.union([
      z.literal('Anticipated (§ 102)'),
      z.literal('Obvious (§ 103)'),
      z.literal('Likely Patentable'),
    ]),
    primaryReference: z.string().nullable(),
    combinedReferences: z.array(z.string()),
    completeDisclosureAnalysis: z
      .object({
        singleReferences: z.array(z.string()),
        minimalCombinations: z.array(z.array(z.string())),
      })
      .optional(),
    rejectionJustification: z.object({
      motivationToCombine: z.string().nullable(),
      claimElementMapping: z.array(
        z.object({
          element: z.string(),
          taughtBy: z.string(),
        })
      ),
      fullNarrative: z.string(),
    }),
    strategicRecommendations: z.array(
      z.object({
        recommendation: z.string(),
        suggestedAmendmentLanguage: z.string(),
      })
    ),
    originalClaim: z.string().optional(),
    revisedClaim: z.string().optional(),
    completeAmendmentRationale: z.string().optional(),
    alternativeAmendmentOptions: z.array(z.string()).nullable().optional(),
  }),
});

export const GenerateSuggestionsParamsSchema = z.object({
  parsedElements: z.array(z.string()),
  searchResults: z.array(
    z.object({
      referenceNumber: z.string(),
      title: z.string().optional(),
      relevanceScore: z.number().optional(),
    })
  ),
  claimText: z.string(),
  inventionData: InventionDataSchema,
  searchId: z.string().nullable(),
});

export const GenerateSuggestionsResultSchema = z.object({
  suggestions: z.array(
    z.object({
      type: z.string(),
      content: z.string(),
      priority: z.enum(['high', 'medium', 'low']).optional(),
    })
  ),
});

// --- Inferred Types ---
export type CombinedAnalysisParams = z.infer<
  typeof CombinedAnalysisParamsSchema
>;
export type CombinedAnalysisResult = z.infer<
  typeof CombinedAnalysisResultSchema
>;
export type GenerateSuggestionsParams = z.infer<
  typeof GenerateSuggestionsParamsSchema
>;
export type GenerateSuggestionsResult = z.infer<
  typeof GenerateSuggestionsResultSchema
>;
