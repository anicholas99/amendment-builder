import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { OpenaiServerService } from './openai.server-service';
import {
  CLAIM_DECOMPOSITION_PROMPT_V2,
  CLAIM_PARSING_SYSTEM_PROMPT_V2,
} from '@/server/prompts/prompts/templates/claimParsing';
import { renderPromptTemplate } from '@/server/prompts/prompts/utils';

/**
 * Service for handling claim-related operations such as parsing and generation
 */
export class ClaimsServerService {
  /**
   * Extract claim elements from a claim text using V2 format
   * @param claimText The claim text to parse
   * @param claimData Optional object containing all claims
   * @returns Array of element strings
   */
  static async extractClaimElementsV2(
    claimText: string,
    claimData?: Record<string, string>
  ): Promise<string[]> {
    try {
      logger.info('[ClaimsServerService] Extracting claim elements V2', {
        claimLength: claimText.length,
        hasClaimData: !!claimData,
      });

      const { systemMessage, prompt } =
        await ClaimsServerService.extractKeyElementsV2(claimText, claimData);

      const result = await OpenaiServerService.getChatCompletion({
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      });

      logger.debug('[ClaimsServerService] Raw AI response', {
        content: result.content,
      });

      // Parse the JSON response
      const parsed = JSON.parse(result.content);

      logger.debug('[ClaimsServerService] Parsed response', {
        parsed,
        isArray: Array.isArray(parsed),
        hasElements: 'elements' in parsed,
      });

      // Handle both direct array and object with elements property
      const elements = Array.isArray(parsed) ? parsed : parsed.elements || [];

      // Validate it's an array of strings
      if (
        !Array.isArray(elements) ||
        !elements.every(item => typeof item === 'string')
      ) {
        logger.error('[ClaimsServerService] Invalid V2 response format', {
          parsed,
        });
        throw new ApplicationError(
          ErrorCode.VALIDATION_FAILED,
          'Invalid response format from AI'
        );
      }

      logger.info('[ClaimsServerService] Successfully extracted V2 elements', {
        elementCount: elements.length,
      });

      return elements;
    } catch (error) {
      logger.error(
        '[ClaimsServerService] Failed to extract claim elements V2',
        error
      );

      if (error instanceof ApplicationError) {
        throw error;
      }

      // If AI fails, try basic fallback parsing
      return ClaimsServerService.fallbackParsingV2(claimText);
    }
  }

  /**
   * Generate prompt for V2 claim element extraction
   */
  private static async extractKeyElementsV2(
    claimText: string,
    claimData?: Record<string, string>
  ): Promise<{ systemMessage: string; prompt: string }> {
    const systemMessage = CLAIM_PARSING_SYSTEM_PROMPT_V2.template;

    // Prepare claim data string if available
    let claimDataString = '';
    if (claimData && Object.keys(claimData).length > 0) {
      claimDataString = Object.entries(claimData)
        .map(([num, text]) => `Claim ${num}: ${text}`)
        .join('\n\n');
    }

    const prompt = renderPromptTemplate(CLAIM_DECOMPOSITION_PROMPT_V2, {
      claimText,
      claimData: claimDataString || 'No additional claims provided.',
    });

    return { systemMessage, prompt };
  }

  /**
   * Fallback parsing for V2 format when AI fails
   */
  private static fallbackParsingV2(claimText: string): string[] {
    logger.warn('[ClaimsServerService] Using fallback parsing V2');

    // Simple extraction of noun phrases and key components
    const elements: string[] = [];

    // Remove claim preamble
    const withoutPreamble = claimText.replace(/^.*?comprising:?\s*/i, '');

    // Split by common delimiters
    const parts = withoutPreamble.split(/[;,]\s*/);

    parts.forEach(part => {
      const cleaned = part.trim();
      if (cleaned && cleaned.length > 3) {
        elements.push(cleaned);
      }
    });

    // If no elements found, just return the whole claim as one element
    if (elements.length === 0 && claimText.trim()) {
      elements.push(claimText.trim());
    }

    return elements;
  }
}
