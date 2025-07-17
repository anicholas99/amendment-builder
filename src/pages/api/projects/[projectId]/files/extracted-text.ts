import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest } from '@/types/middleware';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/server/logger';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const querySchema = z.object({
  projectId: z.string().uuid(),
});

const bodySchema = z.object({
  fileIds: z.array(z.string().uuid()),
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Only POST requests are accepted',
    });
  }

  try {
    const { projectId } = querySchema.parse(req.query);
    const { fileIds } = bodySchema.parse(req.body);
    const { tenantId } = req.user!;

    if (!tenantId) {
      throw new Error(
        'Tenant ID is required but was not provided by middleware'
      );
    }

    if (!prisma) {
      throw new ApplicationError(
        ErrorCode.INTERNAL_ERROR,
        'Database connection unavailable'
      );
    }

    logger.info('[ExtractedText] Fetching extracted text for files', {
      projectId,
      fileCount: fileIds.length,
    });

    // Fetch the extracted text from ProjectDocument records (the correct table for uploaded files)
    const files = await prisma.projectDocument.findMany({
      where: {
        id: { in: fileIds },
        projectId,
        project: {
          tenantId, // Ensure tenant security
        },
      },
      select: {
        id: true,
        fileName: true,
        extractedText: true,
      },
    });

    // Transform to the expected format
    const result: {
      [fileId: string]: { name: string; extractedText: string | null };
    } = {};

    files.forEach(file => {
      result[file.id] = {
        name: file.fileName || 'Untitled Document',
        extractedText: file.extractedText,
      };
    });

    logger.info('[ExtractedText] Retrieved extracted text', {
      projectId,
      fileCount: files.length,
      filesWithText: files.filter(f => f.extractedText).length,
    });

    return res.status(200).json(result);
  } catch (error) {
    logger.error('[ExtractedText] Failed to fetch extracted text', {
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
      message: 'Failed to fetch extracted text',
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
