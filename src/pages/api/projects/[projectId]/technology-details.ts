import { NextApiRequest, NextApiResponse } from 'next';
import { RequestWithServices } from '@/types/middleware';
import { logger } from '@/server/logger';
import { AuthenticatedRequest } from '@/types/middleware';
import { z } from 'zod';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { apiResponse } from '@/utils/api/responses';

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

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { inventionService } = (req as RequestWithServices).services;
  const { projectId } = req.query;

  if (!projectId || typeof projectId !== 'string') {
    return res.status(400).json({ error: 'Invalid project ID' });
  }

  try {
    logger.info('[API] Updating technology details', {
      projectId,
      updateKeys: Object.keys(req.body),
    });

    await inventionService.updateMultipleFields(projectId, req.body);

    // Return the updated data
    const updatedData = await inventionService.getInventionData(projectId);

    logger.info('[API] Technology details updated successfully', {
      projectId,
    });

    return apiResponse.ok(res, updatedData);
  } catch (error) {
    logger.error('[API] Error updating technology details', {
      projectId,
      error,
    });
    return apiResponse.serverError(res, {
      error: 'Failed to update technology details',
    });
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
