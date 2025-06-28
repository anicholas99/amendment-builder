import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { createApiLogger } from '@/lib/monitoring/apiLogger';
import { findCitationMatchesBySearchWithOptions } from '@/repositories/citationRepository';
import { getSearchHistoryWithTenant } from '@/repositories/search';
import { AuthenticatedRequest } from '@/types/middleware';
import { processCitationMatchArray } from '@/features/citation-extraction/utils/citation';
import { ProcessedCitationMatch } from '@/types/domain/citation';
import { CitationMatchesBySearchResponseSchema } from '@/types/api/citation';
import { withAuth } from '@/middleware/auth';
import { withTenantGuard } from '@/middleware/authorization';
import { withErrorHandling } from '@/middleware/errorHandling';
import { withRateLimit } from '@/middleware/rateLimiter';
import { requireRole } from '@/middleware/role';
import { withMethod } from '@/middleware/method';
import { SecurePresets, TenantResolvers } from '@/lib/api/securePresets';

const apiLogger = createApiLogger('citation-matches/by-search');

// Query validation schema
const querySchema = z.object({
  searchHistoryId: z.string().uuid('Invalid searchHistoryId format'),
  includeMetadataForAllReferences: z.enum(['true', 'false']).optional(),
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Query parameters are already validated by middleware
    const { searchHistoryId, includeMetadataForAllReferences } = req.query;

    // Convert string booleans to actual booleans
    const shouldIncludeAllMetadata = includeMetadataForAllReferences === 'true';

    apiLogger.info(`Fetching citation matches for search ${searchHistoryId}`);

    // Use repository function to get citation matches
    const result = await findCitationMatchesBySearchWithOptions(
      searchHistoryId as string,
      shouldIncludeAllMetadata
    );

    const { citationMatches, placeholderMatches } = result;

    apiLogger.info(`Found ${citationMatches.length} citation matches`);

    // Transform citation matches to ProcessedCitationMatch format
    const processedMatches = processCitationMatchArray(citationMatches as any);

    // Transform placeholder matches if present
    let processedPlaceholders: ProcessedCitationMatch[] = [];
    if (placeholderMatches && placeholderMatches.length > 0) {
      // Create ProcessedCitationMatch objects for placeholders
      processedPlaceholders = placeholderMatches.map(
        (placeholder): ProcessedCitationMatch => ({
          id: placeholder.id,
          searchHistoryId: searchHistoryId as string,
          citationJobId: placeholder.id.replace('placeholder-', ''),
          referenceNumber: placeholder.referenceNumber || 'unknown',
          citation: '',
          paragraph: null,
          score: null,
          parsedElementText: null,
          locationStatus: 'PENDING',
          locationJobId: null,
          location: null,
          locationError: null,
          reasoningStatus: 'PENDING',
          reasoningJobId: null,
          reasoning: null,
          reasoningError: null,
          referenceTitle: null,
          referenceApplicant: null,
          referenceAssignee: null,
          referencePublicationDate: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          jobStatus: placeholder.jobStatus as any,
          jobCompletedAt: null,
          analysisSource: 'LEGACY_RELEVANCE',
          isTopResult: false,
          isPlaceholder: true,
          hasLocation: false,
          hasReasoning: false,
        })
      );
    }

    // Combine processed matches
    const allProcessedMatches = [...processedMatches, ...processedPlaceholders];

    // Validate response data
    try {
      // Convert dates to ISO strings for JSON serialization
      const serializableMatches = allProcessedMatches.map(match => ({
        ...match,
        createdAt:
          match.createdAt instanceof Date
            ? match.createdAt.toISOString()
            : match.createdAt,
        updatedAt:
          match.updatedAt instanceof Date
            ? match.updatedAt.toISOString()
            : match.updatedAt,
        jobCompletedAt:
          match.jobCompletedAt instanceof Date
            ? match.jobCompletedAt.toISOString()
            : match.jobCompletedAt,
        reasoning: match.reasoning
          ? {
              ...match.reasoning,
              timestamp:
                match.reasoning.timestamp instanceof Date
                  ? match.reasoning.timestamp.toISOString()
                  : match.reasoning.timestamp,
            }
          : null,
      }));

      CitationMatchesBySearchResponseSchema.parse(serializableMatches);

      return res.status(200).json(serializableMatches);
    } catch (validationError) {
      apiLogger.error('Response validation failed', {
        error: validationError,
        sampleMatch: allProcessedMatches[0],
      });
      // Still return the data but log the validation error for monitoring
      return res.status(200).json(allProcessedMatches);
    }
  } catch (error) {
    apiLogger.error('Error fetching citation matches', { error });
    return res.status(500).json({
      error: 'Internal Server Error',
      details: (error as Error).message,
    });
  }
}

// Resolve tenantId based on searchHistoryId
const resolveTenantId = async (
  req: AuthenticatedRequest
): Promise<string | null> => {
  const { searchHistoryId } = req.query;
  const searchHistory = await getSearchHistoryWithTenant(
    searchHistoryId as string
  );
  return searchHistory?.tenantId || null;
};

// Use the new secure preset to simplify the middleware chain
export default SecurePresets.tenantProtected(resolveTenantId, handler, {
  validate: {
    query: querySchema,
  },
});
