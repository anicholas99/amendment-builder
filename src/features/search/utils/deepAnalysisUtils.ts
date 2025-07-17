/**
 * Deep Analysis Utilities
 *
 * Business logic and utility functions for deep analysis functionality.
 * Extracted from DeepAnalysisPanel.tsx to follow single responsibility principle.
 */

import {
  ParsedDeepAnalysis,
  StructuredDeepAnalysis,
  ExaminerStructuredDeepAnalysis,
  RelevanceCalculation,
  RejectionType,
  ExaminerOverallAssessment,
} from '../types/deepAnalysis';
import { DeepAnalysisResult } from '@/types/domain/citation';
import { logger } from '@/utils/clientLogger';

export function parseDeepAnalysis(
  deepAnalysisJson: string | null | undefined
): ParsedDeepAnalysis | StructuredDeepAnalysis | DeepAnalysisResult | null {
  if (!deepAnalysisJson) {
    logger.debug('[parseDeepAnalysis] No deepAnalysisJson provided');
    return null;
  }

  try {
    // If already an object, handle it
    if (typeof deepAnalysisJson === 'object') {
      logger.debug(
        '[parseDeepAnalysis] deepAnalysisJson is already an object',
        {
          type: typeof deepAnalysisJson,
          keys: Object.keys(deepAnalysisJson || {}),
        }
      );
      return deepAnalysisJson as any;
    }

    const cleanedJson = deepAnalysisJson.trim().replace(/^\uFEFF/, '');
    const parsed = JSON.parse(cleanedJson);

    // Log the parsed structure
    logger.debug('[parseDeepAnalysis] Parsed JSON structure', {
      type: typeof parsed,
      isArray: Array.isArray(parsed),
      keys: parsed && typeof parsed === 'object' ? Object.keys(parsed) : [],
      sample: JSON.stringify(parsed).substring(0, 200),
    });

    if (typeof parsed !== 'object' || parsed === null) {
      logger.warn('[parseDeepAnalysis] Parsed result is not an object', {
        parsed,
      });
      return null;
    }

    // Check for DeepAnalysisResult format
    if (
      parsed.overallRelevance !== undefined &&
      parsed.elementAnalysis &&
      Array.isArray(parsed.elementAnalysis)
    ) {
      logger.debug('[parseDeepAnalysis] Detected DeepAnalysisResult format');
      return parsed as DeepAnalysisResult;
    }

    // Check for StructuredDeepAnalysis format
    if (parsed.elementAnalysis && parsed.overallAssessment) {
      logger.debug(
        '[parseDeepAnalysis] Detected StructuredDeepAnalysis format',
        {
          hasValidationPerformed: 'validationPerformed' in parsed,
          validationPerformed: parsed.validationPerformed,
          hasValidationResults: 'validationResults' in parsed,
          validationResults: parsed.validationResults,
          validationResultsType: typeof parsed.validationResults,
          validationResultsKeys: parsed.validationResults && typeof parsed.validationResults === 'object' 
            ? Object.keys(parsed.validationResults) 
            : [],
          hasValidationSummary: 'validationSummary' in parsed,
          validationSummary: parsed.validationSummary,
          keys: Object.keys(parsed),
        }
      );
      return parsed as StructuredDeepAnalysis;
    }

    // Check if it might be a wrapped structure (e.g., { highRelevanceElements: { ... } })
    const topLevelKeys = Object.keys(parsed);
    if (topLevelKeys.length === 1) {
      const wrappedKey = topLevelKeys[0];
      const wrappedData = parsed[wrappedKey];

      logger.debug(
        '[parseDeepAnalysis] Found single top-level key, checking wrapped structure',
        {
          wrappedKey,
          wrappedDataType: typeof wrappedData,
          wrappedDataKeys:
            wrappedData && typeof wrappedData === 'object'
              ? Object.keys(wrappedData)
              : [],
        }
      );

      // If the wrapped data looks like claim elements, treat it as ParsedDeepAnalysis
      if (wrappedData && typeof wrappedData === 'object') {
        const isClaimElements = Object.values(wrappedData).every(
          value => typeof value === 'string'
        );
        if (isClaimElements) {
          logger.debug(
            '[parseDeepAnalysis] Treating wrapped data as ParsedDeepAnalysis'
          );
          return wrappedData as ParsedDeepAnalysis;
        }
      }
    }

    // Check for legacy format
    const isLegacyFormat = Object.entries(parsed).every(
      ([key, value]) => typeof key === 'string' && typeof value === 'string'
    );

    if (isLegacyFormat) {
      logger.debug(
        '[parseDeepAnalysis] Detected legacy ParsedDeepAnalysis format'
      );
      return parsed as ParsedDeepAnalysis;
    }

    logger.warn(
      '[parseDeepAnalysis] Could not determine format, returning as-is'
    );
    return parsed;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('[parseDeepAnalysis] Error parsing deepAnalysisJson:', {
      error: err.message,
      sample:
        typeof deepAnalysisJson === 'string'
          ? deepAnalysisJson.substring(0, 500) + '...'
          : 'Not a string',
    });
    return null;
  }
}

/**
 * Extract key phrases from an analysis string
 */
export const extractKeyPhrases = (analysisText: string): string[] => {
  // Look for phrases like "clearly shows", "discloses", "teaches", etc.
  const phrases = [];

  const significantPhrasePatterns = [
    /\b(clearly|explicitly|directly) (shows|discloses|teaches|describes|presents)\b/gi,
    /\b(strong|clear|explicit|direct) (correlation|match|disclosure|teaching)\b/gi,
    /\b(precisely|exactly) (describes|matches|aligns with)\b/gi,
  ];

  for (const pattern of significantPhrasePatterns) {
    const matches = analysisText.match(pattern);
    if (matches) {
      phrases.push(...matches);
    }
  }

  // Return unique phrases, limited to 2
  return Array.from(new Set(phrases)).slice(0, 2);
};

/**
 * Type guard to check if we have the structured format with examiner fields
 */
export const isExaminerStructuredFormat = (
  data: any
): data is ExaminerStructuredDeepAnalysis => {
  return (
    data &&
    typeof data === 'object' &&
    'elementAnalysis' in data &&
    'overallAssessment' in data
  );
};

/**
 * Calculate overall relevance score and level from analysis data
 */
export const calculateOverallRelevance = (
  overallAssessment: ExaminerOverallAssessment | null
): RelevanceCalculation | null => {
  if (!overallAssessment) return null;

  const score = overallAssessment.patentabilityScore;

  if (score === undefined) return null;

  const level = score >= 0.7 ? 'high' : score >= 0.4 ? 'medium' : 'low';

  const color =
    level === 'high'
      ? 'red.500'
      : level === 'medium'
        ? 'orange.500'
        : 'green.500';

  const rejectionType = overallAssessment.overallRejection;

  return {
    score,
    level,
    color,
    rejectionType,
  };
};

/**
 * Get color for rejection type
 */
export const getRejectionColor = (
  rejectionType: RejectionType | undefined
): string => {
  switch (rejectionType || 'Not Rejected') {
    case '102 Anticipation':
      return 'red.500';
    case '103 Obviousness':
      return 'orange.500';
    default:
      return 'green.500';
  }
};

/**
 * Get tag scheme for rejection type
 */
export const getRejectionScheme = (
  rejectionType: RejectionType | undefined
): string => {
  switch (rejectionType || 'Not Rejected') {
    case '102 Anticipation':
      return 'red';
    case '103 Obviousness':
      return 'orange';
    default:
      return 'green';
  }
};

/**
 * Extract a suggestion sentence from the holistic analysis
 */
export const extractSuggestion = (holistic: string): string | null => {
  if (!holistic) return null;

  // Look for common suggestion patterns
  const suggestionPatterns = [
    /(?:To overcome[^.]*\.)/i,
    /(?:Consider[^.]*\.)/i,
    /(?:Suggestion:[^.]*\.)/i,
    /(?:Recommended amendment:[^.]*\.)/i,
    /(?:You should[^.]*\.)/i,
    /(?:Amendment:[^.]*\.)/i,
  ];

  for (const pattern of suggestionPatterns) {
    const match = holistic.match(pattern);
    if (match) return match[0].trim();
  }

  // Fallback: if the last sentence contains 'amend', 'refine', or 'change', highlight it
  const sentences = holistic.split(/(?<=\.)\s+/);
  const last = sentences[sentences.length - 1];
  if (/amend|refine|change|overcome|suggest/i.test(last)) return last.trim();

  return null;
};

/**
 * Determine rejection type from analysis text (for legacy format)
 */
export const determineRejectionType = (analysisText: string): RejectionType => {
  if (
    /anticipate|anticipation|102|exact match|identical|directly disclose/i.test(
      analysisText
    )
  ) {
    return '102 Anticipation';
  }
  if (
    /obvious|obviousness|103|suggest|combination|similar|taught/i.test(
      analysisText
    )
  ) {
    return '103 Obviousness';
  }
  return 'Not Rejected';
};

/**
 * Determine element relevance level from analysis text (for legacy format)
 */
export const determineElementLevel = (
  analysisText: string
): 'high' | 'medium' | 'low' => {
  if (/high|strong|clear|direct|exact|explicit/i.test(analysisText)) {
    return 'high';
  }
  if (/moderate|partial|some|suggest/i.test(analysisText)) {
    return 'medium';
  }
  return 'low';
};
