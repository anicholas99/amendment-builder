/**
 * Office Action Parser Service
 *
 * Parses Office Action documents to extract rejections, prior art references,
 * and examiner reasoning. Uses AI to understand the structure and content.
 */

import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { processWithOpenAI } from '@/server/ai/aiService';
import { safeJsonParse } from '@/utils/jsonUtils';
import { estimateTokens } from '@/utils/textUtils';
import { renderPromptTemplate } from '@/server/prompts/prompts/utils';
import { ParsedRejection, RejectionType } from '@/types/domain/amendment';
import { v4 as uuidv4 } from 'uuid';

// ============ PROMPT TEMPLATES ============

const OFFICE_ACTION_PARSING_SYSTEM_PROMPT = {
  version: '1.0.0',
  template: `You are an expert USPTO patent examiner assistant that analyzes Office Action documents.

Your task is to parse an Office Action document and extract structured information about rejections, prior art references, and examiner reasoning.

You must identify:
1. **Rejections**: Each distinct rejection with its type (§102, §103, §101, §112, OTHER)
2. **Claims**: Which specific claims are rejected in each rejection
3. **Prior Art**: Patent/publication numbers cited in each rejection
4. **Examiner Reasoning**: The examiner's rationale for each rejection
5. **Document Metadata**: Application number, mailing date, examiner name if present

CRITICAL REQUIREMENTS:
- Extract each rejection as a separate structured object
- Accurately identify rejection types (§102 = anticipation, §103 = obviousness, §101 = subject matter, §112 = written description/enablement)
- Parse claim numbers correctly (e.g., "Claims 1-5" should be ["1", "2", "3", "4", "5"])
- Extract patent/publication numbers in standard format (e.g., "US20180053140A1")
- Preserve exact examiner reasoning text for each rejection

Return your analysis as valid JSON following this exact structure:
{
  "metadata": {
    "applicationNumber": "string or null",
    "mailingDate": "string or null", 
    "examinerName": "string or null"
  },
  "rejections": [
    {
      "id": "string (UUID)",
      "type": "§102" | "§103" | "§101" | "§112" | "OTHER",
      "claims": ["1", "2", "3"],
      "priorArtReferences": ["US20180053140A1", "US9876543B2"],
      "examinerReasoning": "string (exact examiner text)",
      "rawText": "string (full rejection section text)",
      "startIndex": number,
      "endIndex": number
    }
  ],
  "allPriorArtReferences": ["US20180053140A1", "US9876543B2", "..."],
  "summary": {
    "totalRejections": number,
    "rejectionTypes": ["§102", "§103"],
    "totalClaimsRejected": number,
    "uniquePriorArtCount": number
  }
}`,
};

const OFFICE_ACTION_PARSING_USER_PROMPT = {
  version: '1.0.0',
  template: `Please parse the following Office Action document and extract all rejections, prior art references, and metadata.

OFFICE ACTION TEXT:
"""
{{officeActionText}}
"""

Parse this document thoroughly and return the structured JSON as specified in your instructions.`,
};

// ============ TYPES ============

interface ParsedOfficeActionResult {
  metadata: {
    applicationNumber: string | null;
    mailingDate: string | null;
    examinerName: string | null;
  };
  rejections: ParsedRejection[];
  allPriorArtReferences: string[];
  summary: {
    totalRejections: number;
    rejectionTypes: string[];
    totalClaimsRejected: number;
    uniquePriorArtCount: number;
  };
}

// ============ SERVICE CLASS ============

export class OfficeActionParserService {
  /**
   * Parse an Office Action document text using AI
   */
  static async parseOfficeAction(
    officeActionText: string,
    options: {
      maxTokens?: number;
      model?: string;
    } = {}
  ): Promise<ParsedOfficeActionResult> {
    logger.info('[OfficeActionParser] Starting Office Action parsing', {
      textLength: officeActionText.length,
      estimatedTokens: estimateTokens(officeActionText),
    });

    if (!officeActionText?.trim()) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'Office Action text is required for parsing'
      );
    }

    // Check text length and token limits
    const estimatedTokens = estimateTokens(officeActionText);
    const maxTokens = options.maxTokens || 150000; // Conservative limit

    if (estimatedTokens > maxTokens) {
      logger.warn('[OfficeActionParser] Office Action text exceeds token limit', {
        estimatedTokens,
        maxTokens,
      });
      
      // For really long documents (13+ pages), use intelligent segmentation
      if (estimatedTokens > 4000) { // ~4+ pages worth - lowered for testing
        logger.info('[OfficeActionParser] Using segmentation for very long document');
        return this.parseWithSegmentation(officeActionText, options);
      }
      
      // For moderately long documents, truncate intelligently
      const truncatedText = this.truncateOfficeActionText(officeActionText, maxTokens);
      logger.info('[OfficeActionParser] Text truncated for processing', {
        originalLength: officeActionText.length,
        truncatedLength: truncatedText.length,
      });
      officeActionText = truncatedText;
    }

    try {
      // Render prompts
      const systemPrompt = renderPromptTemplate(OFFICE_ACTION_PARSING_SYSTEM_PROMPT, {});
      const userPrompt = renderPromptTemplate(OFFICE_ACTION_PARSING_USER_PROMPT, {
        officeActionText,
      });

      logger.debug('[OfficeActionParser] Sending to AI for parsing', {
        systemPromptLength: systemPrompt.length,
        userPromptLength: userPrompt.length,
      });

      // Call AI service
      const aiResponse = await processWithOpenAI(
        systemPrompt,
        userPrompt,
        {
          maxTokens: 8000, // Increased for complex documents with multiple rejections
          temperature: 0.1, // Low temperature for consistent parsing
        }
      );

      if (!aiResponse?.content?.trim()) {
        throw new ApplicationError(
          ErrorCode.AI_INVALID_RESPONSE,
          'AI service returned empty response for Office Action parsing'
        );
      }

      // Parse AI response
      const parsedResult = this.parseAIResponse(aiResponse.content);
      
      // Validate and enhance the result
      const validatedResult = this.validateAndEnhanceResult(parsedResult);

      logger.info('[OfficeActionParser] Successfully parsed Office Action', {
        totalRejections: validatedResult.summary.totalRejections,
        rejectionTypes: validatedResult.summary.rejectionTypes,
        priorArtCount: validatedResult.summary.uniquePriorArtCount,
      });

      return validatedResult;

    } catch (error) {
      logger.error('[OfficeActionParser] Failed to parse Office Action', {
        error: error instanceof Error ? error.message : String(error),
        textLength: officeActionText.length,
      });

      if (error instanceof ApplicationError) {
        throw error;
      }

      throw new ApplicationError(
        ErrorCode.AI_SERVICE_ERROR,
        `Failed to parse Office Action: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Parse AI response into structured result
   */
  private static parseAIResponse(aiResponse: string): ParsedOfficeActionResult {
    try {
      // More robust cleaning of the AI response
      let cleanedResponse = aiResponse.trim();
      
      // Remove markdown code blocks
      cleanedResponse = cleanedResponse.replace(/^```(?:json)?\s*\n?/gm, '');
      cleanedResponse = cleanedResponse.replace(/\n?\s*```\s*$/gm, '');
      
      // Extract just the JSON object/array part
      const jsonMatch = cleanedResponse.match(/(\{[\s\S]*\})/);
      if (jsonMatch) {
        cleanedResponse = jsonMatch[1];
      }
      
      // Additional cleanup
      cleanedResponse = cleanedResponse.trim();

      logger.debug('[OfficeActionParser] Attempting to parse cleaned JSON', {
        originalLength: aiResponse.length,
        cleanedLength: cleanedResponse.length,
        cleanedPreview: cleanedResponse.substring(0, 200),
      });

      const parsed = safeJsonParse(cleanedResponse, null);
      if (!parsed) {
        // Try to recover from truncated JSON
        logger.warn('[OfficeActionParser] JSON parse failed, attempting recovery', {
          responseLength: cleanedResponse.length,
          lastChars: cleanedResponse.slice(-100),
        });
        
        const recoveredParsed = this.attemptJsonRecovery(cleanedResponse);
        if (recoveredParsed) {
          logger.info('[OfficeActionParser] Successfully recovered truncated JSON');
          return recoveredParsed as ParsedOfficeActionResult;
        }
        
        throw new Error('Failed to parse AI response as JSON');
      }

      return parsed as ParsedOfficeActionResult;
    } catch (error) {
      logger.error('[OfficeActionParser] Failed to parse AI response', {
        error: error instanceof Error ? error.message : String(error),
        responseLength: aiResponse.length,
        responsePreview: aiResponse.substring(0, 200),
      });

      throw new ApplicationError(
        ErrorCode.AI_INVALID_RESPONSE,
        'AI returned invalid JSON response for Office Action parsing'
      );
    }
  }

  /**
   * Attempt to recover truncated JSON by adding missing closing braces/brackets
   */
  private static attemptJsonRecovery(truncatedJson: string): any {
    try {
      // Common truncation recovery strategies
      const recoveryAttempts = [
        // Add missing closing braces and brackets
        truncatedJson + '}',
        truncatedJson + ']}',
        truncatedJson + '}]}',
        truncatedJson + '"}}',
        truncatedJson + '"}]}',
        // Try removing last incomplete line and closing
        truncatedJson.split('\n').slice(0, -1).join('\n') + '}',
        truncatedJson.split('\n').slice(0, -1).join('\n') + ']}',
      ];

      for (const attempt of recoveryAttempts) {
        const parsed = safeJsonParse(attempt.trim(), null);
        if (parsed && typeof parsed === 'object') {
          logger.debug('[OfficeActionParser] JSON recovery successful', {
            strategy: attempt.slice(truncatedJson.length),
            resultKeys: Object.keys(parsed),
          });
          return parsed;
        }
      }

      return null;
    } catch (error) {
      logger.debug('[OfficeActionParser] JSON recovery failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  /**
   * Validate and enhance the parsed result
   */
  private static validateAndEnhanceResult(
    result: ParsedOfficeActionResult
  ): ParsedOfficeActionResult {
    // Ensure rejections have UUIDs
    const enhancedRejections = result.rejections.map(rejection => ({
      ...rejection,
      id: rejection.id || uuidv4(),
    }));

    // Validate rejection types
    const validRejectionTypes = Object.values(RejectionType);
    enhancedRejections.forEach(rejection => {
      if (!validRejectionTypes.includes(rejection.type as any)) {
        logger.warn('[OfficeActionParser] Invalid rejection type found', {
          type: rejection.type,
          rejectionId: rejection.id,
        });
        rejection.type = RejectionType.OTHER;
      }
    });

    // Deduplicate prior art references
    const allPriorArt = Array.from(new Set(result.allPriorArtReferences || []));

    // Recalculate summary
    const summary = {
      totalRejections: enhancedRejections.length,
      rejectionTypes: Array.from(new Set(enhancedRejections.map(r => r.type))),
      totalClaimsRejected: Array.from(
        new Set(enhancedRejections.flatMap(r => r.claims))
      ).length,
      uniquePriorArtCount: allPriorArt.length,
    };

    return {
      ...result,
      rejections: enhancedRejections,
      allPriorArtReferences: allPriorArt,
      summary,
    };
  }

  /**
   * Truncate Office Action text while preserving structure
   */
  private static truncateOfficeActionText(text: string, maxTokens: number): string {
    // Estimate characters per token (rough approximation)
    const charsPerToken = 4;
    const maxChars = maxTokens * charsPerToken * 0.8; // Conservative

    if (text.length <= maxChars) {
      return text;
    }

    // Try to preserve important sections
    const lines = text.split('\n');
    let truncatedText = '';
    let currentLength = 0;

    for (const line of lines) {
      if (currentLength + line.length > maxChars) {
        break;
      }
      truncatedText += line + '\n';
      currentLength += line.length + 1;
    }

    // Add truncation notice
    truncatedText += '\n\n[TRUNCATED FOR PROCESSING]';

    return truncatedText;
  }

  /**
   * Extract specific rejection by ID from parsed results
   */
  static findRejectionById(
    parsedResult: ParsedOfficeActionResult,
    rejectionId: string
  ): ParsedRejection | null {
    return parsedResult.rejections.find(r => r.id === rejectionId) || null;
  }

  /**
   * Get all prior art references from a specific rejection
   */
  static getPriorArtForRejection(
    parsedResult: ParsedOfficeActionResult,
    rejectionId: string
  ): string[] {
    const rejection = this.findRejectionById(parsedResult, rejectionId);
    return rejection?.priorArtReferences || [];
  }

  /**
   * Get summary statistics for the parsed Office Action
   */
  static getParsingStatistics(parsedResult: ParsedOfficeActionResult): {
    hasMetadata: boolean;
    rejectionBreakdown: Record<string, number>;
    averageClaimsPerRejection: number;
    averagePriorArtPerRejection: number;
  } {
    const { metadata, rejections } = parsedResult;
    
    const hasMetadata = !!(
      metadata.applicationNumber || 
      metadata.mailingDate || 
      metadata.examinerName
    );

    const rejectionBreakdown = rejections.reduce((acc, rejection) => {
      acc[rejection.type] = (acc[rejection.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalClaims = rejections.reduce((sum, r) => sum + r.claims.length, 0);
    const totalPriorArt = rejections.reduce((sum, r) => sum + r.priorArtReferences.length, 0);

    return {
      hasMetadata,
      rejectionBreakdown,
      averageClaimsPerRejection: rejections.length > 0 ? totalClaims / rejections.length : 0,
      averagePriorArtPerRejection: rejections.length > 0 ? totalPriorArt / rejections.length : 0,
    };
  }

  /**
   * Parse extremely long Office Actions using intelligent segmentation
   * Industry-standard approach for 13+ page documents that exceed token limits
   */
  private static async parseWithSegmentation(
    officeActionText: string,
    options: { maxTokens?: number; model?: string } = {}
  ): Promise<ParsedOfficeActionResult> {
    logger.info('[OfficeActionParser] Using segmentation for long document', {
      textLength: officeActionText.length,
      estimatedTokens: estimateTokens(officeActionText),
    });

    // Step 1: Identify rejection boundaries using regex patterns
    const rejectionBoundaries = this.findRejectionBoundaries(officeActionText);
    
    // Step 2: Create segments based on rejections (industry standard)
    const segments = this.createRejectionSegments(officeActionText, rejectionBoundaries);
    
    // Step 3: Process each segment with context
    const segmentResults: any[] = [];
    let globalContext = '';

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      
      logger.debug('[OfficeActionParser] Processing segment', {
        segmentNumber: i + 1,
        totalSegments: segments.length,
        segmentLength: segment.content.length,
        tokenCount: estimateTokens(segment.content),
      });

      try {
        // Build enhanced prompt with context
        const segmentPrompt = this.buildSegmentPrompt(segment, i + 1, segments.length, globalContext);
        
        const aiResponse = await processWithOpenAI(
          segmentPrompt.system,
          segmentPrompt.user,
          {
            maxTokens: 4000,
            temperature: 0.1,
            response_format: { type: 'json_object' },
          }
        );

        const segmentResult = this.parseAIResponse(aiResponse.content);
        segmentResults.push(segmentResult);
        
        // Update global context for next segment
        if (segmentResult.rejections?.length > 0) {
          const lastRejection = segmentResult.rejections[segmentResult.rejections.length - 1];
          globalContext = lastRejection.examinerReasoning?.substring(0, 300) || '';
        }

      } catch (error) {
        logger.error('[OfficeActionParser] Segment processing failed', {
          segmentNumber: i + 1,
          error: error instanceof Error ? error.message : String(error),
        });
        
        // Continue with empty result for this segment
        segmentResults.push({
          metadata: {},
          rejections: [],
          allPriorArtReferences: [],
        });
      }
    }

    // Step 4: Merge all segment results intelligently
    const mergedResult = this.mergeSegmentResults(segmentResults, officeActionText);
    
    // Step 5: Validate and enhance the merged result
    const finalResult = this.validateAndEnhanceResult(mergedResult);

    logger.info('[OfficeActionParser] Segmentation parsing completed', {
      totalSegments: segments.length,
      totalRejections: finalResult.summary.totalRejections,
      totalPriorArt: finalResult.summary.uniquePriorArtCount,
    });

    return finalResult;
  }

  /**
   * Find rejection section boundaries in Office Action text
   */
  private static findRejectionBoundaries(text: string): Array<{ start: number; end: number; type: string }> {
    const boundaries: Array<{ start: number; end: number; type: string }> = [];
    
    // Common rejection patterns
    const rejectionPatterns = [
      /Claims?\s+\d+[\d\s,\-and]*\s+(?:is|are)\s+rejected/gi,
      /§\s*10[123]\s+[Rr]ejection/gi,
      /§\s*112\s+[Rr]ejection/gi,
      /Claims?\s+\d+[\d\s,\-and]*\s+(?:is|are)\s+(?:anticipated|obvious)/gi,
    ];

    rejectionPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        boundaries.push({
          start: match.index,
          end: match.index + match[0].length,
          type: 'rejection_start',
        });
      }
    });

    // Sort by position and calculate end positions
    boundaries.sort((a, b) => a.start - b.start);
    
    for (let i = 0; i < boundaries.length; i++) {
      const current = boundaries[i];
      const next = boundaries[i + 1];
      
      // End of this rejection is start of next rejection or end of document
      current.end = next ? next.start : text.length;
    }

    return boundaries;
  }

  /**
   * Create processing segments based on rejection boundaries
   */
  private static createRejectionSegments(
    text: string,
    boundaries: Array<{ start: number; end: number; type: string }>
  ): Array<{ content: string; start: number; end: number; type: string }> {
    const segments: Array<{ content: string; start: number; end: number; type: string }> = [];
    const maxSegmentTokens = 15000; // Conservative limit per segment

    if (boundaries.length === 0) {
      // No clear rejection structure, use simple chunking
      return this.createSimpleChunks(text, maxSegmentTokens);
    }

    let lastEnd = 0;

    // Add header segment if there's content before first rejection
    if (boundaries[0].start > 0) {
      const headerContent = text.substring(0, boundaries[0].start).trim();
      if (headerContent) {
        segments.push({
          content: headerContent,
          start: 0,
          end: boundaries[0].start,
          type: 'header',
        });
      }
    }

    // Process each rejection segment
    boundaries.forEach((boundary, index) => {
      const segmentContent = text.substring(boundary.start, boundary.end).trim();
      const segmentTokens = estimateTokens(segmentContent);

      if (segmentTokens > maxSegmentTokens) {
        // Split large rejection into sub-segments
        const subSegments = this.splitLargeRejection(segmentContent, boundary.start, maxSegmentTokens);
        segments.push(...subSegments);
      } else {
        segments.push({
          content: segmentContent,
          start: boundary.start,
          end: boundary.end,
          type: 'rejection',
        });
      }

      lastEnd = boundary.end;
    });

    return segments;
  }

  /**
   * Split large rejections that exceed token limits
   */
  private static splitLargeRejection(
    content: string,
    startIndex: number,
    maxTokens: number
  ): Array<{ content: string; start: number; end: number; type: string }> {
    const subSegments: Array<{ content: string; start: number; end: number; type: string }> = [];
    const maxChars = maxTokens * 4; // Rough chars-to-tokens conversion
    
    let currentIndex = 0;
    let partNumber = 1;

    while (currentIndex < content.length) {
      const segmentContent = content.substring(currentIndex, Math.min(currentIndex + maxChars, content.length));
      
      subSegments.push({
        content: segmentContent,
        start: startIndex + currentIndex,
        end: startIndex + currentIndex + segmentContent.length,
        type: `rejection_part_${partNumber}`,
      });

      currentIndex += segmentContent.length;
      partNumber++;
    }

    return subSegments;
  }

  /**
   * Create simple text chunks when structure detection fails
   */
  private static createSimpleChunks(
    text: string,
    maxTokens: number
  ): Array<{ content: string; start: number; end: number; type: string }> {
    const chunks: Array<{ content: string; start: number; end: number; type: string }> = [];
    const maxChars = maxTokens * 4;
    
    let currentIndex = 0;
    let chunkNumber = 1;

    while (currentIndex < text.length) {
      const chunkContent = text.substring(currentIndex, Math.min(currentIndex + maxChars, text.length));
      
      chunks.push({
        content: chunkContent,
        start: currentIndex,
        end: currentIndex + chunkContent.length,
        type: `chunk_${chunkNumber}`,
      });

      currentIndex += chunkContent.length;
      chunkNumber++;
    }

    return chunks;
  }

  /**
   * Build enhanced prompts for segment processing with context
   */
  private static buildSegmentPrompt(
    segment: { content: string; start: number; end: number; type: string },
    segmentNumber: number,
    totalSegments: number,
    context: string
  ): { system: string; user: string } {
    const systemPrompt = `You are an expert USPTO patent examiner assistant analyzing Office Action documents.

SEGMENT ANALYSIS: You are analyzing segment ${segmentNumber} of ${totalSegments} total segments.
${context ? `PREVIOUS CONTEXT: ${context}` : ''}

Your task is to extract structured information from this segment:
1. **Rejections**: Each distinct rejection with type (§102, §103, §101, §112, OTHER)
2. **Claims**: Which specific claims are rejected  
3. **Prior Art**: Patent/publication numbers cited
4. **Examiner Reasoning**: The examiner's rationale
5. **Document Metadata**: Application numbers, dates, examiner names

CRITICAL: 
- Maintain consistency with previous segments
- Mark incomplete rejections that span segments
- Extract patent numbers in standard format
- Preserve exact examiner reasoning text

Return valid JSON with the standard Office Action structure.`;

    const userPrompt = `Analyze this Office Action segment (${segment.type}):

${segment.content}

Extract all rejections, prior art, and metadata from this segment.`;

    return { system: systemPrompt, user: userPrompt };
  }

  /**
   * Merge results from all processed segments
   */
  private static mergeSegmentResults(segmentResults: any[], fullText: string): any {
    const mergedResult = {
      metadata: {
        applicationNumber: null,
        mailingDate: null,
        examinerName: null,
      },
      rejections: [] as any[],
      allPriorArtReferences: [] as string[],
    };

    // Merge metadata (take first non-null value)
    segmentResults.forEach(result => {
      if (result.metadata) {
        mergedResult.metadata.applicationNumber = 
          mergedResult.metadata.applicationNumber || result.metadata.applicationNumber;
        mergedResult.metadata.mailingDate = 
          mergedResult.metadata.mailingDate || result.metadata.mailingDate;
        mergedResult.metadata.examinerName = 
          mergedResult.metadata.examinerName || result.metadata.examinerName;
      }
    });

    // Merge rejections
    segmentResults.forEach(result => {
      if (result.rejections && Array.isArray(result.rejections)) {
        mergedResult.rejections.push(...result.rejections);
      }
    });

    // Merge prior art references and remove duplicates
    const allPriorArt = new Set<string>();
    segmentResults.forEach(result => {
      if (result.allPriorArtReferences && Array.isArray(result.allPriorArtReferences)) {
        result.allPriorArtReferences.forEach((ref: string) => allPriorArt.add(ref));
      }
      if (result.priorArtReferences && Array.isArray(result.priorArtReferences)) {
        result.priorArtReferences.forEach((ref: string) => allPriorArt.add(ref));
      }
    });
    mergedResult.allPriorArtReferences = Array.from(allPriorArt);

    return mergedResult;
  }
} 