import { logger } from '@/lib/monitoring/logger';
import { CitationLocation } from '@/types/domain/citation';
import {
  CITATION_DEFAULTS,
  PUBLICATION_TYPES,
  SCORE_THRESHOLDS,
  REASONING_SCORE_THRESHOLDS,
} from '../constants/citationConstants';

/**
 * Formats location data for display based on publication type
 * @param location - The citation location data
 * @returns Formatted location string
 */
export function formatLocationData(
  location: CitationLocation | null | undefined
): string {
  if (!location) return CITATION_DEFAULTS.NOT_AVAILABLE;

  try {
    // Handle Granted Patents (Column/Line)
    if (
      location.publicationType &&
      PUBLICATION_TYPES.GRANTED.some(
        type =>
          type === location.publicationType ||
          type === location.publicationType?.toUpperCase()
      ) &&
      location.patentDescriptionLocations &&
      location.patentDescriptionLocations.length > 0
    ) {
      const loc = location.patentDescriptionLocations[0];
      const lineRange =
        loc.startLineNumber === loc.endLineNumber
          ? loc.startLineNumber
          : `${loc.startLineNumber}-${loc.endLineNumber}`;
      return `Col ${loc.startColumnNumber}, Ln ${lineRange}`;
    }

    // Handle Applications (Paragraphs)
    if (
      location.publicationType &&
      PUBLICATION_TYPES.APPLICATION.some(
        type =>
          type === location.publicationType ||
          type === location.publicationType?.toUpperCase()
      ) &&
      location.applicationDescriptionLocations &&
      location.applicationDescriptionLocations.length > 0
    ) {
      const parasStr = location.applicationDescriptionLocations
        .map(loc =>
          loc.startParagraphNumber === loc.endParagraphNumber
            ? `[${loc.startParagraphNumber}]`
            : `[${loc.startParagraphNumber}]-[${loc.endParagraphNumber}]`
        )
        .join(', ');
      return `Para ${parasStr}`;
    }

    return CITATION_DEFAULTS.NOT_FOUND;
  } catch (error) {
    logger.error('[formatLocationData] Error processing location data:', error);
    return CITATION_DEFAULTS.PARSE_ERROR;
  }
}

/**
 * Formats citation text for display
 * @param citation - The raw citation text
 * @returns Cleaned citation text
 */
export function formatCitationText(citation: string): string {
  if (
    !citation ||
    citation === CITATION_DEFAULTS.NO_CITATION_TEXT ||
    citation === 'null' ||
    citation === 'undefined'
  ) {
    return CITATION_DEFAULTS.NOT_AVAILABLE;
  }
  // Basic cleanup: remove excessive whitespace
  return citation.replace(/\s+/g, ' ').trim();
}

/**
 * Strips HTML and markdown formatting from text
 * @param text - Text with potential formatting
 * @returns Plain text
 */
export function stripFormatting(text: string | null | undefined): string {
  if (!text) return CITATION_DEFAULTS.NOT_AVAILABLE;
  return text.replace(/<[^>]*>/g, '').replace(/\*\*(.*?)\*\*/g, '$1');
}

/**
 * Formats a score value as a percentage
 * @param score - The score value (0-1 or 0-100)
 * @returns Formatted percentage string
 */
export function formatScore(score: number | null | undefined): string {
  if (score === null || score === undefined)
    return CITATION_DEFAULTS.NOT_AVAILABLE;
  const numericScore = score > 1 && score <= 100 ? score / 100 : score;
  if (numericScore >= 0 && numericScore <= 1) {
    return `${(numericScore * 100).toFixed(1)}%`;
  }
  return `${score.toFixed(1)}%`;
}

/**
 * Formats a reasoning score as a percentage
 * @param score - The reasoning score (0-1)
 * @returns Formatted percentage string
 */
export function formatReasoningScore(score: number | null | undefined): string {
  if (score === null || score === undefined)
    return CITATION_DEFAULTS.NOT_AVAILABLE;

  // Add validation to ensure score is a number
  const numericScore = Number(score);
  if (isNaN(numericScore)) {
    logger.warn('[formatReasoningScore] Invalid score value received:', {
      score,
    });
    return CITATION_DEFAULTS.NOT_AVAILABLE;
  }

  // Ensure score is within valid range (0-1)
  if (numericScore < 0 || numericScore > 1) {
    logger.warn('[formatReasoningScore] Score out of range:', {
      score: numericScore,
    });
    return CITATION_DEFAULTS.NOT_AVAILABLE;
  }

  const percentage = Math.round(numericScore * 100);
  return `${percentage}%`;
}

/**
 * Gets the color scheme for a score value
 * @param score - The score value
 * @returns Color scheme name for Chakra UI
 */
export function getScoreColor(score: number | null | undefined): string {
  if (score === null || score === undefined) return 'gray';
  const numericScore = score > 1 && score <= 100 ? score / 100 : score;
  if (numericScore >= SCORE_THRESHOLDS.HIGH) return 'green';
  if (numericScore >= SCORE_THRESHOLDS.MEDIUM) return 'yellow';
  return 'red';
}

/**
 * Gets the color scheme for a reasoning score
 * @param score - The reasoning score (0-1)
 * @returns Color scheme name for Chakra UI
 */
export function getReasoningScoreColor(
  score: number | null | undefined
): string {
  if (score === null || score === undefined) return 'gray';
  if (score >= REASONING_SCORE_THRESHOLDS.HIGH) return 'green';
  if (score >= REASONING_SCORE_THRESHOLDS.MEDIUM) return 'yellow';
  return 'red';
}
