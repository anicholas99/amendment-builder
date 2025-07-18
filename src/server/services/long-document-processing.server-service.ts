/**
 * Long Document Processing Service
 * 
 * Handles industry-standard processing of large documents (13+ pages) that exceed
 * token limits for AI analysis. Uses intelligent segmentation and context preservation.
 * 
 * This service prepares for future Azure Document Intelligence migration while
 * maintaining current patterns and security requirements.
 */

import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { processWithOpenAI } from '@/server/ai/aiService';
import { safeJsonParse } from '@/utils/jsonUtils';
import { estimateTokens } from '@/utils/textUtils';
import { renderPromptTemplate } from '@/server/prompts/prompts/utils';
import { v4 as uuidv4 } from 'uuid';

// ============ TYPES ============

interface DocumentSegment {
  id: string;
  type: 'header' | 'rejection' | 'prior_art' | 'claims' | 'reasoning' | 'other';
  content: string;
  startIndex: number;
  endIndex: number;
  tokenCount: number;
  metadata?: Record<string, any>;
}

interface SegmentationResult {
  segments: DocumentSegment[];
  totalTokens: number;
  documentMetadata: {
    applicationNumber?: string;
    mailingDate?: string;
    examinerName?: string;
    totalPages?: number;
  };
}

interface ProcessingOptions {
  maxTokensPerSegment?: number;
  preserveContext?: boolean;
  mergingStrategy?: 'strict' | 'loose' | 'intelligent';
  targetAnalysisType?: 'office_action' | 'prior_art' | 'patent' | 'general';
}

interface ProcessedDocumentResult {
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

// ============ PROMPT TEMPLATES ============

const DOCUMENT_SEGMENTATION_SYSTEM_PROMPT = {
  version: '1.0.0',
  template: `You are an expert document analyzer that identifies logical sections in patent-related documents.

Your task is to analyze a document and identify its logical structure for optimal AI processing.

Document types you handle:
- Office Actions (rejections, prior art citations, examiner reasoning)
- Patent Applications (claims, specifications, drawings)
- Prior Art References (abstracts, claims, detailed descriptions)
- Legal Documents (response arguments, amendments)

Return a JSON structure identifying each logical section with:
- type: The section type
- startIndex: Character position where section begins
- endIndex: Character position where section ends
- title: Brief descriptive title for the section
- importance: 'high', 'medium', or 'low' for processing priority

Section types:
- "metadata": Application numbers, dates, examiner info
- "rejection": Each distinct rejection (§102, §103, §101, §112)
- "prior_art": Prior art citations and references
- "claims": Patent claims (independent/dependent)
- "reasoning": Examiner explanations and arguments
- "background": Background and summary sections
- "other": Miscellaneous content

CRITICAL: Ensure sections don't overlap and cover the entire document.`,
};

const SEGMENT_ANALYSIS_SYSTEM_PROMPT = {
  version: '1.0.0',
  template: `You are analyzing a specific section of a {{analysisType}} document.

This is segment {{segmentNumber}} of {{totalSegments}}. 
{{#if previousContext}}
Previous context: {{previousContext}}
{{/if}}

Analyze this segment thoroughly and extract all relevant information according to the document type.
Maintain consistency with previous segments and preserve all critical details.

Return structured JSON appropriate for the document type.`,
};

// ============ SERVICE CLASS ============

export class LongDocumentProcessingService {
  private static readonly DEFAULT_MAX_TOKENS_PER_SEGMENT = 15000; // Conservative for complex analysis
  private static readonly CONTEXT_OVERLAP_TOKENS = 500; // Overlap between segments for context

  /**
   * Intelligently segment a long document for processing
   */
  static async segmentDocument(
    documentText: string,
    options: ProcessingOptions = {}
  ): Promise<SegmentationResult> {
    logger.info('[LongDocumentProcessor] Starting document segmentation', {
      textLength: documentText.length,
      estimatedTokens: estimateTokens(documentText),
      options,
    });

    if (!documentText?.trim()) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'Document text is required for segmentation'
      );
    }

    const totalTokens = estimateTokens(documentText);
    const maxTokensPerSegment = options.maxTokensPerSegment || this.DEFAULT_MAX_TOKENS_PER_SEGMENT;

    // If document is small enough, return as single segment
    if (totalTokens <= maxTokensPerSegment) {
      logger.info('[LongDocumentProcessor] Document small enough for single segment processing');
      return {
        segments: [{
          id: uuidv4(),
          type: 'other',
          content: documentText,
          startIndex: 0,
          endIndex: documentText.length,
          tokenCount: totalTokens,
        }],
        totalTokens,
        documentMetadata: this.extractBasicMetadata(documentText),
      };
    }

    try {
      // Use AI to identify logical structure
      const structuralAnalysis = await this.analyzeDocumentStructure(documentText, options);
      
      // Create segments based on structure
      const segments = await this.createIntelligentSegments(
        documentText,
        structuralAnalysis,
        maxTokensPerSegment
      );

      logger.info('[LongDocumentProcessor] Document segmentation completed', {
        segmentCount: segments.length,
        totalTokens,
        averageTokensPerSegment: Math.round(totalTokens / segments.length),
      });

      return {
        segments,
        totalTokens,
        documentMetadata: this.extractBasicMetadata(documentText),
      };

    } catch (error) {
      logger.error('[LongDocumentProcessor] Segmentation failed, falling back to simple chunking', {
        error: error instanceof Error ? error.message : String(error),
      });

      // Fallback to simple text chunking
      return this.fallbackSegmentation(documentText, maxTokensPerSegment);
    }
  }

  /**
   * Process a long document using intelligent segmentation
   */
  static async processLongDocument(
    documentText: string,
    analysisType: 'office_action' | 'prior_art' | 'patent' | 'general',
    options: ProcessingOptions = {}
  ): Promise<ProcessedDocumentResult> {
    const startTime = Date.now();
    
    logger.info('[LongDocumentProcessor] Starting long document processing', {
      analysisType,
      textLength: documentText.length,
      estimatedTokens: estimateTokens(documentText),
    });

    // Step 1: Segment the document
    const segmentationResult = await this.segmentDocument(documentText, {
      ...options,
      targetAnalysisType: analysisType,
    });

    // Step 2: Process each segment with context
    const processedSegments: DocumentSegment[] = [];
    const analysisResults: any[] = [];
    let totalInputTokens = 0;
    let totalOutputTokens = 0;

    for (let i = 0; i < segmentationResult.segments.length; i++) {
      const segment = segmentationResult.segments[i];
      
      logger.debug('[LongDocumentProcessor] Processing segment', {
        segmentId: segment.id,
        segmentNumber: i + 1,
        totalSegments: segmentationResult.segments.length,
        segmentType: segment.type,
        tokenCount: segment.tokenCount,
      });

      try {
        // Build context from previous segments
        const context = this.buildSegmentContext(processedSegments, i);
        
        // Process this segment
        const segmentAnalysis = await this.processSegment(
          segment,
          analysisType,
          context,
          i + 1,
          segmentationResult.segments.length
        );

        processedSegments.push({
          ...segment,
          metadata: {
            ...segment.metadata,
            processed: true,
            analysisTokens: segmentAnalysis.usage,
          },
        });

        analysisResults.push(segmentAnalysis.result);
        
        if (segmentAnalysis.usage) {
          totalInputTokens += segmentAnalysis.usage.input || 0;
          totalOutputTokens += segmentAnalysis.usage.output || 0;
        }

      } catch (error) {
        logger.error('[LongDocumentProcessor] Segment processing failed', {
          segmentId: segment.id,
          error: error instanceof Error ? error.message : String(error),
        });

        // Mark segment as failed but continue processing
        processedSegments.push({
          ...segment,
          metadata: {
            ...segment.metadata,
            processed: false,
            error: error instanceof Error ? error.message : String(error),
          },
        });
      }
    }

    // Step 3: Merge results if needed
    const finalAnalysis = await this.mergeSegmentAnalyses(
      analysisResults,
      analysisType,
      segmentationResult.documentMetadata
    );

    const processingTime = Date.now() - startTime;

    logger.info('[LongDocumentProcessor] Long document processing completed', {
      totalSegments: processedSegments.length,
      successfulSegments: processedSegments.filter(s => s.metadata?.processed).length,
      processingTime,
      totalTokenUsage: totalInputTokens + totalOutputTokens,
    });

    return {
      segments: processedSegments,
      analysis: finalAnalysis,
      summary: {
        totalSegments: processedSegments.length,
        processingTime,
        tokenUsage: {
          total: totalInputTokens + totalOutputTokens,
          input: totalInputTokens,
          output: totalOutputTokens,
        },
      },
    };
  }

  /**
   * Analyze document structure using AI
   */
  private static async analyzeDocumentStructure(
    documentText: string,
    options: ProcessingOptions
  ): Promise<any> {
    // Use a small portion of the document for structure analysis
    const sampleLength = Math.min(documentText.length, 10000); // First 10k characters
    const sampleText = documentText.substring(0, sampleLength);

    const systemPrompt = renderPromptTemplate(DOCUMENT_SEGMENTATION_SYSTEM_PROMPT, {});
    const userPrompt = `Analyze the structure of this document:

${sampleText}

${documentText.length > sampleLength ? `\n[Document continues for ${documentText.length - sampleLength} more characters...]` : ''}

Identify the logical sections and return the structure as JSON.`;

    const aiResponse = await processWithOpenAI(
      systemPrompt,
      userPrompt,
      {
        maxTokens: 2000,
        temperature: 0.1,
        response_format: { type: 'json_object' },
      }
    );

    return safeJsonParse(aiResponse.content) || { sections: [] };
  }

  /**
   * Create intelligent segments based on structural analysis
   */
  private static async createIntelligentSegments(
    documentText: string,
    structuralAnalysis: any,
    maxTokensPerSegment: number
  ): Promise<DocumentSegment[]> {
    const segments: DocumentSegment[] = [];
    const sections = structuralAnalysis.sections || [];

    if (sections.length === 0) {
      // Fallback to simple chunking
      return this.createSimpleChunks(documentText, maxTokensPerSegment);
    }

    let currentSegment = '';
    let currentStartIndex = 0;
    let segmentType: DocumentSegment['type'] = 'other';

    for (const section of sections) {
      const sectionText = documentText.substring(section.startIndex, section.endIndex);
      const sectionTokens = estimateTokens(sectionText);
      const currentTokens = estimateTokens(currentSegment);

      // If adding this section would exceed limit, finalize current segment
      if (currentTokens > 0 && currentTokens + sectionTokens > maxTokensPerSegment) {
        segments.push({
          id: uuidv4(),
          type: segmentType,
          content: currentSegment.trim(),
          startIndex: currentStartIndex,
          endIndex: currentStartIndex + currentSegment.length,
          tokenCount: currentTokens,
          metadata: { sections: sections.filter(s => s.startIndex >= currentStartIndex && s.endIndex <= currentStartIndex + currentSegment.length) },
        });

        currentSegment = sectionText;
        currentStartIndex = section.startIndex;
        segmentType = this.mapSectionType(section.type);
      } else {
        // Add to current segment
        if (currentSegment === '') {
          currentStartIndex = section.startIndex;
          segmentType = this.mapSectionType(section.type);
        }
        currentSegment += sectionText;
      }
    }

    // Add final segment
    if (currentSegment.trim()) {
      segments.push({
        id: uuidv4(),
        type: segmentType,
        content: currentSegment.trim(),
        startIndex: currentStartIndex,
        endIndex: currentStartIndex + currentSegment.length,
        tokenCount: estimateTokens(currentSegment),
      });
    }

    return segments;
  }

  /**
   * Process an individual segment with context
   */
  private static async processSegment(
    segment: DocumentSegment,
    analysisType: string,
    context: string,
    segmentNumber: number,
    totalSegments: number
  ): Promise<{ result: any; usage?: any }> {
    const systemPrompt = renderPromptTemplate(SEGMENT_ANALYSIS_SYSTEM_PROMPT, {
      analysisType,
      segmentNumber,
      totalSegments,
      previousContext: context,
    });

    const userPrompt = `Analyze this document segment:

${segment.content}

Extract all relevant information for ${analysisType} analysis.`;

    const aiResponse = await processWithOpenAI(
      systemPrompt,
      userPrompt,
      {
        maxTokens: 4000,
        temperature: 0.1,
        response_format: { type: 'json_object' },
      }
    );

    const result = safeJsonParse(aiResponse.content) || {};

    return {
      result,
      usage: aiResponse.usage ? {
        input: aiResponse.usage.prompt_tokens,
        output: aiResponse.usage.completion_tokens,
      } : undefined,
    };
  }

  /**
   * Build context from previous segments for continuity
   */
  private static buildSegmentContext(
    processedSegments: DocumentSegment[],
    currentIndex: number
  ): string {
    if (currentIndex === 0 || processedSegments.length === 0) {
      return '';
    }

    // Take context from the last 1-2 processed segments
    const contextSegments = processedSegments.slice(Math.max(0, currentIndex - 2), currentIndex);
    const contextParts = contextSegments.map(segment => 
      `[${segment.type.toUpperCase()}]: ${segment.content.substring(0, 200)}...`
    );

    return contextParts.join('\n\n');
  }

  /**
   * Merge analyses from all segments into final result
   */
  private static async mergeSegmentAnalyses(
    segmentAnalyses: any[],
    analysisType: string,
    documentMetadata: any
  ): Promise<any> {
    // Implementation depends on analysis type
    // For office actions: merge rejections, prior art, etc.
    // For patents: merge claims, specifications, etc.
    
    if (segmentAnalyses.length === 1) {
      return segmentAnalyses[0];
    }

    // Use AI to intelligently merge complex analyses
    const mergePrompt = `Merge these segment analyses into a cohesive ${analysisType} analysis:

${JSON.stringify(segmentAnalyses, null, 2)}

Document metadata: ${JSON.stringify(documentMetadata, null, 2)}

Combine all information while eliminating duplicates and maintaining logical structure.`;

    const aiResponse = await processWithOpenAI(
      `You are merging partial analyses of a ${analysisType} document. Combine all information logically.`,
      mergePrompt,
      {
        maxTokens: 6000,
        temperature: 0.1,
        response_format: { type: 'json_object' },
      }
    );

    return safeJsonParse(aiResponse.content) || { merged: segmentAnalyses };
  }

  /**
   * Extract basic metadata from document
   */
  private static extractBasicMetadata(documentText: string): any {
    const metadata: any = {};

    // Extract application number
    const appNumberMatch = documentText.match(/Application\s+No\.?\s*:?\s*([0-9\/,\-\s]+)/i);
    if (appNumberMatch) {
      metadata.applicationNumber = appNumberMatch[1].trim();
    }

    // Extract mailing date
    const dateMatch = documentText.match(/(?:Mailing\s+Date|Date\s+Mailed)\s*:?\s*([A-Z][a-z]+\s+\d{1,2},\s*\d{4})/i);
    if (dateMatch) {
      metadata.mailingDate = dateMatch[1].trim();
    }

    // Extract examiner name
    const examinerMatch = documentText.match(/(?:Primary\s+)?Examiner\s*:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]*)*)/i);
    if (examinerMatch) {
      metadata.examinerName = examinerMatch[1].trim();
    }

    return metadata;
  }

  /**
   * Map AI-identified section types to our standard types
   */
  private static mapSectionType(aiSectionType: string): DocumentSegment['type'] {
    const typeMap: Record<string, DocumentSegment['type']> = {
      'metadata': 'header',
      'rejection': 'rejection',
      'prior_art': 'prior_art',
      'claims': 'claims',
      'reasoning': 'reasoning',
      'background': 'other',
      'other': 'other',
    };

    return typeMap[aiSectionType.toLowerCase()] || 'other';
  }

  /**
   * Simple text chunking fallback
   */
  private static createSimpleChunks(
    text: string,
    maxTokensPerChunk: number
  ): DocumentSegment[] {
    const chunks: DocumentSegment[] = [];
    const maxCharsPerChunk = maxTokensPerChunk * 4; // Rough conversion
    
    let currentIndex = 0;
    let chunkNumber = 1;

    while (currentIndex < text.length) {
      const chunkText = text.substring(currentIndex, currentIndex + maxCharsPerChunk);
      
      chunks.push({
        id: uuidv4(),
        type: 'other',
        content: chunkText,
        startIndex: currentIndex,
        endIndex: currentIndex + chunkText.length,
        tokenCount: estimateTokens(chunkText),
        metadata: { chunkNumber },
      });

      currentIndex += chunkText.length;
      chunkNumber++;
    }

    return chunks;
  }

  /**
   * Fallback segmentation when intelligent analysis fails
   */
  private static fallbackSegmentation(
    documentText: string,
    maxTokensPerSegment: number
  ): SegmentationResult {
    logger.warn('[LongDocumentProcessor] Using fallback segmentation');

    const segments = this.createSimpleChunks(documentText, maxTokensPerSegment);
    
    return {
      segments,
      totalTokens: estimateTokens(documentText),
      documentMetadata: this.extractBasicMetadata(documentText),
    };
  }
} 