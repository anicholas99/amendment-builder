export interface ConsistencyIssue {
  type:
    | 'missing_reference'
    | 'element_mismatch'
    | 'duplicate_claim'
    | 'orphaned_element'
    | 'mirror_claim_mismatch';
  severity: 'error' | 'warning';
  claimId?: string;
  elementId?: string;
  claimNumber?: number;
  message: string;
  suggestion?: string;
}

export interface ClaimEligibility101Result {
  eligible: boolean;
  verdict: '§101 Eligible' | 'Risk of §101 Rejection' | '§101 Ineligible';
  issue?: string;
  recommendation?: string;
  confidence: number;
  analysis: {
    isAbstractIdea: boolean;
    abstractIdeaCategory?: 'mathematical_concepts' | 'mental_processes' | 'organizing_human_activity';
    hasSignificantlyMore: boolean;
    technicalImprovement?: string;
    practicalApplication?: string;
  };
}

export interface PatentSection {
  name: string;
  content: string;
  wordCount: number;
  issues?: string[];
}

export interface PatentApplicationAnalysis {
  title: string;
  sections: PatentSection[];
  wordCount: number;
  completenessScore: number;
  missingElements: string[];
  recommendations: string[];
  fullContent: string;
}

export interface ToolExecutionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ChatToolCall {
  tool: string;
  args?: Record<string, any>;
}

export interface ChatToolChain {
  tools: ChatToolCall[];
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  toolCall?: ChatToolCall;
  toolResult?: ToolExecutionResult;
}

export interface ClaimOperationResult {
  success: boolean;
  message: string;
  claims?: any[];
  claim?: any;
}

/**
 * Patent Section Enhancement Result
 */
export interface EnhancePatentSectionResult {
  success: boolean;
  updatedSection?: string;
  message: string;
}

/**
 * Patent Consistency Check Result
 */
export interface PatentConsistencyIssue {
  section: string;
  type:
    | 'missing_reference'
    | 'terminology'
    | 'claim_support'
    | 'format'
    | 'contradiction';
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
}

export interface CheckPatentConsistencyResult {
  issues: PatentConsistencyIssue[];
  summary: string;
  overallScore: number; // 0-100
}

export interface ClaimRevision {
  claimId: string;
  claimNumber: number;
  original: string;
  proposed: string;
  changes: Array<{
    type: 'added' | 'removed' | 'unchanged';
    value: string;
  }>;
  confidence: number;
  reasoning: string;
}

export interface BatchRevisionResult {
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
  revisions: ClaimRevision[];
}
