/**
 * Deep Analysis Types
 *
 * Centralized type definitions for deep analysis functionality.
 * Extracted from DeepAnalysisPanel.tsx to follow single responsibility principle.
 */

export interface ParsedDeepAnalysis {
  [claimElement: string]: string;
}

export interface Citation {
  location: string;
  citationText: string;
  paragraphContext?: string;
  reasoning: string;
}

export interface ElementAnalysis {
  analysis: string;
  relevanceLevel: 'high' | 'medium' | 'low';
  relevanceScore: number;
  keyFindings: string[];
}

export interface StructuredDeepAnalysis {
  elementAnalysis: {
    [claimElement: string]: ElementAnalysis;
  };
  overallAssessment: {
    summary: string;
    relevanceLevel: 'high' | 'medium' | 'low';
    patentabilityScore: number;
    keyConcerns: string[];
    strategicRecommendations: string[];
  };
}

export interface ExaminerElementAnalysis extends ElementAnalysis {
  rejectionType?: '102 Anticipation' | '103 Obviousness' | 'Not Rejected';
  primaryCitations?: Citation[];
  rejectionRationale?: string;
}

export interface ExaminerOverallAssessment {
  summary: string;
  patentabilityScore: number;
  keyConcerns: string[];
  strategicRecommendations: string[];
  overallRejection?: '102 Anticipation' | '103 Obviousness' | 'Not Rejected';
  rejectionSummary?: string;
}

export interface ExaminerStructuredDeepAnalysis
  extends Omit<
    StructuredDeepAnalysis,
    'elementAnalysis' | 'overallAssessment'
  > {
  elementAnalysis: {
    [claimElement: string]: ExaminerElementAnalysis;
  };
  overallAssessment: ExaminerOverallAssessment;
  holisticAnalysis: string;
  amendmentExplanation?: string;
  originalClaim?: string;
  revisedClaim?: string;
  validationPerformed?: boolean;
  validationResults?: {
    totalSuggestions?: number;
    disclosedCount?: number;
    keepCount?: number;
    validationSummary?: string;
    validationDetails?: Array<{
      suggestion: string;
      wasDisclosed: boolean;
      reasoning?: string;
    }>;
    [key: string]: any;
  };
}

export interface DeepAnalysisPanelProps {
  /**
   * The parsed deep analysis data
   */
  analysisData: ParsedDeepAnalysis | StructuredDeepAnalysis | null;

  /**
   * The reference number being analyzed
   */
  referenceNumber: string;

  /**
   * Whether the data is currently loading
   */
  isLoading?: boolean;

  /**
   * Callback function to apply an amendment
   */
  onApplyAmendment?: (original: string, revised: string) => void;
}

export interface RelevanceCalculation {
  score: number;
  level: 'high' | 'medium' | 'low';
  color: string;
  rejectionType?: '102 Anticipation' | '103 Obviousness' | 'Not Rejected';
}

export type RejectionType =
  | '102 Anticipation'
  | '103 Obviousness'
  | 'Not Rejected';
export type RelevanceLevel = 'high' | 'medium' | 'low';
