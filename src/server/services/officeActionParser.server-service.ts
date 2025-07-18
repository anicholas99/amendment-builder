import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { OpenaiServerService } from '@/server/services/openai.server-service';
import { PatentPromptSanitizer } from '@/utils/ai/promptSanitizer';
import { safeJsonParse } from '@/utils/jsonUtils';
import type { ParsedOfficeActionData, ParsedRejection, CitedReference } from '@/types/amendment';

/**
 * Office Action Parser Service
 * Analyzes Office Action documents using AI to extract structured data
 * Follows existing AI service patterns from the patent drafter codebase
 */
export class OfficeActionParserService {
  
  /**
   * Parses an Office Action text document and extracts structured data
   * @param oaText Raw text content from the Office Action document
   * @param applicationNumber Optional application number for context
   * @returns Parsed Office Action data structure
   */
  static async parseOfficeActionText(
    oaText: string,
    applicationNumber?: string
  ): Promise<ParsedOfficeActionData> {
    try {
      logger.info('[OfficeActionParser] Starting Office Action parsing', {
        textLength: oaText.length,
        applicationNumber,
      });

      // Sanitize the Office Action text
      const sanitizedText = PatentPromptSanitizer.sanitizeInventionDisclosure(oaText);
      
      logger.debug('[OfficeActionParser] Text sanitization completed', {
        originalLength: oaText.length,
        sanitizedLength: sanitizedText.length,
        wasReduced: sanitizedText.length < oaText.length,
      });

      // Generate parsing prompt
      const prompt = this.generateParsingPrompt(sanitizedText, applicationNumber);

      // Call OpenAI for parsing
      const aiResponse = await OpenaiServerService.getChatCompletion({
        messages: [
          {
            role: 'system',
            content: 'You are an expert USPTO patent examiner analyzing Office Action documents. Extract structured data and return only valid JSON without any markdown formatting or code blocks.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.1,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      });

      // Parse the AI response
      const parsedResponse = safeJsonParse<ParsedOfficeActionData>(aiResponse.content);
      
      if (!parsedResponse) {
        throw new ApplicationError(
          ErrorCode.AI_INVALID_RESPONSE,
          'Failed to parse AI response for Office Action'
        );
      }

      // Validate the parsed response
      const validatedData = this.validateParsedData(parsedResponse);

      logger.info('[OfficeActionParser] Office Action parsing completed successfully', {
        applicationNumber: validatedData.applicationNumber,
        rejectionsCount: validatedData.rejections.length,
        citedReferencesCount: validatedData.citedReferences.length,
        examiner: validatedData.examiner?.name,
      });

      return validatedData;

    } catch (error) {
      logger.error('[OfficeActionParser] Failed to parse Office Action', {
        error,
        textLength: oaText.length,
        applicationNumber,
      });

      if (error instanceof ApplicationError) {
        throw error;
      }

      throw new ApplicationError(
        ErrorCode.AI_GENERATION_FAILED,
        `Office Action parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Generates a detailed prompt for Office Action parsing
   * Follows existing prompt patterns from the patent drafter AI services
   */
  private static generateParsingPrompt(oaText: string, applicationNumber?: string): string {
    return `Analyze the following USPTO Office Action document and extract structured information.

${applicationNumber ? `Application Number: ${applicationNumber}` : ''}

Office Action Document:
---
${oaText}
---

Extract the following information and return as JSON:

{
  "applicationNumber": "string (extract from document)",
  "examiner": {
    "name": "string (examiner name)",
    "id": "string (examiner ID if available)",
    "artUnit": "string (art unit number)"
  },
  "dateIssued": "string (ISO date format)",
  "responseDeadline": "string (ISO date format)",
  "rejections": [
    {
      "type": "102|103|101|112 (rejection type)",
      "claimNumbers": ["array of claim numbers as strings"],
      "reasoning": "string (examiner's reasoning)",
      "citedReferences": ["array of patent numbers cited for this rejection"],
      "elements": ["array of claim elements mentioned"]
    }
  ],
  "citedReferences": [
    {
      "patentNumber": "string (patent/publication number)",
      "title": "string (patent title if available)",
      "inventors": "string (inventors if listed)",
      "assignee": "string (assignee if listed)",
      "publicationDate": "string (publication date if available)",
      "relevantClaims": ["array of relevant claim numbers if mentioned"]
    }
  ],
  "examinerRemarks": "string (any additional examiner remarks or comments)"
}

IMPORTANT RULES:
1. For rejection types, use: "102" for anticipation, "103" for obviousness, "101" for subject matter eligibility, "112" for written description/enablement
2. Extract ALL rejections, even if they reference the same prior art
3. Include ALL cited references, even if mentioned multiple times
4. For claim numbers, extract as strings (e.g., ["1", "3", "7-10"])
5. If information is not available, use null or empty arrays as appropriate
6. Dates should be in ISO format (YYYY-MM-DD) when possible
7. Be thorough - capture all rejection reasoning and examiner comments

Return only the JSON object, no additional text or formatting.`;
  }

  /**
   * Validates and cleans the parsed Office Action data
   * Ensures data integrity following existing validation patterns
   */
  private static validateParsedData(data: any): ParsedOfficeActionData {
    const validated: ParsedOfficeActionData = {
      applicationNumber: data.applicationNumber || undefined,
      examiner: data.examiner ? {
        name: data.examiner.name || undefined,
        id: data.examiner.id || undefined,
        artUnit: data.examiner.artUnit || undefined,
      } : undefined,
      dateIssued: data.dateIssued || undefined,
      responseDeadline: data.responseDeadline || undefined,
      rejections: [],
      citedReferences: [],
      examinerRemarks: data.examinerRemarks || undefined,
    };

    // Validate rejections
    if (Array.isArray(data.rejections)) {
      validated.rejections = data.rejections
        .filter((rejection: any) => rejection && typeof rejection === 'object')
        .map((rejection: any) => ({
          type: this.validateRejectionType(rejection.type),
          claimNumbers: Array.isArray(rejection.claimNumbers) 
            ? rejection.claimNumbers.filter((claim: any) => typeof claim === 'string') 
            : [],
          reasoning: typeof rejection.reasoning === 'string' ? rejection.reasoning : '',
          citedReferences: Array.isArray(rejection.citedReferences) 
            ? rejection.citedReferences.filter((ref: any) => typeof ref === 'string') 
            : [],
          elements: Array.isArray(rejection.elements) 
            ? rejection.elements.filter((elem: any) => typeof elem === 'string') 
            : [],
        }));
    }

    // Validate cited references
    if (Array.isArray(data.citedReferences)) {
      validated.citedReferences = data.citedReferences
        .filter((ref: any) => ref && typeof ref === 'object' && ref.patentNumber)
        .map((ref: any) => ({
          patentNumber: ref.patentNumber,
          title: ref.title || undefined,
          inventors: ref.inventors || undefined,
          assignee: ref.assignee || undefined,
          publicationDate: ref.publicationDate || undefined,
          relevantClaims: Array.isArray(ref.relevantClaims) 
            ? ref.relevantClaims.filter((claim: any) => typeof claim === 'string') 
            : [],
        }));
    }

    logger.debug('[OfficeActionParser] Data validation completed', {
      rejectionsValidated: validated.rejections.length,
      referencesValidated: validated.citedReferences.length,
      hasExaminerInfo: !!validated.examiner,
    });

    return validated;
  }

  /**
   * Validates rejection type values
   */
  private static validateRejectionType(type: any): '102' | '103' | '101' | '112' {
    const validTypes = ['102', '103', '101', '112'];
    if (typeof type === 'string' && validTypes.includes(type)) {
      return type as '102' | '103' | '101' | '112';
    }
    
    // Try to infer from common variations
    const typeStr = String(type).toLowerCase();
    if (typeStr.includes('anticipat') || typeStr.includes('102')) return '102';
    if (typeStr.includes('obvious') || typeStr.includes('103')) return '103';
    if (typeStr.includes('subject matter') || typeStr.includes('101') || typeStr.includes('alice')) return '101';
    if (typeStr.includes('written description') || typeStr.includes('enablement') || typeStr.includes('112')) return '112';
    
    // Default to 103 (obviousness) as it's most common
    logger.warn('[OfficeActionParser] Unknown rejection type, defaulting to 103', { type });
    return '103';
  }

  /**
   * Extracts text content from Office Action file
   * Leverages existing file processing utilities
   */
  static async extractTextFromFile(filePath: string, mimeType: string): Promise<string> {
    try {
      logger.debug('[OfficeActionParser] Extracting text from file', {
        filePath,
        mimeType,
      });

      // Import storage service for text extraction
      const { StorageServerService } = await import('./storage.server-service');
      
      // Create a formidable file object for the existing extraction service
      const file = {
        filepath: filePath,
        mimetype: mimeType,
        originalFilename: 'office-action',
        size: 0, // Will be filled by storage service
      } as any;

      const extractedText = await StorageServerService.extractTextFromFile(file);

      logger.info('[OfficeActionParser] Text extraction completed', {
        extractedLength: extractedText.length,
      });

      return extractedText;

    } catch (error) {
      logger.error('[OfficeActionParser] Text extraction failed', {
        error,
        filePath,
        mimeType,
      });

      throw new ApplicationError(
        ErrorCode.FILE_PROCESSING_ERROR,
        `Failed to extract text from Office Action file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
} 