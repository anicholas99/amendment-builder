import { processWithOpenAI } from '@/lib/ai/openAIClient';
import { logger } from '@/lib/monitoring/logger';
// TODO: Fix these imports when prompt templates are created
// import {
//   PARAPHRASE_GENERATION_V1,
//   PARAPHRASE_SYSTEM_MESSAGE_V1,
// } from '@/lib/prompts/templates/variantGeneration';
// import { renderPromptTemplate } from '@/lib/prompts/utils';

// Define the variant type locally
export interface ElementWithVariants {
  text: string;
  variants: string[];
}

// Temporary implementations until prompt templates are created
const PARAPHRASE_GENERATION_V1 = `Generate 3-5 paraphrases for the following claim element. Each paraphrase should maintain the same technical meaning but use different wording:

Element: {{elementText}}

Paraphrases:`;

const PARAPHRASE_SYSTEM_MESSAGE_V1 = {
  template:
    'You are a patent claim analysis assistant. Generate clear, technically accurate paraphrases that maintain the same meaning as the original text.',
};

const renderPromptTemplate = (
  template: string,
  variables: Record<string, string>
): string => {
  let result = template;
  Object.entries(variables).forEach(([key, value]) => {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  });
  return result;
};

// Simple in-memory cache for LLM paraphrases to avoid repeated calls for the same elements
const paraphraseCache = new Map<string, string[]>();

/**
 * Simple normalization (lowercase, without stemming)
 */
function normalizeText(text: string): string {
  return text.toLowerCase();
}

/**
 * Expands a single element text into variants using normalization and LLM paraphrasing.
 * Includes basic in-memory caching for LLM calls.
 */
async function expandSingleElement(elementText: string): Promise<string[]> {
  // Always include the original text as the first variant
  const variants = new Set<string>([elementText]);

  // Add normalized version
  const normalized = normalizeText(elementText);
  if (normalized !== elementText) {
    variants.add(normalized);
  }

  // Only use LLM paraphrases for longer inputs (>= 8 words) to avoid noise on short phrases
  const words = elementText.trim().split(/\s+/).length;
  if (words >= 8) {
    // Check cache first to avoid redundant API calls
    if (paraphraseCache.has(elementText)) {
      const cachedPhrases = paraphraseCache.get(elementText) || [];
      logger.debug(
        `Using cached paraphrases for element: "${elementText.substring(0, 30)}..."`,
        {
          cacheHit: true,
          variantCount: cachedPhrases.length,
        }
      );
      cachedPhrases.forEach(p => variants.add(p));
    } else {
      // Call the LLM for paraphrases if not in cache
      try {
        const prompt = renderPromptTemplate(PARAPHRASE_GENERATION_V1, {
          elementText,
        });

        logger.debug(
          `Requesting paraphrases from LLM for: "${elementText.substring(0, 30)}..."`,
          {
            cacheHit: false,
            elementLength: elementText.length,
            wordCount: words,
          }
        );

        const { content } = await processWithOpenAI(
          prompt,
          PARAPHRASE_SYSTEM_MESSAGE_V1.template,
          {
            model: 'gpt-3.5-turbo', // Use a cheaper model for paraphrasing
            temperature: 0.7, // Higher temperature for more creative variations
            maxTokens: 200, // Limit token usage
          }
        );

        // Extract paraphrases from response (split by line, clean up, filter empty)
        const generatedPhrases = content
          .split(/\r?\n/)
          .map(line => line.trim())
          .filter(line => line && line.length > 5 && line !== elementText);

        // Add generated phrases to variants set
        generatedPhrases.forEach(phrase => variants.add(phrase));

        // Cache the results for future use
        paraphraseCache.set(elementText, generatedPhrases);

        logger.debug(
          `Generated ${generatedPhrases.length} paraphrases for element`,
          {
            elementPreview: elementText.substring(0, 30) + '...',
            paraphrases: generatedPhrases,
          }
        );
      } catch (error) {
        // Log error but continue - we'll still have the original text
        logger.warn('Error generating paraphrases for element', {
          error: error instanceof Error ? error.message : String(error),
          elementPreview: elementText.substring(0, 50) + '...',
        });
      }
    }
  }

  // Return a de-duplicated array of variants
  return Array.from(variants);
}

/**
 * Generates search variants for an array of parsed claim elements.
 * @param elements Array of element strings from a claim
 * @returns Promise resolving to elements with their search variants
 */
export async function generateVariantsForElements(
  elements: string[]
): Promise<ElementWithVariants[]> {
  logger.info(`Generating variants for ${elements.length} claim elements...`);

  const elementsWithVariants: ElementWithVariants[] = [];

  // Process each element to generate variants
  for (const elementText of elements) {
    try {
      const variants = await expandSingleElement(elementText);

      elementsWithVariants.push({
        text: elementText,
        variants: variants,
      });
    } catch (error) {
      // If variant generation fails for an element, include it with just the original text
      logger.error('Failed to generate variants for element', {
        error: error instanceof Error ? error : String(error),
        element: elementText.substring(0, 50) + '...',
      });

      elementsWithVariants.push({
        text: elementText,
        variants: [elementText], // Fallback to just original text
      });
    }
  }

  // Log a summary
  const totalVariantCount = elementsWithVariants.reduce(
    (sum, el) => sum + (el.variants?.length || 0),
    0
  );
  const averageVariants =
    totalVariantCount / Math.max(1, elementsWithVariants.length);

  logger.info(`Generated variants for ${elements.length} elements`, {
    totalVariantCount,
    averageVariantsPerElement: averageVariants.toFixed(1),
  });

  return elementsWithVariants;
}
