/**
 * Server-side service for performing complex AI-driven snippet extraction.
 */
import { logger } from '@/server/logger';
import { OpenaiServerService } from './openai.server-service';

/**
 * Represents the snippets extracted by the LLM for a single input claim element.
 */
export interface ExtractedElementSnippets {
  inputClaimElement: string;
  extractedSnippets: string[];
}

// Expected structure from the LLM
interface LLMSnippetResponseFormat {
  element_to_snippets_map: Array<{
    input_claim_element: string;
    extracted_snippets: string[];
  }>;
}

export class SnippetExtractionServerService {
  /**
   * Uses an LLM to extract relevant snippets from a single prior art document
   * for multiple claim elements simultaneously.
   *
   * @param userClaimElementTexts - An array of user's claim element strings.
   * @param priorArtReferenceNumber - The identifier of the prior art document.
   * @param fullPriorArtText - The complete text of the prior art document.
   * @param inventionSummary - Optional summary of the user's invention for context.
   * @returns A promise resolving to an array of ExtractedElementSnippets or null on critical error.
   */
  static async extractSnippetsForAllElements(
    userClaimElementTexts: string[],
    priorArtReferenceNumber: string,
    fullPriorArtText: string,
    inventionSummary?: string
  ): Promise<Array<ExtractedElementSnippets> | null> {
    logger.info(
      `[SnippetExtractionServerService] Starting snippet extraction for ${userClaimElementTexts.length} elements against ref: ${priorArtReferenceNumber}`
    );

    if (!userClaimElementTexts || userClaimElementTexts.length === 0) {
      logger.warn(
        '[SnippetExtractionServerService] No claim elements provided.'
      );
      return [];
    }
    if (!fullPriorArtText) {
      logger.warn(
        `[SnippetExtractionServerService] Full prior art text is empty for ref: ${priorArtReferenceNumber}.`
      );
      return null;
    }

    const prompt = this.constructPrompt(
      userClaimElementTexts,
      fullPriorArtText,
      priorArtReferenceNumber,
      inventionSummary
    );

    try {
      const llmResponse = await OpenaiServerService.getChatCompletion({
        model: 'gpt-4.1',
        messages: [
          {
            role: 'system',
            content:
              'You are a patent analysis assistant specialized in extracting textual evidence.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.1,
        max_tokens: 4096, // Increased max_tokens
        // response_format: { type: 'json_object' }, // Temporarily remove as it might cause issues
      });

      const parsedResult = this.parseAndValidateResponse(
        llmResponse.content,
        userClaimElementTexts
      );

      if (!parsedResult) {
        logger.error(
          `[SnippetExtractionServerService] Failed to parse or validate LLM response for ref ${priorArtReferenceNumber}.`
        );
        return null;
      }

      logger.info(
        `[SnippetExtractionServerService] Successfully extracted and parsed snippets for ref ${priorArtReferenceNumber}.`
      );
      return parsedResult;
    } catch (error) {
      logger.error(
        `[SnippetExtractionServerService] Critical error during snippet extraction for ref ${priorArtReferenceNumber}:`,
        error
      );
      return null;
    }
  }

  /**
   * Constructs the prompt for the LLM.
   */
  private static constructPrompt(
    userClaimElementTexts: string[],
    fullPriorArtText: string,
    priorArtReferenceNumber: string,
    inventionSummary?: string
  ): string {
    const claimElementsJSON = JSON.stringify(userClaimElementTexts, null, 2);
    return `
You are an expert patent analyst AI. Your task is to meticulously review a PRIOR ART DOCUMENT and identify relevant textual snippets for a given list of CLAIM ELEMENTS from an invention.

CONTEXT ABOUT THE INVENTION (Optional):
Invention Summary: "${inventionSummary || 'Not provided'}"

PRIOR ART DOCUMENT (Reference Number: ${priorArtReferenceNumber}):
\`\`\`text
${fullPriorArtText}
\`\`\`

CLAIM ELEMENTS TO ANALYZE:
\`\`\`json
${claimElementsJSON}
\`\`\`

INSTRUCTIONS:
1. For EACH claim element provided in the "CLAIM ELEMENTS TO ANALYZE" JSON array, search the entire "PRIOR ART DOCUMENT" text.
2. Identify and extract the single most relevant, concise, and continuous passage (snippet).
3. Snippets MUST be exact quotes from the PRIOR ART DOCUMENT.
4. LENGTH LIMIT: Snippets MUST NOT exceed 75 words.
5. If no relevant passage is found, use the exact string "Nothing relevant found."
6. If multiple distinctly relevant snippets are found, include only the best one.
7. If no relevant passage is found, its "extracted_snippets" array should be empty ([]).

REQUIRED OUTPUT FORMAT:
Respond ONLY with a single JSON object. This JSON object must have a top-level key named "element_to_snippets_map". The value must be an array of objects. Each object must correspond to an input claim element and have two keys: "input_claim_element" (string, exact match) and "extracted_snippets" (array of strings).

It is CRITICAL that every input claim element is represented in the output.

Example:
\`\`\`json
{
  "element_to_snippets_map": [
    { "input_claim_element": "Element A...", "extracted_snippets": ["Relevant quote..."] },
    { "input_claim_element": "Element B...", "extracted_snippets": [] }
  ]
}
\`\`\`

Ensure your entire response is ONLY this single JSON object.`;
  }

  /**
   * Parses and validates the LLM response.
   */
  private static parseAndValidateResponse(
    responseText: string,
    originalClaimElementTexts: string[]
  ): Array<ExtractedElementSnippets> | null {
    try {
      const jsonMatch = responseText.match(
        /\{\s*"element_to_snippets_map"\s*:\s*\[[\s\S]*?\]\s*\}/
      );
      const jsonString = jsonMatch ? jsonMatch[0] : responseText;
      const parsed: LLMSnippetResponseFormat = JSON.parse(jsonString);

      if (
        !parsed?.element_to_snippets_map ||
        !Array.isArray(parsed.element_to_snippets_map)
      ) {
        logger.error(
          "[SnippetExtractionServerService] Parsed response missing or invalid 'element_to_snippets_map' array.",
          parsed
        );
        return null;
      }

      const results: Array<ExtractedElementSnippets> = [];
      const foundInputElements = new Set<string>();

      for (const item of parsed.element_to_snippets_map) {
        if (
          typeof item.input_claim_element !== 'string' ||
          !Array.isArray(item.extracted_snippets)
        ) {
          logger.warn(
            '[SnippetExtractionServerService] Item has malformed structure.',
            item
          );
          continue;
        }
        if (!originalClaimElementTexts.includes(item.input_claim_element)) {
          logger.warn(
            `[SnippetExtractionServerService] LLM returned an unexpected input_claim_element: ${item.input_claim_element}`
          );
          continue;
        }

        results.push({
          inputClaimElement: item.input_claim_element,
          extractedSnippets: item.extracted_snippets.filter(
            s => typeof s === 'string' && s.trim() !== ''
          ),
        });
        foundInputElements.add(item.input_claim_element);
      }

      for (const originalElement of originalClaimElementTexts) {
        if (!foundInputElements.has(originalElement)) {
          logger.warn(
            `[SnippetExtractionServerService] LLM response did not include an entry for: ${originalElement}.`
          );
          results.push({
            inputClaimElement: originalElement,
            extractedSnippets: [],
          });
        }
      }
      return results;
    } catch (error) {
      logger.error(
        '[SnippetExtractionServerService] Error parsing LLM JSON response:',
        {
          error: error instanceof Error ? error.message : String(error),
          responseText,
        }
      );
      return null;
    }
  }
}
