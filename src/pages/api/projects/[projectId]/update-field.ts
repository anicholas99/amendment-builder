import type { NextApiResponse } from 'next';
import { AuthenticatedRequest } from '@/types/middleware';
import { z } from 'zod';
import { createApiLogger } from '@/lib/monitoring/apiLogger';
import { CustomApiRequest } from '@/types/api';
import { updateProjectFieldSchema } from '@/lib/validation/schemas/project.schemas';
import { projectIdQuerySchema } from '@/lib/validation/schemas/shared/querySchemas';
import { projectService } from '@/server/services/project.server-service';
import { SecurePresets } from '@/lib/api/securePresets';

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
    return res.status(501).json({ error: 'Operation not implemented' });
  }

  if (!req.user || !req.user.id || !req.user.tenantId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const result = await projectService.updateProject(
    projectId,
    updateData,
    req.user.id,
    req.user.tenantId
  );

  res.status(200).json(result);
}

// Custom tenant resolver for project field updates
const projectFieldTenantResolver = async (
  req: AuthenticatedRequest
): Promise<string | null> => {
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
