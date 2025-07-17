import { z } from 'zod';

/**
 * Schemas for Patentability Score JSON Blobs
 *
 * These schemas define the structure of analysis data stored in PatentabilityScore:
 * - elementAnalysisJson: Analysis of individual claim elements
 * - overlapMatrixJson: Matrix showing overlap between elements and prior art
 * - recommendations: Strategic recommendations (stored as JSON array string)
 */

/**
 * Element Analysis Schema
 * Represents the analysis of individual claim elements for patentability
 */
export const ElementAnalysisSchema = z.object({
  elementText: z.string(),
  concernLevel: z.enum(['high', 'medium', 'low']),
  matchCount: z.number().int().min(0),
  primaryReference: z.string(),
  primaryReferenceScore: z.number().min(0).max(1),
  analysis: z.string(),

  // Optional fields that may be present in some versions
  elementId: z.string().optional(),
  previousOverlap: z.number().optional(),
  overlapDiff: z.number().optional(),
});

/**
 * Overlap Matrix Entry Schema
 * Represents the overlap between a claim element and prior art references
 */
export const OverlapMatrixEntrySchema = z.object({
  overlap: z.number().min(0).max(1),
  refs: z.array(z.string()),
});

/**
 * Complete schemas for PatentabilityScore JSON fields
 */
export const ElementAnalysisArraySchema = z.array(ElementAnalysisSchema);
export const OverlapMatrixSchema = z.record(
  z.string(),
  OverlapMatrixEntrySchema
);
export const RecommendationsArraySchema = z.array(z.string());

// Type inference
export type ElementAnalysis = z.infer<typeof ElementAnalysisSchema>;
export type OverlapMatrixEntry = z.infer<typeof OverlapMatrixEntrySchema>;
export type OverlapMatrix = z.infer<typeof OverlapMatrixSchema>;

/**
 * Validates and parses element analysis from database JSON string
 * @param jsonString - Raw JSON string from database
 * @returns Parsed and validated element analysis array or null if invalid
 */
export function parseElementAnalysis(
  jsonString: string | null | undefined
): ElementAnalysis[] | null {
  if (!jsonString) return null;

  try {
    const parsed = JSON.parse(jsonString);
    return ElementAnalysisArraySchema.parse(parsed);
  } catch (error) {
    // Error logging removed for client compatibility
    return null;
  }
}

/**
 * Validates and parses overlap matrix from database JSON string
 * @param jsonString - Raw JSON string from database
 * @returns Parsed and validated overlap matrix or null if invalid
 */
export function parseOverlapMatrix(
  jsonString: string | null | undefined
): OverlapMatrix | null {
  if (!jsonString) return null;

  try {
    const parsed = JSON.parse(jsonString);
    return OverlapMatrixSchema.parse(parsed);
  } catch (error) {
    // Error logging removed for client compatibility
    return null;
  }
}

/**
 * Validates and parses recommendations from database JSON string
 * @param jsonString - Raw JSON string from database
 * @returns Parsed and validated recommendations array or null if invalid
 */
export function parseRecommendations(
  jsonString: string | null | undefined
): string[] | null {
  if (!jsonString) return null;

  try {
    const parsed = JSON.parse(jsonString);
    return RecommendationsArraySchema.parse(parsed);
  } catch (error) {
    // Error logging removed for client compatibility
    return null;
  }
}

/**
 * Safely stringifies element analysis for database storage
 * @param analysis - Element analysis array
 * @returns JSON string or null
 */
export function stringifyElementAnalysis(
  analysis: ElementAnalysis[] | null | undefined
): string | null {
  if (!analysis || analysis.length === 0) return null;

  try {
    // Validate before stringifying
    const validated = ElementAnalysisArraySchema.parse(analysis);
    return JSON.stringify(validated);
  } catch (error) {
    // Error logging removed for client compatibility
    return null;
  }
}

/**
 * Safely stringifies overlap matrix for database storage
 * @param matrix - Overlap matrix object
 * @returns JSON string or null
 */
export function stringifyOverlapMatrix(
  matrix: OverlapMatrix | null | undefined
): string | null {
  if (!matrix) return null;

  try {
    // Validate before stringifying
    const validated = OverlapMatrixSchema.parse(matrix);
    return JSON.stringify(validated);
  } catch (error) {
    // Error logging removed for client compatibility
    return null;
  }
}

/**
 * Safely stringifies recommendations for database storage
 * @param recommendations - Recommendations array
 * @returns JSON string or null
 */
export function stringifyRecommendations(
  recommendations: string[] | null | undefined
): string | null {
  if (!recommendations || recommendations.length === 0) return null;

  try {
    // Validate before stringifying
    const validated = RecommendationsArraySchema.parse(recommendations);
    return JSON.stringify(validated);
  } catch (error) {
    // Error logging removed for client compatibility
    return null;
  }
}
