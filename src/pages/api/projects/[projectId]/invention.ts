import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest, RequestWithServices } from '@/types/middleware';
import { logger } from '@/server/monitoring/enhanced-logger';
import { getProjectTenantId } from '@/repositories/project/security.repository';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { z } from 'zod';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';

// Define typed schemas for complex fields
const FigureElementSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  referenceNumeral: z.string().optional(),
});

const FigureSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  fileName: z.string().optional(),
  elements: z.array(FigureElementSchema).optional(),
  displayOrder: z.number().optional(),
});

const PendingFigureSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  fileName: z.string(),
  status: z.enum(['pending', 'uploaded', 'processed']).optional(),
});

const ClaimSchema = z.object({
  id: z.string().optional(),
  claimNumber: z.number(),
  text: z.string(),
  type: z.enum(['independent', 'dependent', 'multiple-dependent']).optional(),
  parentClaimId: z.string().optional(),
  dependencies: z.array(z.number()).optional(),
});

const PriorArtItemSchema = z.object({
  id: z.string().optional(),
  patentNumber: z.string(),
  title: z.string(),
  abstract: z.string().optional(),
  publicationDate: z.string().optional(),
  relevance: z.number().optional(),
  notes: z.string().optional(),
});

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

  // Object fields - now properly typed
  // NOTE: figures are handled through normalized tables, not through invention data
  // figures: z.record(FigureSchema).optional(),
  pendingFigures: z.array(PendingFigureSchema).optional(),
  elements: z
    .record(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        figureReferences: z.array(z.string()).optional(),
      })
    )
    .optional(),
  claims: z.array(ClaimSchema).optional(), // Now properly typed
  priorArt: z.array(PriorArtItemSchema).optional(), // Now properly typed
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
  value: z.unknown(), // Use unknown instead of any, will be validated based on field
});

/**
 * API endpoint for managing invention data
 * Demonstrates the dual-write pattern for migrating away from JSON blobs
 */
const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { method } = req;
  const projectId = String(req.query.projectId);
  const userId = (req as AuthenticatedRequest).user!.id;

  // Get the request-scoped service
  const { inventionService } = (req as RequestWithServices).services;

  if (!projectId || typeof projectId !== 'string') {
    return res.status(400).json({ error: 'Invalid project ID' });
  }

  switch (method) {
    case 'GET':
      try {
        const inventionData =
          await inventionService.getInventionData(projectId);

        if (!inventionData) {
          return res.status(404).json({ error: 'No invention data found' });
        }

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
        if (method === 'PATCH') {
          const result = patchSchema.safeParse(req.body);
          if (!result.success) {
            return res.status(400).json({
              error: 'Validation failed',
              details: result.error.errors,
            });
          }
        }

        let updateData = req.body;
        // For PATCH requests, construct the update object from field/value
        if (method === 'PATCH' && req.body.field) {
          updateData = { [req.body.field]: req.body.value };
        }

        await inventionService.updateMultipleFields(projectId, updateData);

        // Return the updated data
        const updatedData = await inventionService.getInventionData(projectId);

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
};

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
