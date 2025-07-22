/**
 * Types for rejection analysis domain
 * 
 * Defines types for analyzing Office Action rejections,
 * assessing examiner reasoning, and generating strategic recommendations
 */

export type RejectionStrength = 'STRONG' | 'MODERATE' | 'WEAK' | 'FLAWED';

export type RecommendedStrategy = 'ARGUE' | 'AMEND' | 'COMBINATION';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ClaimChartRow {
  claimElement: string;
  priorArtDisclosure: string;
  isDisclosed: boolean;
  notes: string;
}

export interface ContextualInsight {
  type: 'OCR_UTILIZATION' | 'PRIOR_ART_MAPPING' | 'SPECIFICATION_REFERENCE' | 'PROSECUTION_HISTORY';
  description: string;
  confidence: number;
  source?: string;
}

export interface RejectionAnalysisResult {
  rejectionId: string;
  strength: RejectionStrength;
  confidenceScore: number;
  examinerReasoningGaps: string[];
  claimChart?: ClaimChartRow[];
  recommendedStrategy: RecommendedStrategy;
  strategyRationale: string;
  argumentPoints: string[];
  amendmentSuggestions: string[];
  analyzedAt: Date;
  // Enhanced tracking and context fields
  modelVersion?: string;
  agentVersion?: string;
  contextualInsights?: ContextualInsight[];
}

export interface StrategyRecommendation {
  primaryStrategy: RecommendedStrategy;
  alternativeStrategies: string[];
  confidence: number;
  reasoning: string;
  riskLevel: RiskLevel;
  keyConsiderations: string[];
}

export interface OfficeActionAnalysis {
  officeActionId: string;
  analyses: RejectionAnalysisResult[];
  overallStrategy: StrategyRecommendation;
  analyzedAt: Date;
}

// Request/Response types for API
export interface AnalyzeRejectionRequest {
  rejectionId: string;
  includeClaimChart?: boolean;
  includePriorArtFullText?: boolean;
}

export interface AnalyzeOfficeActionRequest {
  officeActionId: string;
  includeClaimCharts?: boolean;
}

export interface AnalyzeRejectionResponse {
  success: boolean;
  analysis: RejectionAnalysisResult;
}

export interface AnalyzeOfficeActionResponse {
  success: boolean;
  analyses: RejectionAnalysisResult[];
  overallStrategy: StrategyRecommendation;
} 