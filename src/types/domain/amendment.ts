/**
 * @fileoverview Amendment domain types
 * Core types for office action processing and amendment generation
 */

import { z } from 'zod';

// ============ ENUMS & CONSTANTS ============

export const RejectionType = {
  SECTION_102: '§102',
  SECTION_103: '§103', 
  SECTION_101: '§101',
  SECTION_112: '§112',
  OTHER: 'OTHER'
} as const;

export const AmendmentStrategy = {
  AMEND_CLAIMS: 'AMEND_CLAIMS',
  ARGUE_REJECTION: 'ARGUE_REJECTION',
  COMBINATION: 'COMBINATION'
} as const;

export const AmendmentStatus = {
  PENDING: 'PENDING',
  ANALYZING: 'ANALYZING', 
  COMPLETE: 'COMPLETE',
  ERROR: 'ERROR'
} as const;

// ============ SCHEMAS ============

export const ParsedRejectionSchema = z.object({
  id: z.string(),
  type: z.enum(['§102', '§103', '§101', '§112', 'OTHER']),
  rawType: z.string().optional(), // Preserve GPT's original classification
  rejectionCategory: z.string().optional(), // e.g. "enablement", "double patenting", "indefiniteness"
  legalBasis: z.string().optional(), // e.g. "35 U.S.C. § 112(b)", "35 U.S.C. § 103(a)"
  claims: z.array(z.string()),
  priorArtReferences: z.array(z.string()),
  examinerReasoning: z.string(),
  reasoningInsights: z.array(z.string()).optional(), // GPT's legal insights about examiner reasoning
  rawText: z.string(),
  startIndex: z.number().optional(),
  endIndex: z.number().optional(),
  // Confidence and human review flags
  classificationConfidence: z.number().min(0).max(1).optional(),
  requiresHumanReview: z.boolean().optional(),
});

export const OfficeActionSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  fileName: z.string(),
  extractedText: z.string(),
  rejections: z.array(ParsedRejectionSchema),
  priorArtReferences: z.array(z.string()),
  examinerName: z.string().optional(),
  applicationNumber: z.string().optional(),
  mailingDate: z.string().optional(),
  // Enhanced document type handling
  documentType: z.string().optional(), // Allow GPT's full classification
  rawDocumentType: z.string().optional(), // Store original if different
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const RejectionAnalysisSchema = z.object({
  rejectionId: z.string(),
  isValid: z.boolean(),
  confidence: z.number().min(0).max(1),
  missingElements: z.array(z.string()),
  weakArguments: z.array(z.string()),
  recommendedStrategy: z.enum(['AMEND_CLAIMS', 'ARGUE_REJECTION', 'COMBINATION']),
  rawRecommendedStrategy: z.string().optional(), // Preserve GPT's original strategy description
  suggestedAmendments: z.array(z.string()),
  argumentPoints: z.array(z.string()),
  strategyRationale: z.string().optional(),
  // Enhanced analysis fields
  strengthAssessment: z.enum(['STRONG', 'MODERATE', 'WEAK', 'FLAWED']).optional(),
  rawStrengthAssessment: z.string().optional(), // GPT's original strength description
  examinerReasoningGaps: z.array(z.string()).optional(),
  contextualInsights: z.array(z.object({
    type: z.string(),
    description: z.string(),
    confidence: z.number().min(0).max(1),
    source: z.string(),
  })).optional(),
});

export const AmendmentResponseSchema = z.object({
  id: z.string(),
  officeActionId: z.string(),
  projectId: z.string(),
  status: z.enum(['PENDING', 'ANALYZING', 'COMPLETE', 'ERROR']),
  strategy: z.enum(['AMEND_CLAIMS', 'ARGUE_REJECTION', 'COMBINATION']),
  claimAmendments: z.array(z.object({
    claimNumber: z.string(),
    originalText: z.string(),
    amendedText: z.string(),
    justification: z.string(),
  })),
  argumentSections: z.array(z.object({
    rejectionId: z.string(),
    title: z.string(),
    content: z.string(),
    priorArtReferences: z.array(z.string()),
  })),
  responseDocument: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// ============ INTERFACES ============

export interface ParsedRejection extends z.infer<typeof ParsedRejectionSchema> {}

export interface OfficeAction extends z.infer<typeof OfficeActionSchema> {}

export interface RejectionAnalysis extends z.infer<typeof RejectionAnalysisSchema> {}

export interface AmendmentResponse extends z.infer<typeof AmendmentResponseSchema> {}

export interface ClaimAmendment {
  claimNumber: string;
  originalText: string;
  amendedText: string;
  justification: string;
}

export interface ArgumentSection {
  rejectionId: string;
  title: string;
  content: string;
  priorArtReferences: string[];
}

export interface AmendmentAnalysisRequest {
  officeActionId: string;
  projectId: string;
  forceRefresh?: boolean;
}

export interface AmendmentGenerationRequest {
  officeActionId: string;
  projectId: string;
  strategy: keyof typeof AmendmentStrategy;
  userInstructions?: string;
}

// ============ API TYPES ============

export interface CreateOfficeActionRequest {
  projectId: string;
  file: File;
  metadata?: {
    applicationNumber?: string;
    mailingDate?: string;
    examinerName?: string;
  };
}

export interface CreateOfficeActionResponse {
  success: boolean;
  officeAction: {
    id: string;
    fileName: string;
    status: string;
    rejectionCount: number;
    createdAt: string;
  };
}

export interface AnalyzeRejectionsRequest {
  officeActionId: string;
  projectId: string;
  forceRefresh?: boolean;
}

export interface AnalyzeRejectionsResponse {
  success: boolean;
  analyses: RejectionAnalysis[];
  overallStrategy: keyof typeof AmendmentStrategy;
  confidence: number;
}

export interface GenerateAmendmentRequest {
  officeActionId: string;
  projectId: string;
  strategy: keyof typeof AmendmentStrategy;
  userInstructions?: string;
}

export interface GenerateAmendmentResponse {
  success: boolean;
  amendment: AmendmentResponse;
  documentUrl?: string;
}

// ============ UI TYPES ============

export interface AmendmentStudioProps {
  projectId: string;
  officeActionId?: string;
}

export interface RejectionListProps {
  rejections: ParsedRejection[];
  analyses?: RejectionAnalysis[];
  onSelectRejection: (rejectionId: string) => void;
  selectedRejectionId?: string;
}

export interface AmendmentWorkspaceProps {
  officeAction: OfficeAction;
  amendment?: AmendmentResponse;
  onSaveAmendment: (amendment: Partial<AmendmentResponse>) => void;
  isEditing: boolean;
}

// ============ UTILITY TYPES ============

export type RejectionTypeValue = typeof RejectionType[keyof typeof RejectionType];
export type AmendmentStrategyValue = typeof AmendmentStrategy[keyof typeof AmendmentStrategy];
export type AmendmentStatusValue = typeof AmendmentStatus[keyof typeof AmendmentStatus]; 