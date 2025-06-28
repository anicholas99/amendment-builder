import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest } from '@/types/middleware';
import { createApiLogger } from '@/lib/monitoring/apiLogger';
import { z } from 'zod';
import { SecurePresets, TenantResolvers } from '@/lib/api/securePresets';
import {
  getClaimSyncData,
  saveClaimSyncData,
} from '@/repositories/claimSyncRepository';
import { sendSafeErrorResponse } from '@/utils/secure-error-response';
import { ApplicationError } from '@/lib/error';

const apiLogger = createApiLogger('claim-sync');

const querySchema = z.object({
  projectId: z.string(),
});

// Schema for request validation - V2 format only
const ClaimSyncSchema = z.object({
  parsedElements: z.array(z.string()), // V2 format - array of strings
  searchQueries: z.array(z.string()),
  lastSyncedClaim: z.string(),
});

/**
 * API handler for claim sync operations
 * Now exclusively uses V2 format (string arrays)
 */
async function handler(
  req: NextApiRequest & AuthenticatedRequest,
  res: NextApiResponse
) {
  const { projectId } = req.query as { projectId: string };
  const userTenantId = req.user?.tenantId;

  if (!userTenantId) {
    apiLogger.error('No tenant ID in authenticated request', {
      projectId,
      userId: req.user?.id,
    });
    return res.status(403).json({ error: 'Tenant context required' });
  }

  try {
    switch (req.method) {
      case 'GET':
        // Load claim sync data using repository with tenant verification
        const syncData = await getClaimSyncData(projectId, userTenantId);

        if (!syncData) {
          // Return empty data instead of 404 - this is expected on first load
          apiLogger.info('No sync data found, returning empty response', {
            projectId,
            tenantId: userTenantId,
          });
          return res.status(200).json({
            parsedElements: [],
            searchQueries: [],
            claimSyncedAt: null,
            lastSyncedClaim: null,
          });
        }

        // Return V2 format
        return res.status(200).json({
          parsedElements: syncData.parsedElements,
          searchQueries: syncData.searchQueries,
          lastSyncedClaim: syncData.lastSyncedClaim || null,
        });

      case 'POST':
        // Save claim sync data using repository
        apiLogger.info('Processing claim sync save', {
          projectId,
          bodyKeys: Object.keys(req.body || {}),
        });

        // Validate the request body
        const validationResult = ClaimSyncSchema.safeParse(req.body);
        if (!validationResult.success) {
          return res.status(400).json({
            error: 'Invalid request body',
            details: validationResult.error.flatten(),
          });
        }

        const { parsedElements, searchQueries, lastSyncedClaim } =
          validationResult.data;

        apiLogger.info('Saving claim sync data', {
          projectId,
          elementCount: parsedElements.length,
          queryCount: searchQueries.length,
        });

        // Save using repository with tenant verification
        await saveClaimSyncData(projectId, userTenantId, {
          parsedElements,
          searchQueries,
          lastSyncedClaim,
        });

        apiLogger.info('Claim sync data saved successfully', { projectId });

        return res.status(200).json({
          success: true,
          message: 'Claim sync data saved successfully',
        });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    apiLogger.error('Failed to sync claims', {
      projectId,
      userId: req.user?.id,
      error: error instanceof Error ? error : String(error),
    });

    if (error instanceof ApplicationError) {
      sendSafeErrorResponse(res, error, error.statusCode || 500, error.message);
      return;
    }

    sendSafeErrorResponse(
      res,
      error,
      500,
      'Failed to synchronize claims. Please try again later.'
    );
  }
}

// Applying secure preset for tenant protection
export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    validate: {
      query: querySchema,
    },
  }
);
