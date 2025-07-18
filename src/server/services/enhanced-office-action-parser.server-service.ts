/**
 * Enhanced Office Action Parser Service
 * 
 * Handles long Office Action documents using intelligent segmentation
 * instead of truncation. Processes 13+ page documents efficiently while
 * maintaining all critical information.
 * 
 * Extends the existing OfficeActionParserService with industry-standard
 * long document processing capabilities.
 */

import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { processWithOpenAI } from '@/server/ai/aiService';
import { safeJsonParse } from '@/utils/jsonUtils';
import { estimateTokens } from '@/utils/textUtils';
import { renderPromptTemplate } from '@/server/prompts/prompts/utils';
import { ParsedRejection, RejectionType } from '@/types/domain/amendment';
import { 
  DocumentSegment, 
  SegmentationResult, 
  ProcessedDocumentResult,
  ProcessingOptions 
} from '@/types/long-document-processing';
import { v4 as uuidv4 } from 'uuid';

// ============ TYPES ============

interface ParsedOfficeActionResult {
  metadata: {
    applicationNumber: string | null;
    mailingDate: string | null;
    examinerName: string | null;
    isLongDocument?: boolean;
    segmentCount?: number;
  };
  rejections: ParsedRejection[];
  allPriorArtReferences: string[];
  summary: {
    totalRejections: number;
    rejectionTypes: string[];
    totalClaimsRejected: number;
    uniquePriorArtCount: number;
  };
  processingStats?: {
    totalTokens: number;
    processingTime: number;
    segmentationUsed: boolean;
  };
}

// ============ PROMPT TEMPLATES ============

const ENHANCED_OFFICE_ACTION_PARSING_SYSTEM_PROMPT = {
  version: '2.0.0',
  template: `You are an expert USPTO patent examiner assistant that analyzes Office Action documents.

Your task is to parse an Office Action document segment and extract structured information about rejections, prior art references, and examiner reasoning.

SEGMENT CONTEXT: You are analyzing {{#if segmentNumber}}segment {{segmentNumber}} of {{totalSegments}}{{else}}a complete document{{/if}}.
{{#if previousContext}}
PREVIOUS SEGMENTS CONTEXT: {{previousContext}}
{{/if}}

You must identify:
1. **Rejections**: Each distinct rejection with its type (§102, §103, §101, §112, OTHER)
2. **Claims**: Which specific claims are rejected in each rejection
3. **Prior Art**: Patent/publication numbers cited in each rejection
4. **Examiner Reasoning**: The examiner's rationale for each rejection
5. **Document Metadata**: Application number, mailing date, examiner name if present

CRITICAL REQUIREMENTS:
- Maintain consistency with previous segments
- Extract each rejection as a separate structured object
- Accurately identify rejection types (§102 = anticipation, §103 = obviousness, §101 = subject matter, §112 = written description/enablement)
- Parse claim numbers correctly (e.g., "Claims 1-5" should be ["1", "2", "3", "4", "5"])
- Extract patent/publication numbers in standard format (e.g., "US20180053140A1")
- Preserve exact examiner reasoning text for each rejection
- If this is a partial segment, note any incomplete rejections that continue in next segment

Return your analysis as valid JSON following this exact structure:
{
  "metadata": {
    "applicationNumber": "string or null",
    "mailingDate": "string or null", 
    "examinerName": "string or null",
    "segmentComplete": boolean
  },
  "rejections": [
    {
      "id": "string (UUID)",
      "type": "§102" | "§103" | "§101" | "§112" | "OTHER",
      "claims": ["1", "2", "3"],
      "priorArtReferences": ["US20180053140A1", "US9876543B2"],
      "examinerReasoning": "string (exact examiner text)",
      "rawText": "string (full rejection section text)",
      "isComplete": boolean,
      "continuesInNextSegment": boolean
    }
  ],
  "priorArtReferences": ["US20180053140A1", "US9876543B2", "..."],
  "incompleteElements": {
    "hasIncompleteRejections": boolean,
    "partialContent": "string if applicable"
  }
}`,
};

const SEGMENT_MERGING_SYSTEM_PROMPT = {
  version: '1.0.0',
  template: `You are merging multiple Office Action analysis segments into a final comprehensive result.

Your task is to:
1. Combine all rejections from segments, handling incomplete ones that span segments
2. Merge all prior art references without duplicates
3. Resolve any conflicts between segments
4. Create final comprehensive summary

CRITICAL: Ensure no rejections or prior art are lost during merging.
Handle incomplete rejections that span multiple segments by combining their content.`,
};

// ============ SERVICE CLASS ============

export class EnhancedOfficeActionParserService {
  private static readonly LONG_DOCUMENT_THRESHOLD = 120000; // ~30k tokens
  private static readonly MAX_TOKENS_PER_SEGMENT = 15000;

  /**
   * Parse an Office Action document with intelligent long document handling
   */
  static async parseOfficeAction(
    officeActionText: string,
    options: {
      maxTokens?: number;
      model?: string;
      forceSegmentation?: boolean;
    } = {}
  ): Promise<ParsedOfficeActionResult> {
    const startTime = Date.now();
    
    logger.info('[EnhancedOfficeActionParser] Starting Office Action parsing', {
      textLength: officeActionText.length,
      estimatedTokens: estimateTokens(officeActionText),
    });

    if (!officeActionText?.trim()) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'Office Action text is required for parsing'
      );
    }

    const estimatedTokens = estimateTokens(officeActionText);
    const maxTokens = options.maxTokens || 150000;
    const isLongDocument = estimatedTokens > this.LONG_DOCUMENT_THRESHOLD || options.forceSegmentation;

    try {
      let result: ParsedOfficeActionResult;

      if (isLongDocument) {
        logger.info('[EnhancedOfficeActionParser] Using long document processing', {
          estimatedTokens,
          threshold: this.LONG_DOCUMENT_THRESHOLD,
        });
        
        result = await this.parseLongDocument(officeActionText, options);
      } else {
        logger.info('[EnhancedOfficeActionParser] Using standard processing');
        
        result = await this.parseStandardDocument(officeActionText, options);
      }

      // Add processing statistics
      result.processingStats = {
        totalTokens: estimatedTokens,
        processingTime: Date.now() - startTime,
        segmentationUsed: isLongDocument,
      };

      logger.info('[EnhancedOfficeActionParser] Successfully parsed Office Action', {
        totalRejections: result.summary.totalRejections,
        rejectionTypes: result.summary.rejectionTypes,
        priorArtCount: result.summary.uniquePriorArtCount,
        isLongDocument,
        segmentCount: result.metadata.segmentCount,
        processingTime: result.processingStats.processingTime,
      });

      return result;

    } catch (error) {
      logger.error('[EnhancedOfficeActionParser] Failed to parse Office Action', {
        error: error instanceof Error ? error.message : String(error),
        textLength: officeActionText.length,
        isLongDocument,
      });

      throw error;
    }
  }

  /**
   * Parse long documents using intelligent segmentation
   */
  private static async parseLongDocument(
    officeActionText: string,
    options: any
  ): Promise<ParsedOfficeActionResult> {
    // Step 1: Segment the document intelligently
    const segmentationResult = await this.segmentOfficeAction(officeActionText);
    
    logger.info('[EnhancedOfficeActionParser] Document segmented', {
      segmentCount: segmentationResult.segments.length,
      averageTokensPerSegment: Math.round(segmentationResult.totalTokens / segmentationResult.segments.length),
    });

    // Step 2: Process each segment with context
    const segmentAnalyses: any[] = [];
    let previousContext = '';

    for (let i = 0; i < segmentationResult.segments.length; i++) {
      const segment = segmentationResult.segments[i];
      
      logger.debug('[EnhancedOfficeActionParser] Processing segment', {
        segmentNumber: i + 1,
        segmentType: segment.type,
        tokenCount: segment.tokenCount,
      });

      try {
        const segmentAnalysis = await this.analyzeSegment(
          segment,
          i + 1,
          segmentationResult.segments.length,
          previousContext
        );

        segmentAnalyses.push(segmentAnalysis);
        
        // Update context for next segment (last 500 chars of reasoning)
        if (segmentAnalysis.rejections?.length > 0) {
          const lastRejection = segmentAnalysis.rejections[segmentAnalysis.rejections.length - 1];
          previousContext = lastRejection.examinerReasoning?.substring(-500) || '';
        }

      } catch (error) {
        logger.error('[EnhancedOfficeActionParser] Segment analysis failed', {
          segmentNumber: i + 1,
          error: error instanceof Error ? error.message : String(error),
        });
        
        // Create placeholder analysis for failed segment
        segmentAnalyses.push({
          metadata: { segmentComplete: false },
          rejections: [],
          priorArtReferences: [],
          incompleteElements: { hasIncompleteRejections: false },
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Step 3: Merge all segment analyses
    const mergedResult = await this.mergeSegmentAnalyses(
      segmentAnalyses,
      segmentationResult.documentMetadata
    );

    // Add long document metadata
    mergedResult.metadata.isLongDocument = true;
    mergedResult.metadata.segmentCount = segmentationResult.segments.length;

    return mergedResult;
  }

  /**
   * Parse standard (short) documents using existing method
   */
  private static async parseStandardDocument(
    officeActionText: string,
    options: any
  ): Promise<ParsedOfficeActionResult> {
    // Check token limits and truncate if necessary (existing logic)
    const estimatedTokens = estimateTokens(officeActionText);
    const maxTokens = options.maxTokens || 150000;

    if (estimatedTokens > maxTokens) {
      logger.warn('[EnhancedOfficeActionParser] Document exceeds token limit, truncating', {
        estimatedTokens,
        maxTokens,
      });
      
      officeActionText = this.truncateOfficeActionText(officeActionText, maxTokens);
    }

    // Use existing parsing logic
    const systemPrompt = renderPromptTemplate({
      version: '1.0.0',
      template: `You are an expert USPTO patent examiner assistant that analyzes Office Action documents.

Your task is to parse an Office Action document and extract structured information about rejections, prior art references, and examiner reasoning.

Return analysis as valid JSON with rejections, metadata, and prior art references.`,
    }, {});

    const userPrompt = `Please parse the following Office Action document:

${officeActionText}`;

    const aiResponse = await processWithOpenAI(
      systemPrompt,
      userPrompt,
      {
        maxTokens: 4000,
        temperature: 0.1,
        response_format: { type: 'json_object' },
      }
    );

    const parsedResult = safeJsonParse(aiResponse.content);
    if (!parsedResult) {
      throw new ApplicationError(
        ErrorCode.AI_INVALID_RESPONSE,
        'Failed to parse Office Action using standard method'
      );
    }

    return this.validateAndEnhanceResult(parsedResult);
  }

  /**
   * Intelligently segment Office Action document
   */
  private static async segmentOfficeAction(
    officeActionText: string
  ): Promise<SegmentationResult> {
    // Office Actions have predictable structure:
    // 1. Header/metadata
    // 2. Rejections (multiple sections)
    // 3. Prior art references
    // 4. Examiner reasoning

    const segments: DocumentSegment[] = [];
    let currentIndex = 0;

    // Try to identify rejection sections first
    const rejectionMarkers = [
      /Claims?\s+\d+[\d\s,\-and]*\s+(?:is|are)\s+rejected/gi,
      /§\s*10[123]\s+rejection/gi,
      /§\s*112\s+rejection/gi,
      /Claim\s+\d+\s+is\s+(?:anticipated|obvious)/gi,
    ];

    const rejectionMatches: Array<{ start: number; end: number; type: string }> = [];

    rejectionMarkers.forEach((marker, index) => {
      let match;
      while ((match = marker.exec(officeActionText)) !== null) {
        rejectionMatches.push({
          start: match.index,
          end: match.index + match[0].length,
          type: 'rejection',
        });
      }
    });

    // Sort by position
    rejectionMatches.sort((a, b) => a.start - b.start);

    if (rejectionMatches.length === 0) {
      // No clear structure found, use simple chunking
      return this.createSimpleSegments(officeActionText);
    }

    // Create segments based on rejection boundaries
    let lastEnd = 0;

    for (let i = 0; i < rejectionMatches.length; i++) {
      const match = rejectionMatches[i];
      
      // Find the end of this rejection (start of next rejection or end of document)
      const nextMatch = rejectionMatches[i + 1];
      const segmentEnd = nextMatch ? nextMatch.start : officeActionText.length;

      const segmentText = officeActionText.substring(match.start, segmentEnd);
      const tokenCount = estimateTokens(segmentText);

      // If segment is too large, split it
      if (tokenCount > this.MAX_TOKENS_PER_SEGMENT) {
        const subSegments = this.splitLargeSegment(segmentText, match.start);
        segments.push(...subSegments);
      } else {
        segments.push({
          id: uuidv4(),
          type: 'rejection',
          content: segmentText.trim(),
          startIndex: match.start,
          endIndex: segmentEnd,
          tokenCount,
          metadata: { rejectionNumber: i + 1 },
        });
      }

      lastEnd = segmentEnd;
    }

    // Handle any remaining content at the end
    if (lastEnd < officeActionText.length) {
      const remainingText = officeActionText.substring(lastEnd);
      if (remainingText.trim()) {
        segments.push({
          id: uuidv4(),
          type: 'other',
          content: remainingText.trim(),
          startIndex: lastEnd,
          endIndex: officeActionText.length,
          tokenCount: estimateTokens(remainingText),
        });
      }
    }

    return {
      segments,
      totalTokens: estimateTokens(officeActionText),
      documentMetadata: this.extractBasicMetadata(officeActionText),
    };
  }

  /**
   * Analyze individual segment with context
   */
  private static async analyzeSegment(
    segment: DocumentSegment,
    segmentNumber: number,
    totalSegments: number,
    previousContext: string
  ): Promise<any> {
    const systemPrompt = renderPromptTemplate(ENHANCED_OFFICE_ACTION_PARSING_SYSTEM_PROMPT, {
      segmentNumber,
      totalSegments,
      previousContext: previousContext || null,
    });

    const userPrompt = `Analyze this Office Action segment:

${segment.content}`;

    const aiResponse = await processWithOpenAI(
      systemPrompt,
      userPrompt,
      {
        maxTokens: 4000,
        temperature: 0.1,
        response_format: { type: 'json_object' },
      }
    );

    const result = safeJsonParse(aiResponse.content);
    if (!result) {
      throw new ApplicationError(
        ErrorCode.AI_INVALID_RESPONSE,
        `Failed to parse segment ${segmentNumber} analysis`
      );
    }

    return result;
  }

  /**
   * Merge analyses from all segments
   */
  private static async mergeSegmentAnalyses(
    segmentAnalyses: any[],
    documentMetadata: any
  ): Promise<ParsedOfficeActionResult> {
    if (segmentAnalyses.length === 1) {
      return this.validateAndEnhanceResult(segmentAnalyses[0]);
    }

    // Merge using AI for complex cases
    const mergePrompt = `Merge these Office Action segment analyses into a comprehensive result:

${JSON.stringify(segmentAnalyses, null, 2)}

Document metadata: ${JSON.stringify(documentMetadata, null, 2)}

Combine all rejections, resolve incomplete ones that span segments, and merge prior art references.`;

    const systemPrompt = renderPromptTemplate(SEGMENT_MERGING_SYSTEM_PROMPT, {});

    const aiResponse = await processWithOpenAI(
      systemPrompt,
      mergePrompt,
      {
        maxTokens: 6000,
        temperature: 0.1,
        response_format: { type: 'json_object' },
      }
    );

    const mergedResult = safeJsonParse(aiResponse.content);
    if (!mergedResult) {
      // Fallback to simple merging
      return this.simpleMergeSegments(segmentAnalyses, documentMetadata);
    }

    return this.validateAndEnhanceResult(mergedResult);
  }

  /**
   * Simple fallback merging when AI merging fails
   */
  private static simpleMergeSegments(
    segmentAnalyses: any[],
    documentMetadata: any
  ): ParsedOfficeActionResult {
    const allRejections: ParsedRejection[] = [];
    const allPriorArt: string[] = [];
    let applicationNumber = null;
    let mailingDate = null;
    let examinerName = null;

    segmentAnalyses.forEach(analysis => {
      if (analysis.rejections) {
        allRejections.push(...analysis.rejections);
      }
      if (analysis.priorArtReferences) {
        allPriorArt.push(...analysis.priorArtReferences);
      }
      if (analysis.metadata) {
        applicationNumber = applicationNumber || analysis.metadata.applicationNumber;
        mailingDate = mailingDate || analysis.metadata.mailingDate;
        examinerName = examinerName || analysis.metadata.examinerName;
      }
    });

    // Remove duplicate prior art
    const uniquePriorArt = [...new Set(allPriorArt)];

    return {
      metadata: {
        applicationNumber,
        mailingDate,
        examinerName,
      },
      rejections: allRejections,
      allPriorArtReferences: uniquePriorArt,
      summary: {
        totalRejections: allRejections.length,
        rejectionTypes: [...new Set(allRejections.map(r => r.type))],
        totalClaimsRejected: [...new Set(allRejections.flatMap(r => r.claims || []))].length,
        uniquePriorArtCount: uniquePriorArt.length,
      },
    };
  }

  /**
   * Create simple segments when structure detection fails
   */
  private static createSimpleSegments(officeActionText: string): SegmentationResult {
    const segments: DocumentSegment[] = [];
    const maxCharsPerSegment = this.MAX_TOKENS_PER_SEGMENT * 4;
    
    let currentIndex = 0;
    let segmentNumber = 1;

    while (currentIndex < officeActionText.length) {
      const segmentText = officeActionText.substring(
        currentIndex,
        Math.min(currentIndex + maxCharsPerSegment, officeActionText.length)
      );
      
      segments.push({
        id: uuidv4(),
        type: 'other',
        content: segmentText,
        startIndex: currentIndex,
        endIndex: currentIndex + segmentText.length,
        tokenCount: estimateTokens(segmentText),
        metadata: { segmentNumber },
      });

      currentIndex += segmentText.length;
      segmentNumber++;
    }

    return {
      segments,
      totalTokens: estimateTokens(officeActionText),
      documentMetadata: this.extractBasicMetadata(officeActionText),
    };
  }

  /**
   * Split large segments that exceed token limits
   */
  private static splitLargeSegment(
    segmentText: string,
    startIndex: number
  ): DocumentSegment[] {
    const subSegments: DocumentSegment[] = [];
    const maxCharsPerSubSegment = this.MAX_TOKENS_PER_SEGMENT * 4;
    
    let currentIndex = 0;
    let subSegmentNumber = 1;

    while (currentIndex < segmentText.length) {
      const subSegmentText = segmentText.substring(
        currentIndex,
        Math.min(currentIndex + maxCharsPerSubSegment, segmentText.length)
      );
      
      subSegments.push({
        id: uuidv4(),
        type: 'rejection',
        content: subSegmentText,
        startIndex: startIndex + currentIndex,
        endIndex: startIndex + currentIndex + subSegmentText.length,
        tokenCount: estimateTokens(subSegmentText),
        metadata: { 
          isSubSegment: true,
          subSegmentNumber,
          parentSegmentStart: startIndex,
        },
      });

      currentIndex += subSegmentText.length;
      subSegmentNumber++;
    }

    return subSegments;
  }

  /**
   * Extract basic metadata from document text
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
   * Truncate text intelligently (fallback for existing compatibility)
   */
  private static truncateOfficeActionText(text: string, maxTokens: number): string {
    const maxChars = maxTokens * 4;
    if (text.length <= maxChars) {
      return text;
    }

    // Try to truncate at a natural boundary
    const truncated = text.substring(0, maxChars);
    const lastParagraph = truncated.lastIndexOf('\n\n');
    
    if (lastParagraph > maxChars * 0.8) {
      return truncated.substring(0, lastParagraph);
    }

    return truncated;
  }

  /**
   * Validate and enhance parsing result
   */
  private static validateAndEnhanceResult(rawResult: any): ParsedOfficeActionResult {
    // Add validation logic and enhancement here
    // This would include the existing validation from OfficeActionParserService
    
    return {
      metadata: rawResult.metadata || {},
      rejections: rawResult.rejections || [],
      allPriorArtReferences: rawResult.allPriorArtReferences || rawResult.priorArtReferences || [],
      summary: rawResult.summary || {
        totalRejections: rawResult.rejections?.length || 0,
        rejectionTypes: [],
        totalClaimsRejected: 0,
        uniquePriorArtCount: 0,
      },
    };
  }
} 