/**
 * Citation Job transformation utilities
 *
 * Provides safe parsing and transformation of CitationJob data,
 * handling JSON fields and ensuring type safety throughout the application.
 */

import { z } from 'zod';
import {
  CitationJob as PrismaCitationJob,
  CitationResult as PrismaCitationResult,
  CitationMatch as PrismaCitationMatch,
} from '@prisma/client';
import {
  EnhancedProcessedCitationJob,
  RawCitationResult,
  DeepAnalysisResult,
  ExaminerAnalysisResult,
  SerializedCitationJob,
  CitationJobStatus,
  ProcessedCitationMatch,
} from '@/types/domain/citation';
import { safeJsonParse } from '@/utils/jsonUtils';
import { logger } from '@/utils/clientLogger';
import { processCitationMatch } from './citation';
import { validateApiResponse } from '@/lib/validation/apiValidation';
import { parseDeepAnalysis as parseDeepAnalysisFromSchema } from '@/lib/validation/schemas/db/citationAnalysis.schema';

/**
 * Zod schema for raw citation result
 */
const RawCitationResultSchema = z
  .object({
    citation: z.string(),
    paragraph: z.string().nullable().optional(),
    score: z.number().optional(),
    rankPercentage: z.number().optional(),
    elementText: z.string().optional(),
    matchingText: z.string().optional(),
    // Additional fields found in actual API responses
    ucId: z.string().optional(),
    paragraphNumer: z.number().optional(), // Note: API sends "paragraphNumer" not "paragraphNumber"
    paragraphNumber: z.number().optional(), // Also accept the correctly spelled version
  })
  .catchall(z.unknown()); // Allow additional unknown fields to be more flexible

/**
 * Type for database CitationJob with optional relations
 */
type CitationJobWithRelations = PrismaCitationJob & {
  results?: PrismaCitationResult | null;
  matches?: PrismaCitationMatch[];
  examinerAnalysisJson?: string | null;
};

/**
 * Parse raw result data safely
 */
function parseRawResultData(
  rawData: string | null
): RawCitationResult[] | null {
  if (!rawData) return null;

  try {
    const parsed = safeJsonParse(rawData, null) as unknown;
    if (!parsed) return null;

    // Handle nested array structure [[...]] (most common case)
    if (
      Array.isArray(parsed) &&
      parsed.length > 0 &&
      Array.isArray(parsed[0])
    ) {
      // It's a nested array [[{...}, {...}]] - extract the first inner array
      const innerArray = parsed[0];
      const results: RawCitationResult[] = [];

      for (const item of innerArray) {
        const validated = RawCitationResultSchema.safeParse(item);
        if (validated.success) {
          results.push(validated.data);
        } else {
          logger.warn('[parseRawResultData] Invalid result item:', {
            error: JSON.stringify(validated.error.issues),
            item,
          });
        }
      }
      return results.length > 0 ? results : null;
    }

    // Handle flat array structure [...]
    if (Array.isArray(parsed)) {
      const results: RawCitationResult[] = [];
      for (const item of parsed) {
        const validated = RawCitationResultSchema.safeParse(item);
        if (validated.success) {
          results.push(validated.data);
        } else {
          logger.warn('[parseRawResultData] Invalid result item:', {
            error: JSON.stringify(validated.error.issues),
            item,
          });
        }
      }
      return results.length > 0 ? results : null;
    }

    // Handle single result wrapped in object
    if (typeof parsed === 'object' && parsed !== null && 'results' in parsed) {
      const objectWithResults = parsed as { results: unknown };
      if (Array.isArray(objectWithResults.results)) {
        return parseRawResultData(JSON.stringify(objectWithResults.results));
      }
    }

    logger.warn('[parseRawResultData] Unexpected data structure:', { parsed });
    return null;
  } catch (error) {
    logger.error('[parseRawResultData] Error parsing raw result data:', {
      error,
    });
    return null;
  }
}

/**
 * Parse deep analysis JSON safely
 */
function parseDeepAnalysisJson(
  deepAnalysisJson: string | null
): DeepAnalysisResult | null {
  if (!deepAnalysisJson) return null;

  // Use the centralized parsing function that handles all formats
  return parseDeepAnalysisFromSchema(
    deepAnalysisJson
  ) as DeepAnalysisResult | null;
}

/**
 * Parse examiner analysis JSON safely
 */
function parseExaminerAnalysisJson(
  examinerAnalysisJson: string | null
): ExaminerAnalysisResult | null {
  if (!examinerAnalysisJson) return null;

  try {
    const parsed = safeJsonParse(examinerAnalysisJson, null) as unknown;
    if (!parsed) return null;

    // For now, we'll assume the examiner analysis is always in the correct format
    // In production, you'd want to add Zod validation here
    return parsed as ExaminerAnalysisResult;
  } catch (error) {
    logger.error(
      '[parseExaminerAnalysisJson] Error parsing examiner analysis:',
      { error }
    );
    return null;
  }
}

/**
 * Calculate duration between two dates
 */
function calculateDuration(
  startedAt?: Date | null,
  completedAt?: Date | null
): number | undefined {
  if (!startedAt || !completedAt) return undefined;
  return completedAt.getTime() - startedAt.getTime();
}

/**
 * Transform a raw CitationJob from the database into a processed version
 */
export function processCitationJob(
  job: CitationJobWithRelations
): EnhancedProcessedCitationJob {
  // Parse JSON fields
  const results = parseRawResultData(job.rawResultData);
  const deepAnalysis = parseDeepAnalysisJson(job.deepAnalysisJson);
  const examinerAnalysis = parseExaminerAnalysisJson(
    job.examinerAnalysisJson || null
  );

  // Calculate computed fields
  const isComplete = job.status === 'COMPLETED' || job.status === 'completed';
  const hasResults = !!results && results.length > 0;
  const hasDeepAnalysis = !!deepAnalysis;
  const hasExaminerAnalysis = !!examinerAnalysis;
  const duration = calculateDuration(job.startedAt, job.completedAt);

  // Process matches if included
  let processedMatches: ProcessedCitationMatch[] | undefined;
  if (job.matches) {
    processedMatches = job.matches.map(match => processCitationMatch(match));
  }

  return {
    // Core fields
    id: job.id,
    searchHistoryId: job.searchHistoryId,
    status: job.status.toUpperCase() as CitationJobStatus,
    externalJobId: job.externalJobId,
    referenceNumber: job.referenceNumber,

    // Timestamps
    createdAt: job.createdAt,
    startedAt: job.startedAt,
    completedAt: job.completedAt,
    lastCheckedAt: job.lastCheckedAt,

    // Error handling
    error: job.error,
    errorMessage: job.errorMessage,

    // Parsed JSON fields
    results,
    deepAnalysis,
    examinerAnalysis,

    // Computed fields
    duration,
    isComplete,
    hasResults,
    hasDeepAnalysis,
    hasExaminerAnalysis,

    // Relations
    matches: processedMatches,
    citationResult: job.results
      ? {
          id: job.results.id,
          resultsData: safeJsonParse(job.results.resultsData, {}),
          createdAt: job.results.createdAt,
        }
      : null,
  };
}

/**
 * Serialize a processed CitationJob for API responses
 */
export function serializeCitationJob(
  job: EnhancedProcessedCitationJob
): SerializedCitationJob {
  return {
    // Core fields
    id: job.id,
    searchHistoryId: job.searchHistoryId,
    status: job.status,
    externalJobId: job.externalJobId,
    referenceNumber: job.referenceNumber,

    // Timestamps as ISO strings
    createdAt: job.createdAt.toISOString(),
    startedAt: job.startedAt?.toISOString() || null,
    completedAt: job.completedAt?.toISOString() || null,
    lastCheckedAt: job.lastCheckedAt?.toISOString() || null,

    // Error handling
    error: job.error,
    errorMessage: job.errorMessage,

    // JSON fields as strings for backwards compatibility
    rawResultData: job.results ? JSON.stringify(job.results) : null,
    deepAnalysisJson: job.deepAnalysis
      ? JSON.stringify(job.deepAnalysis)
      : null,
    examinerAnalysisJson: job.examinerAnalysis
      ? JSON.stringify(job.examinerAnalysis)
      : null,

    // Computed fields
    duration: job.duration,
    isComplete: job.isComplete,
    hasResults: job.hasResults,
    hasDeepAnalysis: job.hasDeepAnalysis,
    hasExaminerAnalysis: job.hasExaminerAnalysis,
  };
}

/**
 * Process an array of citation jobs
 */
export function processCitationJobs(
  jobs: CitationJobWithRelations[]
): EnhancedProcessedCitationJob[] {
  return jobs.map(job => processCitationJob(job));
}

/**
 * Validate and process citation job input for creation
 */
export const CreateCitationJobSchema = z.object({
  searchHistoryId: z.string().uuid(),
  externalJobId: z.union([z.string(), z.number()]).transform(val => {
    if (typeof val === 'string') {
      const parsed = parseInt(val, 10);
      if (isNaN(parsed)) {
        throw new z.ZodError([
          {
            code: 'custom',
            message: 'Invalid externalJobId format',
            path: ['externalJobId'],
          },
        ]);
      }
      return parsed;
    }
    return val;
  }),
  referenceNumber: z.string().min(1),
  status: z.string().optional().default('PENDING'),
});

export type ValidatedCreateCitationJobInput = z.infer<
  typeof CreateCitationJobSchema
>;
