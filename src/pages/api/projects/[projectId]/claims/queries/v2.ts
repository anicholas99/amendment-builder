import { NextApiResponse } from 'next';
import { CustomApiRequest } from '@/types/api';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { z } from 'zod';
// import { withAuth } from '@/middleware/auth';
import { QueryGenerationService } from '@/server/services/query-generation.server-service';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import {
  GenerateQueriesRequestV2Schema,
  // GenerateQueriesResponseV2Schema
} from '@/types/api/responses';

// ============================================================================
// Constants and Configuration
// ============================================================================

const apiLogger = createApiLogger('claims/queries/v2');

// Query validation
const querySchema = z.object({
  projectId: z.string(),
});

// ============================================================================
// API Handler
// ============================================================================

/**
 * V2 Query Generation - Accepts simplified string array format
 *
 * @endpoint POST /api/projects/[projectId]/claims/queries/v2
 * @param {string[]} elements - Array of claim element strings
 * @param {object} inventionData - Optional invention context
 * @returns {searchQueries: string[], usage?: object}
 */
async function handler(
  req: CustomApiRequest<z.infer<typeof GenerateQueriesRequestV2Schema>>,
  res: NextApiResponse
): Promise<void> {
  apiLogger.logRequest(req);

  const { projectId } = req.query as z.infer<typeof querySchema>;
  const { elements, inventionData } = req.body;

  apiLogger.info('V2 query generation request', {
    projectId,
    elementCount: elements.length,
    hasInventionData: !!inventionData,
  });

  try {
    // Generate queries using V2 format (service will auto-detect)
    const searchQueries =
      await QueryGenerationService.generateSearchQueries(elements);

    apiLogger.info('Successfully generated queries', {
      queryCount: searchQueries.length,
    });

    return res.status(200).json({
      success: true,
      data: {
        searchQueries: searchQueries,
        timestamp: new Date().toISOString(),
        projectId,
      },
    });
  } catch (error) {
    apiLogger.error('V2 query generation failed', { error });
    throw error;
  }
}

// ============================================================================
// Middleware Configuration
// ============================================================================

export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    validate: {
      query: querySchema,
      body: GenerateQueriesRequestV2Schema,
      bodyMethods: ['POST'],
    },
    rateLimit: 'api',
  }
);
