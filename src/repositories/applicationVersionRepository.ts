import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/monitoring/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { Document } from '@prisma/client';

/**
 * Update application version timestamp to make it the current/latest version
 * @param versionId The application version ID
 * @param projectId The project ID for verification
 * @param tenantId The tenant ID for verification
 * @returns Updated application version with documents
 */
export async function updateApplicationVersionTimestamp(
  versionId: string,
  projectId: string,
  tenantId: string
): Promise<{
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  projectId: string;
  documents: Array<{
    id: string;
    type: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
} | null> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  try {
    logger.debug(
      `Repository: Updating application version timestamp: ${versionId}, project: ${projectId}, tenant: ${tenantId}`
    );

    // First verify the version exists and belongs to the project/tenant
    const existingVersion = await prisma.applicationVersion.findFirst({
      where: {
        id: versionId,
        projectId: projectId,
        project: {
          tenantId: tenantId,
        },
      },
      select: { id: true },
    });

    if (!existingVersion) {
      logger.warn(
        `Repository: Application version not found or access denied: ${versionId}`
      );
      return null;
    }

    // Update the timestamp to make it the latest
    const updatedVersion = await prisma.applicationVersion.update({
      where: {
        id: versionId,
      },
      data: {
        createdAt: new Date(), // Set to current time to make it the latest
      },
      include: {
        documents: true,
      },
    });

    logger.info(
      `Repository: Successfully updated application version timestamp: ${versionId}`
    );

    // Map the Prisma result to match the expected return type
    return {
      id: updatedVersion.id,
      name: updatedVersion.name || '',
      createdAt: updatedVersion.createdAt,
      updatedAt: new Date(), // ApplicationVersion might not have updatedAt, using current time
      projectId: updatedVersion.projectId,
      documents: updatedVersion.documents.map((doc: Document) => ({
        id: doc.id,
        type: doc.type,
        content: doc.content || '',
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      })),
    };
  } catch (error) {
    logger.error('Failed to update application version timestamp', {
      error,
      versionId,
      projectId,
      tenantId,
    });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to update application version: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Find application version with documents and verify access
 * @param versionId The application version ID
 * @param projectId The project ID for verification
 * @param tenantId The tenant ID for verification
 * @returns Application version with documents or null if not found/unauthorized
 */
export async function findApplicationVersionWithAccess(
  versionId: string,
  projectId: string,
  tenantId: string
): Promise<{
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  projectId: string;
  project: {
    tenantId: string;
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
      `Repository: Finding application version with access: ${versionId}, project: ${projectId}, tenant: ${tenantId}`
    );

    const version = await prisma.applicationVersion.findFirst({
      where: {
        id: versionId,
        projectId: projectId,
        project: {
          tenantId: tenantId,
        },
      },
      include: {
        project: {
          select: {
            tenantId: true,
          },
        },
      },
    });

    if (!version) {
      logger.debug(
        `Repository: Application version not found or access denied: ${versionId}`
      );
      return null;
    }

    logger.debug(`Repository: Found application version: ${versionId}`);

    // Map the Prisma result to match the expected return type
    return {
      id: version.id,
      name: version.name || '',
      createdAt: version.createdAt,
      updatedAt: new Date(), // ApplicationVersion might not have updatedAt, using current time
      projectId: version.projectId,
      project: {
        tenantId: version.project.tenantId,
      },
    };
  } catch (error) {
    logger.error('Failed to find application version with access', {
      error,
      versionId,
      projectId,
      tenantId,
    });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to find application version: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Update or create document for an application version
 * @param versionId The application version ID
 * @param projectId The project ID for verification
 * @param tenantId The tenant ID for verification
 * @param documentType The type of document
 * @param content The document content
 * @returns Updated/created document info
 */
export async function updateVersionDocument(
  versionId: string,
  projectId: string,
  tenantId: string,
  documentType: string,
  content: string
): Promise<{
  id: string;
  type: string;
  updatedAt: Date;
}> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  try {
    logger.debug(
      `Repository: Updating version document: ${versionId}, type: ${documentType}`
    );

    // Verify the version exists and belongs to the correct project/tenant
    const version = await findApplicationVersionWithAccess(
      versionId,
      projectId,
      tenantId
    );
    if (!version) {
      throw new ApplicationError(
        ErrorCode.DB_QUERY_ERROR,
        'Version not found or access denied'
      );
    }

    // Check if document already exists
    const existingDocument = await prisma.document.findFirst({
      where: {
        applicationVersionId: versionId,
        type: documentType,
      },
    });

    let document;
    if (existingDocument) {
      // Update existing document
      document = await prisma.document.update({
        where: {
          id: existingDocument.id,
        },
        data: {
          content: content,
          updatedAt: new Date(),
        },
      });
      logger.info(
        `Repository: Updated existing document ${documentType} for version ${versionId}`
      );
    } else {
      // Create new document
      document = await prisma.document.create({
        data: {
          applicationVersionId: versionId,
          type: documentType,
          content: content,
        },
      });
      logger.info(
        `Repository: Created new document ${documentType} for version ${versionId}`
      );
    }

    // Update the project's last modified timestamp
    await prisma.project.update({
      where: { id: projectId },
      data: { updatedAt: new Date() },
    });

    return {
      id: document.id,
      type: document.type,
      updatedAt: document.updatedAt,
    };
  } catch (error) {
    logger.error('Failed to update version document', {
      error,
      versionId,
      projectId,
      tenantId,
      documentType,
    });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to update version document: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Delete application version by ID with access control
 * @param versionId The application version ID to delete
 * @param projectId The project ID for verification
 * @param tenantId The tenant ID for verification
 * @returns True if deleted successfully
 */
export async function deleteApplicationVersionWithAccess(
  versionId: string,
  projectId: string,
  tenantId: string
): Promise<boolean> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  try {
    logger.debug(
      `Repository: Deleting application version: ${versionId}, project: ${projectId}, tenant: ${tenantId}`
    );

    // First verify the version exists and belongs to the project/tenant
    const version = await findApplicationVersionWithAccess(
      versionId,
      projectId,
      tenantId
    );
    if (!version) {
      logger.warn(
        `Repository: Application version not found for deletion: ${versionId}`
      );
      return false;
    }

    // Delete the application version (cascade will delete associated documents)
    await prisma.applicationVersion.delete({
      where: {
        id: versionId,
      },
    });

    logger.info(
      `Repository: Successfully deleted application version: ${versionId}`
    );
    return true;
  } catch (error) {
    logger.error('Failed to delete application version', {
      error,
      versionId,
      projectId,
      tenantId,
    });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to delete application version: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Reset (delete all) application versions for a project
 * @param projectId The project ID
 * @param userId The user ID for verification
 * @param tenantId The tenant ID for verification
 * @returns Number of versions deleted
 */
export async function resetApplicationVersionsForProject(
  projectId: string,
  userId: string,
  tenantId: string
): Promise<number> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    logger.debug(
      `Repository: Resetting all application versions for project: ${projectId}, user: ${userId}, tenant: ${tenantId}`
    );

    // First verify the project exists and belongs to the user/tenant
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: userId,
        tenantId: tenantId,
      },
      select: { id: true },
    });

    if (!project) {
      logger.warn(
        `Repository: Project not found or access denied: ${projectId}`
      );
      throw new ApplicationError(
        ErrorCode.DB_RECORD_NOT_FOUND,
        'Project not found or access denied'
      );
    }

    // Delete all application versions for the project (cascade will delete documents)
    const result = await prisma.applicationVersion.deleteMany({
      where: {
        projectId: projectId,
      },
    });

    logger.info(
      `Repository: Successfully deleted ${result.count} application versions for project: ${projectId}`
    );

    // Update the project's last modified timestamp
    await prisma.project.update({
      where: { id: projectId },
      data: { updatedAt: new Date() },
    });

    return result.count;
  } catch (error) {
    // If it's already an ApplicationError, re-throw it
    if (error instanceof ApplicationError) {
      throw error;
    }

    logger.error('Failed to reset application versions', {
      error,
      projectId,
      userId,
      tenantId,
    });

    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to reset application versions: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
