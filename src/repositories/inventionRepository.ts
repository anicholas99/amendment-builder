import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/monitoring/logger';
import { Prisma } from '@prisma/client';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { safeJsonParse } from '@/utils/json-utils';
import { Invention } from '@prisma/client';
import { FigureStatus } from '@/constants/database-enums';

// List of fields that should be strings but might be sent as arrays
const STRING_FIELDS: (keyof Prisma.InventionCreateInput)[] = [
  'title',
  'summary',
  'abstract',
  'patentCategory',
  'technicalField',
  'noveltyStatement',
];

/**
 * Repository for handling invention-related database operations
 * Centralizes all direct database access for inventions
 */
export const inventionRepository = {
  /**
   * Upsert invention data for a project
   */
  async upsert(data: {
    projectId: string;
    inventionData: any; // Using any for now due to complex JSON fields
  }) {
    try {
      if (!prisma) {
        throw new ApplicationError(
          ErrorCode.DB_CONNECTION_ERROR,
          'Database client not initialized'
        );
      }

      // Add detailed logging
      logger.debug('[inventionRepository.upsert] Raw data received:', {
        projectId: data.projectId,
        inventionDataKeys: Object.keys(data.inventionData),
        inventionData: data.inventionData,
      });

      const processedData = { ...data.inventionData };
      for (const field of STRING_FIELDS) {
        if (Array.isArray(processedData[field])) {
          logger.warn(
            `[inventionRepository.upsert] Converting array to string for field: ${String(field)}`,
            {
              originalValue: processedData[field],
              convertedValue: (processedData[field] as string[])
                .filter((s: string) => s.trim() !== '')
                .join('\n'),
            }
          );
          processedData[field] = (processedData[field] as string[])
            .filter((s: string) => s.trim() !== '')
            .join('\n');
        }
      }

      logger.debug('[inventionRepository.upsert] Processed data to save:', {
        projectId: data.projectId,
        processedDataKeys: Object.keys(processedData),
        processedData: processedData,
      });

      return await prisma.invention.upsert({
        where: { projectId: data.projectId },
        create: {
          projectId: data.projectId,
          ...processedData,
        },
        update: processedData,
      });
    } catch (error) {
      logger.error('Failed to upsert invention', {
        projectId: data.projectId,
        error,
      });
      throw error;
    }
  },

  /**
   * Get invention data by project ID
   */
  async findByProjectId(projectId: string) {
    try {
      if (!prisma) {
        throw new ApplicationError(
          ErrorCode.DB_CONNECTION_ERROR,
          'Database client not initialized'
        );
      }

      return await prisma.invention.findUnique({
        where: { projectId },
      });
    } catch (error) {
      logger.error('Failed to find invention by project ID', {
        projectId,
        error,
      });
      throw error;
    }
  },

  /**
   * Get project with invention data
   */
  async getProjectWithInvention(projectId: string) {
    try {
      if (!prisma) {
        throw new ApplicationError(
          ErrorCode.DB_CONNECTION_ERROR,
          'Database client not initialized'
        );
      }

      return await prisma.project.findUnique({
        where: { id: projectId },
        include: { invention: true },
      });
    } catch (error) {
      logger.error('Failed to get project with invention', {
        projectId,
        error,
      });
      throw error;
    }
  },

  /**
   * Get project with invention data, verifying tenant
   */
  async getProjectWithInventionAndTenant(projectId: string, tenantId: string) {
    try {
      if (!prisma) {
        throw new ApplicationError(
          ErrorCode.DB_CONNECTION_ERROR,
          'Database client not initialized'
        );
      }

      return await prisma.project.findFirst({
        where: {
          id: projectId,
          tenantId: tenantId,
        },
        include: { invention: true },
      });
    } catch (error) {
      logger.error('Failed to get project with invention and tenant', {
        projectId,
        tenantId,
        error,
      });
      throw error;
    }
  },

  /**
   * Store invention data in a transaction with tenant verification
   */
  async storeInventionInTransaction(
    projectId: string,
    tenantId: string,
    inventionData: any
  ) {
    try {
      if (!prisma) {
        throw new ApplicationError(
          ErrorCode.DB_CONNECTION_ERROR,
          'Database client not initialized'
        );
      }

      return await prisma.$transaction(async tx => {
        // Verify project belongs to tenant
        const project = await tx.project.findFirst({
          where: { id: projectId, tenantId },
        });

        if (!project) {
          throw new ApplicationError(
            ErrorCode.DB_RECORD_NOT_FOUND,
            'Project not found'
          );
        }

        const processedData = { ...inventionData };
        for (const field of STRING_FIELDS) {
          if (Array.isArray(processedData[field])) {
            processedData[field] = (processedData[field] as string[])
              .filter((s: string) => s.trim() !== '')
              .join('\n');
          }
        }

        // Create or update invention
        const invention = await tx.invention.upsert({
          where: { projectId },
          create: {
            projectId,
            ...processedData,
          },
          update: processedData,
        });

        return invention;
      });
    } catch (error) {
      logger.error('Failed to store invention in transaction', {
        projectId,
        tenantId,
        error,
      });
      throw error;
    }
  },

  /**
   * Delete invention data for a project
   */
  async deleteByProjectId(projectId: string) {
    try {
      if (!prisma) {
        throw new ApplicationError(
          ErrorCode.DB_CONNECTION_ERROR,
          'Database client not initialized'
        );
      }

      return await prisma.invention.delete({
        where: { projectId },
      });
    } catch (error) {
      logger.error('Failed to delete invention', {
        projectId,
        error,
      });
      throw error;
    }
  },

  /**
   * Check if invention exists for a project
   */
  async exists(projectId: string): Promise<boolean> {
    try {
      if (!prisma) {
        throw new ApplicationError(
          ErrorCode.DB_CONNECTION_ERROR,
          'Database client not initialized'
        );
      }

      const count = await prisma.invention.count({
        where: { projectId },
      });
      return count > 0;
    } catch (error) {
      logger.error('Failed to check invention existence', {
        projectId,
        error,
      });
      throw error;
    }
  },

  /**
   * Stores the main invention data and its normalized claims within a single transaction.
   * This ensures data consistency.
   * @param projectId - The ID of the project.
   * @param tenantId - The ID of the tenant for security verification.
   * @param inventionData - The core invention data to upsert.
   * @param claimsData - The normalized claims data to create.
   * @returns The newly created or updated invention record.
   */
  async storeInventionAndClaims(
    projectId: string,
    tenantId: string,
    inventionData: any,
    claimsData: { number: number; text: string }[]
  ) {
    logger.info(
      `[InventionRepo] Storing invention and ${claimsData.length} claims for project ${projectId}`
    );

    if (!prisma) {
      throw new Error('Prisma client is not available.');
    }

    return prisma.$transaction(async tx => {
      // Step 1: Verify tenant ownership of the project
      const project = await tx.project.findFirst({
        where: { id: projectId, tenantId: tenantId },
        select: { id: true },
      });

      if (!project) {
        throw new ApplicationError(
          ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS,
          'Project not found or access denied.'
        );
      }

      // Step 2: Process the invention data - serialize nested objects to JSON strings
      const processedInventionData: any = {};

      // Map of field names to their JSON counterparts
      const jsonFieldMap: Record<string, string> = {
        background: 'backgroundJson',
        advantages: 'advantagesJson',
        features: 'featuresJson',
        useCases: 'useCasesJson',
        priorArt: 'priorArtJson',
        technicalImplementation: 'technicalImplementationJson',
        processSteps: 'processStepsJson',
        definitions: 'definitionsJson',
        futureDirections: 'futureDirectionsJson',
      };

      // Extract structuredFigures before processing other fields
      const structuredFigures = inventionData.structuredFigures;
      delete inventionData.structuredFigures; // Remove from inventionData so it's not stored as JSON

      // Extract top-level elements before deleting them
      const topLevelElements = inventionData.elements;
      
      // Also remove figures and elements - these are now handled by normalized tables
      delete inventionData.figures;
      delete inventionData.elements;

      // Process each field
      for (const [key, value] of Object.entries(inventionData)) {
        if (jsonFieldMap[key]) {
          // This field should be serialized to JSON
          processedInventionData[jsonFieldMap[key]] = JSON.stringify(value);
        } else if (key === 'novelty') {
          // 'novelty' maps to 'noveltyStatement' in the database
          processedInventionData.noveltyStatement = value;
        } else {
          // For other fields, use as-is
          processedInventionData[key] = value;
        }
      }

      // Step 3: Upsert the core invention data
      const upsertedInvention = await tx.invention.upsert({
        where: { projectId },
        create: {
          projectId,
          ...processedInventionData,
        },
        update: processedInventionData,
      });

      // Step 4: If there are claims, delete old ones and create new ones
      if (claimsData.length > 0) {
        // Delete existing claims for this invention to handle re-processing
        await tx.claim.deleteMany({
          where: { inventionId: upsertedInvention.id },
        });

        // Create the new claims
        await tx.claim.createMany({
          data: claimsData.map(claim => ({
            inventionId: upsertedInvention.id,
            number: claim.number,
            text: claim.text,
          })),
        });
      }

      // Step 5: Process elements (both top-level and from figures)
      const allElements = new Map<string, string>();

      // First, add all top-level elements (these may not be associated with any figure)
      if (topLevelElements && typeof topLevelElements === 'object') {
        logger.debug(
          `[InventionRepo] Processing ${Object.keys(topLevelElements).length} top-level elements`
        );
        
        for (const [elementKey, elementName] of Object.entries(topLevelElements)) {
          if (typeof elementName === 'string') {
            allElements.set(String(elementKey), elementName);
          }
        }
      }

      // Then, add elements from structured figures (may override with more specific names)
      if (structuredFigures && Array.isArray(structuredFigures)) {
        for (const figureData of structuredFigures) {
          if (figureData.elements && Array.isArray(figureData.elements)) {
            for (const elementData of figureData.elements) {
              allElements.set(elementData.elementKey, elementData.elementName);
            }
          }
        }
      }

      // Create/update all elements for this project
      if (allElements.size > 0) {
        logger.debug(
          `[InventionRepo] Creating/updating ${allElements.size} unique elements`
        );

        for (const [elementKey, elementName] of Array.from(allElements)) {
          await tx.element.upsert({
            where: {
              projectId_elementKey: {
                projectId,
                elementKey: elementKey,
              },
            },
            create: {
              projectId,
              elementKey: elementKey,
              name: elementName,
            },
            update: {
              name: elementName,
            },
          });

          logger.debug(
            `[InventionRepo] Upserted element ${elementKey}: ${elementName}`
          );
        }
      }

      // Step 6: Process structuredFigures if present
      if (structuredFigures && Array.isArray(structuredFigures)) {
        logger.debug(
          `[InventionRepo] Processing ${structuredFigures.length} structured figures`
        );

        // Log the structured figures data
        logger.debug(`[InventionRepo] Structured figures data:`, {
          structuredFigures: JSON.stringify(structuredFigures, null, 2),
        });

        // Create proper FigureContent objects for the UI
        const figureContentMap: Record<string, any> = {};

        for (const figureData of structuredFigures) {
          const elementsObject =
            figureData.elements?.reduce(
              (acc: Record<string, string>, elementData: any) => {
                acc[elementData.elementKey] =
                  elementData.calloutDescription ||
                  elementData.elementName ||
                  '';
                return acc;
              },
              {}
            ) || {};

          const figureContent = {
            title: figureData.title || `Figure ${figureData.figureKey}`,
            description: figureData.description || '',
            elements: elementsObject,
            callouts:
              figureData.elements?.map((elementData: any) => ({
                element: elementData.elementKey,
                description:
                  elementData.calloutDescription ||
                  elementData.elementName ||
                  '',
              })) || [],
          };

          figureContentMap[figureData.figureKey] = figureContent;
        }

        // Create ProjectFigure records for each structured figure
        logger.debug(`[InventionRepo] Creating ProjectFigure records`);

        // Get the current user (we'll use the project owner as the uploader)
        const projectOwner = await tx.project.findUnique({
          where: { id: projectId },
          select: { userId: true },
        });

        if (!projectOwner) {
          throw new Error('Project owner not found');
        }

        for (const figureData of structuredFigures) {
          // Check if a figure with this key already exists
          const existingFigure = await tx.projectFigure.findFirst({
            where: {
              projectId,
              figureKey: figureData.figureKey,
            },
          });

          let projectFigure;

          if (existingFigure) {
            // Update existing figure
            projectFigure = await tx.projectFigure.update({
              where: { id: existingFigure.id },
              data: {
                title: figureData.title || `Figure ${figureData.figureKey}`,
                description: figureData.description || '',
                displayOrder: figureData.displayOrder || 0,
                updatedAt: new Date(),
              },
            });
          } else {
            // Create new figure with placeholder values for required fields
            projectFigure = await tx.projectFigure.create({
              data: {
                projectId,
                figureKey: figureData.figureKey,
                title: figureData.title || `Figure ${figureData.figureKey}`,
                description: figureData.description || '',
                displayOrder: figureData.displayOrder || 0,
                // Set status to PENDING - no file uploaded yet
                status: FigureStatus.PENDING,
                uploadedBy: projectOwner.userId,
              } as any, // Type assertion for the status field
            });
          }

          logger.debug(
            `[InventionRepo] Created/updated ProjectFigure ${figureData.figureKey}`
          );

          // Create FigureElement relationships
          if (figureData.elements && Array.isArray(figureData.elements)) {
            // First, delete existing relationships for this figure
            await tx.figureElement.deleteMany({
              where: {
                figureId: projectFigure.id,
              },
            });

            // Create new relationships
            for (const elementData of figureData.elements) {
              // Get the element we created earlier
              const element = await tx.element.findUnique({
                where: {
                  projectId_elementKey: {
                    projectId,
                    elementKey: elementData.elementKey,
                  },
                },
              });

              if (element) {
                await tx.figureElement.create({
                  data: {
                    figureId: projectFigure.id,
                    elementId: element.id,
                    // Use element name as default callout description
                    calloutDescription:
                      elementData.calloutDescription ||
                      elementData.elementName ||
                      null,
                  },
                });

                logger.debug(
                  `[InventionRepo] Created FigureElement relationship: ${figureData.figureKey} -> ${elementData.elementKey}`
                );
              }
            }
          }
        }

        logger.debug(
          `[InventionRepo] Completed processing structured figures, elements, and relationships`
        );
      } else {
        logger.debug(`[InventionRepo] No structured figures to process`);
      }

      logger.info(
        `[InventionRepo] Transaction successful for project ${projectId}`
      );
      return upsertedInvention;
    });
  },
};
