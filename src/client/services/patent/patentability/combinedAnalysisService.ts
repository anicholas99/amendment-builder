import { apiFetch } from '@/lib/api/apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/lib/monitoring/logger';

export interface StructuredCombinedAnalysis {
  patentabilityDetermination:
    | 'Anticipated (§ 102)'
    | 'Obvious (§ 103)'
    | 'Likely Patentable';
  primaryReference: string | null;
  combinedReferences: string[];
  rejectionJustification: {
    motivationToCombine: string | null;
    claimElementMapping: Array<{
      element: string;
      taughtBy: string;
    }>;
    fullNarrative: string;
  };
  strategicRecommendations: Array<{
    recommendation: string;
    suggestedAmendmentLanguage: string;
  }>;
  originalClaim?: string;
  revisedClaim?: string;
}

interface CombinedAnalysisClientInput {
  claim1Text: string;
  referenceIds: string[];
  referenceNumbers?: string[]; // Human-readable reference numbers
  searchHistoryId: string;
}

/**
 * Calls the backend API to run a combined deep analysis.
 * @returns A structured examiner-style analysis.
 */
export async function runCombinedAnalysisFromClient({
  claim1Text,
  referenceIds,
  referenceNumbers,
  searchHistoryId,
}: CombinedAnalysisClientInput): Promise<StructuredCombinedAnalysis> {
  try {
    const response = await apiFetch(API_ROUTES.AI.COMBINED_ANALYSIS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        claim1Text,
        referenceIds,
        referenceNumbers,
        searchHistoryId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApplicationError(
        ErrorCode.AI_GENERATION_FAILED,
        `Failed to run combined analysis: ${errorData.message || response.statusText}`
      );
    }

    const result = await response.json();
    return result.analysis;
  } catch (error) {
    logger.error('Failed to run combined analysis from client:', { error });
    // Re-throw the original error if it's already an ApplicationError
    if (error instanceof ApplicationError) {
      throw error;
    }
    // Otherwise, wrap it
    throw new ApplicationError(
      ErrorCode.AI_GENERATION_FAILED,
      'An unexpected error occurred during combined analysis.'
    );
  }
}
