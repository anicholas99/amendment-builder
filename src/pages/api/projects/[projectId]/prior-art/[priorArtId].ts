import { NextApiRequest, NextApiResponse } from 'next';
import { CustomApiRequest } from '@/types/api';
import { z } from 'zod';
import { logger } from '@/server/logger';
import { projectIdQuerySchema } from '@/lib/validation/schemas/shared/querySchemas';
import { PriorArtServerService } from '@/server/services/prior-art.server-service';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { apiResponse } from '@/utils/api/responses';

// Schema for path parameters
const priorArtIdQuerySchema = projectIdQuerySchema.extend({
  priorArtId: z.string().min(1, 'Prior art ID is required'),
});

/**
 * API handler for managing individual prior art items
 * Supports:
 * - DELETE: Remove a specific prior art item by ID
 */
async function handler(
  req: CustomApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { projectId, priorArtId } = (req as any).validatedQuery as z.infer<
    typeof priorArtIdQuerySchema
  >;

  // User and tenant are guaranteed by middleware
  const { id: userId, tenantId } = req.user!;

  // TypeScript safety check - middleware guarantees this
  if (!tenantId) {
    throw new Error('Tenant ID is required but was not provided by middleware');
  }

  switch (req.method) {
    case 'DELETE':
      try {
        const removed = await PriorArtServerService.removePriorArtById(
          projectId,
          priorArtId,
          userId,
          tenantId
        );

        if (!removed) {
          return apiResponse.notFound(res, 'Prior art not found');
        }

        return apiResponse.ok(res, {
          success: true,
          message: 'Prior art removed successfully',
        });
      } catch (error) {
        logger.error('Failed to remove prior art', {
          error,
          projectId,
          priorArtId,
          userId,
          tenantId,
        });
        return apiResponse.serverError(
          res,
          new Error('Failed to remove prior art')
        );
      }
      break;

    default:
      return apiResponse.methodNotAllowed(res, ['DELETE']);
  }
}

// SECURITY: This endpoint is tenant-protected using project-based resolution
// Users can only manage prior art for projects within their own tenant
export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    validate: {
      query: priorArtIdQuerySchema,
    },
    rateLimit: 'api',
  }
);
