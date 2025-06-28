import { NextApiRequest, NextApiResponse } from 'next';
import { inventionDataService } from '@/server/services/invention-data.server-service';
import { logger } from '@/lib/monitoring/logger';
import { AuthenticatedRequest } from '@/types/middleware';
import { z } from 'zod';
import { SecurePresets, TenantResolvers } from '@/lib/api/securePresets';

// Validation schema for updating technology details
const updateTechnologyDetailsSchema = z.object({
  textInput: z.string().optional(),
  title: z.string().optional(),
  summary: z.string().optional(),
  abstract: z.string().optional(),
  novelty: z.string().optional(),
  features: z.array(z.string()).optional(),
  advantages: z.array(z.string()).optional(),
  useCases: z.array(z.string()).optional(),
  processSteps: z.array(z.string()).optional(),
  technicalField: z.string().optional(),
  patentCategory: z.string().optional(),
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { projectId } = req.query;

  if (!projectId || typeof projectId !== 'string') {
    return res.status(400).json({ error: 'Invalid project ID' });
  }

  try {
    logger.info('[API] Updating technology details', {
      projectId,
      updateKeys: Object.keys(req.body),
    });

    await inventionDataService.updateMultipleFields(projectId, req.body);

    // Return the updated data
    const updatedData = await inventionDataService.getInventionData(projectId);

    logger.info('[API] Technology details updated successfully', {
      projectId,
    });

    return res.status(200).json(updatedData);
  } catch (error) {
    logger.error('[API] Error updating technology details', {
      projectId,
      error,
    });
    return res
      .status(500)
      .json({ error: 'Failed to update technology details' });
  }
}

// SECURITY: This endpoint is tenant-protected using project-based resolution
// Users can only update technology details for projects within their own tenant
export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    validate: {
      body: updateTechnologyDetailsSchema,
      bodyMethods: ['PUT'], // Only PUT needs body validation
    },
    rateLimit: 'api',
  }
);
