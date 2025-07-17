/**
 * Relevance Score Calculation Utility
 * 
 * Calculates overall relevance scores for references based on citation match data.
 * Accounts for both successful matches and filtered out low-confidence matches.
 */

import { ProcessedCitationMatch } from '@/types/domain/citation';
import { logger } from '@/utils/clientLogger';

export interface ReferenceRelevanceScore {
  referenceNumber: string;
  averageScore: number;
  matchCount: number;
  hasLowConfidenceMatches: boolean;
}

/**
 * Calculate overall relevance score for a reference based on its citation matches
 * 
 * @param matches - Array of citation matches for a specific reference
 * @returns Relevance score (0-1) accounting for match quality and quantity
 */
export function calculateReferenceRelevanceScore(
  matches: ProcessedCitationMatch[]
): number {
  if (!matches || matches.length === 0) {
    return 0;
  }

  // Debug: Log the matches to see what data we're working with
  logger.debug('[calculateReferenceRelevanceScore] Processing matches:', {
    matchCount: matches.length,
    firstMatch: matches[0] ? {
      id: matches[0].id,
      hasReasoning: !!matches[0].reasoning,
      reasoningScore: matches[0].reasoning?.score,
      basicScore: matches[0].score,
      citation: matches[0].citation?.substring(0, 50) + '...'
    } : null
  });

  // Get reasoning scores from matches that have them
  const reasoningScores = matches
    .map(match => {
      const score = match.reasoning?.score;
      logger.debug('[calculateReferenceRelevanceScore] Reasoning score:', {
        matchId: match.id,
        score,
        type: typeof score
      });
      return score;
    })
    .filter((score): score is number => typeof score === 'number' && !isNaN(score) && score > 0);

  logger.debug('[calculateReferenceRelevanceScore] Valid reasoning scores:', {
    scores: reasoningScores,
    count: reasoningScores.length
  });

  if (reasoningScores.length === 0) {
    // If no reasoning scores available, fall back to basic scores
    const basicScores = matches
      .map(match => match.score)
      .filter((score): score is number => typeof score === 'number' && !isNaN(score) && score > 0);
    
    logger.debug('[calculateReferenceRelevanceScore] Using basic scores:', {
      scores: basicScores,
      count: basicScores.length
    });
    
    if (basicScores.length === 0) {
      return 0;
    }
    
    const averageBasicScore = basicScores.reduce((sum, score) => sum + score, 0) / basicScores.length;
    
    // Basic scores could be in different ranges, let's normalize them
    let normalizedScore = averageBasicScore;
    if (averageBasicScore > 1) {
      // If scores are > 1, assume they're percentages (0-100) and convert to 0-1
      normalizedScore = Math.min(averageBasicScore / 100, 1);
    }
    
    logger.debug('[calculateReferenceRelevanceScore] Basic score calculation:', {
      averageBasicScore,
      normalizedScore
    });
    
    return normalizedScore;
  }

  // Calculate average reasoning score
  const averageReasoningScore = reasoningScores.reduce((sum, score) => sum + score, 0) / reasoningScores.length;

  // Reasoning scores should already be in 0-1 range, but let's ensure they're normalized
  let normalizedReasoningScore = averageReasoningScore;
  if (averageReasoningScore > 1) {
    // If reasoning scores are > 1, assume they're percentages and convert
    normalizedReasoningScore = Math.min(averageReasoningScore / 100, 1);
  }

  // Penalty factor for missing reasoning scores (indicates potential low-confidence matches that were filtered)
  const reasoningCoverage = reasoningScores.length / matches.length;
  const coveragePenalty = reasoningCoverage < 1 ? (1 - reasoningCoverage) * 0.1 : 0; // Max 10% penalty

  // Apply penalty and ensure result stays in 0-1 range
  const finalScore = Math.max(0, normalizedReasoningScore - coveragePenalty);
  
  logger.debug('[calculateReferenceRelevanceScore] Final calculation:', {
    averageReasoningScore,
    normalizedReasoningScore,
    reasoningCoverage,
    coveragePenalty,
    finalScore
  });
  
  return Math.min(finalScore, 1);
}

/**
 * Calculate relevance scores for all references from grouped citation data
 * 
 * @param groupedResults - Citation matches grouped by element text
 * @returns Map of reference number to relevance score data
 */
export function calculateReferenceRelevanceScores(
  groupedResults: Array<{ elementText: string; matches: ProcessedCitationMatch[] }>
): Map<string, ReferenceRelevanceScore> {
  const referenceScores = new Map<string, ReferenceRelevanceScore>();

  // Group all matches by reference number
  const matchesByReference = new Map<string, ProcessedCitationMatch[]>();
  
  groupedResults.forEach(group => {
    group.matches.forEach(match => {
      const refNum = match.referenceNumber;
      if (!matchesByReference.has(refNum)) {
        matchesByReference.set(refNum, []);
      }
      matchesByReference.get(refNum)!.push(match);
    });
  });

  logger.debug('[calculateReferenceRelevanceScores] Processing references:', {
    referenceCount: matchesByReference.size,
    references: Array.from(matchesByReference.keys())
  });

  // Calculate scores for each reference
  matchesByReference.forEach((matches, referenceNumber) => {
    const averageScore = calculateReferenceRelevanceScore(matches);
    const matchCount = matches.length;
    
    // Check if there are potential low-confidence matches
    const reasoningScoreCount = matches.filter(m => m.reasoning?.score != null).length;
    const hasLowConfidenceMatches = reasoningScoreCount < matches.length;

    const scoreData = {
      referenceNumber,
      averageScore,
      matchCount,
      hasLowConfidenceMatches,
    };

    logger.debug('[calculateReferenceRelevanceScores] Reference score calculated:', scoreData);

    referenceScores.set(referenceNumber, scoreData);
  });

  return referenceScores;
}

/**
 * Format relevance score as a percentage string with appropriate styling class
 * 
 * @param score - Relevance score (0-1)
 * @returns Object with formatted percentage and CSS class for styling
 */
export function formatRelevanceScore(score: number): {
  percentage: string;
  styleClass: string;
} {
  const percentage = Math.round(score * 100);
  
  let styleClass = '';
  if (percentage >= 80) {
    styleClass = 'text-green-600 bg-green-50 border-green-200';
  } else if (percentage >= 60) {
    styleClass = 'text-yellow-600 bg-yellow-50 border-yellow-200';
  } else if (percentage >= 40) {
    styleClass = 'text-orange-600 bg-orange-50 border-orange-200';
  } else {
    styleClass = 'text-red-600 bg-red-50 border-red-200';
  }

  return {
    percentage: `${percentage}%`,
    styleClass,
  };
} 