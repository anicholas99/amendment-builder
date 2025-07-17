import { processWithOpenAI } from './aiService';
import { logger } from '@/server/logger';
import { GPTReadyReference } from '../../types/patbaseTypes';
import {
  FullAnalysisResponse,
  ReferenceRiskProfile,
} from '../../types/priorArtAnalysisTypes';
import { estimateTokens } from '@/utils/textUtils';
import { renderPromptTemplate } from '@/server/prompts/prompts/utils';
import {
  PRIOR_ART_ANALYSIS_SYSTEM_PROMPT_V1,
  PRIOR_ART_ANALYSIS_USER_PROMPT_V1,
} from '@/server/prompts/prompts/templates/priorArtAnalysis';
import { safeJsonParse } from '@/utils/jsonUtils';
import { ApplicationError, ErrorCode } from '@/lib/error';

// Define the expected structure for the parsed AI response (core part)
// Needs to reflect the new fields added to FullAnalysisResponse
type CoreAIAnalysisResponse = Omit<
  FullAnalysisResponse,
  | 'analyzedAt'
  | 'referencesAnalyzedCount'
  | 'referencesRequestedCount'
  | 'partialDataWarning'
  | 'rewriteMapping'
  | 'unifiedSuggestions'
> & {
  coverageMatrix: {
    [element: string]: {
      [referenceId: string]: 'Yes' | 'Partial' | 'No';
    };
  };
  overallAssessment: string;
  keyDistinguishingFeatures: string[];
  holisticRefinementSuggestions: Array<{
    suggestion: string;
    rationale: string; // Why this helps over combined art
    addressesReferences: string[];
  }>;
  analyses: Array<{
    referenceId: string;
    overlapSummary: string; // Holistic overlap of Claim 1 vs this reference
    primaryRiskType: '§102 Anticipation' | '§103 Obviousness' | 'Low Risk';
    riskRationale: string;
  }>;
  obviousnessCombinations: Array<{
    combination: string[]; // e.g., ["Ref-ID-1", "Ref-ID-3"]
    rationale: string; // Why this combination makes Claim 1 obvious
  }>;
};

/**
 * Calls the AI service to perform prior art analysis based on a claim and formatted references.
 * Handles prompt construction, AI call, basic response validation, and calculates risk profiles.
 *
 * @param claimText The draft independent claim text.
 * @param references An array of formatted and truncated prior art references.
 * @param existingDependentClaimsText The text of existing dependent claims.
 * @param inventionDetailsContext A summary of the invention's details.
 * @returns A promise resolving to the full analysis result object including risk profiles, or null on failure.
 */
export async function callAIServiceForAnalysis(
  claimText: string,
  references: GPTReadyReference[],
  existingDependentClaimsText?: string,
  inventionDetailsContext?: string
): Promise<FullAnalysisResponse | null> {
  // Render the prompts using templates
  const systemPrompt = renderPromptTemplate(
    PRIOR_ART_ANALYSIS_SYSTEM_PROMPT_V1,
    {}
  );

  const userPrompt = renderPromptTemplate(PRIOR_ART_ANALYSIS_USER_PROMPT_V1, {
    inventionDetailsContext:
      inventionDetailsContext || 'No additional invention details provided.',
    claimText,
    existingDependentClaimsText:
      existingDependentClaimsText ||
      'No existing dependent claims provided by the user.',
    references: JSON.stringify(references, null, 2),
  });

  logger.info(
    `[AI Analysis Service] Sending user prompt with ${userPrompt.length} characters.`
  );

  try {
    logger.info(
      '[AI Analysis Service] Calling processWithOpenAI with structured prompt and temp=0.0'
    );
    const aiResponse = await processWithOpenAI(userPrompt, systemPrompt, {
      model: 'gpt-4.1',
      temperature: 0.0,
      response_format: { type: 'json_object' },
      maxTokens: 5096,
    });

    if (!aiResponse?.content) {
      throw new ApplicationError(
        ErrorCode.AI_SERVICE_ERROR,
        'AI service returned empty content'
      );
    }

    if (aiResponse.usage) {
      logger.info(
        `[AI Analysis Service Usage] Model: ${aiResponse.usage.model || 'N/A'}, Prompt Tokens: ${aiResponse.usage.prompt_tokens}, Completion Tokens: ${aiResponse.usage.completion_tokens}, Total Tokens: ${aiResponse.usage.total_tokens}, Estimated Cost: $${aiResponse.usage.estimated_cost.toFixed(6)}, Fallback Used: ${aiResponse.usage.used_fallback || false}`
      );
    } else {
      logger.warn(
        '[AI Analysis Service Usage] Usage information not available in AI response.'
      );
    }

    try {
      // Use 'any' initially until validation, then cast
      const parsedResponse = safeJsonParse<unknown>(aiResponse.content);

      if (parsedResponse === undefined) {
        throw new ApplicationError(
          ErrorCode.AI_INVALID_RESPONSE,
          'Failed to parse AI response as JSON'
        );
      }

      // Type guard to ensure parsedResponse is an object
      if (!parsedResponse || typeof parsedResponse !== 'object') {
        throw new ApplicationError(
          ErrorCode.AI_INVALID_RESPONSE,
          'AI response is not a valid object'
        );
      }

      // Create a properly typed response object that we'll populate after validation
      const responseObj = parsedResponse as Record<string, unknown>;

      // --- Start Basic Validation ---
      const requiredKeys: (keyof CoreAIAnalysisResponse)[] = [
        'coverageMatrix',
        'analyses',
        'priorityActions',
        'structuringAdvice',
        'dependentClaimSuggestions',
        'finalClaimDraft',
        'overallAssessment',
        'keyDistinguishingFeatures',
        'holisticRefinementSuggestions',
        'obviousnessCombinations',
      ];

      const missingKeys = requiredKeys.filter(
        key =>
          !(key in responseObj) ||
          (typeof responseObj[key] === 'string' &&
            !(responseObj[key] as string).trim())
      );

      if (missingKeys.length > 0) {
        logger.error(
          `[AI Analysis Service] AI response missing or has empty required properties: ${missingKeys.join(', ')}.`
        );
        logger.error(
          '[AI Analysis Service] Raw AI Response for Debug:',
          aiResponse.content
        );
        throw new ApplicationError(
          ErrorCode.AI_INVALID_RESPONSE,
          `AI response missing or has empty required properties: ${missingKeys.join(', ')}`
        );
      }

      if (!Array.isArray(responseObj.analyses)) {
        throw new ApplicationError(
          ErrorCode.AI_INVALID_RESPONSE,
          'AI response "analyses" is not an array'
        );
      }

      if (
        typeof responseObj.overallAssessment !== 'string' ||
        !responseObj.overallAssessment.trim()
      ) {
        throw new ApplicationError(
          ErrorCode.AI_INVALID_RESPONSE,
          'AI response "overallAssessment" is not a valid string'
        );
      }

      if (!Array.isArray(responseObj.keyDistinguishingFeatures)) {
        throw new ApplicationError(
          ErrorCode.AI_INVALID_RESPONSE,
          'AI response "keyDistinguishingFeatures" is not an array'
        );
      }

      if (!Array.isArray(responseObj.holisticRefinementSuggestions)) {
        throw new ApplicationError(
          ErrorCode.AI_INVALID_RESPONSE,
          'AI response "holisticRefinementSuggestions" is not an array'
        );
      }

      // Handle both string and array formats for dependentClaimSuggestions
      if (typeof responseObj.dependentClaimSuggestions === 'string') {
        // Convert string to array by splitting on newlines
        responseObj.dependentClaimSuggestions =
          responseObj.dependentClaimSuggestions
            .split(/\n+/)
            .filter((line: string) => line.trim().length > 0);
      } else if (!Array.isArray(responseObj.dependentClaimSuggestions)) {
        logger.warn(
          '[AI Analysis Service] dependentClaimSuggestions is neither string nor array. Setting to empty array.'
        );
        responseObj.dependentClaimSuggestions = [];
      }

      if (typeof responseObj.finalClaimDraft !== 'string') {
        throw new ApplicationError(
          ErrorCode.AI_INVALID_RESPONSE,
          'AI response "finalClaimDraft" is not a string'
        );
      }

      // Validate coverageMatrix structure
      if (
        typeof responseObj.coverageMatrix !== 'object' ||
        responseObj.coverageMatrix === null
      ) {
        throw new ApplicationError(
          ErrorCode.AI_INVALID_RESPONSE,
          'AI response "coverageMatrix" is not an object'
        );
      }

      const coverageMatrix = responseObj.coverageMatrix as Record<
        string,
        Record<string, string>
      >;
      for (const element in coverageMatrix) {
        const refMap = coverageMatrix[element];
        if (typeof refMap !== 'object' || refMap === null) {
          throw new ApplicationError(
            ErrorCode.AI_INVALID_RESPONSE,
            `AI response "coverageMatrix.${element}" is not an object`
          );
        }
        for (const refId in refMap) {
          const value = refMap[refId];
          if (value !== 'Yes' && value !== 'Partial' && value !== 'No') {
            logger.warn(
              `Invalid coverageMatrix value for ${element}.${refId}: "${value}". Expected "Yes", "Partial", or "No". Treating as "Partial".`
            );
            refMap[refId] = 'Partial'; // Correct invalid values
          }
        }
      }

      // Add validation for new fields within analyses
      const analyses = responseObj.analyses as Array<Record<string, unknown>>;
      for (let i = 0; i < analyses.length; i++) {
        const analysis = analyses[i];
        if (
          typeof analysis.referenceId !== 'string' ||
          !analysis.referenceId.trim()
        ) {
          throw new ApplicationError(
            ErrorCode.AI_INVALID_RESPONSE,
            `AI response "analyses[${i}].referenceId" is not valid`
          );
        }
        if (
          typeof analysis.overlapSummary !== 'string' ||
          !analysis.overlapSummary.trim()
        ) {
          throw new ApplicationError(
            ErrorCode.AI_INVALID_RESPONSE,
            `AI response "analyses[${i}].overlapSummary" is not valid`
          );
        }
        const validRiskTypes = [
          '§102 Anticipation',
          '§103 Obviousness',
          'Low Risk',
        ];
        if (
          typeof analysis.primaryRiskType !== 'string' ||
          !validRiskTypes.includes(analysis.primaryRiskType)
        ) {
          logger.warn(
            `Invalid primaryRiskType for analyses[${i}]: ${analysis.primaryRiskType}. Defaulting to 'Low Risk'.`
          );
          analysis.primaryRiskType = 'Low Risk'; // Default or throw error
        }
        if (
          typeof analysis.riskRationale !== 'string' ||
          !analysis.riskRationale.trim()
        ) {
          // Allow empty rationale for Low Risk?
          if (analysis.primaryRiskType !== 'Low Risk') {
            logger.warn(
              `Missing riskRationale for analyses[${i}] with risk ${analysis.primaryRiskType}. Setting to empty string.`
            );
            analysis.riskRationale = ''; // Default or throw error
          }
        }
      }

      // Validate obviousnessCombinations structure
      if (!Array.isArray(responseObj.obviousnessCombinations)) {
        throw new ApplicationError(
          ErrorCode.AI_INVALID_RESPONSE,
          'AI response "obviousnessCombinations" is not an array'
        );
      }

      const obviousnessCombinations =
        responseObj.obviousnessCombinations as Array<Record<string, unknown>>;
      for (let i = 0; i < obviousnessCombinations.length; i++) {
        const combo = obviousnessCombinations[i];
        if (!combo || typeof combo !== 'object') {
          throw new ApplicationError(
            ErrorCode.AI_INVALID_RESPONSE,
            `AI response "obviousnessCombinations[${i}]" is not an object`
          );
        }
        if (!Array.isArray(combo.combination) || combo.combination.length < 2) {
          // Must have at least 2 refs
          throw new ApplicationError(
            ErrorCode.AI_INVALID_RESPONSE,
            `AI response "obviousnessCombinations[${i}].combination" is not an array of at least two strings`
          );
        }
        if (
          !combo.combination.every(
            (ref: unknown) => typeof ref === 'string' && ref.trim()
          )
        ) {
          throw new ApplicationError(
            ErrorCode.AI_INVALID_RESPONSE,
            `AI response "obviousnessCombinations[${i}].combination" contains invalid reference IDs`
          );
        }
        if (typeof combo.rationale !== 'string' || !combo.rationale.trim()) {
          throw new ApplicationError(
            ErrorCode.AI_INVALID_RESPONSE,
            `AI response "obviousnessCombinations[${i}].rationale" is not a valid string`
          );
        }
      }

      // --- END NEW CODE: Add Risk Profile Calculation ---
      const AUTO_RESOLVE_THRESHOLD = 0.8; // 80%
      try {
        const elements = Object.keys(coverageMatrix || {});
        const M = elements.length;
        const referenceIds = analyses.map(a => a.referenceId as string);
        let referenceRiskProfiles: ReferenceRiskProfile[] = [];
        const autoResolvedReferences: string[] = [];

        if (M > 0 && analyses.length > 0 && coverageMatrix) {
          referenceRiskProfiles = referenceIds.map((refId: string) => {
            const novelElements = elements.filter(
              el => coverageMatrix[el]?.[refId] === 'No'
            ).length;
            const coverageScore =
              M > 0 ? Math.round((novelElements / M) * 100) : 0;
            const isResolved = coverageScore >= AUTO_RESOLVE_THRESHOLD * 100;

            if (isResolved) {
              autoResolvedReferences.push(refId);
            }

            return {
              referenceId: refId,
              totalElements: M,
              novelElements: novelElements,
              coverageScore: coverageScore,
              isResolved: isResolved,
            };
          });
        }

        // Attach calculated results to the parsed object
        responseObj.referenceRiskProfiles = referenceRiskProfiles;
        responseObj.autoResolvedReferences = autoResolvedReferences;
        logger.info(
          '[AI Analysis Service] Calculated reference risk profiles:',
          { referenceRiskProfiles }
        );
      } catch (calcError) {
        logger.error(
          '[AI Analysis Service] Error calculating risk profiles:',
          calcError
        );
        // Ensure fields exist even on error to prevent downstream issues
        responseObj.referenceRiskProfiles = [];
        responseObj.autoResolvedReferences = [];
      }
      // --- END NEW CODE: Risk Profile Calculation ---

      logger.info(
        '[AI Analysis Service] Successfully parsed and validated AI response. Calculation added.'
      );
      // Cast to the full type now that calculation is done
      return responseObj as unknown as FullAnalysisResponse;
    } catch (parseError) {
      logger.error(
        '[AI Analysis Service] Failed to parse AI JSON response:',
        parseError
      );
      logger.error(
        '[AI Analysis Service] Raw AI Response:',
        aiResponse.content
      );
      return null;
    }
  } catch (error) {
    logger.error('[AI Analysis Service] Error during AI call:', error);
    return null;
  }
}
