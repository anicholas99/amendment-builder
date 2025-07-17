import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { AuthenticatedRequest } from '@/types/middleware';
import { processCitationMatchArray } from '@/features/citation-extraction/utils/citation';
import { getSearchHistoryWithTenant } from '@/repositories/search';
import { findTopCitationMatches } from '@/repositories/citationMatchRepository';
import { SecurePresets } from '@/server/api/securePresets';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { apiResponse } from '@/utils/api/responses';

const apiLogger = createApiLogger('citation-matches/top-results');

// Query validation schema
const querySchema = z.object({
  searchHistoryId: z.string().uuid('Invalid searchHistoryId format'),
  referenceNumber: z.string().optional(),
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return apiResponse.methodNotAllowed(res, ['GET']);
  }

  try {
    const { searchHistoryId, referenceNumber } = querySchema.parse(req.query);

    apiLogger.info(
      `Fetching top citation matches for search ${searchHistoryId}`,
      {
        referenceNumber,
      }
    );

    // Use repository to fetch top citation matches
    const citationMatches = await findTopCitationMatches(
      searchHistoryId,
      referenceNumber
    );

    apiLogger.info(`Found ${citationMatches.length} top citation matches`);

    // Transform citation matches to ProcessedCitationMatch format
    const processedMatches = processCitationMatchArray(citationMatches as any);

    // Group by element for easier UI consumption
    const groupedByElement: Record<string, any> = {};

    processedMatches.forEach(match => {
      const elementText = match.parsedElementText || 'Unknown Element';

      if (!groupedByElement[elementText]) {
        groupedByElement[elementText] = {
          elementText,
          matches: [],
        };
      }

      groupedByElement[elementText].matches.push(match);
    });

    // Convert to array
    const groupedResults = Object.values(groupedByElement);

    // Include the deep analysis summary if available
    let deepAnalysisSummary = null;
    if (
      citationMatches.length > 0 &&
      citationMatches[0].citationJob?.deepAnalysisJson
    ) {
      try {
        const deepAnalysis = JSON.parse(
          citationMatches[0].citationJob.deepAnalysisJson as string
        );
        deepAnalysisSummary = {
          overallAssessment: deepAnalysis.overallAssessment,
          holisticAnalysis: deepAnalysis.holisticAnalysis,
        };
      } catch (parseError) {
        apiLogger.error('Failed to parse deep analysis JSON', { parseError });
      }
    }

    return apiResponse.ok(res, {
      groupedResults,
      totalMatches: processedMatches.length,
      deepAnalysisSummary,
    });
  } catch (error) {
    apiLogger.error('Error fetching top citation matches', { error });
    return apiResponse.serverError(res, new Error('Internal Server Error'));
  }
}

// Apply security middleware
const resolveTenantId = async (
  req: AuthenticatedRequest
): Promise<string | null> => {
  const { searchHistoryId } = querySchema.parse(req.query);
  const searchHistory = await getSearchHistoryWithTenant(searchHistoryId);
  return searchHistory?.tenantId || null;
};

export default SecurePresets.tenantProtected(resolveTenantId, handler, {
  rateLimit: 'read', // Use read-only rate limits for this GET endpoint
});
