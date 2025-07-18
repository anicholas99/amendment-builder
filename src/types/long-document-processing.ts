/**
 * Types for Long Document Processing Service
 * 
 * Supports industry-standard processing of large documents that exceed
 * token limits for AI analysis.
 */

export interface DocumentSegment {
  id: string;
  type: 'header' | 'rejection' | 'prior_art' | 'claims' | 'reasoning' | 'other';
  content: string;
  startIndex: number;
  endIndex: number;
  tokenCount: number;
  metadata?: Record<string, any>;
}

export interface SegmentationResult {
  segments: DocumentSegment[];
  totalTokens: number;
  documentMetadata: {
    applicationNumber?: string;
    mailingDate?: string;
    examinerName?: string;
    totalPages?: number;
  };
}

export interface ProcessingOptions {
  maxTokensPerSegment?: number;
  preserveContext?: boolean;
  mergingStrategy?: 'strict' | 'loose' | 'intelligent';
  targetAnalysisType?: 'office_action' | 'prior_art' | 'patent' | 'general';
}

export interface ProcessedDocumentResult {
  segments: DocumentSegment[];
  analysis: any; // Will be typed based on analysis type
  summary: {
    totalSegments: number;
    processingTime: number;
    tokenUsage: {
      total: number;
      input: number;
      output: number;
    };
  };
}

export interface DocumentStructureSection {
  type: string;
  startIndex: number;
  endIndex: number;
  title: string;
  importance: 'high' | 'medium' | 'low';
}

export interface SegmentAnalysisResult {
  result: any;
  usage?: {
    input: number;
    output: number;
  };
} 