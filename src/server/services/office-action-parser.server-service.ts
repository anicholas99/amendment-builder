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
      
      // Truncate if necessary but preserve structure
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
          maxTokens: 4000,
          temperature: 0.1, // Low temperature for consistent parsing
          model: options.model || 'gpt-4o', // Use gpt-4o for better structured output
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
} 