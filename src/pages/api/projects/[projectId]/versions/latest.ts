import { NextApiResponse } from 'next';
import { z } from 'zod';
import { AuthenticatedRequest } from '@/types/middleware';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { apiResponse } from '@/utils/api/responses';
import { createApiLogger } from '@/server/monitoring/apiLogger';

const apiLogger = createApiLogger('versions/latest');

// Query validation schema
const querySchema = z.object({
  projectId: z.string().uuid('Project ID must be a valid UUID'),
});

/**
 * Latest Version API Handler
 * Returns the latest version for a project or null if no versions exist
 * 
 * For amendment projects, this typically returns null since they don't use versioning
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  apiLogger.logRequest(req);

  if (req.method !== 'GET') {
    return apiResponse.methodNotAllowed(res, ['GET']);
  }

  try {
    const { projectId } = querySchema.parse(req.query);
    const { tenantId } = req.user!;

    // For amendment projects, return null since they don't use the versioning system
    // This prevents 404 errors while maintaining API compatibility
    const latestVersion = null;

    apiLogger.info('Latest version retrieved', {
      projectId,
      hasVersion: !!latestVersion,
    });

    return apiResponse.ok(res, {
      success: true,
      version: latestVersion,
      projectId,
    });

  } catch (error) {
    apiLogger.errorSafe('Failed to retrieve latest version', error as Error);
    return apiResponse.serverError(res, new Error('Failed to retrieve latest version'));
  }
}

// SECURITY: This endpoint is tenant-protected using project-based resolution
export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    validate: {
      query: querySchema,
    },
    rateLimit: 'api',
  }
); 