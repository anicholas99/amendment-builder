import { NextApiResponse } from 'next';
import { createApiLogger } from '@/lib/monitoring/apiLogger';
import { z } from 'zod';
import { CustomApiRequest } from '@/types/api';
// import { withAuth } from '@/middleware/auth';
import { ClaimsServerService } from '@/server/services/claims.server.service';
import { SecurePresets, TenantResolvers } from '@/lib/api/securePresets';
import {
  ParseClaimRequestV2Schema,
  ParseClaimResponseV2Schema,
} from '@/types/api/responses';

// ============================================================================
// Constants and Configuration
// ============================================================================

const apiLogger = createApiLogger('claims/parse/v2');

// Use schemas from centralized location
const querySchema = z.object({
  projectId: z.string(),
});

// ============================================================================
// API Handler
// ============================================================================

/**
 * V2 Claim Parser - Returns simplified string array format
 *
 * @endpoint POST /api/projects/[projectId]/claims/parse/v2
 * @returns {elements: string[], version: '2.0.0'}
 */
async function handler(
  req: CustomApiRequest<z.infer<typeof ParseClaimRequestV2Schema>>,
  res: NextApiResponse
) {
  apiLogger.logRequest(req);

  // Get projectId from URL
  const { projectId } = req.query as z.infer<typeof querySchema>;

  // Get claim text from body
  const { claimText } = req.body;

  apiLogger.info('V2 claim parsing request', {
    projectId,
    claimLength: claimText.length,
  });

  try {
    // Extract elements using V2 method
    const elements =
      await ClaimsServerService.extractClaimElementsV2(claimText);

    // Build V2 response
    const response: z.infer<typeof ParseClaimResponseV2Schema> = {
      elements,
      version: '2.0.0',
    };

    apiLogger.info('V2 claim parsing successful', {
      projectId,
      elementCount: elements.length,
    });

    apiLogger.logResponse(200, response);
    return res.status(200).json(response);
  } catch (error) {
    apiLogger.error('V2 claim parsing failed', { error });
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
      body: ParseClaimRequestV2Schema,
      bodyMethods: ['POST'],
    },
    rateLimit: 'api',
  }
);
