import { z } from 'zod';
import { logger } from '@/lib/monitoring/logger';

/**
 * Schemas for Citation Analysis JSON Blobs
 *
 * These schemas define the structure of analysis data stored in CitationJob:
 * - deepAnalysisJson: Contains AI-generated deep analysis of citation relevance
 * - examinerAnalysisJson: Contains examiner-style analysis for patent rejection
 */

/**
 * Element Analysis Schema
 * Common structure for element-level analysis
 */
export const ElementAnalysisSchema = z.object({
  elementId: z.string(),
  relevance: z.number().min(0).max(1),
  explanation: z.string(),
  matchedConcepts: z.array(z.string()).optional(),
});

// Element comparison for examiner analysis
export const ExaminerElementAnalysisSchema = z.object({
  analysis: z.string(),
  relevanceLevel: z.enum(['high', 'medium', 'low']),
  relevanceScore: z.number().min(0).max(1),
  keyFindings: z.array(z.string()),
  rejectionType: z
    .enum(['102 Anticipation', '103 Obviousness', 'Not Rejected'])
    .optional(),
  primaryCitations: z
    .array(
      z.object({
        location: z.string(),
        citationText: z.string(),
        paragraphContext: z.string().optional(),
        reasoning: z.string(),
      })
    )
    .optional(),
  rejectionRationale: z.string().optional(),
  recommendation: z.string().optional(),
});

export const ExaminerOverallAssessmentSchema = z.object({
  summary: z.string(),
  patentabilityScore: z.number().min(0).max(1),
  keyConcerns: z.array(z.string()),
  strategicRecommendations: z.array(z.string()),
  overallRejection: z
    .enum(['102 Anticipation', '103 Obviousness', 'Not Rejected'])
    .optional(),
  rejectionSummary: z.string().optional(),
});

/**
 * Deep Analysis Result Schema
 * Stored in CitationJob.deepAnalysisJson
 */
export const DeepAnalysisResultSchema = z.object({
  elementAnalysis: z.record(ExaminerElementAnalysisSchema),
  overallAssessment: ExaminerOverallAssessmentSchema,
  holisticAnalysis: z.string().optional(),
  originalClaim: z.string().optional(),
  revisedClaim: z.string().optional(),
});

export const LegacyDeepAnalysisSchema = z.object({
  summary: z.string(),
  relevanceLevel: z.enum(['high', 'medium', 'low']),
  elements: z.record(z.string()),
  keyFindings: z.array(z.string()).optional(),
  recommendations: z.array(z.string()).optional(),
});

// Type inference
export type DeepAnalysisResult = z.infer<typeof DeepAnalysisResultSchema>;
export type LegacyDeepAnalysis = z.infer<typeof LegacyDeepAnalysisSchema>;

/**
 * Transform legacy deep analysis format to new format
 */
export function transformLegacyDeepAnalysis(
  legacy: LegacyDeepAnalysis
): DeepAnalysisResult {
  // Convert legacy elements to new elementAnalysis format
  const elementAnalysis: Record<
    string,
    z.infer<typeof ExaminerElementAnalysisSchema>
  > = {};

  for (const [element, analysis] of Object.entries(legacy.elements)) {
    elementAnalysis[element] = {
      analysis: analysis,
      relevanceLevel: legacy.relevanceLevel,
      relevanceScore:
        legacy.relevanceLevel === 'high'
          ? 0.8
          : legacy.relevanceLevel === 'medium'
            ? 0.5
            : 0.2,
      keyFindings: legacy.keyFindings || [],
      rejectionType: undefined,
      primaryCitations: undefined,
      rejectionRationale: undefined,
      recommendation: undefined,
    };
  }

  const overallRelevance =
    legacy.relevanceLevel === 'high'
      ? 0.8
      : legacy.relevanceLevel === 'medium'
        ? 0.5
        : 0.2;

  return {
    elementAnalysis,
    overallAssessment: {
      summary: legacy.summary,
      patentabilityScore: overallRelevance,
      keyConcerns: [],
      strategicRecommendations: legacy.recommendations || [],
    },
  };
}

/**
 * Validates and parses deep analysis from database JSON string
 * Handles both current and legacy formats
 */
export function parseDeepAnalysis(
  jsonString: string | null | undefined
): DeepAnalysisResult | null {
  if (!jsonString) return null;

  try {
    const parsed = JSON.parse(jsonString);

    // Try current format first
    const currentResult = DeepAnalysisResultSchema.safeParse(parsed);
    if (currentResult.success) {
      return currentResult.data;
    }

    // Try legacy format
    const legacyResult = LegacyDeepAnalysisSchema.safeParse(parsed);
    if (legacyResult.success) {
      return transformLegacyDeepAnalysis(legacyResult.data);
    }

    logger.error('Failed to parse deep analysis - unknown format');
    return null;
  } catch (error) {
    logger.error('Failed to parse deep analysis JSON:', error);
    return null;
  }
}

/**
 * Validates and parses examiner analysis from database JSON string
 * Note: This now uses the same format as deep analysis
 */
export function parseExaminerAnalysis(
  jsonString: string | null | undefined
): DeepAnalysisResult | null {
  // Examiner analysis now uses the same format as deep analysis
  return parseDeepAnalysis(jsonString);
}

/**
 * Safely stringifies deep analysis for database storage
 */
export function stringifyDeepAnalysis(
  analysis: DeepAnalysisResult | null | undefined
): string | null {
  if (!analysis) return null;

  try {
    // Validate before stringifying
    const validated = DeepAnalysisResultSchema.parse(analysis);
    return JSON.stringify(validated);
  } catch (error) {
    logger.error('Failed to stringify deep analysis:', error);
    return null;
  }
}

/**
 * Safely stringifies examiner analysis for database storage
 * Note: This now uses the same format as deep analysis
 */
export function stringifyExaminerAnalysis(
  analysis: DeepAnalysisResult | null | undefined
): string | null {
  // Examiner analysis now uses the same format as deep analysis
  return stringifyDeepAnalysis(analysis);
}
