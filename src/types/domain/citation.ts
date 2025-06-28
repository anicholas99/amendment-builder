/**
 * Consolidated domain types for citations
 * This file serves as the single source of truth for all citation-related types
 */

import {
  CitationJob as PrismaCitationJob,
  CitationMatch as PrismaCitationMatch,
} from '@prisma/client';

/**
 * Raw citation job from database (Prisma model)
 */
export interface SavedCitationJob extends PrismaCitationJob {
  // Extending Prisma model directly for type safety
}

/**
 * Raw citation match from database with all fields
 */
export interface SavedCitationMatch extends PrismaCitationMatch {
  // These are the actual DB fields based on the repository code
  citationJob?: {
    id: string;
    status: string;
    externalJobId: number | null;
    referenceNumber: string | null;
    completedAt: Date | null;
  };
}

/**
 * Parsed citation data from external API results
 */
export interface CitationMatchData {
  citation: string;
  paragraph?: string | null;
  score?: number;
  rankPercentage?: number;
  elementText?: string;
  matchingText?: string;
}

/**
 * Location data for a citation match
 * This matches the ExternalLocationResult structure from the API
 */
export interface CitationLocation {
  foundInAbstract: boolean;
  claimLocations: Array<{
    startClaimNumber: number;
    endClaimNumber: number;
  }>;
  patentDescriptionLocations: Array<{
    startPageNumber: number;
    startColumnNumber: number;
    startLineNumber: number;
    endPageNumber: number;
    endColumnNumber: number;
    endLineNumber: number;
  }>;
  applicationDescriptionLocations: Array<{
    startParagraphNumber: string;
    endParagraphNumber: string;
  }>;
  publicationType: string; // e.g., "G" for granted, "A" for application
  // Legacy fields (if present in old data)
  reference?: string;
  elementId?: string;
  locations?: Array<{
    section: string;
    text: string;
    context?: string;
  }>;
}

/**
 * Deep analysis result for a citation
 */
export interface DeepAnalysisResult {
  elementAnalysis: {
    [element: string]: {
      analysis: string;
      relevanceLevel: string;
      relevanceScore: number;
      keyFindings: string[];
      rejectionType: string;
      primaryCitations: Array<{
        location: string;
        citationText: string;
        paragraphContext?: string;
        reasoning: string;
      }>;
      rejectionRationale: string;
      recommendation: string;
    };
  };
  overallAssessment: {
    summary: string;
    patentabilityScore: number;
    keyConcerns: string[];
    overallRejection: string;
    rejectionSummary: string;
    strategicRecommendations: string[];
  };
  holisticAnalysis: string;
  originalClaim?: string;
  revisedClaim?: string;
}

/**
 * Enhanced deep analysis result with citation mapping
 * This is the new format that includes specific citation identification
 */
export interface EnhancedDeepAnalysisResult {
  elementAnalysis: {
    [element: string]: {
      analysis: string;
      relevanceLevel: string;
      relevanceScore: number;
      keyFindings: string[];
      rejectionType?: string;
      primaryCitations?: Array<{
        location: string;
        citationText: string;
        paragraphContext?: string;
        reasoning: string;
      }>;
      rejectionRationale?: string;
      recommendation?: string;
    };
  };
  overallAssessment: {
    summary: string;
    patentabilityScore: number;
    keyConcerns: string[];
    overallRejection?: string;
    rejectionSummary?: string;
    strategicRecommendations: string[];
  };
  holisticAnalysis?: string;
  originalClaim?: string;
  revisedClaim?: string;
}

/**
 * Examiner analysis result for a citation
 */
export interface ExaminerAnalysisResult {
  examinerSummary: string;
  keyRejectionPoints: Array<{
    type: '102 Anticipation' | '103 Obviousness' | 'No Rejection';
    elements: string[];
    rationale: string;
  }>;
  responseStrategy: {
    primaryArgument: string;
    amendmentSuggestions: string[];
    distinctionPoints: string[];
  };
  elementComparisons: Array<{
    element: string;
    topCitations: Array<{
      text: string;
      relevance: number;
      location: string;
    }>;
    examinerView: string;
  }>;
  referenceNumber: string;
  referenceTitle: string;
  analysisDate: string;
}

/**
 * Reasoning data for a citation match
 */
export interface CitationReasoning {
  score: number;
  summary: string;
  fullAnalysis?: string;
  keyPoints?: string[];
  timestamp: Date;
}

/**
 * Status types for various async operations
 */
export type CitationJobStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'PENDING_EXTERNAL'
  | 'COMPLETED_EXTERNAL'
  | 'FAILED_EXTERNAL'
  | 'ERROR_PROCESSING_RESULTS'
  | 'QUEUE_FAILED';
export type LocationStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'NOT_FOUND';
export type ReasoningStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

/**
 * UI-ready citation job with parsed data
 */
export interface ProcessedCitationJob {
  id: string;
  searchHistoryId: string;
  status: CitationJobStatus;
  externalJobId?: number | null;
  referenceNumber?: string | null;
  createdAt: Date;
  startedAt?: Date | null;
  completedAt?: Date | null;
  error?: string | null;

  // Parsed fields
  deepAnalysis?: DeepAnalysisResult | null;
  examinerAnalysis?: ExaminerAnalysisResult | null;
  results?: CitationMatchData[] | null;

  // Computed fields
  duration?: number; // in milliseconds
  isOptimistic?: boolean;
  wasOptimistic?: boolean;
}

/**
 * UI-ready citation match with all parsed data
 */
export interface ProcessedCitationMatch {
  // Core identifiers
  id: string;
  searchHistoryId: string;
  citationJobId: string;
  referenceNumber: string;

  // Citation content
  citation: string;
  paragraph?: string | null;
  score?: number | null;
  parsedElementText?: string | null;
  elementOrder?: number | null;

  // Location data (parsed)
  locationStatus: LocationStatus;
  locationJobId?: number | null;
  location?: CitationLocation | null;
  locationDataRaw?: string | null; // Raw location data when not JSON (e.g., "Paragraph 30")
  locationError?: string | null;

  // Reasoning data (parsed)
  reasoningStatus: ReasoningStatus;
  reasoningJobId?: number | null;
  reasoning?: CitationReasoning | null;
  reasoningError?: string | null;

  // Reference metadata
  referenceTitle?: string | null;
  referenceApplicant?: string | null;
  referenceAssignee?: string | null;
  referencePublicationDate?: string | null;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Related job info
  jobStatus?: CitationJobStatus;
  jobCompletedAt?: Date | null;

  // Analysis tracking fields
  analysisSource: string;
  isTopResult: boolean;

  // UI helpers
  isPlaceholder?: boolean;
  hasLocation?: boolean;
  hasReasoning?: boolean;
}

/**
 * Consolidated citation results for a search history
 */
export interface ConsolidatedCitationResults {
  searchHistoryId: string;
  totalMatches: number;
  uniqueReferences: number;
  topMatches: ProcessedCitationMatch[];
  byReference: Record<string, ProcessedCitationMatch[]>;
  timestamp: Date;
}

/**
 * Smart citation analysis for patent claims
 */
export interface SmartCitationAnalysis {
  elementAnalysis: Array<{
    elementText: string;
    emphasizedInClaim: boolean;
    priorArtStrength: number;
    patentabilityFocus: number;
    reasoning: string;
    citationEvidence: Array<{
      referenceNumber: string;
      exactText: string;
      relevance: number;
    }>;
  }>;
  preprocessorSummary: string;
  overallAssessment?: {
    patentabilityScore: number;
    criticalElements: string[];
    recommendations: string[];
  };
}

/**
 * Type guards
 */
export function isCitationJob(obj: unknown): obj is SavedCitationJob {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    'id' in obj &&
    typeof (obj as Record<string, unknown>).id === 'string' &&
    'searchHistoryId' in obj &&
    typeof (obj as Record<string, unknown>).searchHistoryId === 'string' &&
    'status' in obj &&
    typeof (obj as Record<string, unknown>).status === 'string'
  );
}

export function isCitationMatch(obj: unknown): obj is SavedCitationMatch {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    'id' in obj &&
    typeof (obj as Record<string, unknown>).id === 'string' &&
    'citationJobId' in obj &&
    typeof (obj as Record<string, unknown>).citationJobId === 'string' &&
    'citation' in obj &&
    typeof (obj as Record<string, unknown>).citation === 'string'
  );
}

/**
 * Utility types for API requests/responses
 */
export interface CreateCitationJobRequest {
  searchHistoryId: string;
  referenceNumber: string;
  searchInputs?: string[];
}

export interface UpdateCitationMatchReasoningRequest {
  citationMatchId: string;
  score: number;
  summary: string;
  fullAnalysis?: string;
}

export interface CitationMatchFilter {
  searchHistoryId?: string;
  referenceNumber?: string;
  hasReasoning?: boolean;
  hasLocation?: boolean;
  minScore?: number;
}

/**
 * Enhanced CitationJob types with safe JSON field handling
 */

/**
 * Raw result data structure from external citation service
 */
export interface RawCitationResult {
  citation: string;
  paragraph?: string | null;
  score?: number;
  rankPercentage?: number;
  elementText?: string;
  matchingText?: string;
}

/**
 * Enhanced ProcessedCitationJob with fully parsed JSON fields
 * This replaces the basic ProcessedCitationJob above for full type safety
 */
export interface EnhancedProcessedCitationJob {
  // Core fields
  id: string;
  searchHistoryId: string;
  status: CitationJobStatus;
  externalJobId?: number | null;
  referenceNumber?: string | null;

  // Timestamps
  createdAt: Date;
  startedAt?: Date | null;
  completedAt?: Date | null;
  lastCheckedAt?: Date | null;

  // Error handling
  error?: string | null;
  errorMessage?: string | null;

  // Parsed JSON fields (no longer strings)
  results?: RawCitationResult[] | null;
  deepAnalysis?: DeepAnalysisResult | null;
  examinerAnalysis?: ExaminerAnalysisResult | null;

  // Computed fields
  duration?: number; // in milliseconds
  isComplete: boolean;
  hasResults: boolean;
  hasDeepAnalysis: boolean;
  hasExaminerAnalysis: boolean;

  // Relations (optional, included based on query)
  matches?: ProcessedCitationMatch[];
  citationResult?: {
    id: string;
    resultsData: unknown; // Already parsed
    createdAt: Date;
  } | null;
}

/**
 * Serializable version for API responses
 */
export interface SerializedCitationJob {
  id: string;
  searchHistoryId: string;
  status: CitationJobStatus;
  externalJobId?: number | null;
  referenceNumber?: string | null;
  createdAt: string; // ISO date string
  startedAt?: string | null;
  completedAt?: string | null;
  lastCheckedAt?: string | null;
  error?: string | null;
  errorMessage?: string | null;
  rawResultData?: string | null; // Keep as string for backwards compatibility
  deepAnalysisJson?: string | null; // Keep as string for backwards compatibility
  examinerAnalysisJson?: string | null; // Keep as string for backwards compatibility
  duration?: number;
  isComplete: boolean;
  hasResults: boolean;
  hasDeepAnalysis: boolean;
  hasExaminerAnalysis: boolean;
}

/**
 * Type guard for enhanced processed citation job
 */
export function isEnhancedProcessedCitationJob(
  obj: unknown
): obj is EnhancedProcessedCitationJob {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    'id' in obj &&
    typeof (obj as Record<string, unknown>).id === 'string' &&
    'searchHistoryId' in obj &&
    typeof (obj as Record<string, unknown>).searchHistoryId === 'string' &&
    'status' in obj &&
    typeof (obj as Record<string, unknown>).status === 'string' &&
    'isComplete' in obj &&
    typeof (obj as Record<string, unknown>).isComplete === 'boolean' &&
    'hasResults' in obj &&
    typeof (obj as Record<string, unknown>).hasResults === 'boolean' &&
    'hasDeepAnalysis' in obj &&
    typeof (obj as Record<string, unknown>).hasDeepAnalysis === 'boolean'
  );
}
