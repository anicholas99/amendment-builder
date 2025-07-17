/**
 * Suggestion Validation Service
 * 
 * Validates AI-generated amendment suggestions against prior art
 * to ensure they are not already disclosed in the reference(s).
 * 
 * Supports both single-reference validation (for deep analysis)
 * and multi-reference validation (for combined analysis).
 */

import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import {
  submitToExternalApi,
  pollExternalApi,
} from '@/server/services/citation-extraction-inline.server.service';
import { environment } from '@/config/environment';
import { safeJsonParse } from '@/utils/jsonUtils';
import { CITATION_THRESHOLDS } from '@/config/citationExtractionConfig';
import { processWithOpenAI } from '@/server/ai/aiService';

interface PotentialAmendment {
  suggestionText: string;
  reasoning: string;
  addressesRejections: string[];
  coherenceImpact?: string;
  priority: 'high' | 'medium' | 'low';
}

interface ValidationResult {
  suggestionText: string;
  isDisclosed: boolean;
  disclosureEvidence: string[];
  validationScore: number;
  recommendation: 'remove' | 'modify' | 'keep';
  // For multi-reference validation
  disclosureByReference?: Record<string, {
    isDisclosed: boolean;
    evidence: string[];
    score: number;
  }>;
}

interface MultiReferenceValidationResult {
  suggestionText: string;
  isDisclosedInAny: boolean;
  isDisclosedInAll: boolean;
  disclosureByReference: Record<string, {
    isDisclosed: boolean;
    evidence: string[];
    score: number;
  }>;
  overallValidationScore: number;
  recommendation: 'remove' | 'modify' | 'keep';
  disclosingReferences: string[];
  validationSummary: string;
}

export class SuggestionValidationService {
  /**
   * Validate potential amendments against a single prior art reference
   * LEGACY METHOD - kept for backward compatibility with deep analysis
   */
  static async validateSuggestions(
    potentialAmendments: PotentialAmendment[],
    referenceNumber: string,
    originalClaimText: string
  ): Promise<Record<string, ValidationResult>> {
    logger.info('[SuggestionValidation] Starting single-reference validation', {
      amendmentCount: potentialAmendments.length,
      referenceNumber,
    });

    const validationResults: Record<string, ValidationResult> = {};

    try {
      // Extract suggestion texts for validation
      const suggestionTexts = potentialAmendments.map(a => a.suggestionText);

      // Run citation extraction on the suggestion texts
      const extractionResults = await this.runValidationExtraction(
        suggestionTexts,
        referenceNumber
      );

      // Analyze results to determine if suggestions are disclosed
      for (let i = 0; i < potentialAmendments.length; i++) {
        const amendment = potentialAmendments[i];
        const extractionResult = extractionResults[i] || [];

        const validation = await this.analyzeValidationResult(
          amendment,
          extractionResult,
          originalClaimText,
          referenceNumber
        );

        validationResults[amendment.suggestionText] = validation;
      }

      logger.info('[SuggestionValidation] Single-reference validation complete', {
        totalSuggestions: potentialAmendments.length,
        disclosedCount: Object.values(validationResults).filter(v => v.isDisclosed).length,
        keepCount: Object.values(validationResults).filter(v => v.recommendation === 'keep').length,
      });

      return validationResults;
    } catch (error) {
      logger.error('[SuggestionValidation] Single-reference validation failed', { error });
      
      // Return conservative results on error - mark all as potentially disclosed
      for (const amendment of potentialAmendments) {
        validationResults[amendment.suggestionText] = {
          suggestionText: amendment.suggestionText,
          isDisclosed: true,
          disclosureEvidence: ['Validation failed - conservatively marking as disclosed'],
          validationScore: 1.0,
          recommendation: 'remove',
        };
      }
      
      return validationResults;
    }
  }

  /**
   * Validate potential amendments against multiple prior art references
   * NEW METHOD - for combined analysis validation
   */
  static async validateSuggestionsMultiReference(
    potentialAmendments: PotentialAmendment[],
    referenceNumbers: string[],
    originalClaimText: string
  ): Promise<Record<string, MultiReferenceValidationResult>> {
    logger.info('[SuggestionValidation] Starting multi-reference validation', {
      amendmentCount: potentialAmendments.length,
      referenceCount: referenceNumbers.length,
      references: referenceNumbers,
    });

    const validationResults: Record<string, MultiReferenceValidationResult> = {};

    try {
      // Extract suggestion texts for validation
      const suggestionTexts = potentialAmendments.map(a => a.suggestionText);

      // Run citation extraction against each reference
      const extractionResultsByReference: Record<string, any[][]> = {};
      
      for (const referenceNumber of referenceNumbers) {
        logger.debug('[SuggestionValidation] Running extraction for reference', {
          referenceNumber,
          suggestionCount: suggestionTexts.length,
        });

        try {
          const extractionResults = await this.runValidationExtraction(
            suggestionTexts,
            referenceNumber
          );
          extractionResultsByReference[referenceNumber] = extractionResults;
        } catch (error) {
          logger.warn('[SuggestionValidation] Extraction failed for reference', {
            referenceNumber,
            error,
          });
          // Initialize empty results for failed reference
          extractionResultsByReference[referenceNumber] = suggestionTexts.map(() => []);
        }
      }

      // Analyze results across all references for each suggestion
      for (let i = 0; i < potentialAmendments.length; i++) {
        const amendment = potentialAmendments[i];
        
        const multiRefValidation = await this.analyzeMultiReferenceValidationResult(
          amendment,
          extractionResultsByReference,
          i,
          originalClaimText,
          referenceNumbers
        );

        validationResults[amendment.suggestionText] = multiRefValidation;
      }

      const disclosedInAnyCount = Object.values(validationResults).filter(v => v.isDisclosedInAny).length;
      const keepCount = Object.values(validationResults).filter(v => v.recommendation === 'keep').length;

      logger.info('[SuggestionValidation] Multi-reference validation complete', {
        totalSuggestions: potentialAmendments.length,
        disclosedInAnyCount,
        keepCount,
        totalReferences: referenceNumbers.length,
      });

      return validationResults;
    } catch (error) {
      logger.error('[SuggestionValidation] Multi-reference validation failed', { error });
      
      // Return conservative results on error - mark all as disclosed in any
      for (const amendment of potentialAmendments) {
        validationResults[amendment.suggestionText] = {
          suggestionText: amendment.suggestionText,
          isDisclosedInAny: true,
          isDisclosedInAll: false,
          disclosureByReference: {},
          overallValidationScore: 1.0,
          recommendation: 'remove',
          disclosingReferences: referenceNumbers,
          validationSummary: 'Validation failed - conservatively marking as disclosed',
        };
      }
      
      return validationResults;
    }
  }

  /**
   * Run citation extraction specifically for validation
   */
  private static async runValidationExtraction(
    suggestionTexts: string[],
    referenceNumber: string
  ): Promise<any[]> {
    const apiKey = environment.aiapi.apiKey;

    if (!apiKey) {
      throw new ApplicationError(
        ErrorCode.API_SERVICE_UNAVAILABLE,
        'AIAPI_API_KEY not configured for validation'
      );
    }

    try {
      // Use same threshold as normal citation extraction
      const threshold = CITATION_THRESHOLDS.default;

      // Submit to external API
      const externalJobId = await submitToExternalApi(
        suggestionTexts,
        referenceNumber,
        threshold
      );

      logger.debug('[SuggestionValidation] Submitted extraction job', {
        externalJobId,
        suggestionCount: suggestionTexts.length,
        threshold,
      });

      // Poll for results
      const { status, result } = await pollExternalApi(externalJobId, apiKey);

      if (status === 'COMPLETED' && result) {
        return this.parseValidationResults(result);
      }

      throw new ApplicationError(
        ErrorCode.CITATION_EXTERNAL_API_ERROR,
        'Validation extraction failed'
      );
    } catch (error) {
      logger.error('[SuggestionValidation] Extraction failed', { error });
      throw error;
    }
  }

  /**
   * Parse validation extraction results
   */
  private static parseValidationResults(rawResults: any): any[] {
    try {
      // Handle different result formats
      if (typeof rawResults === 'string') {
        const parsed = safeJsonParse(rawResults);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }

      if (Array.isArray(rawResults)) {
        return rawResults;
      }

      // Try to extract array from object
      if (rawResults && typeof rawResults === 'object') {
        const possibleKeys = ['results', 'data', 'citations', 'matches'];
        for (const key of possibleKeys) {
          if (Array.isArray(rawResults[key])) {
            return rawResults[key];
          }
        }
      }

      logger.warn('[SuggestionValidation] Unexpected result format', {
        resultType: typeof rawResults,
        resultKeys: rawResults ? Object.keys(rawResults) : [],
      });

      return [];
    } catch (error) {
      logger.error('[SuggestionValidation] Failed to parse results', { error });
      return [];
    }
  }

  /**
   * Analyze validation results to determine if suggestion is disclosed
   */
  private static async analyzeValidationResult(
    amendment: PotentialAmendment,
    extractionResult: any[],
    originalClaimText: string,
    referenceNumber: string
  ): Promise<ValidationResult> {
    // Get top 2-3 citations from extraction results
    const topCitations = extractionResult
      .filter((match: any) => {
        const score = match.score || match.relevance || 0;
        return score > 0.7; // Only consider reasonably relevant matches
      })
      .sort((a: any, b: any) => {
        const scoreA = a.score || a.relevance || 0;
        const scoreB = b.score || b.relevance || 0;
        return scoreB - scoreA;
      })
      .slice(0, 3); // Take top 3

    // If no citations found, the amendment is likely novel
    if (topCitations.length === 0) {
      return {
        suggestionText: amendment.suggestionText,
        isDisclosed: false,
        disclosureEvidence: [],
        validationScore: 0,
        recommendation: 'keep',
      };
    }

    // Use GPT to analyze if the amendment is actually disclosed
    const prompt = `You are a patent examiner analyzing whether a proposed claim amendment is already disclosed in prior art citations.

PROPOSED AMENDMENT:
"${amendment.suggestionText}"

REASONING FOR AMENDMENT:
${amendment.reasoning}

TOP CITATIONS FROM PRIOR ART:
${topCitations.map((citation: any, i: number) => `
Citation ${i + 1} (Score: ${citation.score || citation.relevance || 'N/A'}):
${citation.citation || citation.text || 'No text available'}
`).join('\n')}

TASK: Analyze whether the proposed amendment is actually disclosed in these citations.

Consider:
1. Is the EXACT technical feature described in the amendment present in any citation?
2. Would this amendment distinguish the claim from the prior art?
3. Is this just semantic similarity or actual disclosure?

Respond in JSON format:
{
  "isDisclosed": boolean,
  "validationScore": number (0.0-1.0, where 1.0 means fully disclosed),
  "disclosureEvidence": ["specific quote from citation if disclosed"],
  "analysis": "brief explanation of your determination",
  "recommendation": "keep" | "modify" | "remove"
}`;

    try {
      const response = await processWithOpenAI(
        prompt,
        'You are an expert patent examiner focused on prior art analysis.',
        {
          model: environment.openai.model || 'gpt-4',
          temperature: 0.1,
          maxTokens: 1000,
          response_format: { type: 'json_object' },
        }
      );

      const result = safeJsonParse<{
        isDisclosed: boolean;
        validationScore: number;
        disclosureEvidence: string[];
        analysis: string;
        recommendation: 'keep' | 'modify' | 'remove';
      }>(response.content);

      if (!result) {
        throw new Error('Failed to parse GPT response');
      }

      logger.debug('[SuggestionValidation] GPT analysis complete', {
        amendment: amendment.suggestionText.substring(0, 50) + '...',
        isDisclosed: result.isDisclosed,
        recommendation: result.recommendation,
      });

      return {
        suggestionText: amendment.suggestionText,
        isDisclosed: result.isDisclosed,
        disclosureEvidence: result.disclosureEvidence,
        validationScore: result.validationScore,
        recommendation: result.recommendation,
      };
    } catch (error) {
      logger.error('[SuggestionValidation] GPT analysis failed', { error });
      
      // Conservative fallback - if GPT fails, mark as potentially disclosed
      return {
        suggestionText: amendment.suggestionText,
        isDisclosed: true,
        disclosureEvidence: ['Validation failed - conservatively marking as disclosed'],
        validationScore: 1.0,
        recommendation: 'remove',
      };
    }
  }

  /**
   * Analyze multi-reference validation results
   */
  private static async analyzeMultiReferenceValidationResult(
    amendment: PotentialAmendment,
    extractionResultsByReference: Record<string, any[][]>,
    index: number,
    originalClaimText: string,
    referenceNumbers: string[]
  ): Promise<MultiReferenceValidationResult> {
    const suggestionText = amendment.suggestionText;
    let isDisclosedInAny = false;
    let isDisclosedInAll = true;
    const disclosureByReference: Record<string, {
      isDisclosed: boolean;
      evidence: string[];
      score: number;
    }> = {};
    let overallValidationScore = 0;
    let recommendation: 'remove' | 'modify' | 'keep' = 'keep';
    const disclosingReferences: string[] = [];
    let validationSummary = 'No evidence of disclosure across all references.';

    for (const referenceNumber of referenceNumbers) {
      const extractionResults = extractionResultsByReference[referenceNumber][index] || [];
      const validationResult = await this.analyzeValidationResult(
        amendment,
        extractionResults,
        originalClaimText,
        referenceNumber
      );

      if (validationResult.isDisclosed) {
        isDisclosedInAny = true;
        disclosingReferences.push(referenceNumber);
      } else {
        isDisclosedInAll = false; // If any reference doesn't disclose it, it's not disclosed in all
      }

      disclosureByReference[referenceNumber] = {
        isDisclosed: validationResult.isDisclosed,
        evidence: validationResult.disclosureEvidence,
        score: validationResult.validationScore,
      };
      overallValidationScore += validationResult.validationScore;
    }

    overallValidationScore /= referenceNumbers.length;

    // Determine recommendation based on disclosure
    if (isDisclosedInAny) {
      recommendation = overallValidationScore > 0.8 ? 'remove' : 'modify';
      validationSummary = `Disclosed in ${disclosingReferences.length} of ${referenceNumbers.length} references: ${disclosingReferences.join(', ')}`;
    } else {
      recommendation = 'keep';
      validationSummary = 'Not disclosed in any reference - suggestion appears novel';
    }

    return {
      suggestionText,
      isDisclosedInAny,
      isDisclosedInAll,
      disclosureByReference,
      overallValidationScore,
      recommendation,
      disclosingReferences,
      validationSummary,
    };
  }

  /**
   * Check if suggestion is too similar to original claim
   */
  private static isSimilarToOriginal(suggestion: string, originalClaim: string): boolean {
    // Simple check - could be enhanced with better similarity metrics
    const suggestionLower = suggestion.toLowerCase().trim();
    const originalLower = originalClaim.toLowerCase();
    
    // Check if suggestion is mostly contained in original
    const suggestionWords = suggestionLower.split(/\s+/);
    const matchingWords = suggestionWords.filter(word => 
      originalLower.includes(word) && word.length > 3
    );
    
    const similarityRatio = matchingWords.length / suggestionWords.length;
    return similarityRatio > 0.8; // 80% similarity threshold
  }
} 