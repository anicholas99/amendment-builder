import { NextApiResponse } from 'next';
import { AuthenticatedRequest } from '@/types/middleware';
import { ApplicationError } from '@/lib/error';
import { logger } from '@/server/logger';
import {
  createClaimVersionFromCurrent,
  getClaimVersionsByInvention,
} from '@/repositories/claimVersionRepository';
import { SecurePresets, type TenantResolver } from '@/server/api/securePresets';
import { z } from 'zod';

// Validation schemas
const querySchema = z.object({
  inventionId: z.string().min(1, 'inventionId is required').optional(), // Made optional for POST
});

const bodySchema = z.object({
  inventionId: z.string().min(1, 'inventionId is required'),
  name: z.string().optional(),
});

/**
 * API endpoints for claim version management
 * GET /api/claims/versions?inventionId=xxx - List all versions
 * POST /api/claims/versions - Create a new version
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { method } = req;
  const user = req.user;

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  switch (method) {
    case 'GET': {
      const { inventionId } = req.query;

      if (!inventionId || typeof inventionId !== 'string') {
        return res.status(400).json({
          error: 'inventionId is required',
        });
      }

      try {
        // Get versions for the invention
        const versions = await getClaimVersionsByInvention(inventionId);

        return res.status(200).json({
          success: true,
          data: {
            versions,
          },
        });
      } catch (error) {
        logger.error('[ClaimVersions API] Error fetching versions', {
          error,
          inventionId,
        });

        if (error instanceof ApplicationError) {
          return res.status(error.statusCode || 500).json({
            error: error.message,
          });
        }

        return res.status(500).json({
          error: 'Failed to fetch claim versions',
        });
      }
    }

    case 'POST': {
      const { inventionId, name } = req.body;

      if (!inventionId || typeof inventionId !== 'string') {
        return res.status(400).json({
          error: 'inventionId is required',
        });
      }

      try {
        // Create a new version from current claims
        const version = await createClaimVersionFromCurrent(
          inventionId,
          user.id,
          name || null
        );

        logger.info('[ClaimVersions API] Created new claim version', {
          versionId: version.id,
          inventionId,
          userId: user.id,
        });

        return res.status(201).json({
          success: true,
          data: {
            version,
          },
        });
      } catch (error) {
        logger.error('[ClaimVersions API] Error creating version', {
          error,
          inventionId,
        });

        if (error instanceof ApplicationError) {
          return res.status(error.statusCode || 500).json({
            error: error.message,
          });
        }

        return res.status(500).json({
          error: 'Failed to create claim version',
        });
      }
    }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

// Custom tenant resolver for claim versions
const claimVersionTenantResolver: TenantResolver = async req => {
  const inventionId =
    req.method === 'GET'
      ? (req.query.inventionId as string | undefined)
      : (req.body as { inventionId?: string })?.inventionId;

  if (!inventionId || typeof inventionId !== 'string') {
    return null;
  }

  try {
    // Get the invention directly from prisma
    const { prisma } = await import('@/lib/prisma');
    if (!prisma) {
      return null;
    }

    const invention = await prisma.invention.findUnique({
      where: { id: inventionId },
      include: { project: true },
    });

    if (!invention) {
      return null;
    }

    return invention.project.tenantId;
  } catch (error) {
    logger.error('[ClaimVersions API] Error resolving tenant', { error });
    return null;
  }
};

// SECURITY: This endpoint is tenant-protected using invention-based resolution
// Users can only access/create claim versions for inventions within their tenant
export default SecurePresets.tenantProtected(
  claimVersionTenantResolver,
  handler,
  {
    validate: {
      query: querySchema,
      body: bodySchema,
      bodyMethods: ['POST'], // Only POST needs body validation
    },
    rateLimit: 'api',
  }
);
