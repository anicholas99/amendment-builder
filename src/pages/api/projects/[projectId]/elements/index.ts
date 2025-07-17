import type { NextApiResponse } from 'next';
import { AuthenticatedRequest } from '@/types/middleware';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { figureRepository } from '@/repositories/figure';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { z } from 'zod';

const apiLogger = createApiLogger('get-project-elements');

// Query validation schema
const querySchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { projectId } = req.query as z.infer<typeof querySchema>;

  try {
    apiLogger.info('Fetching all elements for project', { projectId });

    // Get all elements for the project
    const elements = await figureRepository.getProjectElements(projectId);

    apiLogger.info('Successfully fetched project elements', {
      projectId,
      elementCount: elements.length,
    });

    return res.status(200).json({
      elements: elements.map(elem => ({
        elementKey: elem.elementKey,
        elementName: elem.name,
        id: elem.id,
      })),
    });
  } catch (error) {
    apiLogger.error('Failed to fetch project elements', { error, projectId });
    throw error;
  }
}

// SECURITY: This endpoint is tenant-protected using project-based resolution
// Users can only access elements for projects within their own tenant
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
