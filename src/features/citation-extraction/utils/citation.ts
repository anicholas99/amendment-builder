/**
 * Citation transformation utilities
 * Handles conversion between database models and UI-ready types
 */

import { logger } from '@/utils/clientLogger';
import { safeJsonParse } from '@/utils/jsonUtils';
import {
  SavedCitationJob,
  SavedCitationMatch,
  ProcessedCitationJob,
  ProcessedCitationMatch,
  CitationMatchData,
  CitationLocation,
  CitationReasoning,
  DeepAnalysisResult,
  ExaminerAnalysisResult,
  CitationJobStatus,
  LocationStatus,
  ReasoningStatus,
} from '@/types/domain/citation';

/**
 * Process a raw citation job from the database into a UI-ready format
 */
export function processCitationJob(
  raw: SavedCitationJob & {
    results?: { resultsData: string } | null;
    deepAnalysisJson?: string | null;
    examinerAnalysisJson?: string | null;
  }
): ProcessedCitationJob {
  logger.debug('[processCitationJob] Processing citation job', {
    id: raw.id,
    hasResults: !!raw.results,
    hasDeepAnalysis: !!raw.deepAnalysisJson,
    hasExaminerAnalysis: !!raw.examinerAnalysisJson,
  });

  // Parse results data if present
  let parsedResults: CitationMatchData[] | null = null;
  if (raw.results?.resultsData) {
    try {
      const parsed = safeJsonParse(raw.results.resultsData, null) as unknown;

      // Handle nested array structure [[...]] or flat [...]
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (Array.isArray(parsed[0])) {
          // It's [[...]] format - take the first inner array
          parsedResults = parsed[0] as CitationMatchData[];
        } else if (typeof parsed[0] === 'object') {
          // It's [...] format - use directly
          parsedResults = parsed as CitationMatchData[];
        }
      }

      logger.debug('[processCitationJob] Parsed results', {
        jobId: raw.id,
        resultCount: parsedResults?.length || 0,
      });
    } catch (error) {
      logger.error('[processCitationJob] Failed to parse results', {
        jobId: raw.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Parse deep analysis if present
  let parsedDeepAnalysis: DeepAnalysisResult | null = null;
  if (raw.deepAnalysisJson) {
    try {
      parsedDeepAnalysis = safeJsonParse(
        raw.deepAnalysisJson,
        null
      ) as DeepAnalysisResult | null;
      logger.debug('[processCitationJob] Parsed deep analysis', {
        jobId: raw.id,
        hasAnalysis: !!parsedDeepAnalysis,
      });
    } catch (error) {
      logger.error('[processCitationJob] Failed to parse deep analysis', {
        jobId: raw.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Parse examiner analysis if present
  let parsedExaminerAnalysis: ExaminerAnalysisResult | null = null;
  if (raw.examinerAnalysisJson) {
    try {
      parsedExaminerAnalysis = safeJsonParse(
        raw.examinerAnalysisJson,
        null
      ) as ExaminerAnalysisResult | null;
      logger.debug('[processCitationJob] Parsed examiner analysis', {
        jobId: raw.id,
        hasAnalysis: !!parsedExaminerAnalysis,
      });
    } catch (error) {
      logger.error('[processCitationJob] Failed to parse examiner analysis', {
        jobId: raw.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Calculate duration if completed
  let duration: number | undefined;
  if (raw.startedAt && raw.completedAt) {
    duration =
      new Date(raw.completedAt).getTime() - new Date(raw.startedAt).getTime();
  }

  const processed: ProcessedCitationJob = {
    id: raw.id,
    searchHistoryId: raw.searchHistoryId,
    status: (raw.status as CitationJobStatus) || 'PENDING',
    externalJobId: raw.externalJobId,
    referenceNumber: raw.referenceNumber,
    createdAt: new Date(raw.createdAt),
    startedAt: raw.startedAt ? new Date(raw.startedAt) : null,
    completedAt: raw.completedAt ? new Date(raw.completedAt) : null,
    error: raw.error,
    deepAnalysis: parsedDeepAnalysis,
    examinerAnalysis: parsedExaminerAnalysis,
    results: parsedResults,
    duration,
  };

  logger.debug('[processCitationJob] Successfully processed job', {
    id: processed.id,
    status: processed.status,
  });

  return processed;
}

/**
 * Process a raw citation match from the database into a UI-ready format
 */
export function processCitationMatch(
  raw: SavedCitationMatch
): ProcessedCitationMatch {
  // Remove per-match debug logging - only log issues

  // Parse location data if present
  let parsedLocation: CitationLocation | null = null;
  let locationDataRaw: string | null = null;

  if (raw.locationData) {
    // Try to parse as JSON first - safeJsonParse handles validation
    const parsed = safeJsonParse(raw.locationData, null);

    if (parsed && typeof parsed === 'object' && 'foundInAbstract' in parsed) {
      // It's valid location JSON
      parsedLocation = parsed as CitationLocation;
    } else {
      // It's a simple string like "Paragraph 30", keep it as is
      locationDataRaw = raw.locationData;
    }
  }

  // Build reasoning data from individual fields if present
  let parsedReasoning: CitationReasoning | null = null;
  if (
    raw.reasoningScore !== null &&
    raw.reasoningSummary !== null &&
    raw.reasoningSummary !== undefined
  ) {
    // Validate that reasoningScore is a valid number
    const scoreValue = Number(raw.reasoningScore);
    if (isNaN(scoreValue) || scoreValue < 0 || scoreValue > 1) {
      logger.warn('[processCitationMatch] Invalid reasoning score detected', {
        matchId: raw.id,
        reasoningScore: raw.reasoningScore,
        scoreType: typeof raw.reasoningScore,
      });
      // Skip creating reasoning object if score is invalid
    } else {
      parsedReasoning = {
        score: scoreValue,
        summary: raw.reasoningSummary || '', // Default to empty string if falsy
        fullAnalysis: undefined, // We don't have this in the current schema
        keyPoints: undefined, // We don't have this in the current schema
        timestamp: new Date(raw.updatedAt), // Use updatedAt as timestamp
      };
    }
  }

  const processed: ProcessedCitationMatch = {
    // Core identifiers
    id: raw.id,
    searchHistoryId: raw.searchHistoryId,
    citationJobId: raw.citationJobId,
    referenceNumber: raw.referenceNumber,

    // Citation content
    citation: raw.citation,
    paragraph: raw.paragraph,
    score: raw.score,
    parsedElementText: raw.parsedElementText,
    elementOrder: (raw as any).elementOrder ?? null,

    // Location data
    locationStatus: (raw.locationStatus as LocationStatus) || 'PENDING',
    locationJobId: raw.locationJobId,
    location: parsedLocation,
    locationDataRaw,
    locationError: raw.locationErrorMessage,

    // Reasoning data
    reasoningStatus: (raw.reasoningStatus as ReasoningStatus) || 'PENDING',
    reasoningJobId: raw.reasoningJobId,
    reasoning: parsedReasoning,
    reasoningError: raw.reasoningErrorMessage,

    // Reference metadata
    referenceTitle: raw.referenceTitle,
    referenceApplicant: raw.referenceApplicant,
    referenceAssignee: raw.referenceAssignee,
    referencePublicationDate: raw.referencePublicationDate,

    // Timestamps
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),

    // Related job info
    jobStatus: raw.citationJob?.status as CitationJobStatus,
    jobCompletedAt: raw.citationJob?.completedAt
      ? new Date(raw.citationJob.completedAt)
      : null,

    // Analysis tracking fields
    analysisSource: raw.analysisSource || 'LEGACY_RELEVANCE',
    isTopResult: raw.isTopResult || false,

    // UI helpers
    isPlaceholder: !raw.citationJob || raw.citationJob.status !== 'COMPLETED',
    hasLocation: !!parsedLocation || !!locationDataRaw,
    hasReasoning: !!parsedReasoning,
  };

  return processed;
}

/**
 * Process an array of citation jobs
 * Filters out invalid entries instead of creating fake data
 */
export function processCitationJobArray(
  rawJobs: Array<
    SavedCitationJob & {
      results?: { resultsData: string } | null;
      deepAnalysisJson?: string | null;
    }
  >
): ProcessedCitationJob[] {
  // Only log summary information
  if (rawJobs.length === 0) {
    return [];
  }

  const processedJobs: ProcessedCitationJob[] = [];
  let errorCount = 0;

  for (const job of rawJobs) {
    try {
      if (!job) {
        errorCount++;
        continue;
      }

      const processed = processCitationJob(job);
      processedJobs.push(processed);
    } catch (error) {
      // Log the error but don't include fake data in results
      logger.error(
        '[processCitationJobArray] Failed to process job, skipping',
        {
          jobId: job?.id || 'unknown',
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      );
      errorCount++;
    }
  }

  // Log summary only when there are issues or significant processing
  if (errorCount > 0 || processedJobs.length > 10) {
    logger.info('[processCitationJobArray] Processing summary', {
      inputCount: rawJobs.length,
      outputCount: processedJobs.length,
      errorCount,
    });
  }

  return processedJobs;
}

/**
 * Process an array of citation matches
 * Filters out invalid entries instead of creating fake data
 */
export function processCitationMatchArray(
  rawMatches: SavedCitationMatch[]
): ProcessedCitationMatch[] {
  // Only log summary information
  if (rawMatches.length === 0) {
    return [];
  }

  const processedMatches: ProcessedCitationMatch[] = [];
  let errorCount = 0;

  for (const match of rawMatches) {
    try {
      if (!match) {
        errorCount++;
        continue;
      }

      const processed = processCitationMatch(match);
      processedMatches.push(processed);
    } catch (error) {
      // Log the error but don't include fake data in results
      logger.error(
        '[processCitationMatchArray] Failed to process match, skipping',
        {
          matchId: match?.id || 'unknown',
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      );
      errorCount++;
    }
  }

  // Log summary only when there are issues or significant processing
  if (errorCount > 0 || processedMatches.length > 10) {
    logger.info('[processCitationMatchArray] Processing summary', {
      inputCount: rawMatches.length,
      outputCount: processedMatches.length,
      errorCount,
    });
  }

  return processedMatches;
}

/**
 * Serialize a processed citation job back to database format
 */
export function serializeCitationJob(
  processed: ProcessedCitationJob
): Partial<SavedCitationJob> & {
  resultsData?: string;
  deepAnalysisJson?: string;
} {
  // Remove per-job debug logging
  const serialized: Partial<SavedCitationJob> & {
    resultsData?: string;
    deepAnalysisJson?: string;
  } = {
    id: processed.id,
    searchHistoryId: processed.searchHistoryId,
    status: processed.status,
    externalJobId: processed.externalJobId,
    referenceNumber: processed.referenceNumber,
    createdAt: processed.createdAt,
    startedAt: processed.startedAt,
    completedAt: processed.completedAt,
    error: processed.error,
  };

  // Serialize results if present
  if (processed.results) {
    // Maintain the [[...]] format for compatibility
    serialized.resultsData = JSON.stringify([processed.results]);
  }

  // Serialize deep analysis if present
  if (processed.deepAnalysis) {
    serialized.deepAnalysisJson = JSON.stringify(processed.deepAnalysis);
  }

  return serialized;
}

/**
 * Serialize a processed citation match back to database format
 */
export function serializeCitationMatch(
  processed: ProcessedCitationMatch
): Partial<SavedCitationMatch> {
  // Remove per-match debug logging
  const serialized = {
    id: processed.id,
    searchHistoryId: processed.searchHistoryId,
    citationJobId: processed.citationJobId,
    referenceNumber: processed.referenceNumber,
    citation: processed.citation,
    paragraph: processed.paragraph,
    score: processed.score,
    parsedElementText: processed.parsedElementText,
    elementOrder: processed.elementOrder, // Include elementOrder field
    locationStatus: processed.locationStatus,
    locationJobId: processed.locationJobId,
    locationData:
      processed.locationDataRaw ||
      (processed.location
        ? JSON.stringify(processed.location)
        : (null as string | null)),
    locationDataRaw: processed.locationDataRaw, // Include raw location for frontend
    location: processed.location, // Include parsed location for frontend
    locationErrorMessage: processed.locationError,
    reasoningStatus: processed.reasoningStatus,
    reasoningJobId: processed.reasoningJobId,
    reasoningScore: processed.reasoning?.score ?? null,
    reasoningSummary: processed.reasoning?.summary ?? null,
    reasoningError: processed.reasoningError,
    referenceTitle: processed.referenceTitle,
    referenceApplicant: processed.referenceApplicant,
    referenceAssignee: processed.referenceAssignee,
    referencePublicationDate: processed.referencePublicationDate,
    createdAt: processed.createdAt,
    updatedAt: processed.updatedAt,
  };

  return serialized as Partial<SavedCitationMatch>;
}

/**
 * Group citation matches by reference number
 */
export function groupMatchesByReference(
  matches: ProcessedCitationMatch[]
): Record<string, ProcessedCitationMatch[]> {
  return matches.reduce(
    (acc, match) => {
      const ref = match.referenceNumber;
      if (!acc[ref]) {
        acc[ref] = [];
      }
      acc[ref].push(match);
      return acc;
    },
    {} as Record<string, ProcessedCitationMatch[]>
  );
}

/**
 * Calculate aggregate statistics for citation matches
 */
export function calculateCitationStats(matches: ProcessedCitationMatch[]) {
  const stats = {
    total: matches.length,
    withReasoning: matches.filter(m => m.hasReasoning).length,
    withLocation: matches.filter(m => m.hasLocation).length,
    byStatus: {
      pending: matches.filter(m => m.jobStatus === 'PENDING').length,
      processing: matches.filter(m => m.jobStatus === 'PROCESSING').length,
      completed: matches.filter(m => m.jobStatus === 'COMPLETED').length,
      failed: matches.filter(m => m.jobStatus === 'FAILED').length,
    },
    averageScore:
      matches.length > 0
        ? Number(
            (
              matches.reduce((sum, m) => sum + (m.score || 0), 0) /
              matches.length
            ).toFixed(10)
          )
        : 0,
    uniqueReferences: new Set(matches.map(m => m.referenceNumber)).size,
  };

  return stats;
}

/**
 * Type guard to check if an object is a valid citation job
 */
export function isValidCitationJob(obj: unknown): obj is ProcessedCitationJob {
  return (
    obj !== null &&
    obj !== undefined &&
    typeof obj === 'object' &&
    'id' in obj &&
    typeof (obj as Record<string, unknown>).id === 'string' &&
    'searchHistoryId' in obj &&
    typeof (obj as Record<string, unknown>).searchHistoryId === 'string' &&
    'status' in obj &&
    typeof (obj as Record<string, unknown>).status === 'string' &&
    [
      'PENDING',
      'PROCESSING',
      'COMPLETED',
      'FAILED',
      'PENDING_EXTERNAL',
      'COMPLETED_EXTERNAL',
      'FAILED_EXTERNAL',
      'ERROR_PROCESSING_RESULTS',
      'QUEUE_FAILED',
    ].includes((obj as Record<string, unknown>).status as string)
  );
}

/**
 * Type guard to check if an object is a valid citation match
 */
export function isValidCitationMatch(
  obj: unknown
): obj is ProcessedCitationMatch {
  return (
    obj !== null &&
    obj !== undefined &&
    typeof obj === 'object' &&
    'id' in obj &&
    typeof (obj as Record<string, unknown>).id === 'string' &&
    'citationJobId' in obj &&
    typeof (obj as Record<string, unknown>).citationJobId === 'string' &&
    'citation' in obj &&
    typeof (obj as Record<string, unknown>).citation === 'string' &&
    'referenceNumber' in obj &&
    typeof (obj as Record<string, unknown>).referenceNumber === 'string'
  );
}
