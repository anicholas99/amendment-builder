import type { NextApiResponse } from 'next';
import { AuthenticatedRequest, RequestWithServices } from '@/types/middleware';
import { z } from 'zod';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { CustomApiRequest } from '@/types/api';
import { updateProjectFieldSchema } from '@/lib/validation/schemas/project.schemas';
import { projectIdQuerySchema } from '@/lib/validation/schemas/shared/querySchemas';
import { SecurePresets } from '@/server/api/securePresets';
import { apiResponse } from '@/utils/api/responses';

const apiLogger = createApiLogger('update-field');

interface UpdateFieldBody {
  field: string;
  value: unknown;
  operation?: 'set' | 'append' | 'remove';
}

async function handler(
  req: CustomApiRequest<UpdateFieldBody>,
  res: NextApiResponse
): Promise<void> {
  const { projectService } = (req as RequestWithServices).services;
  apiLogger.logRequest(req);

  const { projectId } = req.query as z.infer<typeof projectIdQuerySchema>;
  const { field, value, operation } = req.body;

  // Build update data for the specific field
  const updateData: any = {};

  if (operation === 'set' || !operation) {
    updateData[field] = value;
  } else {
    // Handle append/remove operations if needed
    apiLogger.warn('Append/remove operations not implemented', {
      operation,
      field,
    });
    return res.status(501).json({ error: 'Operation not implemented' }); // Keep 501 - no helper exists
  }

  if (!req.user || !req.user.id || !req.user.tenantId) {
    return apiResponse.unauthorized(res, 'Unauthorized');
  }

  const result = await projectService.updateProject(
    projectId,
    updateData,
    req.user.id,
    req.user.tenantId
  );

  return apiResponse.ok(res, result);
}

// Custom tenant resolver for project field updates
const projectFieldTenantResolver = async (
  req: AuthenticatedRequest
): Promise<string | null> => {
  const { projectService } = (req as RequestWithServices).services;
  const { projectId } = (req as any).validatedQuery as z.infer<
    typeof projectIdQuerySchema
  >;
  return await projectService.getTenantIdForProject(projectId);
};

// SECURITY: This endpoint is tenant-protected using project-based resolution
// Users can only update fields for projects within their own tenant
export default SecurePresets.tenantProtected(
  projectFieldTenantResolver,
  handler,
  {
    validate: {
      query: projectIdQuerySchema, // Always validate the projectId parameter
      body: updateProjectFieldSchema,
      bodyMethods: ['POST'], // Only POST needs body validation
    },
    rateLimit: 'api',
  }
);
