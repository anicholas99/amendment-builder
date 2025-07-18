/**
 * File History Context Types
 * 
 * Comprehensive types for providing historical context to AI agents
 * Enables patent attorney-level reasoning by including file history,
 * claim evolution, examiner patterns, and prior argument tracking
 */

import { z } from 'zod';

// ============ BASE CONTEXT TYPES ============

export interface FileHistoryContext {
  projectId: string;
  applicationNumber?: string;
  fileHistory: HistoricalFileEntry[];
  claimEvolution: ClaimEvolutionHistory;
  examinerContext: ExaminerContext;
  priorArgumentHistory: ArgumentHistory;
  metadata: FileHistoryMetadata;
}

export interface HistoricalFileEntry {
  id: string;
  type: 'OFFICE_ACTION' | 'RESPONSE' | 'IDS' | 'NOTICE_OF_ALLOWANCE' | 'RCE' | 'CONTINUATION';
  fileDate: Date;
  fileName: string;
  extractedText: string;
  status: 'PROCESSED' | 'ANALYZED' | 'FILED';
  metadata: HistoricalFileMetadata;
}

export interface HistoricalFileMetadata {
  officeActionNumber?: string;
  examiner?: {
    name?: string;
    id?: string;
    artUnit?: string;
  };
  rejectionSummary?: {
    types: string[];
    claimsAffected: number[];
    priorArtCited: string[];
  };
  responseStrategy?: 'AMEND_CLAIMS' | 'ARGUE_REJECTION' | 'COMBINATION';
  outcome?: 'ALLOWED' | 'FINAL' | 'NON_FINAL' | 'APPEALED' | 'ABANDONED';
}

// ============ CLAIM EVOLUTION TRACKING ============

export interface ClaimEvolutionHistory {
  claims: ClaimVersionHistory[];
  amendmentReasons: AmendmentReason[];
  consistencyCheck: ClaimConsistencyAnalysis;
}

export interface ClaimVersionHistory {
  claimNumber: number;
  versions: ClaimVersion[];
  currentText: string;
  firstFiled: Date;
  totalAmendments: number;
}

export interface ClaimVersion {
  id: string;
  versionNumber: number;
  text: string;
  changedAt: Date;
  changeReason: string;
  associatedOfficeAction?: string;
  associatedResponse?: string;
  differences: ClaimDifference[];
}

export interface ClaimDifference {
  type: 'ADDITION' | 'DELETION' | 'MODIFICATION';
  text: string;
  position: number;
  reason: string;
}

export interface AmendmentReason {
  officeActionId: string;
  claimNumbers: number[];
  rejectionType: string;
  amendmentText: string;
  justification: string;
  outcome: 'ACCEPTED' | 'WITHDRAWN' | 'PENDING';
}

export interface ClaimConsistencyAnalysis {
  potentialContradictions: string[];
  argumentsToAvoid: string[];
  successfulStrategies: string[];
  problematicLanguage: string[];
}

// ============ EXAMINER CONTEXT ============

export interface ExaminerContext {
  current: ExaminerInfo;
  history: ExaminerInteraction[];
  patterns: ExaminerPatterns;
  preferences: ExaminerPreferences;
}

export interface ExaminerInfo {
  name?: string;
  id?: string;
  artUnit?: string;
  tenure?: string;
  specializations?: string[];
}

export interface ExaminerInteraction {
  officeActionId: string;
  date: Date;
  rejectionTypes: string[];
  citedReferences: string[];
  examinerComments: string;
  responseStrategy: string;
  outcome: string;
}

export interface ExaminerPatterns {
  commonRejectionTypes: Array<{
    type: string;
    frequency: number;
    typicalLanguage: string[];
  }>;
  priorArtPreferences: Array<{
    source: string;
    frequency: number;
  }>;
  argumentResponseTendencies: Array<{
    argumentType: string;
    successRate: number;
    typicalResponse: string;
  }>;
}

export interface ExaminerPreferences {
  preferredArgumentStyles: string[];
  effectiveClaimLanguage: string[];
  unsuccessfulApproaches: string[];
  timelinePreferences: string;
}

// ============ PRIOR ARGUMENT HISTORY ============

export interface ArgumentHistory {
  byRejectionType: ArgumentsByType;
  successfulArguments: SuccessfulArgument[];
  failedArguments: FailedArgument[];
  priorArtAnalysis: PriorArtArgumentHistory;
}

export interface ArgumentsByType {
  section102: HistoricalArgument[];
  section103: HistoricalArgument[];
  section101: HistoricalArgument[];
  section112: HistoricalArgument[];
  other: HistoricalArgument[];
}

export interface HistoricalArgument {
  id: string;
  officeActionId: string;
  responseId: string;
  date: Date;
  argumentText: string;
  claimsAddressed: number[];
  priorArtCited: string[];
  outcome: 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN' | 'PENDING';
  examinerResponse?: string;
  lessonsLearned: string[];
}

export interface SuccessfulArgument {
  argumentText: string;
  rejectionType: string;
  claimsInvolved: number[];
  keyFactors: string[];
  reusabilityScore: number;
}

export interface FailedArgument {
  argumentText: string;
  rejectionType: string;
  failureReason: string;
  examinerCounterArgument: string;
  avoidanceStrategy: string;
}

export interface PriorArtArgumentHistory {
  discreditedReferences: Array<{
    reference: string;
    discreditingArguments: string[];
    dateDiscredited: Date;
    stillCited: boolean;
  }>;
  establishedDifferences: Array<{
    reference: string;
    keyDifferences: string[];
    claimsProtected: number[];
    strengthOfArgument: 'STRONG' | 'MODERATE' | 'WEAK';
  }>;
  priorArtCombinations: Array<{
    references: string[];
    combinationArguments: string[];
    counterArguments: string[];
    success: boolean;
  }>;
}

// ============ METADATA & CONTEXT ============

export interface FileHistoryMetadata {
  totalOfficeActions: number;
  totalResponses: number;
  currentRoundNumber: number;
  prosecutionDuration: number; // in days
  lastResponseDate?: Date;
  nextDeadline?: Date;
  statusHistory: ApplicationStatusChange[];
  relationshipContext: ApplicationRelationships;
}

export interface ApplicationStatusChange {
  date: Date;
  status: string;
  trigger: string;
  impact: string;
}

export interface ApplicationRelationships {
  parentApplications: ParentApplication[];
  continuationData: ContinuationData[];
  priorityClaims: PriorityClaim[];
}

export interface ParentApplication {
  applicationNumber: string;
  filingDate: Date;
  status: string;
  relevantDisclosures: string[];
  claimScope: string;
}

export interface ContinuationData {
  type: 'CONTINUATION' | 'CIP' | 'DIVISIONAL';
  applicationNumber: string;
  relationship: string;
  scopeDifferences: string[];
}

export interface PriorityClaim {
  applicationNumber: string;
  country: string;
  filingDate: Date;
  relevance: string;
}

// ============ CONTEXT BUILDER CONFIGURATION ============

export interface FileHistoryContextOptions {
  includeFullText: boolean;
  maxHistoryDepth?: number; // number of office action rounds to include
  includeDraftResponses: boolean;
  includeExaminerAnalysis: boolean;
  includeClaimEvolution: boolean;
  includePriorArtHistory: boolean;
  includeRelatedApplications: boolean;
  cacheResults: boolean;
  tenantId: string;
}

export interface ContextBuildResult {
  context: FileHistoryContext;
  buildTime: number;
  cacheHit: boolean;
  warnings: string[];
  dataQuality: ContextQualityMetrics;
}

export interface ContextQualityMetrics {
  completeness: number; // 0-1 score
  recency: number; // 0-1 score based on how recent the data is
  consistency: number; // 0-1 score for data consistency
  missingDataAreas: string[];
}

// ============ AI AGENT CONTEXT TYPES ============

export interface AIAgentContext {
  fileHistory: FileHistoryContext;
  currentState: CurrentApplicationState;
  strategicGuidance: StrategicGuidance;
  riskAssessment: RiskAssessment;
}

export interface CurrentApplicationState {
  pendingDeadlines: Deadline[];
  openRejections: OpenRejection[];
  currentClaimsStatus: ClaimStatus[];
  nextRecommendedActions: RecommendedAction[];
}

export interface Deadline {
  type: string;
  date: Date;
  description: string;
  criticality: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface OpenRejection {
  id: string;
  type: string;
  claimsAffected: number[];
  priorArtCited: string[];
  examinerReasoning: string;
  suggestedStrategy: string[];
  confidenceLevel: number;
}

export interface ClaimStatus {
  claimNumber: number;
  status: 'ALLOWED' | 'REJECTED' | 'PENDING' | 'CANCELLED';
  rejectionHistory: string[];
  amendmentHistory: string[];
  strategicImportance: 'CORE' | 'IMPORTANT' | 'FALLBACK';
}

export interface RecommendedAction {
  type: 'AMEND_CLAIM' | 'ARGUE_REJECTION' | 'FILE_RCE' | 'APPEAL' | 'ABANDON';
  priority: number;
  description: string;
  rationale: string;
  estimatedSuccessRate: number;
}

export interface StrategicGuidance {
  overallStrategy: string;
  keyMessages: string[];
  argumentsToEmphasize: string[];
  argumentsToAvoid: string[];
  claimScopeRecommendations: string[];
}

export interface RiskAssessment {
  prosecutionRisks: Risk[];
  claimScopeRisks: Risk[];
  priorArtRisks: Risk[];
  overallRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface Risk {
  type: string;
  description: string;
  likelihood: number; // 0-1
  impact: number; // 0-1
  mitigationStrategies: string[];
}

// ============ ZOD VALIDATION SCHEMAS ============

export const FileHistoryContextSchema = z.object({
  projectId: z.string(),
  applicationNumber: z.string().optional(),
  fileHistory: z.array(z.object({
    id: z.string(),
    type: z.enum(['OFFICE_ACTION', 'RESPONSE', 'IDS', 'NOTICE_OF_ALLOWANCE', 'RCE', 'CONTINUATION']),
    fileDate: z.date(),
    fileName: z.string(),
    extractedText: z.string(),
    status: z.enum(['PROCESSED', 'ANALYZED', 'FILED']),
    metadata: z.record(z.unknown()),
  })),
  claimEvolution: z.object({
    claims: z.array(z.object({
      claimNumber: z.number(),
      versions: z.array(z.object({
        id: z.string(),
        versionNumber: z.number(),
        text: z.string(),
        changedAt: z.date(),
        changeReason: z.string(),
      })),
      currentText: z.string(),
      firstFiled: z.date(),
      totalAmendments: z.number(),
    })),
    amendmentReasons: z.array(z.unknown()),
    consistencyCheck: z.object({
      potentialContradictions: z.array(z.string()),
      argumentsToAvoid: z.array(z.string()),
      successfulStrategies: z.array(z.string()),
      problematicLanguage: z.array(z.string()),
    }),
  }),
  examinerContext: z.object({
    current: z.object({
      name: z.string().optional(),
      id: z.string().optional(),
      artUnit: z.string().optional(),
    }),
    history: z.array(z.unknown()),
    patterns: z.object({
      commonRejectionTypes: z.array(z.unknown()),
      priorArtPreferences: z.array(z.unknown()),
      argumentResponseTendencies: z.array(z.unknown()),
    }),
    preferences: z.object({
      preferredArgumentStyles: z.array(z.string()),
      effectiveClaimLanguage: z.array(z.string()),
      unsuccessfulApproaches: z.array(z.string()),
      timelinePreferences: z.string(),
    }),
  }),
  priorArgumentHistory: z.object({
    byRejectionType: z.object({
      section102: z.array(z.unknown()),
      section103: z.array(z.unknown()),
      section101: z.array(z.unknown()),
      section112: z.array(z.unknown()),
      other: z.array(z.unknown()),
    }),
    successfulArguments: z.array(z.unknown()),
    failedArguments: z.array(z.unknown()),
    priorArtAnalysis: z.object({
      discreditedReferences: z.array(z.unknown()),
      establishedDifferences: z.array(z.unknown()),
      priorArtCombinations: z.array(z.unknown()),
    }),
  }),
  metadata: z.object({
    totalOfficeActions: z.number(),
    totalResponses: z.number(),
    currentRoundNumber: z.number(),
    prosecutionDuration: z.number(),
    lastResponseDate: z.date().optional(),
    nextDeadline: z.date().optional(),
    statusHistory: z.array(z.unknown()),
    relationshipContext: z.object({
      parentApplications: z.array(z.unknown()),
      continuationData: z.array(z.unknown()),
      priorityClaims: z.array(z.unknown()),
    }),
  }),
});

export const AIAgentContextSchema = z.object({
  fileHistory: FileHistoryContextSchema,
  currentState: z.object({
    pendingDeadlines: z.array(z.unknown()),
    openRejections: z.array(z.unknown()),
    currentClaimsStatus: z.array(z.unknown()),
    nextRecommendedActions: z.array(z.unknown()),
  }),
  strategicGuidance: z.object({
    overallStrategy: z.string(),
    keyMessages: z.array(z.string()),
    argumentsToEmphasize: z.array(z.string()),
    argumentsToAvoid: z.array(z.string()),
    claimScopeRecommendations: z.array(z.string()),
  }),
  riskAssessment: z.object({
    prosecutionRisks: z.array(z.unknown()),
    claimScopeRisks: z.array(z.unknown()),
    priorArtRisks: z.array(z.unknown()),
    overallRiskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  }),
});

// ============ EXPORTS ============
// All types are already exported individually above 