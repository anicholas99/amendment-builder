import { prisma } from '../../lib/prisma';
import { logger } from '../../lib/monitoring/logger';
import { PriorArtInput, SavedPriorArtWithFields } from './types';
import {
  ProcessedSavedPriorArt,
  SavedPriorArt,
  PriorArtReference,
  SavedCitationUI,
} from '@/types/domain/priorArt';
import {
  processSavedPriorArt,
  processSavedPriorArtArray,
} from '@/features/search/utils/priorArt';

/**
 * Adds a prior art reference to a project.
 * Handles normalization of patent numbers.
 *
 * @param projectId The ID of the project to add the prior art to.
 * @param priorArt The prior art data to save.
 * @returns A promise resolving to the newly created SavedPriorArt record.
 */
export async function addProjectPriorArt(
  projectId: string,
  priorArt: PriorArtInput
): Promise<SavedPriorArtWithFields> {
  logger.debug(
    `Repository: Adding prior art ${priorArt.patentNumber} to project ${projectId}`
  );

  try {
    // Normalize the patent number
    const normalizedPatentNumber = priorArt.patentNumber
      .replace(/-/g, '')
      .toUpperCase();

    // Check if the prior art already exists for this project
    const existingArt = await prisma!.savedPriorArt.findUnique({
      where: {
        projectId_patentNumber: {
          projectId: projectId,
          patentNumber: normalizedPatentNumber,
        },
      },
      select: {
        id: true,
        patentNumber: true,
        title: true,
        abstract: true,
        url: true,
        notes: true,
        authors: true,
        publicationDate: true,
        savedCitationsData: true,
        claim1: true,
        summary: true,
        savedAt: true,
        projectId: true,
      },
    });

    if (existingArt) {
      logger.warn(
        `Repository: Prior art ${priorArt.patentNumber} already saved for project ${projectId}. Updating.`
      );

      // Handle citation data merging if new citations are provided
      let mergedCitationsData = existingArt.savedCitationsData;
      if (priorArt.savedCitationsData) {
        try {
          // Parse existing citations
          const existingCitations: SavedCitationUI[] = existingArt.savedCitationsData 
            ? JSON.parse(existingArt.savedCitationsData) 
            : [];
          
          // Parse new citations
          const newCitations: SavedCitationUI[] = JSON.parse(priorArt.savedCitationsData);
          
          // Merge citations, avoiding duplicates based on elementText + citation combination
          const mergedCitations: SavedCitationUI[] = [...existingCitations];
          
          for (const newCitation of newCitations) {
            const isDuplicate = existingCitations.some((existing: SavedCitationUI) => 
              existing.elementText?.trim() === newCitation.elementText?.trim() &&
              existing.citation?.trim() === newCitation.citation?.trim()
            );
            
            if (!isDuplicate) {
              mergedCitations.push(newCitation);
            }
          }
          
          mergedCitationsData = JSON.stringify(mergedCitations);
          
          logger.debug(
            `Repository: Merged citations for ${priorArt.patentNumber}. ` +
            `Existing: ${existingCitations.length}, New: ${newCitations.length}, ` +
            `Final: ${mergedCitations.length}`
          );
        } catch (error) {
          logger.error(
            `Repository: Error merging citation data for ${priorArt.patentNumber}`, 
            { error }
          );
          // Fall back to new data if parsing fails
          mergedCitationsData = priorArt.savedCitationsData;
        }
      }

      // Update the existing record with new information
      // This allows updating/adding citation data to existing prior art
      const updatedArt = await prisma!.savedPriorArt.update({
        where: {
          id: existingArt.id,
        },
        data: {
          // Only update fields that are provided and differ from existing values
          title: priorArt.title ?? existingArt.title,
          abstract: priorArt.abstract ?? existingArt.abstract,
          url: priorArt.url ?? existingArt.url,
          notes: priorArt.notes ?? existingArt.notes,
          authors: priorArt.authors ?? existingArt.authors,
          publicationDate:
            priorArt.publicationDate ?? existingArt.publicationDate,
          claim1: priorArt.claim1 ?? existingArt.claim1,
          summary: priorArt.summary ?? existingArt.summary,
          // Use merged citation data
          savedCitationsData: mergedCitationsData,
        },
        select: {
          id: true,
          patentNumber: true,
          title: true,
          abstract: true,
          url: true,
          notes: true,
          authors: true,
          publicationDate: true,
          savedCitationsData: true,
          claim1: true,
          summary: true,
          savedAt: true,
          projectId: true,
        },
      });

      logger.info(
        `Repository: Successfully updated prior art ${updatedArt.patentNumber} for project ${projectId}`
      );
      return updatedArt;
    }

    // Create the new prior art record
    const newArt = await prisma!.savedPriorArt.create({
      data: {
        projectId: projectId,
        patentNumber: normalizedPatentNumber,
        title: priorArt.title,
        abstract: priorArt.abstract,
        url: priorArt.url,
        notes: priorArt.notes,
        authors: priorArt.authors,
        publicationDate: priorArt.publicationDate,
        savedCitationsData: priorArt.savedCitationsData,
        claim1: priorArt.claim1,
        summary: priorArt.summary,
      },
      select: {
        id: true,
        patentNumber: true,
        title: true,
        abstract: true,
        url: true,
        notes: true,
        authors: true,
        publicationDate: true,
        savedCitationsData: true,
        claim1: true,
        summary: true,
        savedAt: true,
        projectId: true,
      },
    });

    logger.info(
      `Repository: Successfully added prior art ${newArt.patentNumber} to project ${projectId}`
    );
    return newArt;
  } catch (error) {
    logger.error(
      `Repository error adding prior art for project ${projectId}:`,
      {
        error: error instanceof Error ? error : new Error(String(error)),
      }
    );
    // Decide on error handling: rethrow, return null, etc.
    throw error; // Rethrow for now
  }
}

/**
 * Finds all saved prior art for a specific project.
 *
 * @param projectId The ID of the project to fetch prior art for.
 * @returns A promise resolving to an array of saved prior art.
 */
export async function findProjectPriorArt(
  projectId: string
): Promise<SavedPriorArtWithFields[]> {
  try {
    logger.debug(
      `Repository: Finding saved prior art for project ID: ${projectId}`
    );

    const priorArtItems = await prisma!.savedPriorArt.findMany({
      where: { projectId },
      select: {
        id: true,
        patentNumber: true,
        title: true,
        abstract: true,
        url: true,
        notes: true,
        authors: true,
        publicationDate: true,
        savedCitationsData: true,
        claim1: true,
        summary: true,
        savedAt: true,
        projectId: true,
      },
      orderBy: {
        savedAt: 'desc',
      },
    });

    logger.debug(
      `Repository: Found ${priorArtItems.length} saved prior art items for project ${projectId}`
    );
    return priorArtItems;
  } catch (error) {
    logger.error(
      `Repository error finding prior art for project ${projectId}:`,
      {
        error: error instanceof Error ? error : new Error(String(error)),
      }
    );
    // Return empty array on error to allow graceful degradation
    return [];
  }
}

/**
 * Removes a saved prior art item from a project.
 *
 * @param projectId The ID of the project.
 * @param patentNumber The patent number to remove.
 * @returns A promise resolving to true if successful.
 */
export async function removeProjectPriorArt(
  projectId: string,
  patentNumber: string
): Promise<boolean> {
  try {
    logger.debug(
      `Repository: Removing prior art ${patentNumber} from project ${projectId}`
    );

    // Normalize the patent number
    const normalizedPatentNumber = patentNumber.replace(/-/g, '');

    const result = await prisma!.savedPriorArt.deleteMany({
      where: {
        projectId,
        patentNumber: normalizedPatentNumber,
      },
    });

    logger.debug(
      `Repository: Removed ${result.count} prior art items for patent ${patentNumber}`
    );
    return result.count > 0;
  } catch (error) {
    logger.error(
      `Repository error removing prior art from project ${projectId}:`,
      {
        error: error instanceof Error ? error : new Error(String(error)),
      }
    );
    throw error;
  }
}

/**
 * Removes a saved prior art item from a project by its ID.
 *
 * @param projectId The ID of the project.
 * @param priorArtId The ID of the prior art item to remove.
 * @returns A promise resolving to true if successful, false if not found.
 */
export async function removeProjectPriorArtById(
  projectId: string,
  priorArtId: string
): Promise<boolean> {
  try {
    logger.debug(
      `Repository: Removing prior art by ID ${priorArtId} from project ${projectId}`
    );

    // First check if the prior art exists and belongs to the project
    const existingArt = await prisma!.savedPriorArt.findFirst({
      where: {
        id: priorArtId,
        projectId: projectId,
      },
    });

    if (!existingArt) {
      logger.debug(
        `Repository: Prior art ${priorArtId} not found for project ${projectId}`
      );
      return false;
    }

    // Delete the prior art
    await prisma!.savedPriorArt.delete({
      where: {
        id: priorArtId,
      },
    });

    logger.info(
      `Repository: Successfully removed prior art ${priorArtId} from project ${projectId}`
    );
    return true;
  } catch (error) {
    logger.error(
      `Repository error removing prior art by ID from project ${projectId}:`,
      {
        error: error instanceof Error ? error : new Error(String(error)),
      }
    );
    throw error;
  }
}
