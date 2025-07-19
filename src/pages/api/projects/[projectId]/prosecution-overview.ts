import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { ProjectService } from '@/server/services/project.server-service';
import { ApplicationError } from '@/lib/error';

const querySchema = z.object({
  projectId: z.string().uuid('Invalid project ID format'),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { projectId } = querySchema.parse(req.query);
    const { id: userId, tenantId } = req.user;
    const projectService = new ProjectService();

    // Get prosecution overview data (includes access verification)
    const prosecutionData = await projectService.getProsecutionOverview(
      projectId,
      userId,
      tenantId
    );

    return res.status(200).json({
      success: true,
      data: prosecutionData,
    });
  } catch (error) {
    if (error instanceof ApplicationError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to fetch prosecution overview',
    });
  }
}

export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  { 
    rateLimit: 'standard',
    validate: { query: querySchema }
  }
);