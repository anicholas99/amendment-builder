/**
 * Types related to the Prior Art Analysis feature.
 */

import { PriorArtReference } from './claimTypes'; // Assuming claimTypes is in the same dir or adjust path

/**
 * Represents the coverage matrix mapping claim elements to reference disclosures.
 * Key: Parsed element text
 * Value: Object mapping Reference ID to Yes/Partial/No
 */
export interface CoverageMatrix {
  [element: string]: {
    [referenceId: string]: 'Yes' | 'Partial' | 'No';
  };
}

/**
 * Represents the simplified analysis results for a single prior art reference (holistic only).
 */
export interface PriorArtAnalysisResult {
  referenceId: string; // Publication Number
  overlapSummary: string; // Holistic overlap summary
  primaryRiskType: '§102 Anticipation' | '§103 Obviousness' | 'Low Risk';
  riskRationale: string;
}

/**
 * Represents the risk profile calculated for a single reference.
 */
export interface ReferenceRiskProfile {
  referenceId: string; // e.g., 'US-12345-A1'
  totalElements: number; // Total claim elements analyzed
  novelElements: number; // Count where coverageMatrix = 'No'
  coverageScore: number; // Percentage (0-100) of novel elements
  isResolved: boolean; // True if coverageScore >= threshold
}

/**
 * Represents the overall structure of the AI analysis response, including metadata.
 * Combines holistic analysis with the coverage matrix.
 */
export interface FullAnalysisResponse {
  coverageMatrix: CoverageMatrix;
  analyses: PriorArtAnalysisResult[];
  priorityActions: string[];
  structuringAdvice: string;
  dependentClaimSuggestions: string[];
  finalClaimDraft: string;
  overallAssessment: string;
  keyDistinguishingFeatures: string[];
  holisticRefinementSuggestions: Array<{
    suggestion: string;
    rationale: string;
    addressesReferences: string[];
  }>;
  obviousnessCombinations: Array<{
    combination: string[];
    rationale: string;
  }>;
  analyzedAt?: string;
  referencesAnalyzedCount?: number;
  referencesRequestedCount?: number;
  partialDataWarning?: string;
  referenceRiskProfiles?: ReferenceRiskProfile[];
  autoResolvedReferences?: string[];
}

// Optional: If you use CoreAIAnalysisResponse internally in aiAnalysisService.ts,
// ensure it also reflects these changes. It might be defined directly there
// or derived from FullAnalysisResponse.

// Add other related types if needed...
