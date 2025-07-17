import { NextApiRequest, NextApiResponse } from 'next';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { CustomApiRequest } from '@/types/api';
import { AuthenticatedRequest } from '@/types/middleware';
import { z } from 'zod';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { projectIdQuerySchema } from '@/lib/validation/schemas/shared/querySchemas';
import { 
  batchUpdateDraftDocuments,
  findApplicationVersionById,
  findLatestApplicationVersionWithDocuments 
} from '@/repositories/project';
import { rebuildHtmlContent } from '@/features/patent-application/utils/patent-sections';
import { ApplicationError, ErrorCode } from '@/lib/error';

const apiLogger = createApiLogger('projects/draft/restore-version');

// Schema for version restore request
const restoreVersionSchema = z.object({
  versionId: z.string().min(1, 'Version ID is required'),
});

type RestoreVersionBody = z.infer<typeof restoreVersionSchema>;

/**
 * Handles version restore - updates draft documents with content from a specific version
 * This is done server-side to ensure consistency and prevent race conditions
 */
async function handler(
  req: CustomApiRequest<RestoreVersionBody>,
  res: NextApiResponse
): Promise<void> {
  apiLogger.logRequest(req);

  if (req.method !== 'POST') {
    apiLogger.warn('Method not allowed', { method: req.method });
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { projectId } = req.query;
  const tenantId = (req as AuthenticatedRequest).user?.tenantId;

  if (!tenantId) {
    apiLogger.warn('No tenant ID found in request');
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    // Validate request body
    const validation = restoreVersionSchema.safeParse(req.body);
    if (!validation.success) {
      apiLogger.warn('Invalid request body', {
        errors: validation.error.errors,
      });
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors,
      });
    }

    const { versionId } = validation.data;

    apiLogger.info('Restoring version', {
      projectId,
      versionId,
    });

    // Fetch the specific version with documents
    const version = await findApplicationVersionById(
      versionId,
      String(projectId),
      tenantId
    );
    
    if (!version) {
      throw new ApplicationError(
        ErrorCode.DB_RECORD_NOT_FOUND,
        'Version not found'
      );
    }

    // Verify the version belongs to this project
    if (version.projectId !== String(projectId)) {
      throw new ApplicationError(
        ErrorCode.AUTH_FORBIDDEN,
        'Version does not belong to this project'
      );
    }

    // Extract documents from version
    const updates: Array<{ type: string; content: string }> = [];

    if ('documents' in version && Array.isArray(version.documents)) {
      version.documents.forEach((doc: any) => {
        if (doc.type && doc.content != null) {
          updates.push({
            type: doc.type,
            content: doc.content,
          });
        }
      });
    }

    if (updates.length === 0) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_FAILED,
        'No content found in the selected version'
      );
    }

    // Rebuild content from sections
    const sectionDocuments: Record<string, string> = {};
    updates.forEach(update => {
      sectionDocuments[update.type] = update.content;
    });

    const fullContent = rebuildHtmlContent(sectionDocuments) || '';

    // Batch update all documents at once
    const count = await batchUpdateDraftDocuments(String(projectId), updates);

    apiLogger.info('Version restored successfully', {
      projectId,
      versionId,
      versionName: version.name,
      documentCount: count,
    });

    // Return the rebuilt content so the client can update immediately
    res.status(200).json({ 
      success: true,
      content: fullContent,
      versionName: version.name,
      documentCount: count,
    });
  } catch (error) {
    apiLogger.logError(error as Error, {
      projectId: String(projectId),
      operation: 'restoreVersion',
    });
    
    if (error instanceof ApplicationError) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to restore version' });
    }
  }
}

// Use the secure preset with tenant protection
export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    validate: {
      query: projectIdQuerySchema,
    },
  }
); 