/**
 * Database JSON Blob Schemas
 *
 * This module exports all Zod schemas for JSON data stored in database text fields.
 * These schemas provide runtime validation and type safety for critical business data
 * that is stored as JSON strings in the database.
 *
 * Usage:
 * ```typescript
 * import { parseParsedElements } from '@/lib/validation/schemas/db';
 *
 * const parsedElements = parseParsedElements(claimSetVersion.parsedElementsJson);
 * ```
 */

// Citation analysis schemas
export {
  DeepAnalysisResultSchema,
  LegacyDeepAnalysisSchema,
  transformLegacyDeepAnalysis,
  parseDeepAnalysis,
  parseExaminerAnalysis,
  stringifyDeepAnalysis,
  stringifyExaminerAnalysis,
  type DeepAnalysisResult,
  type LegacyDeepAnalysis,
} from './citationAnalysis.schema';

// Patentability score schemas
export {
  ElementAnalysisSchema,
  OverlapMatrixEntrySchema,
  ElementAnalysisArraySchema,
  OverlapMatrixSchema,
  RecommendationsArraySchema,
  parseElementAnalysis,
  parseOverlapMatrix,
  parseRecommendations,
  stringifyElementAnalysis,
  stringifyOverlapMatrix,
  stringifyRecommendations,
  type ElementAnalysis,
  type OverlapMatrixEntry,
  type OverlapMatrix,
} from './patentabilityScore.schema';
