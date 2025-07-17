import { prisma } from '../../lib/prisma';
import { logger } from '@/server/logger';
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
): Promise<any> {
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
      include: {
        savedCitations: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (existingArt) {
      // Handle citation data merging if new citations are provided
      if (priorArt.savedCitationsData) {
        try {
          // Parse new citations from JSON
          const newCitations: SavedCitationUI[] = JSON.parse(
            priorArt.savedCitationsData
          );

          // Get existing citation keys for duplicate checking
          const existingCitationKeys = new Set(
            existingArt.savedCitations.map(
              (c: any) => `${c.elementText?.trim()}:::${c.citationText?.trim()}`
            )
          );

          // Filter out duplicates
          const citationsToAdd = newCitations.filter(newCitation => {
            const key = `${newCitation.elementText?.trim()}:::${newCitation.citation?.trim()}`;
            return !existingCitationKeys.has(key);
          });

          // Add new citations
          if (citationsToAdd.length > 0) {
            const startOrder = existingArt.savedCitations.length;
            await prisma!.savedCitation.createMany({
              data: citationsToAdd.map((citation, index) => ({
                savedPriorArtId: existingArt.id,
                elementText: citation.elementText || '',
                citationText: citation.citation || '',
                location: citation.location || null,
                reasoning: citation.reasoning || null,
                displayOrder: startOrder + index,
              })),
            });

            logger.info(
              `[addProjectPriorArt] Added citations to existing prior art`,
              {
                projectId,
                patentNumber: priorArt.patentNumber,
                citationsAdded: citationsToAdd.length,
              }
            );
          }
        } catch (error) {
          logger.error(
            `Repository: Error adding citation data for ${priorArt.patentNumber}`,
            { error }
          );
        }
      }

      // Update the existing record with new information
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
        },
        include: {
          savedCitations: {
            orderBy: { displayOrder: 'asc' },
          },
        },
      });

      logger.info(`[addProjectPriorArt] Updated existing prior art`, {
        projectId,
        patentNumber: updatedArt.patentNumber,
      });
      return updatedArt;
    }

    // Parse citations if provided
    let citationsToCreate: SavedCitationUI[] = [];
    if (priorArt.savedCitationsData) {
      try {
        citationsToCreate = JSON.parse(priorArt.savedCitationsData);
      } catch (error) {
        logger.error('Repository: Failed to parse citation data', { error });
      }
    }

    // Create the new prior art record with citations
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
        claim1: priorArt.claim1,
        summary: priorArt.summary,
        // Create citations in the same transaction
        savedCitations:
          citationsToCreate.length > 0
            ? {
                create: citationsToCreate.map((citation, index) => ({
                  elementText: citation.elementText || '',
                  citationText: citation.citation || '',
                  location: citation.location || null,
                  reasoning: citation.reasoning || null,
                  displayOrder: index,
                })),
              }
            : undefined,
      },
      include: {
        savedCitations: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    logger.info(`[addProjectPriorArt] Created new prior art`, {
      projectId,
      patentNumber: newArt.patentNumber,
      citationsCount: citationsToCreate.length,
    });
    return newArt;
  } catch (error) {
    logger.error(
      `Repository error adding prior art for project ${projectId}:`,
      {
        error: error instanceof Error ? error : new Error(String(error)),
      }
    );
    throw error;
  }
}

/**
 * Finds all saved prior art for a specific project.
 *
 * @param projectId The ID of the project to fetch prior art for.
 * @returns A promise resolving to an array of saved prior art.
 */
export async function findProjectPriorArt(projectId: string): Promise<any[]> {
  try {
    const priorArtItems = await prisma!.savedPriorArt.findMany({
      where: { projectId },
      include: {
        savedCitations: {
          orderBy: { displayOrder: 'asc' },
        },
      },
      orderBy: {
        savedAt: 'desc',
      },
    });

    // Only log if there are no items or if there's an unusually large number
    if (priorArtItems.length === 0) {
      logger.info(
        `[findProjectPriorArt] No prior art found for project ${projectId}`
      );
    } else if (priorArtItems.length > 50) {
      logger.info(
        `[findProjectPriorArt] Large number of prior art items found`,
        {
          projectId,
          count: priorArtItems.length,
        }
      );
    }

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
    // Normalize the patent number
    const normalizedPatentNumber = patentNumber.replace(/-/g, '');

    // Note: Citations will be cascade deleted automatically
    const result = await prisma!.savedPriorArt.deleteMany({
      where: {
        projectId,
        patentNumber: normalizedPatentNumber,
      },
    });

    if (result.count > 0) {
      logger.info(`[removeProjectPriorArt] Removed prior art`, {
        projectId,
        patentNumber,
        count: result.count,
      });
    }
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
    // First check if the prior art exists and belongs to the project
    const existingArt = await prisma!.savedPriorArt.findFirst({
      where: {
        id: priorArtId,
        projectId: projectId,
      },
    });

    if (!existingArt) {
      return false;
    }

    // Delete the prior art (citations will cascade delete)
    await prisma!.savedPriorArt.delete({
      where: {
        id: priorArtId,
      },
    });

    logger.info(`[removeProjectPriorArtById] Removed prior art by ID`, {
      projectId,
      priorArtId,
    });
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
