import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { logger } from '../../lib/monitoring/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { rebuildHtmlContent } from '@/features/patent-application/utils/patent-sections';

/**
 * Creates a new ApplicationVersion and its associated Document records within a transaction.
 * @param projectId The ID of the project.
 * @param userId The ID of the user creating the version.
 * @param versionName Optional name for the version.
 * @param sectionsData An object where keys are Document types (e.g., 'TITLE', 'ABSTRACT') and values are the content strings.
 * @returns A promise resolving to the newly created ApplicationVersion with its documents.
 */
export async function createApplicationVersionWithDocuments(
  projectId: string,
  userId: string,
  versionName: string | null,
  sectionsData: { [type: string]: string | undefined | null }
): Promise<
  Prisma.ApplicationVersionGetPayload<{ include: { documents: true } }>
> {
  logger.debug(
    `Repository: Creating new version for project ${projectId} by user ${userId}`
  );

  const newVersionWithDocs = await prisma!.$transaction(
    async (tx: Prisma.TransactionClient) => {
      // 1. Create the ApplicationVersion record
      const newVersion = await tx.applicationVersion.create({
        data: {
          projectId: projectId,
          userId: userId,
          name: versionName ?? `Generated Version ${new Date().toISOString()}`, // Default name if null
        },
      });

      // 2. Prepare Document data - individual sections ONLY
      const documentsToCreate = Object.entries(sectionsData)
        .filter(([_, content]) => content !== null && content !== undefined) // Filter out null/undefined content
        .map(([type, content]) => ({
          applicationVersionId: newVersion.id,
          type: type.toUpperCase(), // Ensure type is uppercase to match potential conventions
          content: content as string, // Cast as string after filtering nulls
        }));

      // 3. Create Document records if any exist
      if (documentsToCreate.length > 0) {
        await tx.document.createMany({
          data: documentsToCreate,
        });
      }

      // 5. Fetch the new version including its documents to return
      const result = await tx.applicationVersion.findUnique({
        where: { id: newVersion.id },
        include: {
          documents: true, // Include the created documents
        },
      });

      if (!result) {
        throw new ApplicationError(
          ErrorCode.DB_QUERY_ERROR,
          'Failed to fetch newly created application version within transaction.'
        );
      }
      return result;
    }
  );

  logger.info(
    `Repository: Created new version ${newVersionWithDocs.id} ('${newVersionWithDocs.name}') for project ${projectId} with ${newVersionWithDocs.documents.length} documents`
  );
  return newVersionWithDocs;
}

/**
 * Creates a new ApplicationVersion from draft documents
 * @param projectId The ID of the project.
 * @param userId The ID of the user creating the version.
 * @param versionName Optional name for the version.
 * @returns A promise resolving to the newly created ApplicationVersion with its documents.
 */
export async function createApplicationVersionFromDraft(
  projectId: string,
  userId: string,
  versionName: string | null
): Promise<
  Prisma.ApplicationVersionGetPayload<{ include: { documents: true } }>
> {
  logger.debug(
    `Repository: Creating new version from draft for project ${projectId} by user ${userId}`
  );

  const newVersionWithDocs = await prisma!.$transaction(
    async (tx: Prisma.TransactionClient) => {
      // 1. Get draft documents
      const draftDocuments = await tx.draftDocument.findMany({
        where: { projectId },
      });

      if (draftDocuments.length === 0) {
        throw new ApplicationError(
          ErrorCode.DB_QUERY_ERROR,
          'No draft documents found for project'
        );
      }

      // 2. Create the ApplicationVersion record
      const newVersion = await tx.applicationVersion.create({
        data: {
          projectId: projectId,
          userId: userId,
          name: versionName ?? `Version ${new Date().toLocaleString()}`,
        },
      });

      // 3. Create Document records from draft documents
      const documentsToCreate = draftDocuments.map((draft: any) => ({
        applicationVersionId: newVersion.id,
        type: draft.type,
        content: draft.content,
      }));

      if (documentsToCreate.length > 0) {
        await tx.document.createMany({
          data: documentsToCreate,
        });
      }

      // 4. Fetch the new version including its documents to return
      const result = await tx.applicationVersion.findUnique({
        where: { id: newVersion.id },
        include: {
          documents: true,
        },
      });

      if (!result) {
        throw new ApplicationError(
          ErrorCode.DB_QUERY_ERROR,
          'Failed to fetch newly created application version within transaction.'
        );
      }
      return result;
    }
  );

  logger.info(
    `Repository: Created new version ${newVersionWithDocs.id} ('${newVersionWithDocs.name}') from draft for project ${projectId} with ${newVersionWithDocs.documents.length} documents`
  );
  return newVersionWithDocs;
}

/**
 * Finds a single ApplicationVersion by its ID, including its documents.
 * Ensures the version belongs to the specified project and tenant (implicitly via project check).
 * @param versionId The ID of the version.
 * @param projectId The ID of the project the version must belong to.
 * @param tenantId The ID of the tenant the project must belong to.
 * @returns A promise resolving to the ApplicationVersion with documents, or null if not found or access denied.
 */
export async function findApplicationVersionById(
  versionId: string,
  projectId: string,
  tenantId: string
): Promise<Prisma.ApplicationVersionGetPayload<{
  include: { documents: true };
}> | null> {
  logger.debug(
    `Repository: Finding version ${versionId} for project ${projectId} in tenant ${tenantId}`
  );

  const version = await prisma!.applicationVersion.findUnique({
    where: {
      id: versionId,
    },
    include: {
      documents: true, // Include documents
      project: {
        // Include project to verify tenant and ownership
        select: {
          tenantId: true,
          userId: true, // If you need to check userId as well
        },
      },
    },
  });

  if (!version) {
    logger.debug(`Repository: Version ${versionId} not found.`);
    return null;
  }

  // Verify the version belongs to the correct project and tenant
  if (
    version.projectId !== projectId ||
    version.project.tenantId !== tenantId
  ) {
    logger.warn(
      `Repository: Version ${versionId} found, but does not belong to project ${projectId} in tenant ${tenantId}.`
    );
    return null; // Access denied
  }

  // Optionally, verify user ownership if needed:
  // const userId = ... // Get current userId from context
  // if (version.project.userId !== userId) { ... }

  logger.debug(
    `Repository: Version ${versionId} found and verified for project ${projectId}`
  );
  // Remove the project relation before returning if not needed by the caller
  const { project, ...versionData } = version;
  return versionData as Prisma.ApplicationVersionGetPayload<{
    include: { documents: true };
  }>;
}

/**
 * Find all application versions for a project
 * @param projectId The ID of the project
 * @returns Array of application versions
 */
export async function findApplicationVersionsByProject(
  projectId: string
): Promise<
  Array<{
    id: string;
    name: string | null;
    createdAt: Date;
    projectId: string;
    userId: string;
  }>
> {
  try {
    logger.debug(
      `Repository: Finding application versions for project: ${projectId}`
    );

    const versions = await prisma!.applicationVersion.findMany({
      where: { projectId },
      select: {
        id: true,
        name: true,
        createdAt: true,
        projectId: true,
        userId: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    logger.debug(
      `Repository: Found ${versions.length} application versions for project: ${projectId}`
    );
    return versions;
  } catch (error) {
    logger.error('Failed to find application versions', { error, projectId });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to find application versions: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Find latest application version for a project with documents
 * @param projectId The ID of the project
 * @returns Latest application version with documents or null if not found
 */
export async function findLatestApplicationVersionWithDocuments(
  projectId: string
): Promise<Prisma.ApplicationVersionGetPayload<{
  include: { documents: true };
}> | null> {
  try {
    logger.debug(
      `Repository: Finding latest application version with documents for project: ${projectId}`
    );

    const latestVersion = await prisma!.applicationVersion.findFirst({
      where: { projectId },
      include: { documents: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!latestVersion) {
      logger.debug(
        `Repository: No application versions found for project: ${projectId}`
      );
      return null;
    }

    logger.debug(
      `Repository: Found latest application version for project: ${projectId}`
    );
    return latestVersion;
  } catch (error) {
    logger.error('Failed to find latest application version', {
      error,
      projectId,
    });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to find latest application version: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
