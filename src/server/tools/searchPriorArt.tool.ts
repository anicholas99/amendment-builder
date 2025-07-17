import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { executeSemanticSearch } from '@/server/services/semantic-search.server-service';
import { findProjectByIdAndTenant } from '@/repositories/project/core.repository';
import { env } from '@/config/env';

/**
 * Search for prior art references directly from the chat
 * This allows users to search patents without switching contexts
 *
 * SECURITY: Always validates tenant ownership before accessing data
 */
export async function searchPriorArt(
  projectId: string,
  tenantId: string,
  query: string,
  limit: number = 10
): Promise<{
  success: boolean;
  results: any[];
  searchId: string;
  message: string;
}> {
  logger.info('[SearchPriorArtTool] Searching prior art', {
    projectId,
    query: query.substring(0, 100),
    limit,
  });

  try {
    // Verify project and tenant ownership
    const project = await findProjectByIdAndTenant(projectId, tenantId);
    if (!project) {
      throw new ApplicationError(
        ErrorCode.PROJECT_ACCESS_DENIED,
        'Project not found or access denied'
      );
    }

    // Use the existing semantic search service
    const searchResult = await executeSemanticSearch(
      {
        searchInputs: [query],
        projectId,
        jurisdiction: 'US',
      },
      env.AIAPI_API_KEY || ''
    );

    if (!searchResult || !searchResult.results) {
      throw new ApplicationError(
        ErrorCode.API_INVALID_RESPONSE,
        'Search returned invalid response'
      );
    }

    // Format results for display
    const results = searchResult.results || [];
    const formattedResults = results.slice(0, limit).map((result: any) => ({
      patentNumber: result.patentNumber || result.publicationNumber,
      title: result.title,
      abstract: result.abstract?.substring(0, 200) + '...',
      applicant: result.applicant || result.assignee,
      publicationDate: result.publicationDate,
      relevanceScore: result.relevance || result.score,
      url: result.url,
    }));

    return {
      success: true,
      results: formattedResults,
      searchId: searchResult.jobId || `search-${Date.now()}`,
      message: `Found ${formattedResults.length} prior art references for "${query}"`,
    };
  } catch (error) {
    logger.error('[SearchPriorArtTool] Failed to search prior art', {
      projectId,
      error,
    });

    if (error instanceof ApplicationError) {
      throw error;
    }

    throw new ApplicationError(
      ErrorCode.API_NETWORK_ERROR,
      'Failed to search prior art'
    );
  }
}
