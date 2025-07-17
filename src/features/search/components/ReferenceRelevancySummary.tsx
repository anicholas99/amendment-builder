import React from 'react';
import { logger } from '@/utils/clientLogger';
import { cn } from '@/lib/utils';

export interface CitationMatchSummary {
  id: string;
  parsedElementText: string | null;
  reasoningScore: number | null;
  reasoningSummary: string | null;
}

export interface ReferenceRelevancySummaryProps {
  referenceNumber: string;
  citationMatches: CitationMatchSummary[];
  claim1Text?: string; // Claim 1 text for comparison
  isLoading?: boolean;
}

/**
 * Calculates an overall relevancy score for a reference based on all of its citation matches
 * @param matches Array of citation matches with reasoning scores
 * @returns A number between 0 and 1 representing overall relevancy
 */
const calculateOverallScore = (matches: CitationMatchSummary[]): number => {
  // First, group matches by their parsed element text to avoid counting duplicates
  const elementScoreMap = new Map<string, number[]>();

  matches.forEach(match => {
    if (match.reasoningScore !== null && match.reasoningScore !== undefined) {
      const elementText = match.parsedElementText || 'unknown';
      if (!elementScoreMap.has(elementText)) {
        elementScoreMap.set(elementText, []);
      }
      elementScoreMap.get(elementText)?.push(match.reasoningScore);
    }
  });

  // If no elements with scores are found, return 0
  if (elementScoreMap.size === 0) return 0;

  // For each element, use the highest score among its matches
  let totalScore = 0;
  elementScoreMap.forEach(scores => {
    const highestScore = Math.max(...scores);
    totalScore += highestScore;
  });

  // Calculate average based on number of unique elements
  return totalScore / elementScoreMap.size;
};

/**
 * Counts unique elements and high-scoring elements
 * @param matches Array of citation matches
 * @returns Object with counts of unique and high-scoring elements
 */
const countUniqueElements = (
  matches: CitationMatchSummary[]
): {
  uniqueCount: number;
  highScoringCount: number;
} => {
  // Group by unique element text
  const uniqueElements = new Set<string>();
  matches.forEach(match => {
    if (match.parsedElementText) {
      uniqueElements.add(match.parsedElementText);
    }
  });

  // Get the best score for each unique element
  const elementScoreMap = new Map<string, number>();
  matches.forEach(match => {
    if (match.parsedElementText && match.reasoningScore !== null) {
      const currentBest = elementScoreMap.get(match.parsedElementText) || 0;
      if (match.reasoningScore > currentBest) {
        elementScoreMap.set(match.parsedElementText, match.reasoningScore);
      }
    }
  });

  // Count high scoring elements (>0.7)
  const highScoringCount = Array.from(elementScoreMap.entries()).filter(
    entry => entry[1] > 0.7
  ).length;

  return {
    uniqueCount: uniqueElements.size,
    highScoringCount,
  };
};

/**
 * Determine relevancy label based on value using more granular tiers
 */
const getRelevancyLabel = (score: number): string => {
  if (score >= 0.85) return 'Very High';
  if (score >= 0.7) return 'High';
  if (score >= 0.55) return 'Moderate';
  if (score >= 0.4) return 'Low';
  if (score >= 0.25) return 'Very Low';
  return 'Minimal';
};

/**
 * Determine score color based on value with more granular tiers
 */
const getScoreColor = (score: number): string => {
  if (score >= 0.85) return 'text-green-600 dark:text-green-400';
  if (score >= 0.7) return 'text-teal-600 dark:text-teal-400';
  if (score >= 0.55) return 'text-blue-600 dark:text-blue-400';
  if (score >= 0.4) return 'text-yellow-600 dark:text-yellow-400';
  if (score >= 0.25) return 'text-orange-600 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
};

/**
 * Determine badge variant based on relevancy score
 */
const getBadgeVariant = (score: number): 'solid' | 'subtle' => {
  return score >= 0.7 ? 'solid' : 'subtle';
};

/**
 * A minimal relevancy score component showing just a badge
 */
export const ReferenceRelevancySummary: React.FC<
  ReferenceRelevancySummaryProps
> = ({ referenceNumber, citationMatches, isLoading = false }) => {
  // Removed excessive logging for performance

  // Calculate the overall score - handling special cases better
  let overallScore = 0;

  if (citationMatches && citationMatches.length > 0) {
    // Get all citation matches with valid reasoning scores
    const matchesWithScores = citationMatches.filter(
      match =>
        match.reasoningScore !== null && match.reasoningScore !== undefined
    );

    // Removed logging for performance

    if (matchesWithScores.length > 0) {
      overallScore = calculateOverallScore(matchesWithScores);
    } else {
      // Manual score calculation as fallback if direct scoring fails
      // Just use the first 1-2 matches if they exist
      const sampleMatches = citationMatches.slice(0, 2);

      // Assign a moderate score (50%) if we at least have matches but no scores
      if (sampleMatches.length > 0) {
        // Using fallback scoring (50%) because no valid scores found
        overallScore = 0.5;
      }
    }
  }

  // Format score as percentage, default to 0 if score is NaN or negative
  const scorePercentage = !isNaN(overallScore)
    ? Math.max(0, Math.round(overallScore * 100))
    : 0;

  // Determine the score color, using gray for 0
  const scoreColor =
    scorePercentage > 0 ? getScoreColor(overallScore) : 'text-muted-foreground';

  // Removed final score logging for performance

  // Always render the score component
  return (
    <span className={cn('text-xs font-medium mr-2', scoreColor)}>
      Relevancy: {scorePercentage}%
    </span>
  );
};

export default ReferenceRelevancySummary;
