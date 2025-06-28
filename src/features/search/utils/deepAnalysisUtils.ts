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
import { logger } from '@/lib/monitoring/logger';

export function parseDeepAnalysis(
  deepAnalysisJson: string | null | undefined
): ParsedDeepAnalysis | StructuredDeepAnalysis | DeepAnalysisResult | null {
  if (!deepAnalysisJson) {
    logger.debug('[parseDeepAnalysis] No deepAnalysisJson provided');
    return null;
  }

  try {
    if (typeof deepAnalysisJson === 'object') {
      return deepAnalysisJson as any;
    }

    const cleanedJson = deepAnalysisJson.trim().replace(/^\uFEFF/, '');
    const parsed = JSON.parse(cleanedJson);

    if (typeof parsed !== 'object' || parsed === null) {
      return null;
    }

    if (
      parsed.overallRelevance !== undefined &&
      parsed.elementAnalysis &&
      Array.isArray(parsed.elementAnalysis)
    ) {
      return parsed as DeepAnalysisResult;
    }

    if (parsed.elementAnalysis && parsed.overallAssessment) {
      return parsed as StructuredDeepAnalysis;
    }

    const isLegacyFormat = Object.entries(parsed).every(
      ([key, value]) => typeof key === 'string' && typeof value === 'string'
    );

    if (isLegacyFormat) {
      return parsed as ParsedDeepAnalysis;
    }

    return null;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('[parseDeepAnalysis] Error parsing deepAnalysisJson:', {
      error: err,
      sample: deepAnalysisJson.substring(0, 500) + '...',
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
