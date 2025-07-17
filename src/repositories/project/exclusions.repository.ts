import { prisma } from '../../lib/prisma';
import { logger } from '@/server/logger';
import { ProjectExclusionMetadata } from './types';

/**
 * Find all patent number exclusions for a project.
 * @param projectId The project ID.
 * @returns A promise resolving to an array of project exclusions with metadata.
 */
export async function findProjectExclusions(projectId: string) {
  try {
    logger.debug(`Repository: Finding exclusions for project ID: ${projectId}`);

    const exclusions = await prisma!.projectExclusion.findMany({
      where: { projectId },
      select: {
        id: true,
        excludedPatentNumber: true,
        createdAt: true,
        title: true,
        abstract: true,
        url: true,
        authors: true,
        publicationDate: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    logger.debug(
      `Repository: Found ${exclusions.length} exclusions for project ${projectId}`
    );
    return exclusions;
  } catch (error) {
    logger.error(
      `Repository error finding exclusions for project ${projectId}:`,
      {
        error: error instanceof Error ? error : new Error(String(error)),
      }
    );
    return [];
  }
}

/**
 * Find patent exclusions for UI display - optimized version with minimal fields.
 * This is specifically for the ExclusionsManager modal which only needs id, patentNumber, and createdAt.
 * @param projectId The project ID.
 * @returns A promise resolving to an array of minimal exclusion data.
 */
export async function findProjectExclusionsMinimal(projectId: string) {
  try {
    logger.debug(
      `Repository: Finding minimal exclusions for project ID: ${projectId}`
    );

    const exclusions = await prisma!.projectExclusion.findMany({
      where: { projectId },
      select: {
        id: true,
        excludedPatentNumber: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    logger.debug(
      `Repository: Found ${exclusions.length} minimal exclusions for project ${projectId}`
    );
    return exclusions;
  } catch (error) {
    logger.error(
      `Repository error finding minimal exclusions for project ${projectId}:`,
      {
        error: error instanceof Error ? error : new Error(String(error)),
      }
    );
    return [];
  }
}

/**
 * Adds patent numbers to a project's exclusion list, with optional metadata.
 *
 * @param projectId The ID of the project.
 * @param patentNumbers Array of patent numbers to exclude.
 * @param metadataMap Optional object mapping patent numbers to their metadata.
 * @returns Promise resolving to counts of added and skipped exclusions.
 */
export async function addProjectExclusions(
  projectId: string,
  patentNumbers: string[],
  metadataMap: Record<string, ProjectExclusionMetadata> = {}
): Promise<{ added: number; skipped: number }> {
  if (!patentNumbers || patentNumbers.length === 0) {
    logger.warn(
      `Repository: No patent numbers provided for exclusion in project ${projectId}`
    );
    return { added: 0, skipped: 0 };
  }

  try {
    // 1. Normalize and deduplicate input patent numbers
    const normalizedUniqueNumbers = Array.from(
      new Set(
        patentNumbers.map(num => String(num).replace(/-/g, '').toUpperCase())
      )
    );

    if (normalizedUniqueNumbers.length === 0) {
      logger.warn(
        `Repository: No valid, unique patent numbers after normalization for project ${projectId}`
      );
      return { added: 0, skipped: patentNumbers.length };
    }

    // 2. Find which of these numbers already exist for this project
    const existingExclusions = await prisma!.projectExclusion.findMany({
      where: {
        projectId: projectId,
        excludedPatentNumber: {
          in: normalizedUniqueNumbers,
        },
      },
      select: {
        excludedPatentNumber: true, // Select only the number for easy lookup
      },
    });
    const existingNumbersSet = new Set(
      existingExclusions.map(
        (ex: { excludedPatentNumber: string }) => ex.excludedPatentNumber
      )
    );

    // 3. Filter to get only the numbers that need to be added
    const numbersToAdd = normalizedUniqueNumbers.filter(
      num => !existingNumbersSet.has(num)
    );
    const skippedCount = normalizedUniqueNumbers.length - numbersToAdd.length;

    if (numbersToAdd.length === 0) {
      logger.info(
        `Repository: All ${normalizedUniqueNumbers.length} provided exclusions already exist for project ${projectId}.`
      );
      return { added: 0, skipped: skippedCount };
    }

    // 4. Prepare data for createMany (only for new numbers)
    const now = new Date();

    const dataToCreate = numbersToAdd.map(patentNum => {
      // Check if we have metadata for this patent number
      // If metadataMap is a direct metadata object (not keyed by patent numbers),
      // use it for all patents being excluded
      const metadata =
        typeof metadataMap === 'object' &&
        !Array.isArray(metadataMap) &&
        Object.keys(metadataMap).length > 0
          ? metadataMap[patentNum] || metadataMap // Try patent-specific or fall back to general metadata
          : {};

      return {
        projectId: projectId,
        excludedPatentNumber: patentNum,
        title: metadata.title || null,
        abstract: metadata.abstract || null,
        url: metadata.url || null,
        authors: metadata.authors || null,
        publicationDate: metadata.publicationDate || null,
        updatedAt: now,
      };
    });

    // 5. Use createMany *without* skipDuplicates
    const result = await prisma!.projectExclusion.createMany({
      data: dataToCreate,
    });

    const addedCount = result.count;

    // Warn if createMany count doesn't match expected
    if (addedCount !== numbersToAdd.length) {
      logger.warn(
        `Repository: createMany count (${addedCount}) did not match expected count (${numbersToAdd.length}) for project ${projectId}. There might be concurrent modifications or other issues.`
      );
    }

    logger.info(
      `Repository: Added ${addedCount} new exclusions (skipped ${skippedCount} existing) for project ${projectId}`
    );
    return { added: addedCount, skipped: skippedCount };
  } catch (error) {
    logger.error(
      `Repository error adding exclusions for project ${projectId}:`,
      {
        error: error instanceof Error ? error : new Error(String(error)),
      }
    );
    throw error;
  }
}

/**
 * Removes patent number from a project's exclusion list.
 * @param projectId The ID of the project.
 * @param patentNumber The patent number to remove from exclusions.
 * @returns Promise resolving to true if removed, false otherwise.
 */
export async function removeProjectExclusion(
  projectId: string,
  patentNumber: string
): Promise<boolean> {
  try {
    // Normalize the patent number before deletion
    const normalizedNumber = patentNumber.replace(/-/g, '').toUpperCase();

    const result = await prisma!.projectExclusion.deleteMany({
      where: {
        projectId: projectId,
        excludedPatentNumber: normalizedNumber,
      },
    });
    return result.count > 0;
  } catch (error) {
    logger.error(
      `Repository error removing exclusion for project ${projectId}:`,
      {
        error: error instanceof Error ? error : new Error(String(error)),
      }
    );
    return false;
  }
}

/**
 * Remove a project exclusion by ID.
 * @param projectId The project ID.
 * @param exclusionId The exclusion ID.
 * @returns Promise resolving to true if deleted, false otherwise.
 */
export async function removeProjectExclusionById(
  projectId: string,
  exclusionId: string
): Promise<boolean> {
  try {
    logger.debug(
      `Repository: Removing exclusion ${exclusionId} from project ${projectId}`
    );

    const result = await prisma!.projectExclusion.delete({
      where: {
        id: exclusionId,
        projectId: projectId, // Extra safety check
      },
    });

    return !!result;
  } catch (error) {
    logger.error(
      `Repository error removing exclusion ${exclusionId} from project ${projectId}:`,
      {
        error: error instanceof Error ? error : new Error(String(error)),
      }
    );
    return false;
  }
}
