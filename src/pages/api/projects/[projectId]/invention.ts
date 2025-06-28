import { NextApiRequest, NextApiResponse } from 'next';
import { inventionDataService } from '@/server/services/invention-data.server-service';
import { logger } from '@/lib/monitoring/logger';
import { getProjectTenantId } from '@/repositories/project/security.repository';
import { AuthenticatedRequest } from '@/types/middleware';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { z } from 'zod';
import { SecurePresets, TenantResolvers } from '@/lib/api/securePresets';

// Validation schemas
const updateSchema = z.object({
  // Basic string fields
  title: z.string().optional(),
  summary: z.string().optional(),
  abstract: z.string().optional(),
  novelty: z.string().optional(),
  noveltyStatement: z.string().optional(),
  patentCategory: z.string().optional(),
  technicalField: z.string().optional(),

  // Array fields
  features: z.array(z.string()).optional(),
  advantages: z.array(z.string()).optional(),
  useCases: z.array(z.string()).optional(),
  processSteps: z.array(z.string()).optional(),
  futureDirections: z.array(z.string()).optional(),

  // Object fields
  figures: z.record(z.any()).optional(),
  pendingFigures: z.array(z.any()).optional(),
  elements: z.record(z.any()).optional(),
  claims: z.any().optional(), // Complex structure
  priorArt: z.any().optional(), // Complex structure
  definitions: z.record(z.string()).optional(),
  technicalImplementation: z
    .object({
      preferredEmbodiment: z.string().optional(),
      alternativeEmbodiments: z.array(z.string()).optional(),
      manufacturingMethods: z.array(z.string()).optional(),
    })
    .optional(),
  background: z
    .union([
      z.string(),
      z.object({
        technicalField: z.string().optional(),
        problemStatement: z.string().optional(),
        existingSolutions: z.array(z.string()).optional(),
      }),
    ])
    .optional(),
});

const patchSchema = z.object({
  field: z.string().min(1, 'Field name is required'),
  value: z.any(),
});

/**
 * API endpoint for managing invention data
 * Demonstrates the dual-write pattern for migrating away from JSON blobs
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { projectId } = req.query;

  if (!projectId || typeof projectId !== 'string') {
    return res.status(400).json({ error: 'Invalid project ID' });
  }

  switch (req.method) {
    case 'GET':
      try {
        logger.info('[API] Getting invention data', { projectId });
        logger.debug(
          '[INVENTION API] Starting getInventionData call for project:',
          { projectId }
        );
        const inventionData =
          await inventionDataService.getInventionData(projectId);

        logger.debug('[INVENTION API] Raw inventionData received:', {
          projectId,
          hasData: !!inventionData,
          inventionDataKeys: inventionData ? Object.keys(inventionData) : [],
          hasFigures: !!inventionData?.figures,
          figuresKeys: inventionData?.figures
            ? Object.keys(inventionData.figures)
            : [],
          hasElements: !!inventionData?.elements,
          elementsKeys: inventionData?.elements
            ? Object.keys(inventionData.elements)
            : [],
        });

        if (!inventionData) {
          logger.debug(
            '[INVENTION API] No invention data found, returning 404'
          );
          return res.status(404).json({ error: 'No invention data found' });
        }

        logger.debug('[INVENTION API] Returning invention data to frontend');
        return res.status(200).json(inventionData);
      } catch (error) {
        logger.error('[API] Error getting invention data', {
          projectId,
          error,
        });
        return res.status(500).json({ error: 'Failed to get invention data' });
      }

    case 'PUT':
    case 'PATCH':
      try {
        // Validate PATCH requests differently
        if (req.method === 'PATCH') {
          const result = patchSchema.safeParse(req.body);
          if (!result.success) {
            return res.status(400).json({
              error: 'Validation failed',
              details: result.error.errors,
            });
          }
        }

        // Log the raw request body
        logger.debug('[API] Raw request body received', {
          projectId,
          method: req.method,
          bodyKeys: Object.keys(req.body || {}),
          body: req.body,
        });

        let updateData = req.body;
        // For PATCH requests, construct the update object from field/value
        if (req.method === 'PATCH' && req.body.field) {
          updateData = { [req.body.field]: req.body.value };
        }

        logger.debug('[API] Processed update data', {
          projectId,
          method: req.method,
          updateDataKeys: Object.keys(updateData || {}),
          updateData,
        });

        await inventionDataService.updateMultipleFields(projectId, updateData);

        // Return the updated data
        const updatedData =
          await inventionDataService.getInventionData(projectId);

        logger.info('[API] Update successful, returning data', {
          projectId,
          hasUpdatedData: !!updatedData,
          novelty: updatedData?.novelty,
          noveltyStatement: updatedData?.noveltyStatement,
        });

        return res.status(200).json(updatedData);
      } catch (error) {
        logger.error('[API] Error updating invention data', {
          projectId,
          error,
        });
        return res
          .status(500)
          .json({ error: 'Failed to update invention data' });
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'PATCH']);
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// SECURITY: This endpoint is tenant-protected using project-based resolution
// Users can only access/modify invention data for projects within their own tenant
export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    validate: {
      body: updateSchema, // PUT validation
      bodyMethods: ['PUT'], // PATCH is validated in handler
    },
    rateLimit: 'api',
  }
);
