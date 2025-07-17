import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest } from '@/types/middleware';
import { z } from 'zod';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import {
  ClaimMirroringService,
  ClaimType,
} from '@/server/services/claim-mirroring.server-service';
import { sendSafeErrorResponse } from '@/utils/secureErrorResponse';
import { ApplicationError } from '@/lib/error';

const apiLogger = createApiLogger('claims/mirror');

// Validation schemas
const querySchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
});

const requestBodySchema = z.object({
  claimIds: z.array(z.string()).min(1, 'At least one claim ID is required'),
  targetType: z.enum(['system', 'method', 'apparatus', 'process', 'crm']),
});

/**
 * API handler for mirroring claims to a different type
 * POST /api/projects/[projectId]/claims/mirror
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  apiLogger.logRequest(req);
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;
  const { projectId } = req.query as { projectId: string };

  if (!tenantId) {
    apiLogger.error('No tenant ID in authenticated request', {
      projectId,
      userId,
    });
    return res.status(403).json({ error: 'Tenant context required' });
  }

  try {
    // Validate request body
    const validationResult = requestBodySchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request body',
        details: validationResult.error.flatten(),
      });
    }

    const { claimIds, targetType } = validationResult.data;

    apiLogger.info('Starting claim mirroring', {
      projectId,
      claimCount: claimIds.length,
      targetType,
      userId,
    });

    // Mirror claims using the service
    const mirroredClaims = await ClaimMirroringService.mirrorClaims({
      projectId,
      claimIds,
      targetType: targetType as ClaimType,
      tenantId,
    });

    apiLogger.info('Successfully mirrored claims', {
      projectId,
      originalCount: claimIds.length,
      mirroredCount: mirroredClaims.length,
    });

    return res.status(201).json({
      success: true,
      data: {
        message: `Successfully created ${mirroredClaims.length} ${targetType} claims`,
        claims: mirroredClaims,
      },
    });
  } catch (error) {
    apiLogger.error('Failed to mirror claims', {
      projectId,
      userId,
      error: error instanceof Error ? error : String(error),
    });

    if (error instanceof ApplicationError) {
      sendSafeErrorResponse(res, error, error.statusCode, error.message);
      return;
    }

    sendSafeErrorResponse(
      res,
      error,
      500,
      'Failed to mirror claims. Please try again later.'
    );
  }
}

// Apply security middleware
export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    validate: {
      query: querySchema,
      body: requestBodySchema,
      bodyMethods: ['POST'],
    },
    rateLimit: 'api',
  }
);
