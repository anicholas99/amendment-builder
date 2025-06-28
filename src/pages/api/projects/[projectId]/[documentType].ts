import { NextApiResponse, NextApiRequest } from 'next';
import { AuthenticatedRequest } from '@/types/middleware';
import { z } from 'zod';
import { logger } from '../../../../lib/monitoring/logger';
import { CustomApiRequest } from '@/types/api';
import { safeJsonParse } from '@/utils/json-utils';
import { documentTypeQuerySchema } from '@/lib/validation/schemas/shared/querySchemas';
import { createApiLogger } from '@/lib/monitoring/apiLogger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { SecurePresets, TenantResolvers } from '@/lib/api/securePresets';
import { sendSafeErrorResponse } from '@/utils/secure-error-response';

// Domain interface for Document (replacing Prisma import)
interface DocumentEntity {
  id: string;
  type: string;
  content: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// Import repositories
import {
  secureUpdateProject as updateProjectTimestamp,
  getProjectTenantId,
} from '../../../../repositories/project';
import {
  findDocumentByProjectIdAndType,
  createDocument,
  updateDocument,
  findOrCreateApplicationVersion,
} from '../../../../repositories/documentRepository';

// Define request body type for PUT requests
interface UpdateDocumentBody {
  content: unknown;
}

// Helper function for database retry logic (can potentially wrap repo calls)
async function withDatabaseRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let retries = maxRetries;
  const RETRY_DELAY = 1000; // 1 second

  while (true) {
    try {
      return await operation();
    } catch (error: unknown) {
      if (retries <= 0) {
        throw error;
      }

      retries--;
      logger.warn(
        `Database operation failed, retrying... (${retries} attempts left)`
      );
      // Use proper async delay instead of setTimeout
      await new Promise(resolve => {
        const timer = setImmediate(() => {
          clearImmediate(timer);
          resolve(void 0);
        });
      });
    }
  }
}

// Transform response data
const transformDocument = (document: DocumentEntity) => {
  if (!document) return null;

  // Special handling for FULL_CONTENT - it's plain text, not JSON
  if (document.type === 'FULL_CONTENT') {
    return {
      ...document,
      content: document.content || '',
    };
  }

  // For other document types, parse as JSON
  if (document.content) {
    const content = safeJsonParse(document.content as string);
    if (content === undefined) {
      logger.error('Error parsing document content:', {
        documentId: document.id,
        documentType: document.type,
        dataPreview: (document.content as string).substring(0, 100),
      });
      // Throw error to be caught by the handler's error handling
      throw new ApplicationError(
        ErrorCode.VALIDATION_INVALID_FORMAT,
        `Invalid JSON content in document ${document.id}`
      );
    }
    return {
      ...document,
      content,
    };
  }

  // No content case
  return {
    ...document,
    content: {},
  };
};

// Validation schema for PUT requests
const putSchema = z.object({
  // Document content can be various structures:
  // - For FULL_CONTENT: plain string
  // - For other types: valid JSON structure (object, array, etc)
  content: z.union([
    z.string(), // For FULL_CONTENT documents
    z.record(z.unknown()), // For JSON objects
    z.array(z.unknown()), // For JSON arrays
    z.number(), // For numeric values
    z.boolean(), // For boolean values
    z.null(), // For null values
  ]),
});

async function handler(
  req: CustomApiRequest<UpdateDocumentBody>,
  res: NextApiResponse
): Promise<void> {
  const { method } = req;
  const { projectId, documentType } = req.query as z.infer<
    typeof documentTypeQuerySchema
  >;

  // User is guaranteed by middleware
  const { id: userId } = (req as AuthenticatedRequest).user!;

  try {
    // Now handle different methods
    switch (method) {
      case 'GET':
        try {
          // Use document repo, wrap with retry
          const document = await withDatabaseRetry(() =>
            findDocumentByProjectIdAndType(projectId, documentType)
          );

          if (!document) {
            res.status(404).json({ error: 'Document not found' });
            return;
          }

          try {
            const transformedDocument = transformDocument(document);
            res.status(200).json(transformedDocument);
          } catch (transformError) {
            logger.error('Failed to transform document:', {
              error:
                transformError instanceof Error
                  ? transformError
                  : new Error(String(transformError)),
              projectId,
              documentType,
            });
            sendSafeErrorResponse(
              res,
              transformError,
              400,
              'Invalid document format'
            );
          }
        } catch (error) {
          logger.error('Failed to get document:', {
            error: error instanceof Error ? error : new Error(String(error)),
          });
          sendSafeErrorResponse(res, error, 500, 'Failed to retrieve document');
        }
        break;

      case 'PUT':
        try {
          const validation = putSchema.safeParse(req.body);
          if (!validation.success) {
            return res.status(400).json({
              error: 'Invalid request body',
              details: validation.error.flatten(),
            });
          }
          const { content } = validation.data;

          if (!content) {
            res.status(400).json({ error: 'Content is required' });
            return;
          }

          // Prepare content for saving
          let contentToSave;
          if (documentType === 'FULL_CONTENT') {
            // For FULL_CONTENT, save as plain text string
            contentToSave =
              typeof content === 'string' ? content : String(content);
          } else {
            // For other document types, stringify the JSON
            contentToSave = JSON.stringify(content);
          }

          // Check if document exists
          const existingDocument = await withDatabaseRetry(() =>
            findDocumentByProjectIdAndType(projectId, documentType)
          );

          let document;
          if (existingDocument) {
            // Update existing document
            document = await withDatabaseRetry(() =>
              updateDocument(existingDocument.id, { content: contentToSave })
            );
          } else {
            // Document doesn't exist, find or create an ApplicationVersion first
            const applicationVersionId = await withDatabaseRetry(() =>
              findOrCreateApplicationVersion(projectId, userId)
            );

            // Create new document with appropriate applicationVersion connection
            document = await withDatabaseRetry(() =>
              createDocument({
                applicationVersion: { connect: { id: applicationVersionId } },
                type: documentType,
                content: contentToSave,
              })
            );
          }

          // Also update the project's updatedAt timestamp
          // Get tenant context for secure update
          const { tenantId } = (req as AuthenticatedRequest).user!;
          if (tenantId) {
            await withDatabaseRetry(() =>
              updateProjectTimestamp(projectId, tenantId, userId, {
                updatedAt: new Date(),
              })
            );
          }

          try {
            const transformedDocument = transformDocument(document);
            res.status(200).json(transformedDocument);
          } catch (transformError) {
            logger.error('Failed to transform saved document:', {
              error:
                transformError instanceof Error
                  ? transformError
                  : new Error(String(transformError)),
              projectId,
              documentType,
            });
            sendSafeErrorResponse(
              res,
              transformError,
              400,
              'Document saved but format validation failed'
            );
          }
        } catch (error) {
          logger.error('Failed to update document:', {
            error: error instanceof Error ? error : new Error(String(error)),
          });
          sendSafeErrorResponse(res, error, 500, 'Failed to update document');
        }
        break;

      default:
        res.setHeader('Allow', ['GET', 'PUT']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    logger.error('Error processing document request:', {
      error: error instanceof Error ? error : new Error(String(error)),
    });
    sendSafeErrorResponse(
      res,
      error,
      500,
      'Failed to process document request'
    );
  }
}

// Use the new secure preset
export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    validate: {
      query: documentTypeQuerySchema,
    },
  }
);
