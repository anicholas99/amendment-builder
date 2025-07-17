import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { OpenaiServerService } from './openai.server-service';
import {
  SEARCH_QUERY_GENERATION_PROMPT_V2,
  SEARCH_QUERY_GENERATION_SYSTEM_MESSAGE_V2,
} from '@/server/prompts/prompts/templates/queryGeneration';
import { renderPromptTemplate } from '@/server/prompts/prompts/utils';

/**
 * Service for generating search queries based on claim elements
 */
export class QueryGenerationService {
  /**
   * Generate search queries from claim elements
   * Now only supports V2 format (string arrays)
   * @param elements Array of claim element strings
   * @returns Array of search query strings
   */
  static async generateSearchQueries(elements: string[]): Promise<string[]> {
    if (!Array.isArray(elements) || elements.length === 0) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_FAILED,
        'Elements must be a non-empty array'
      );
    }

    logger.info('[QueryGenerationService] Generating search queries V2', {
      elementCount: elements.length,
    });

    try {
      return await this.generateSearchQueriesV2(elements);
    } catch (error) {
      logger.error(
        '[QueryGenerationService] Failed to generate queries',
        error
      );

      // Fallback to basic query generation if AI fails
      return this.fallbackQueryGenerationV2(elements);
    }
  }

  /**
   * V2 query generation - uses string array format
   */
  private static async generateSearchQueriesV2(
    elements: string[]
  ): Promise<string[]> {
    const systemMessage = SEARCH_QUERY_GENERATION_SYSTEM_MESSAGE_V2.template;
    const prompt = renderPromptTemplate(SEARCH_QUERY_GENERATION_PROMPT_V2, {
      elements: JSON.stringify(elements, null, 2),
    });

    const result = await OpenaiServerService.getChatCompletion({
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    // Parse response
    const parsed = JSON.parse(result.content);
    const queries = parsed.searchQueries || parsed.queries || parsed;

    if (!Array.isArray(queries)) {
      throw new ApplicationError(
        ErrorCode.AI_INVALID_RESPONSE,
        'Expected array of queries from AI'
      );
    }

    // Validate all queries are strings
    const validQueries = queries.filter(
      q => typeof q === 'string' && q.trim().length > 0
    );

    logger.info('[QueryGenerationService] Generated V2 queries', {
      queryCount: validQueries.length,
    });

    return validQueries;
  }

  /**
   * Fallback query generation for V2 format
   */
  private static fallbackQueryGenerationV2(elements: string[]): string[] {
    logger.warn('[QueryGenerationService] Using fallback query generation V2');

    // Generate basic queries from elements
    const queries: string[] = [];

    // Create individual queries for each element
    elements.forEach(element => {
      if (element && element.trim().length > 3) {
        queries.push(element.trim());
      }
    });

    // Create a combined query if multiple elements
    if (elements.length > 1) {
      const combined = elements.slice(0, 3).join(' AND ');
      queries.push(combined);
    }

    return queries.length > 0 ? queries : ['patent search'];
  }
}
