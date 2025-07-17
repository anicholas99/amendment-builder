import { NextApiRequest, NextApiResponse } from 'next';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { AuthenticatedRequest } from '@/types/middleware';
import {
  findDraftDocumentsByProject,
  upsertDraftDocument,
  batchUpdateDraftDocuments,
  deleteDraftDocumentsByProject,
} from '@/repositories/project';
import { CustomApiRequest } from '@/types/api';
import { z } from 'zod';
import { projectIdQuerySchema } from '@/lib/validation/schemas/shared/querySchemas';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { prisma } from '@/lib/prisma';

const apiLogger = createApiLogger('projects/draft');

// Schema for updating a single document
const updateDocumentSchema = z.object({
  type: z.string().min(1, 'Document type is required'),
  content: z.string(),
});

// Schema for batch updates
const batchUpdateSchema = z.object({
  updates: z.array(updateDocumentSchema),
});

type UpdateDocumentBody = z.infer<typeof updateDocumentSchema>;
type BatchUpdateBody = z.infer<typeof batchUpdateSchema>;

/**
 * Handles API requests for project draft documents
 * GET: Retrieves all draft documents for a project
 * PUT: Updates a single draft document
 * POST: Batch updates multiple draft documents
 * DELETE: Deletes all draft documents for a project
 */
async function handler(
  req: CustomApiRequest<UpdateDocumentBody | BatchUpdateBody>,
  res: NextApiResponse
): Promise<void> {
  apiLogger.logRequest(req);

  const { id: userId } = (req as AuthenticatedRequest).user!;
  const { method } = req;
  const { projectId } = req.query;

  // Handle GET request - List draft documents
  if (method === 'GET') {
    try {
      apiLogger.debug('Getting draft documents', {
        projectId,
        userId,
      });

      let documents = await findDraftDocumentsByProject(String(projectId));

      // Check if we should skip auto-initialization (e.g., after a reset)
      const skipInit = req.query.skipInit === 'true';

      // If no draft documents exist and skipInit is not set, initialize from latest version
      if (documents.length === 0 && !skipInit) {
        apiLogger.info(
          'No draft documents found, checking for latest version',
          { projectId }
        );

        const {
          findLatestApplicationVersionWithDocuments,
          initializeDraftDocumentsFromVersion,
        } = await import('@/repositories/project');

        const latestVersion = await findLatestApplicationVersionWithDocuments(
          String(projectId)
        );

        if (latestVersion) {
          apiLogger.info('Initializing draft from latest version', {
            projectId,
            versionId: latestVersion.id,
          });

          await initializeDraftDocumentsFromVersion(
            String(projectId),
            latestVersion.id
          );

          // Fetch the newly created draft documents
          documents = await findDraftDocumentsByProject(String(projectId));
        } else {
          // No version exists, initialize empty draft
          apiLogger.info('No versions found, initializing empty draft', {
            projectId,
          });

          const { initializeEmptyDraftDocuments } = await import(
            '@/repositories/project'
          );
          await initializeEmptyDraftDocuments(String(projectId));

          documents = await findDraftDocumentsByProject(String(projectId));
        }
      }

      apiLogger.info('Draft documents retrieved', {
        projectId,
        userId,
        count: documents.length,
        skipInit,
        documentsPreview: documents.slice(0, 2).map(doc => ({
          id: doc.id,
          type: doc.type,
          contentLength: doc.content?.length || 0,
          hasContent: !!(doc.content && doc.content.trim().length > 0),
          contentPreview: doc.content?.substring(0, 50) + '...',
        })),
        // Additional debug when skipInit is true
        skipInitDebug: skipInit
          ? {
              allTypes: documents.map(d => d.type),
              allHaveContent: documents.every(
                d => d.content && d.content.trim().length > 0
              ),
              emptyDocs: documents
                .filter(d => !d.content || d.content.trim().length === 0)
                .map(d => d.type),
            }
          : undefined,
      });

      res.status(200).json(documents);
    } catch (error) {
      apiLogger.logError(error as Error, {
        projectId: String(projectId),
        userId,
        operation: 'getDraftDocuments',
      });
      res.status(500).json({ error: 'Failed to fetch draft documents' });
    }
    return;
  }

  // Handle PUT request - Update single draft document
  if (method === 'PUT') {
    try {
      // Validate request body
      const validation = updateDocumentSchema.safeParse(req.body);
      if (!validation.success) {
        apiLogger.warn('Invalid request body', {
          errors: validation.error.errors,
          userId,
        });
        res.status(400).json({
          error: 'Validation failed',
          details: validation.error.errors,
        });
        return;
      }

      const { type, content } = validation.data;

      apiLogger.debug('Updating draft document', {
        projectId,
        userId,
        type,
        contentLength: content.length,
      });

      const document = await upsertDraftDocument(
        String(projectId),
        type,
        content
      );

      apiLogger.info('Draft document updated', {
        projectId,
        userId,
        documentId: document.id,
        type: document.type,
      });

      res.status(200).json(document);
    } catch (error) {
      apiLogger.logError(error as Error, {
        projectId: String(projectId),
        userId,
        operation: 'updateDraftDocument',
      });
      res.status(500).json({ error: 'Failed to update draft document' });
    }
    return;
  }

  // Handle POST request - Batch update draft documents
  if (method === 'POST') {
    try {
      // Validate request body
      const validation = batchUpdateSchema.safeParse(req.body);
      if (!validation.success) {
        apiLogger.warn('Invalid request body', {
          errors: validation.error.errors,
          userId,
        });
        res.status(400).json({
          error: 'Validation failed',
          details: validation.error.errors,
        });
        return;
      }

      const { updates } = validation.data;

      apiLogger.debug('Batch updating draft documents', {
        projectId,
        userId,
        updateCount: updates.length,
      });

      const count = await batchUpdateDraftDocuments(String(projectId), updates);

      apiLogger.info('Draft documents batch updated', {
        projectId,
        userId,
        count,
      });

      res.status(200).json({ success: true, count });
    } catch (error) {
      apiLogger.logError(error as Error, {
        projectId: String(projectId),
        userId,
        operation: 'batchUpdateDraftDocuments',
      });
      res.status(500).json({ error: 'Failed to batch update draft documents' });
    }
    return;
  }

  // Handle DELETE request - Delete all draft documents
  if (method === 'DELETE') {
    try {
      apiLogger.debug('Deleting all draft documents', {
        projectId,
        userId,
      });

      const count = await deleteDraftDocumentsByProject(String(projectId));

      // Update the project to indicate it no longer has patent content
      if (prisma) {
        await prisma.project.update({
          where: { id: String(projectId) },
          data: { hasPatentContent: false },
        });
        apiLogger.info('Updated hasPatentContent flag to false', { projectId });
      }

      apiLogger.info('Draft documents deleted', {
        projectId,
        userId,
        count,
      });

      res.status(200).json({
        success: true,
        count,
        message: 'All draft documents deleted successfully',
      });
    } catch (error) {
      apiLogger.logError(error as Error, {
        projectId: String(projectId),
        userId,
        operation: 'deleteDraftDocuments',
      });
      res.status(500).json({ error: 'Failed to delete draft documents' });
    }
    return;
  }

  apiLogger.warn('Method not allowed', { method: req.method, userId });
  res.status(405).json({ error: 'Method not allowed' });
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
