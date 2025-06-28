/**
 * Claim Generation Service
 *
 * Handles the complex business logic for generating patent claims.
 * This service orchestrates AI calls, validation, and retry logic.
 */

import { logger } from '@/lib/monitoring/logger';
import { processWithOpenAI } from '@/server/ai/aiService';
import { safeJsonParse } from '@/utils/json-utils';
import { renderPromptTemplate } from '@/server/prompts/prompts/utils';
import {
  CLAIM_DRAFT_SYSTEM_MESSAGE_V1,
  CLAIM_DRAFT_PROMPT_V1,
  CLAIM_REVIEW_PROMPT_V1,
  CORE_CLAIM_RULES_V1,
  DIFFERENTIATOR_EXTRACTION_PROMPT_V1,
  PREAMBLE_SELECTION_PROMPT_V1,
  FINAL_VALIDATION_PROMPT_V1,
} from '@/server/prompts/prompts/templates/claimGeneration';
import { ApplicationError, ErrorCode } from '@/lib/error';

// Validation schema for claim JSON
import Ajv from 'ajv';
const validateClaimJSON = new Ajv().compile({
  type: 'object',
  properties: {
    draft: { type: 'string', minLength: 12 },
    critique: { type: 'string' },
  },
  required: ['draft', 'critique'],
});

// Hardware/functional word patterns
const HW_REGEX =
  /\b(robot|vehicle|platform|roller|suction|module|device|pump|sensor|tower|circuit|mechanism|assembly|step)\b/i;
const FN_REGEX =
  /\b(control|execute|process|determine|monitor|dose|sterilis|infus|operate|rollback|revert|canary)\b/i;

interface ClaimGenerationInput {
  title: string;
  summary: string;
  abstract?: string;
  novelty: string;
  features?: string[];
  technical_implementation?: {
    preferred_embodiment?: string;
    alternative_embodiments?: string[];
  };
  background?: {
    technical_field?: string;
    problems_solved?: string[];
    existing_solutions?: string[];
  };
  advantages?: string[];
  use_cases?: string[];
  patent_category?: string;
  technical_field?: string;
  definitions?: Record<string, string>;
}

interface ClaimGenerationResult {
  claims: {
    '1': string;
  };
  critique: string;
  metadata?: {
    attempts: number;
    totalTokens: number;
    totalCost: number;
  };
}

interface PreambleData {
  phrase?: string;
  type?: string;
}

interface ClaimResult {
  draft?: string;
  critique?: string;
}

interface FinalValidationResult {
  isValid?: boolean;
  reasoning?: string;
  revisedDraft?: string;
  revisedCritique?: string;
}

export class ClaimGenerationService {
  private readonly MAX_ATTEMPTS = 3;
  private readonly TOP_N_DIFFERENTIATORS = 4;
  private readonly MODEL = 'gpt-4.1';

  /**
   * Generate a patent claim based on the provided input
   */
  async generateClaim(
    input: ClaimGenerationInput
  ): Promise<ClaimGenerationResult> {
    logger.info('[ClaimGen] Starting claim generation', {
      title: input.title,
      hasFeatures: !!input.features?.length,
      hasImplementation: !!input.technical_implementation,
    });

    // Analyze the disclosure
    const disclosureText =
      `${input.novelty} ${input.features?.join(' ')}`.toLowerCase();
    const containsHardware = HW_REGEX.test(disclosureText);
    const methodOnly =
      /\b(method|process)\b/i.test(input.novelty) && !containsHardware;

    // Get optimal preamble
    const { preamblePhrase, preambleType, totalTokens, totalCost } =
      await this.selectPreamble(input.title, input.summary, input.novelty);

    // Extract differentiators
    const differentiators = await this.extractAndPatchDifferentiators(
      input.novelty,
      input.features || [],
      input.technical_implementation?.preferred_embodiment,
      containsHardware,
      methodOnly
    );

    // Try to generate a valid claim
    for (let attempt = 1; attempt <= this.MAX_ATTEMPTS; attempt++) {
      logger.info(`[ClaimGen] Attempt ${attempt} of ${this.MAX_ATTEMPTS}`);

      try {
        const result = await this.generateClaimAttempt(
          input,
          preamblePhrase,
          preambleType,
          differentiators,
          containsHardware
        );

        if (result) {
          logger.info('[ClaimGen] Successfully generated claim', {
            attempt,
            finalValidation: !!result.metadata,
          });

          return {
            claims: { '1': result.claims['1'] },
            critique: result.critique,
            metadata: {
              attempts: attempt,
              totalTokens: totalTokens + (result.metadata?.totalTokens || 0),
              totalCost: totalCost + (result.metadata?.totalCost || 0),
            },
          };
        }
      } catch (error) {
        logger.error(`[ClaimGen] Error in attempt ${attempt}`, {
          error: error instanceof Error ? error : undefined,
        });

        if (attempt === this.MAX_ATTEMPTS) {
          throw new ApplicationError(
            ErrorCode.AI_GENERATION_FAILED,
            'AI failed to generate a compliant Claim 1 after 3 attempts.'
          );
        }
      }
    }

    throw new ApplicationError(
      ErrorCode.AI_GENERATION_FAILED,
      'Failed to generate claim after all attempts.'
    );
  }

  /**
   * Select the optimal preamble for the claim
   */
  private async selectPreamble(
    title: string,
    summary: string,
    novelty: string
  ): Promise<{
    preamblePhrase: string;
    preambleType: string;
    totalTokens: number;
    totalCost: number;
  }> {
    const preamblePrompt = renderPromptTemplate(PREAMBLE_SELECTION_PROMPT_V1, {
      title,
      summary,
      novelty,
    });

    logger.debug('[ClaimGen] Selecting preamble');
    const response = await processWithOpenAI(
      preamblePrompt,
      'Choose preamble',
      {
        model: this.MODEL,
        temperature: 0.1,
        response_format: { type: 'json_object' },
      }
    );

    let preamblePhrase = 'A system comprising:';
    let preambleType = 'system';

    try {
      const preambleData = safeJsonParse<PreambleData>(
        response.content || '{}',
        {}
      );
      if (preambleData?.phrase) {
        preamblePhrase = preambleData.phrase;

        // Enhance generic method preambles
        if (preamblePhrase === 'A method comprising:') {
          const techTerms = [
            'computer',
            'software',
            'ai',
            'artificial intelligence',
            'machine learning',
            'data',
            'algorithm',
            'processing',
          ];
          const inventionText = `${title} ${summary} ${novelty}`.toLowerCase();

          if (techTerms.some(term => inventionText.includes(term))) {
            preamblePhrase = 'A computer-implemented method comprising:';
          } else {
            preamblePhrase = 'An automated method comprising:';
          }
        }

        preambleType = preambleData.type || preambleType;
      }
    } catch (error) {
      logger.warn('[ClaimGen] Failed to parse preamble suggestion', { error });
    }

    return {
      preamblePhrase,
      preambleType,
      totalTokens: response.usage?.total_tokens || 0,
      totalCost: response.usage?.estimated_cost || 0,
    };
  }

  /**
   * Extract and patch differentiators
   */
  private async extractAndPatchDifferentiators(
    novelty: string,
    features: string[],
    tech?: string,
    containsHardware?: boolean,
    methodOnly?: boolean
  ): Promise<string[]> {
    const prompt = renderPromptTemplate(DIFFERENTIATOR_EXTRACTION_PROMPT_V1, {
      novelty,
      features,
      tech,
      containsHardware,
    });

    logger.debug('[ClaimGen] Extracting differentiators');
    const { content } = await processWithOpenAI(prompt, 'extract', {
      temperature: 0.15,
      maxTokens: 120,
    });

    const baseDiffs = content
      .split('\n')
      .map(l => l.replace(/^[-•\s]+/, '').trim())
      .filter(Boolean)
      .slice(0, this.TOP_N_DIFFERENTIATORS);

    // Patch to ensure coverage
    return this.patchDifferentiators(baseDiffs, methodOnly || false);
  }

  /**
   * Ensure differentiators have proper coverage
   */
  private patchDifferentiators(
    list: string[],
    isMethodOnly: boolean
  ): string[] {
    const hasHW = isMethodOnly ? true : list.some(d => HW_REGEX.test(d));
    const hasFN = list.some(d => FN_REGEX.test(d));

    const patched = [...list];
    if (!hasHW && !isMethodOnly) {
      patched.push('robotic platform having suction adhesion');
    }
    if (!hasFN) {
      patched.push(
        'processor executing instructions to classify detected defects'
      );
    }

    return patched.slice(0, this.TOP_N_DIFFERENTIATORS);
  }

  /**
   * Check if claim text is clean
   */
  private isTextClean(claim: string): boolean {
    return (
      !/processor configured to execute an processor executing instructions/i.test(
        claim
      ) && !/\ban processor\b/i.test(claim)
    );
  }

  /**
   * Fix multiple "; and" occurrences
   */
  private ensureSingleAndInClaim(claim: string): string {
    if (!claim) return claim;

    const andCount = (claim.match(/; and/gi) || []).length;
    if (andCount <= 1) return claim;

    const lastAndIndex = claim.lastIndexOf('; and');
    if (lastAndIndex > 0) {
      const beforeLastAnd = claim.substring(0, lastAndIndex);
      const afterLastAnd = claim.substring(lastAndIndex);
      const fixedBeforeLastAnd = beforeLastAnd.replace(/; and/gi, ';');
      return fixedBeforeLastAnd + afterLastAnd;
    }

    return claim;
  }

  /**
   * Generate a single claim attempt
   */
  private async generateClaimAttempt(
    input: ClaimGenerationInput,
    preamblePhrase: string,
    preambleType: string,
    differentiators: string[],
    containsHardware: boolean
  ): Promise<ClaimGenerationResult | null> {
    let attemptTokens = 0;
    let attemptCost = 0;

    // Build prompts
    const systemMsg = CLAIM_DRAFT_SYSTEM_MESSAGE_V1.template;
    const disclosureCtx = `TITLE: ${input.title}\\nSUMMARY: ${input.summary}\\nABSTRACT: ${input.abstract || ''}\\nNOVELTY: ${input.novelty}`;
    const claimTypeInstr = `Start the claim with: **${preamblePhrase}**`;
    const coreRules = CORE_CLAIM_RULES_V1.template;
    const diffBlock = differentiators.map(d => `• ${d}`).join('\\n');

    const draftPrompt = renderPromptTemplate(CLAIM_DRAFT_PROMPT_V1, {
      claimTypeInstr,
      preamblePhrase,
      coreRules,
      isCrm: preambleType === 'crm',
      diffBlock,
      disclosureCtx,
    });

    // Step 1: Generate initial draft
    logger.debug('[ClaimGen] Generating initial draft');
    const draftResponse = await processWithOpenAI(draftPrompt, systemMsg, {
      model: this.MODEL,
      temperature: 0.15,
      response_format: { type: 'json_object' },
    });

    attemptTokens += draftResponse.usage?.total_tokens || 0;
    attemptCost += draftResponse.usage?.estimated_cost || 0;

    const draftResult = safeJsonParse<ClaimResult>(draftResponse.content);
    if (!draftResult?.draft) {
      logger.warn('[ClaimGen] Failed to parse draft');
      return null;
    }

    // Fix grammar issues
    draftResult.draft = this.ensureSingleAndInClaim(draftResult.draft);

    // Step 2: Review the draft
    const reviewPrompt = renderPromptTemplate(CLAIM_REVIEW_PROMPT_V1, {
      coreRules,
    });
    const reviewPromptWithContext = `${reviewPrompt}\n\n${JSON.stringify(draftResult)}`;

    logger.debug('[ClaimGen] Reviewing draft');
    const reviewResponse = await processWithOpenAI(
      reviewPromptWithContext,
      systemMsg,
      {
        model: this.MODEL,
        temperature: 0.1,
        response_format: { type: 'json_object' },
      }
    );

    attemptTokens += reviewResponse.usage?.total_tokens || 0;
    attemptCost += reviewResponse.usage?.estimated_cost || 0;

    const reviewResult = safeJsonParse<ClaimResult>(reviewResponse.content);
    if (
      !reviewResult?.draft ||
      !validateClaimJSON(reviewResult) ||
      !this.isTextClean(reviewResult.draft)
    ) {
      logger.warn('[ClaimGen] Review failed validation');
      return null;
    }

    // Step 3: Final validation
    const finalValidationPrompt = renderPromptTemplate(
      FINAL_VALIDATION_PROMPT_V1,
      {
        coreRules,
        title: input.title,
        summary: input.summary,
        abstract: input.abstract || '',
        novelty: input.novelty,
        patentCategory: input.patent_category || '',
        technicalField: input.technical_field || '',
        backgroundTechnicalField: input.background?.technical_field || 'N/A',
        problemsSolved: input.background?.problems_solved || [],
        existingSolutions: input.background?.existing_solutions || [],
        features: input.features || [],
        advantages: input.advantages || [],
        useCases: input.use_cases || [],
        techText: input.technical_implementation?.preferred_embodiment || 'N/A',
        alternativeEmbodiments: input.technical_implementation
          ?.alternative_embodiments?.length
          ? input.technical_implementation.alternative_embodiments
          : ['None specified'],
        definitions:
          Object.keys(input.definitions || {}).length > 0
            ? input.definitions
            : { 'None specified': '' },
        containsHardware,
      }
    );

    const validationContext = `${finalValidationPrompt}\n${JSON.stringify(reviewResult)}`;
    logger.debug('[ClaimGen] Running final validation');

    const validationResponse = await processWithOpenAI(
      validationContext,
      'Perform final validation check',
      {
        model: this.MODEL,
        temperature: 0.05,
        response_format: { type: 'json_object' },
      }
    );

    attemptTokens += validationResponse.usage?.total_tokens || 0;
    attemptCost += validationResponse.usage?.estimated_cost || 0;

    const validationResult = safeJsonParse<FinalValidationResult>(
      validationResponse.content
    );
    if (!validationResult) {
      logger.warn('[ClaimGen] Failed to parse validation');
      return null;
    }

    // Check validation result
    if (
      validationResult.isValid ||
      (validationResult.revisedDraft &&
        this.isTextClean(validationResult.revisedDraft))
    ) {
      const finalDraft =
        validationResult.revisedDraft || reviewResult.draft || '';
      const finalCritique =
        validationResult.revisedCritique || reviewResult.critique || '';

      return {
        claims: { '1': finalDraft },
        critique: finalCritique,
        metadata: {
          attempts: 1,
          totalTokens: attemptTokens,
          totalCost: attemptCost,
        },
      };
    }

    logger.warn('[ClaimGen] Final validation failed', {
      reasoning: validationResult.reasoning,
    });
    return null;
  }
}

// Export singleton instance
export const claimGenerationService = new ClaimGenerationService();
