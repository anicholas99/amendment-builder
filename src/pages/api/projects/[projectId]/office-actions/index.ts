import type { NextApiResponse } from 'next';
import { z } from 'zod';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { AuthenticatedRequest } from '@/types/middleware';
import { apiResponse } from '@/utils/api/responses';
import { findOfficeActionsByProject } from '@/repositories/officeActionRepository';

const apiLogger = createApiLogger('office-actions');

// Query schema for project ID validation
const querySchema = z.object({
  projectId: z.string().uuid('Project ID must be a valid UUID'),
});

/**
 * Office Actions List Handler
 * Lists all Office Actions for a project
 * Follows existing API patterns from projects endpoints
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  apiLogger.logRequest(req);

  if (req.method !== 'GET') {
    throw new ApplicationError(
      ErrorCode.VALIDATION_FAILED,
      `Method ${req.method} not allowed`
    );
  }

  try {
    // Validate query parameters
    const { projectId } = querySchema.parse(req.query);
    const { tenantId } = req.user!;

    // Get all Office Actions for the project
    const officeActions = await findOfficeActionsByProject(
      projectId,
      tenantId!
    );

    apiLogger.debug('Office Actions retrieved successfully', {
      projectId,
      count: officeActions.length,
      tenantId,
    });

    return apiResponse.ok(res, {
      success: true,
      data: officeActions.map(oa => ({
        id: oa.id,
        projectId: oa.projectId,
        oaNumber: oa.oaNumber,
        dateIssued: oa.dateIssued?.toISOString() || null,
        examinerId: oa.examinerId,
        artUnit: oa.artUnit,
        originalFileName: oa.originalFileName,
        status: oa.status,
        createdAt: oa.createdAt.toISOString(),
        updatedAt: oa.updatedAt.toISOString(),
      })),
      meta: {
        total: officeActions.length,
        projectId,
      },
    });

  } catch (error) {
    apiLogger.errorSafe('Failed to retrieve Office Actions', error as Error);
    
    if (error instanceof ApplicationError) {
      throw error;
    }
    
    throw new ApplicationError(
      ErrorCode.INTERNAL_ERROR,
      'Failed to retrieve Office Actions'
    );
  }
}

// SECURITY: This endpoint is tenant-protected using project-based resolution
// Users can only access Office Actions for projects within their own tenant
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