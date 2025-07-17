import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest } from '@/types/middleware';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/server/logger';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const querySchema = z.object({
  projectId: z.string().uuid(),
  sessionId: z.string(),
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { projectId, sessionId } = querySchema.parse(req.query);
    const { id: userId } = req.user!;

    logger.info('[SessionDocuments] Fetching documents', {
      projectId,
      sessionId,
      userId,
    });

    if (!prisma) {
      throw new ApplicationError(
        ErrorCode.INTERNAL_ERROR,
        'Database unavailable'
      );
    }

    // Fetch documents for this session
    const documents = await prisma.savedPriorArt.findMany({
      where: {
        projectId,
        sessionId,
      } as any,
      select: {
        id: true,
        patentNumber: true,
        title: true,
        fileType: true,
        savedAt: true,
      } as any,
      orderBy: {
        savedAt: 'desc',
      },
    });

    logger.info('[SessionDocuments] Found documents', {
      count: documents.length,
      sessionId,
    });

    return res.status(200).json({ documents });
  } catch (error) {
    logger.error('[SessionDocuments] Failed to fetch documents', {
      error: error instanceof Error ? error.message : String(error),
    });

    if (error instanceof ApplicationError) {
      return res.status(error.statusCode || 400).json({
        error: error.code,
        message: error.message,
      });
    }

    return res.status(500).json({
      error: ErrorCode.INTERNAL_ERROR,
      message: 'Failed to fetch session documents',
    });
  }
}

export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    validate: {
      query: querySchema,
    },
  }
);
