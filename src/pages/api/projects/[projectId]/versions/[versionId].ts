import { NextApiResponse, NextApiRequest } from 'next';
import { logger } from '@/lib/monitoring/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import {
  findApplicationVersionById,
  getProjectTenantId,
  findLatestApplicationVersionWithDocuments,
} from '../../../../../repositories/project';
import {
  updateApplicationVersionTimestamp,
  deleteApplicationVersionWithAccess,
} from '../../../../../repositories/applicationVersionRepository';
import { CustomApiRequest } from '@/types/api';
import { AuthenticatedRequest } from '@/types/middleware';
import { withCsrf } from '@/lib/security/csrf';
import { z } from 'zod';
import { versionQuerySchema } from '@/lib/validation/schemas/shared/querySchemas';
import { createApiLogger } from '@/lib/monitoring/apiLogger';
import { withAuth } from '@/middleware/auth';
import { withTenantGuard } from '@/middleware/authorization';
import { withErrorHandling } from '@/middleware/errorHandling';
import { withRateLimit } from '@/middleware/rateLimiter';
import { requireRole } from '@/middleware/role';
import { withQueryValidation } from '@/middleware/queryValidation';
import { SecurePresets, TenantResolvers } from '@/lib/api/securePresets';
import { methodMiddleware } from '@/middleware/compose/index';

const apiLogger = createApiLogger('projects/versions/:versionId');

/**
 * Handler for ApplicationVersion by ID.
 * GET: Fetches a specific version.
 * PUT: Sets a specific version as the current/latest by updating its timestamp.
 * DELETE: Deletes a specific version.
 * Requires authentication and tenant validation.
 */
async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
): Promise<void> {
  apiLogger.logRequest(req);

  const userId = req.user!.id;
  const tenantId = req.user!.tenantId;
  const { projectId, versionId } = req.query as z.infer<
    typeof versionQuerySchema
  >;

  if (typeof projectId !== 'string' || typeof versionId !== 'string') {
    throw new ApplicationError(
      ErrorCode.VALIDATION_FAILED,
      'Invalid Project ID or Version ID'
    );
  }

  // --- Handle GET Request --- //
  if (req.method === 'GET') {
    logger.info(
      `API [versionId] GET: Fetching version ${versionId} for project ${projectId}, user ${userId}`
    );

    // Handle special case for "latest" version
    if (versionId === 'latest') {
      logger.debug(
        `API [versionId] GET: Fetching latest version for project ${projectId}`
      );
      const latestVersion =
        await findLatestApplicationVersionWithDocuments(projectId);

      if (!latestVersion) {
        logger.warn(
          `API [versionId] GET: No versions found for project ${projectId}, user ${userId}`
        );
        res.status(404).json({
          error: 'NOT_FOUND',
          message: 'No versions found for this project',
        });
        return;
      }

      // Verify tenant access
      const project = await getProjectTenantId(projectId);
      if (!project || project.tenantId !== tenantId) {
        logger.warn(
          `API [versionId] GET: Access denied to project ${projectId} for user ${userId}`
        );
        res.status(404).json({
          error: 'NOT_FOUND',
          message: 'Version not found or access denied',
        });
        return;
      }

      res.status(200).json(latestVersion);
      return;
    }

    // Handle normal version ID case
    const version = await findApplicationVersionById(
      versionId,
      projectId,
      tenantId!
    );
    if (!version) {
      logger.warn(
        `API [versionId] GET: Version ${versionId} not found or access denied for project ${projectId}, user ${userId}`
      );
      res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Version not found or access denied',
      });
      return;
    }
    res.status(200).json(version);
    return;
  }

  // --- Handle PUT Request (Set as Current) --- //
  if (req.method === 'PUT') {
    // Role check for mutation
    if (req.user!.role !== 'USER' && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    logger.info(
      `API [versionId] PUT: Setting version ${versionId} as current for project ${projectId}, user ${userId}`
    );

    // Update the timestamp of the selected version to make it the latest using repository function
    const updatedVersion = await updateApplicationVersionTimestamp(
      versionId,
      projectId,
      tenantId!
    );

    if (!updatedVersion) {
      logger.warn(
        `API [versionId] PUT: Failed to update timestamp for version ${versionId}. Not found or access denied.`
      );
      res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Version not found or access denied',
      });
      return;
    }

    logger.info(
      `API [versionId] PUT: Successfully set version ${versionId} as current by updating timestamp.`
    );
    res.status(200).json(updatedVersion);
    return;
  }

  // --- Handle DELETE Request --- //
  if (req.method === 'DELETE') {
    // Role check for mutation
    if (req.user!.role !== 'USER' && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    logger.info(
      `API [versionId] DELETE: Deleting version ${versionId} for project ${projectId}, user ${userId}`
    );

    const deleted = await deleteApplicationVersionWithAccess(
      versionId,
      projectId,
      tenantId!
    );

    if (!deleted) {
      logger.warn(
        `API [versionId] DELETE: Version ${versionId} not found or access denied for project ${projectId}, user ${userId}`
      );
      res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Version not found or access denied',
      });
      return;
    }

    logger.info(
      `API [versionId] DELETE: Successfully deleted version ${versionId}`
    );
    res.status(204).end();
    return;
  }
}

// Use the new secure preset
export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    validate: {
      query: versionQuerySchema,
    },
  }
);
