import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest } from '@/types/middleware';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { logger } from '@/server/logger';
import { z } from 'zod';
import { apiResponse } from '@/utils/api/responses';
import { projectDocumentRepository } from '@/repositories/projectDocumentRepository';

const querySchema = z.object({
  projectId: z.string().uuid(),
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return apiResponse.methodNotAllowed(res, ['GET']);
  }

  try {
    const { projectId } = querySchema.parse(req.query);
    const { tenantId } = req.user!;

    if (!tenantId) {
      throw new Error(
        'Tenant ID is required but was not provided by middleware'
      );
    }

    // Fetch project documents
    const documents =
      await projectDocumentRepository.findByProjectId(projectId);

    logger.info('[ProjectDocuments] Retrieved project documents', {
      projectId,
      documentCount: documents.length,
    });

    return apiResponse.ok(res, {
      documents: documents.map(doc => ({
        id: doc.id,
        fileName: doc.fileName,
        originalName: doc.originalName,
        fileType: doc.fileType,
        createdAt: doc.createdAt,
        uploadedBy: doc.uploadedBy,
      })),
    });
  } catch (error) {
    logger.error('[ProjectDocuments] Failed to fetch project documents', {
      error: error instanceof Error ? error.message : String(error),
    });

    return apiResponse.serverError(
      res,
      new Error('Failed to fetch project documents')
    );
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
