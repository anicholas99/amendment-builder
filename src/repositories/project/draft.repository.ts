import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { rebuildHtmlContent } from '@/features/patent-application/utils/patent-sections';

/**
 * Get all draft documents for a project
 * @param projectId The ID of the project
 * @returns Array of draft documents
 */
export async function findDraftDocumentsByProject(projectId: string): Promise<
  Array<{
    id: string;
    projectId: string;
    type: string;
    content: string | null;
    createdAt: Date;
    updatedAt: Date;
  }>
> {
  try {
    logger.debug(
      `Repository: Finding draft documents for project: ${projectId}`
    );

    const documents = await prisma!.draftDocument.findMany({
      where: { projectId },
      orderBy: { type: 'asc' },
    });

    logger.debug(
      `Repository: Found ${documents.length} draft documents for project: ${projectId}`
    );
    return documents;
  } catch (error) {
    logger.error('Failed to find draft documents', { error, projectId });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to find draft documents: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Get a specific draft document by project and type
 * @param projectId The ID of the project
 * @param type The document type
 * @returns Draft document or null if not found
 */
export async function findDraftDocumentByType(
  projectId: string,
  type: string
): Promise<{
  id: string;
  projectId: string;
  type: string;
  content: string | null;
  createdAt: Date;
  updatedAt: Date;
} | null> {
  try {
    logger.debug(
      `Repository: Finding draft document for project: ${projectId}, type: ${type}`
    );

    const document = await prisma!.draftDocument.findUnique({
      where: {
        projectId_type: {
          projectId,
          type,
        },
      },
    });

    if (!document) {
      logger.debug(
        `Repository: No draft document found for project: ${projectId}, type: ${type}`
      );
      return null;
    }

    logger.debug(
      `Repository: Found draft document for project: ${projectId}, type: ${type}`
    );
    return document;
  } catch (error) {
    logger.error('Failed to find draft document', { error, projectId, type });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to find draft document: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Create or update a draft document
 * @param projectId The ID of the project
 * @param type The document type
 * @param content The document content
 * @returns The created/updated draft document
 */
export async function upsertDraftDocument(
  projectId: string,
  type: string,
  content: string
): Promise<{
  id: string;
  projectId: string;
  type: string;
  content: string | null;
  createdAt: Date;
  updatedAt: Date;
}> {
  try {
    logger.debug(
      `Repository: Upserting draft document for project: ${projectId}, type: ${type}`
    );

    const document = await prisma!.draftDocument.upsert({
      where: {
        projectId_type: {
          projectId,
          type,
        },
      },
      update: {
        content,
        updatedAt: new Date(),
      },
      create: {
        projectId,
        type,
        content,
      },
    });

    logger.info(
      `Repository: Upserted draft document for project: ${projectId}, type: ${type}`
    );
    return document;
  } catch (error) {
    logger.error('Failed to upsert draft document', { error, projectId, type });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to upsert draft document: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Batch update multiple draft documents
 * @param projectId The ID of the project
 * @param updates Array of document updates
 * @returns Number of documents updated
 */
export async function batchUpdateDraftDocuments(
  projectId: string,
  updates: Array<{ type: string; content: string }>
): Promise<number> {
  try {
    logger.debug(
      `Repository: Batch updating ${updates.length} draft documents for project: ${projectId}`
    );

    const results = await prisma!.$transaction(
      updates.map(update =>
        prisma!.draftDocument.upsert({
          where: {
            projectId_type: {
              projectId,
              type: update.type,
            },
          },
          update: {
            content: update.content,
            updatedAt: new Date(),
          },
          create: {
            projectId,
            type: update.type,
            content: update.content,
          },
        })
      )
    );

    logger.info(
      `Repository: Batch updated ${results.length} draft documents for project: ${projectId}`
    );
    return results.length;
  } catch (error) {
    logger.error('Failed to batch update draft documents', {
      error,
      projectId,
    });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to batch update draft documents: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Delete all draft documents for a project
 * @param projectId The ID of the project
 * @returns Number of documents deleted
 */
export async function deleteDraftDocumentsByProject(
  projectId: string
): Promise<number> {
  try {
    logger.info(
      `Repository: About to delete draft documents for project: ${projectId}`
    );

    // Check how many documents exist before deletion
    const countBefore = await prisma!.draftDocument.count({
      where: { projectId },
    });

    logger.info(
      `Repository: Found ${countBefore} draft documents to delete for project: ${projectId}`
    );

    const result = await prisma!.draftDocument.deleteMany({
      where: { projectId },
    });

    // Verify deletion worked
    const countAfter = await prisma!.draftDocument.count({
      where: { projectId },
    });

    logger.info(`Repository: Deletion complete for project: ${projectId}`, {
      projectId,
      countBefore,
      countDeleted: result.count,
      countAfter,
      deletionSuccess: countAfter === 0,
    });

    if (countAfter > 0) {
      logger.error(
        `Repository: DELETION FAILED! ${countAfter} documents still exist after deletion for project: ${projectId}`
      );
    }

    return result.count;
  } catch (error) {
    logger.error('Failed to delete draft documents', {
      error,
      projectId,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
    });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to delete draft documents: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Copy draft documents to create a new version
 * @param projectId The ID of the project
 * @param versionId The ID of the version to create documents for
 * @param userId The ID of the user creating the version
 * @returns Array of created version documents
 */
export async function copyDraftDocumentsToVersion(
  projectId: string,
  versionId: string,
  userId: string
): Promise<
  Array<{
    id: string;
    applicationVersionId: string;
    type: string;
    content: string | null;
  }>
> {
  try {
    logger.debug(
      `Repository: Copying draft documents to version for project: ${projectId}, version: ${versionId}`
    );

    // Get all draft documents
    const draftDocuments = await findDraftDocumentsByProject(projectId);

    if (draftDocuments.length === 0) {
      logger.warn(
        `Repository: No draft documents found to copy for project: ${projectId}`
      );
      return [];
    }

    // Create version documents from draft documents
    const documentsToCreate = draftDocuments.map(draft => ({
      applicationVersionId: versionId,
      type: draft.type,
      content: draft.content,
    }));

    await prisma!.document.createMany({
      data: documentsToCreate,
    });

    // Fetch the created documents
    const createdDocuments = await prisma!.document.findMany({
      where: { applicationVersionId: versionId },
      select: {
        id: true,
        applicationVersionId: true,
        type: true,
        content: true,
      },
    });

    logger.info(
      `Repository: Copied ${createdDocuments.length} documents to version: ${versionId}`
    );
    return createdDocuments;
  } catch (error) {
    logger.error('Failed to copy draft documents to version', {
      error,
      projectId,
      versionId,
    });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to copy draft documents to version: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Initialize draft documents from a version
 * @param projectId The ID of the project
 * @param versionId The ID of the version to copy from
 * @returns Number of draft documents created
 */
export async function initializeDraftDocumentsFromVersion(
  projectId: string,
  versionId: string
): Promise<number> {
  try {
    logger.debug(
      `Repository: Initializing draft documents from version: ${versionId} for project: ${projectId}`
    );

    // Get version documents
    const versionDocuments = await prisma!.document.findMany({
      where: { applicationVersionId: versionId },
      select: {
        type: true,
        content: true,
      },
    });

    if (versionDocuments.length === 0) {
      logger.warn(
        `Repository: No version documents found to initialize from version: ${versionId}`
      );
      return 0;
    }

    // Delete existing draft documents
    await deleteDraftDocumentsByProject(projectId);

    // Create draft documents from version documents
    const draftsToCreate = versionDocuments.map(doc => ({
      projectId,
      type: doc.type,
      content: doc.content,
    }));

    await prisma!.draftDocument.createMany({
      data: draftsToCreate,
    });

    logger.info(
      `Repository: Initialized ${draftsToCreate.length} draft documents for project: ${projectId}`
    );
    return draftsToCreate.length;
  } catch (error) {
    logger.error('Failed to initialize draft documents from version', {
      error,
      projectId,
      versionId,
    });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to initialize draft documents from version: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Initialize empty draft documents for a project
 * @param projectId The ID of the project
 * @returns Number of draft documents created
 */
export async function initializeEmptyDraftDocuments(
  projectId: string
): Promise<number> {
  try {
    logger.debug(
      `Repository: Initializing empty draft documents for project: ${projectId}`
    );

    // Check if draft documents already exist
    const existing = await prisma!.draftDocument.count({
      where: { projectId },
    });

    if (existing > 0) {
      logger.debug(
        `Repository: Draft documents already exist for project: ${projectId}`
      );
      return 0;
    }

    // No need to create any empty documents - sections will be created when content is generated
    logger.info(
      `Repository: No empty draft documents needed for project: ${projectId}`
    );
    return 0;
  } catch (error) {
    logger.error('Failed to initialize empty draft documents', {
      error,
      projectId,
    });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to initialize empty draft documents: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Initialize draft documents with generated sections
 * @param projectId The ID of the project
 * @param sections Object with section types as keys and content as values
 * @returns Number of draft documents created
 */
export async function initializeDraftDocumentsWithSections(
  projectId: string,
  sections: { [type: string]: string }
): Promise<number> {
  try {
    logger.info(
      `Repository: Initializing draft documents with sections for project: ${projectId}`,
      {
        projectId,
        sectionKeys: Object.keys(sections),
        sectionCount: Object.keys(sections).length,
        sectionsPreview: Object.entries(sections)
          .slice(0, 3)
          .map(([type, content]) => ({
            type,
            contentLength: content?.length || 0,
            hasContent: !!(content && content.trim().length > 0),
          })),
      }
    );

    // Delete existing draft documents
    const deletedCount = await deleteDraftDocumentsByProject(projectId);
    logger.info(
      `Repository: Deleted ${deletedCount} existing draft documents for project: ${projectId}`
    );

    // Create draft documents from sections ONLY - no FULL_CONTENT
    const draftsToCreate = Object.entries(sections)
      .filter(([_, content]) => content !== null && content !== undefined)
      .map(([type, content]) => ({
        projectId,
        type: type.toUpperCase(),
        content,
      }));

    logger.info(
      `Repository: Preparing to create ${draftsToCreate.length} draft documents`,
      {
        projectId,
        draftsToCreate: draftsToCreate.map(draft => ({
          type: draft.type,
          contentLength: draft.content?.length || 0,
          hasContent: !!(draft.content && draft.content.trim().length > 0),
        })),
      }
    );

    if (draftsToCreate.length > 0) {
      await prisma!.draftDocument.createMany({
        data: draftsToCreate,
      });

      logger.info(
        `Repository: Successfully created ${draftsToCreate.length} draft documents for project: ${projectId}`
      );

      // Verify the documents were actually created
      const verificationCount = await prisma!.draftDocument.count({
        where: { projectId },
      });

      logger.info(
        `Repository: Verification count: ${verificationCount} draft documents exist for project: ${projectId}`
      );

      if (verificationCount !== draftsToCreate.length) {
        logger.error(
          `Repository: MISMATCH! Expected ${draftsToCreate.length} but found ${verificationCount} documents`,
          {
            projectId,
            expected: draftsToCreate.length,
            actual: verificationCount,
          }
        );
      }
    } else {
      logger.warn(
        `Repository: No valid sections to create draft documents for project: ${projectId}`,
        {
          sectionsProvided: Object.keys(sections),
          sectionsFiltered: 'all sections were null/undefined',
        }
      );
    }

    logger.info(
      `Repository: Initialized ${draftsToCreate.length} draft documents for project: ${projectId}`
    );
    return draftsToCreate.length;
  } catch (error) {
    logger.error('Failed to initialize draft documents with sections', {
      error,
      projectId,
      sectionKeys: Object.keys(sections || {}),
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
    });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to initialize draft documents: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
