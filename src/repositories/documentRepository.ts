import { Prisma, Document } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';

/**
 * Finds a single document based on its associated project ID and type.
 * @param projectId The ID of the project.
 * @param documentType The type of the document.
 * @returns A promise resolving to the Document or null if not found.
 */
export async function findDocumentByProjectIdAndType(
  projectId: string,
  documentType: string
): Promise<Document | null> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  return prisma.document.findFirst({
    where: {
      applicationVersion: {
        projectId: projectId,
      },
      type: documentType,
    },
    orderBy: {
      updatedAt: 'desc', // Get the most recently updated document
    },
  });
}

/**
 * Creates a new document.
 * @param data Document creation data (applicationVersionId required).
 * @returns A promise resolving to the newly created document.
 */
export async function createDocument(
  data: Prisma.DocumentCreateInput
): Promise<Document> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  // Ensure content is correctly typed if necessary, assuming string for now based on API usage
  const createData = {
    ...data,
    content:
      typeof data.content === 'string'
        ? data.content
        : JSON.stringify(data.content ?? {}),
  };
  return prisma.document.create({ data: createData });
}

/**
 * Updates an existing document by its ID.
 * @param documentId The ID of the document to update.
 * @param data Data to update (e.g., { content: string }).
 * @returns A promise resolving to the updated document.
 */
export async function updateDocument(
  documentId: string,
  data: Prisma.DocumentUpdateInput
): Promise<Document> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  // Ensure content is correctly typed if necessary
  const updateData = { ...data };
  if (updateData.content !== undefined) {
    updateData.content =
      typeof updateData.content === 'string'
        ? updateData.content
        : JSON.stringify(updateData.content ?? {});
  }
  // Add updatedAt timestamp update automatically
  updateData.updatedAt = new Date();

  return prisma.document.update({
    where: { id: documentId },
    data: updateData,
  });
}

/**
 * Finds or creates an application version for a project
 * @param projectId The project ID
 * @param userId The user ID
 * @returns A promise resolving to the application version ID
 */
export async function findOrCreateApplicationVersion(
  projectId: string,
  userId: string
): Promise<string> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  // First, try to find an existing application version
  const existingVersion = await prisma.applicationVersion.findFirst({
    where: {
      projectId: projectId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (existingVersion) {
    return existingVersion.id;
  }

  // If none exists, create a new one
  const newVersion = await prisma.applicationVersion.create({
    data: {
      project: { connect: { id: projectId } },
      user: { connect: { id: userId } },
      name: 'Initial Version',
    },
  });

  return newVersion.id;
}

/**
 * Find document with authorization check - includes project tenant info
 * @param documentId The document ID
 * @param userId The user ID for authorization check
 * @returns Document with project authorization info or null if not found/unauthorized
 */
export async function findDocumentWithAuth(
  documentId: string,
  userId: string
): Promise<{
  id: string;
  content: string | null;
  applicationVersion: {
    project: {
      userId: string;
      tenantId: string;
    };
  };
} | null> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  try {
    logger.debug(
      `Repository: Finding document with auth: ${documentId}, user: ${userId}`
    );

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: {
        id: true,
        content: true,
        applicationVersion: {
          select: {
            project: {
              select: {
                userId: true,
                tenantId: true,
              },
            },
          },
        },
      },
    });

    if (!document) {
      logger.debug(`Repository: Document not found: ${documentId}`);
      return null;
    }

    // Check authorization
    if (document.applicationVersion.project.userId !== userId) {
      logger.debug(
        `Repository: User ${userId} not authorized for document ${documentId}`
      );
      return null;
    }

    logger.debug(`Repository: Found document with auth: ${documentId}`);
    return document;
  } catch (error) {
    logger.error('Failed to find document with auth', {
      error,
      documentId,
      userId,
    });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to find document with auth: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Batch update documents with authorization checks
 * @param updates Array of document updates with userId for authorization
 * @param userId The user ID for authorization
 * @returns Array of successful update results
 */
export async function batchUpdateDocuments(
  updates: Array<{ documentId: string; content: string }>,
  userId: string
): Promise<Array<{ id: string; success: boolean }>> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  try {
    logger.debug(
      `Repository: Processing ${updates.length} document updates for user: ${userId}`
    );

    // Extract valid document IDs
    const validUpdates = updates.filter(
      update => update.documentId && typeof update.content === 'string'
    );

    if (validUpdates.length === 0) {
      logger.warn(`Repository: No valid updates provided`, { userId });
      return [];
    }

    const documentIds = validUpdates.map(u => u.documentId);

    // Fetch all documents in a single query with authorization info
    const documents = await prisma.document.findMany({
      where: {
        id: { in: documentIds },
      },
      select: {
        id: true,
        applicationVersion: {
          select: {
            project: {
              select: {
                userId: true,
                tenantId: true,
              },
            },
          },
        },
      },
    });

    // Create a map for quick lookup
    const documentMap = new Map(documents.map(doc => [doc.id, doc]));

    // Filter authorized updates
    const authorizedUpdates = validUpdates.filter(update => {
      const doc = documentMap.get(update.documentId);
      if (!doc) {
        logger.warn(`Repository: Document not found`, {
          userId,
          documentId: update.documentId,
        });
        return false;
      }
      if (doc.applicationVersion.project.userId !== userId) {
        logger.warn(`Repository: User not authorized for document`, {
          userId,
          documentId: update.documentId,
        });
        return false;
      }
      return true;
    });

    if (authorizedUpdates.length === 0) {
      logger.info(`Repository: No authorized documents to update`);
      return [];
    }

    // Perform batch update in a transaction
    const updatePromises = authorizedUpdates.map(update =>
      prisma!.document.update({
        where: { id: update.documentId },
        data: {
          content: update.content,
          updatedAt: new Date(),
        },
        select: { id: true },
      })
    );

    const updatedDocuments = await prisma!.$transaction(updatePromises);

    // Build results array
    const results = updatedDocuments.map(doc => ({
      id: doc.id,
      success: true,
    }));

    logger.info(
      `Repository: Batch update completed: ${results.length}/${updates.length} successful`
    );
    return results;
  } catch (error) {
    logger.error('Failed to batch update documents', {
      error,
      userId,
      updateCount: updates.length,
    });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to batch update documents: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
