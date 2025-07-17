import { NextApiResponse } from 'next';
import { AuthenticatedRequest } from '@/types/middleware';
import { ApplicationError } from '@/lib/error';
import { logger } from '@/server/logger';
import {
  getClaimVersionWithSnapshots,
  restoreClaimsFromVersion,
  deleteClaimVersion,
} from '@/repositories/claimVersionRepository';
import { SecurePresets, type TenantResolver } from '@/server/api/securePresets';
import { z } from 'zod';

// Validation schemas
const querySchema = z.object({
  versionId: z.string().min(1, 'versionId is required'),
});

const restoreBodySchema = z.object({
  inventionId: z.string().min(1, 'inventionId is required'),
});

/**
 * API endpoints for specific claim version operations
 * GET /api/claims/versions/[versionId] - Get a specific version with snapshots
 * POST /api/claims/versions/[versionId]/restore - Restore claims from this version
 * DELETE /api/claims/versions/[versionId] - Delete a version
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { method } = req;
  const { versionId } = req.query;
  const user = req.user;

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!versionId || typeof versionId !== 'string') {
    return res.status(400).json({
      error: 'versionId is required',
    });
  }

  switch (method) {
    case 'GET': {
      try {
        // Get the version with snapshots
        const version = await getClaimVersionWithSnapshots(versionId);

        if (!version) {
          return res.status(404).json({
            error: 'Version not found',
          });
        }

        return res.status(200).json({
          success: true,
          data: {
            version,
          },
        });
      } catch (error) {
        logger.error('[ClaimVersion API] Error fetching version', {
          error,
          versionId,
        });

        if (error instanceof ApplicationError) {
          return res.status(error.statusCode || 500).json({
            error: error.message,
          });
        }

        return res.status(500).json({
          error: 'Failed to fetch claim version',
        });
      }
    }

    case 'POST': {
      // Handle restore action
      const { action } = req.query;

      if (action !== 'restore') {
        return res.status(400).json({
          error:
            'Invalid action. Use POST /api/claims/versions/[versionId]/restore',
        });
      }

      const { inventionId } = req.body;

      if (!inventionId || typeof inventionId !== 'string') {
        return res.status(400).json({
          error: 'inventionId is required',
        });
      }

      try {
        // Restore claims from this version
        const restoredClaims = await restoreClaimsFromVersion(
          versionId,
          inventionId
        );

        logger.info('[ClaimVersion API] Restored claims from version', {
          versionId,
          inventionId,
          claimCount: restoredClaims.length,
          userId: user.id,
        });

        return res.status(200).json({
          success: true,
          data: {
            claims: restoredClaims,
          },
        });
      } catch (error) {
        logger.error('[ClaimVersion API] Error restoring version', {
          error,
          versionId,
          inventionId,
        });

        if (error instanceof ApplicationError) {
          return res.status(error.statusCode || 500).json({
            error: error.message,
          });
        }

        return res.status(500).json({
          error: 'Failed to restore claim version',
        });
      }
    }

    case 'DELETE': {
      try {
        // Delete the version
        await deleteClaimVersion(versionId, user.id);

        logger.info('[ClaimVersion API] Deleted version', {
          versionId,
          userId: user.id,
        });

        return res.status(200).json({
          success: true,
          data: {},
        });
      } catch (error) {
        logger.error('[ClaimVersion API] Error deleting version', {
          error,
          versionId,
        });

        if (error instanceof ApplicationError) {
          return res.status(error.statusCode || 500).json({
            error: error.message,
          });
        }

        return res.status(500).json({
          error: 'Failed to delete claim version',
        });
      }
    }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

// Custom tenant resolver for claim version operations
const claimVersionTenantResolver: TenantResolver = async req => {
  const { versionId } = req.query as { versionId?: string };
  const targetInventionId = (req.body as { inventionId?: string })?.inventionId; // For POST restore

  if (!versionId || typeof versionId !== 'string') {
    return null;
  }

  try {
    // Get the version to find the invention
    const { prisma } = await import('@/lib/prisma');
    if (!prisma) {
      return null;
    }

    const version = await prisma.claimVersion.findUnique({
      where: { id: versionId },
      include: {
        invention: {
          include: {
            project: true,
          },
        },
      },
    });

    if (!version) {
      return null;
    }

    // For restore operations, also verify the target invention
    if (req.method === 'POST' && targetInventionId) {
      const targetInvention = await prisma.invention.findUnique({
        where: { id: targetInventionId },
        include: { project: true },
      });

      if (!targetInvention) {
        return null;
      }

      // Both must belong to the same tenant
      if (
        version.invention.project.tenantId !== targetInvention.project.tenantId
      ) {
        return null;
      }

      return targetInvention.project.tenantId;
    }

    return version.invention.project.tenantId;
  } catch (error) {
    logger.error('[ClaimVersion API] Error resolving tenant', { error });
    return null;
  }
};

// SECURITY: This endpoint is tenant-protected using version-based resolution
// Users can only access/restore/delete claim versions within their tenant
export default SecurePresets.tenantProtected(
  claimVersionTenantResolver,
  handler,
  {
    validate: {
      query: querySchema,
      body: restoreBodySchema,
      bodyMethods: ['POST'], // Only POST needs body validation
    },
    rateLimit: 'api',
  }
);
