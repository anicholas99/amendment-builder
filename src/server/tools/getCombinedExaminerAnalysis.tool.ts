import {
  getProjectCombinedAnalyses,
  getCombinedAnalysisById,
} from '@/repositories/combinedExaminerAnalysisRepository';
import { logger } from '@/server/logger';

/**
 * Tool to fetch combined examiner analysis data
 * Provides access to AI-generated synthesis of multiple deep analyses
 * that shows how references combine to reject claims
 */
export async function getCombinedExaminerAnalysis(
  projectId: string,
  tenantId: string,
  analysisId?: string,
  limit: number = 5
) {
  logger.info('[GetCombinedAnalysisTool] Fetching combined examiner analysis', {
    projectId,
    analysisId,
    limit,
  });

  try {
    // If a specific analysis ID is provided, fetch just that one
    if (analysisId) {
      const analysis = await getCombinedAnalysisById(
        analysisId,
        projectId,
        tenantId
      );

      const parsedAnalysis = JSON.parse(analysis.analysisJson);
      const referenceNumbers = JSON.parse(analysis.referenceNumbers);

      return {
        summary: `Found combined analysis for ${referenceNumbers.length} references`,
        analyses: [
          {
            id: analysis.id,
            referenceNumbers,
            claim1Text: analysis.claim1Text,
            createdAt: analysis.createdAt,
            analysis: parsedAnalysis,
          },
        ],
      };
    }

    // Otherwise, fetch recent combined analyses for the project
    const analyses = await getProjectCombinedAnalyses(
      projectId,
      tenantId,
      limit
    );

    if (analyses.length === 0) {
      return {
        summary: 'No combined examiner analyses found for this project',
        analyses: [],
        recommendation:
          'Run combined analysis on your citation results to see how references work together',
      };
    }

    // Parse and structure the analyses
    const structuredAnalyses = analyses.map(analysis => {
      const parsedAnalysis = JSON.parse(analysis.analysisJson);
      const referenceNumbers = JSON.parse(analysis.referenceNumbers);

      return {
        id: analysis.id,
        referenceNumbers,
        claim1Text: analysis.claim1Text,
        createdAt: analysis.createdAt,
        searchContext: {
          searchHistoryId: analysis.searchHistory.id,
          query: analysis.searchHistory.query,
        },
        analysis: parsedAnalysis,
      };
    });

    // Generate summary
    const totalReferences = structuredAnalyses.reduce(
      (sum, a) => sum + a.referenceNumbers.length,
      0
    );

    return {
      summary: `Found ${analyses.length} combined analyses covering ${totalReferences} total references`,
      totalAnalyses: analyses.length,
      analyses: structuredAnalyses,
      insightSummary: generateInsightSummary(structuredAnalyses),
    };
  } catch (error) {
    logger.error('[GetCombinedAnalysisTool] Error fetching combined analysis', {
      error,
      projectId,
      analysisId,
    });

    return {
      summary: 'Error fetching combined examiner analysis data',
      error: error instanceof Error ? error.message : 'Unknown error',
      analyses: [],
    };
  }
}

/**
 * Generate a high-level summary of insights from multiple combined analyses
 */
function generateInsightSummary(analyses: any[]): string {
  if (analyses.length === 0) return '';

  // Extract key themes from the analyses
  const rejectionTypes = new Set<string>();
  const keyRecommendations = new Set<string>();

  analyses.forEach(analysis => {
    if (analysis.analysis?.overallAssessment?.keyConcerns) {
      analysis.analysis.overallAssessment.keyConcerns.forEach(
        (concern: string) => {
          if (concern.length < 100) {
            // Only short, key concerns
            rejectionTypes.add(concern);
          }
        }
      );
    }

    if (analysis.analysis?.overallAssessment?.strategicRecommendations) {
      analysis.analysis.overallAssessment.strategicRecommendations
        .slice(0, 2) // Top 2 recommendations per analysis
        .forEach((rec: string) => keyRecommendations.add(rec));
    }
  });

  const themes = Array.from(rejectionTypes).slice(0, 3);
  const recommendations = Array.from(keyRecommendations).slice(0, 3);

  let summary = '';
  if (themes.length > 0) {
    summary += `Key rejection themes: ${themes.join(', ')}. `;
  }
  if (recommendations.length > 0) {
    summary += `Top recommendations: ${recommendations.join('; ')}`;
  }

  return (
    summary ||
    'Multiple combined analyses available with detailed rejection rationales and strategic recommendations.'
  );
}
