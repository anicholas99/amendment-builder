import {
  getProjectDeepAnalyses,
  getDeepAnalysisByReference,
} from '@/repositories/citationJobRepository';
import { parseDeepAnalysis } from '@/lib/validation/schemas/db';
import { logger } from '@/server/logger';

interface DeepAnalysisToolParams {
  projectId: string;
  tenantId: string;
  referenceNumber?: string;
  limit?: number;
}

/**
 * Tool to fetch deep analysis data for citations
 * Provides access to detailed element-by-element analysis, rejection rationales,
 * and strategic recommendations from citation analysis
 */
export async function getDeepAnalysis(
  projectId: string,
  tenantId: string,
  referenceNumber?: string,
  limit: number = 10
) {
  logger.info('[GetDeepAnalysisTool] Fetching deep analysis', {
    projectId,
    referenceNumber,
    limit,
  });

  try {
    // If a specific reference number is provided, fetch just that one
    if (referenceNumber) {
      const analysis = await getDeepAnalysisByReference(
        projectId,
        tenantId,
        referenceNumber
      );

      if (!analysis) {
        return {
          summary: `No deep analysis found for reference ${referenceNumber}`,
          analyses: [],
        };
      }

      const parsedAnalysis = parseDeepAnalysis(analysis.deepAnalysisJson);

      return {
        summary: `Found deep analysis for reference ${referenceNumber}`,
        analyses: [
          {
            id: analysis.id,
            referenceNumber: analysis.referenceNumber,
            createdAt: analysis.createdAt,
            completedAt: analysis.completedAt,
            deepAnalysis: parsedAnalysis,
            examinerAnalysis: analysis.examinerAnalysisJson
              ? JSON.parse(analysis.examinerAnalysisJson)
              : null,
          },
        ],
      };
    }

    // Otherwise, fetch all recent deep analyses for the project
    const analyses = await getProjectDeepAnalyses(projectId, tenantId, limit);

    if (analyses.length === 0) {
      return {
        summary: 'No deep analyses found for this project',
        analyses: [],
        recommendation:
          'Run citation analysis on your prior art searches to generate deep analysis data',
      };
    }

    // Parse and structure the analyses
    const structuredAnalyses = analyses.map(analysis => {
      const parsedDeepAnalysis = parseDeepAnalysis(analysis.deepAnalysisJson);

      return {
        id: analysis.id,
        referenceNumber: analysis.referenceNumber,
        createdAt: analysis.createdAt,
        completedAt: analysis.completedAt,
        searchContext: {
          searchHistoryId: analysis.searchHistory.id,
          query: analysis.searchHistory.query,
        },
        deepAnalysis: parsedDeepAnalysis,
        examinerAnalysis: analysis.examinerAnalysisJson
          ? JSON.parse(analysis.examinerAnalysisJson)
          : null,
      };
    });

    // Generate summary
    const references = analyses.map(a => a.referenceNumber).filter(Boolean);
    const uniqueReferences = [...new Set(references)];

    return {
      summary: `Found ${analyses.length} deep analyses for ${uniqueReferences.length} unique references`,
      recentReferences: uniqueReferences.slice(0, 5),
      totalAnalyses: analyses.length,
      analyses: structuredAnalyses,
    };
  } catch (error) {
    logger.error('[GetDeepAnalysisTool] Error fetching deep analysis', {
      error,
      projectId,
      referenceNumber,
    });

    return {
      summary: 'Error fetching deep analysis data',
      error: error instanceof Error ? error.message : 'Unknown error',
      analyses: [],
    };
  }
}
