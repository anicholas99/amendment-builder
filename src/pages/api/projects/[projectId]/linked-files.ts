import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest } from '@/types/middleware';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { logger } from '@/server/logger';
import { z } from 'zod';

const querySchema = z.object({
  projectId: z.string().uuid(),
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Only GET requests are accepted',
    });
  }

  try {
    const { projectId } = querySchema.parse(req.query);
    const { tenantId } = req.user!;

    if (!tenantId) {
      throw new Error(
        'Tenant ID is required but was not provided by middleware'
      );
    }

    // Import prisma dynamically
    const { prisma } = await import('@/lib/prisma');

    if (!prisma) {
      return res.status(500).json({
        error: 'Database connection unavailable',
      });
    }

    // Fetch saved prior art directly
    const savedPriorArt = await prisma.savedPriorArt.findMany({
      where: {
        projectId,
      },
      select: {
        id: true,
        patentNumber: true,
        title: true,
        claim1: true,
      },
      orderBy: {
        savedAt: 'desc',
      },
    });

    logger.info('[LinkedFiles] Retrieved saved prior art', {
      projectId,
      priorArtCount: savedPriorArt.length,
    });

    return res.status(200).json({
      files: savedPriorArt,
    });
  } catch (error) {
    logger.error('[LinkedFiles] Failed to fetch saved prior art', {
      error: error instanceof Error ? error.message : String(error),
    });

    return res.status(500).json({
      error: 'Failed to fetch saved prior art',
    });
  }
}

// SECURITY: This endpoint is tenant-protected using project-based resolution
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
