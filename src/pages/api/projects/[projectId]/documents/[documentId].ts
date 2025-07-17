import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest } from '@/types/middleware';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { logger } from '@/server/logger';
import { z } from 'zod';
import { projectDocumentRepository } from '@/repositories/projectDocumentRepository';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { apiResponse } from '@/utils/api/responses';

const querySchema = z.object({
  projectId: z.string().uuid(),
  documentId: z.string().uuid(),
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return apiResponse.methodNotAllowed(res, ['DELETE']);
  }

  try {
    const { projectId, documentId } = querySchema.parse(req.query);
    const { tenantId } = req.user!;

    if (!tenantId) {
      throw new Error(
        'Tenant ID is required but was not provided by middleware'
      );
    }

    // Verify the document belongs to this project
    const belongsToProject = await projectDocumentRepository.belongsToProject(
      documentId,
      projectId
    );

    if (!belongsToProject) {
      throw new ApplicationError(
        ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS,
        'Document not found or access denied'
      );
    }

    // Delete the document
    await projectDocumentRepository.delete(documentId);

    logger.info('[ProjectDocuments] Deleted project document', {
      projectId,
      documentId,
    });

    return apiResponse.ok(res, {
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    logger.error('[ProjectDocuments] Failed to delete project document', {
      error: error instanceof Error ? error.message : String(error),
    });

    if (error instanceof ApplicationError) {
      return apiResponse.badRequest(res, error.message);
    }

    return apiResponse.serverError(
      res,
      new Error('Failed to delete project document')
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
