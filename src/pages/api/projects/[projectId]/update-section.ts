import { NextApiRequest, NextApiResponse } from 'next';
import { RequestWithServices } from '@/types/middleware';
import { logger } from '@/server/logger';
import { AuthenticatedRequest } from '@/types/middleware';
import { z } from 'zod';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { apiResponse } from '@/utils/api/responses';

// Validation schema for updating sections
const updateSectionSchema = z.object({
  section: z.string().min(1, 'Section name is required'),
  data: z.any(), // Allow any data structure for flexibility
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { inventionService } = (req as RequestWithServices).services;
  const { projectId } = req.query;

  if (!projectId || typeof projectId !== 'string') {
    return res.status(400).json({ error: 'Invalid project ID' });
  }

  const { section, data } = req.body;

  try {
    logger.info('[API] Updating section', {
      projectId,
      section,
      hasData: !!data,
    });

    // Update the specific section using dedicated methods
    switch (section) {
      case 'title':
        await inventionService.updateTitle(projectId, data);
        break;
      case 'summary':
        await inventionService.updateSummary(projectId, data);
        break;
      case 'technicalField':
        await inventionService.updateTechnicalField(projectId, data);
        break;
      case 'features':
        await inventionService.updateFeatures(projectId, data);
        break;
      case 'advantages':
        await inventionService.updateAdvantages(projectId, data);
        break;
      case 'abstract':
        await inventionService.updateAbstract(projectId, data);
        break;
      case 'noveltyStatement':
      case 'novelty':
        await inventionService.updateNoveltyStatement(projectId, data);
        break;
      case 'background':
        await inventionService.updateBackground(projectId, data);
        break;
      case 'useCases':
        await inventionService.updateUseCases(projectId, data);
        break;
      case 'processSteps':
        await inventionService.updateProcessSteps(projectId, data);
        break;
      default:
        // For sections without dedicated methods, we need to handle them differently
        // This might include: figures, pendingFigures, elements, claims, priorArt, definitions, technicalImplementation
        logger.warn('[API] No dedicated update method for section', {
          section,
        });
        return res.status(400).json({
          error: `Update method for section '${section}' is not implemented. Please use specific endpoints.`,
        });
    }

    // Return the updated data
    const updatedData = await inventionService.getInventionData(projectId);

    logger.info('[API] Section updated successfully', {
      projectId,
      section,
    });

    return apiResponse.ok(res, updatedData);
  } catch (error) {
    logger.error('[API] Error updating section', {
      projectId,
      section,
      error,
    });
    return apiResponse.serverError(res, { error: 'Failed to update section' });
  }
}

// SECURITY: This endpoint is tenant-protected using project-based resolution
// Users can only update sections for projects within their own tenant
export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    validate: {
      body: updateSectionSchema,
      bodyMethods: ['PUT'], // Only PUT needs body validation
    },
    rateLimit: 'api',
  }
);
