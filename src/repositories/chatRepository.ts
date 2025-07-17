import { prisma } from '@/lib/prisma';
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';

export interface SaveChatMessageParams {
  projectId: string;
  role: string; // 'user' | 'assistant' | 'system'
  content: string;
  metadata?: Record<string, unknown>;
}

export async function saveChatMessage({
  projectId,
  role,
  content,
  metadata,
}: SaveChatMessageParams) {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  try {
    return await prisma.chatMessage.create({
      data: {
        projectId,
        role,
        content,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch (error) {
    logger.error('Failed to save chat message', error);
    throw error;
  }
}

export async function getRecentMessages(projectId: string, limit = 50) {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  return prisma.chatMessage.findMany({
    where: { projectId },
    orderBy: { timestamp: 'asc' },
    take: limit,
  });
}

export async function deleteProjectHistory(projectId: string) {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  return prisma.chatMessage.deleteMany({ where: { projectId } });
}

/**
 * Gets the full invention context for the chat agent, including:
 * - Basic project info
 * - Invention data (title, summary, claims, technical details)
 * - Normalized claims
 * - Saved prior art references
 *
 * This ensures the chat agent has full context about what the user is working on.
 * SECURITY: Always validates tenant access before returning data.
 *
 * @param projectId - The project ID to get context for
 * @param tenantId - The tenant ID for security validation
 * @returns Complete invention context or null if not found/unauthorized
 */
export async function getInventionContextForChat(
  projectId: string,
  tenantId: string
): Promise<InventionChatContext | null> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        tenantId: tenantId,
        deletedAt: null, // Exclude soft-deleted projects
      },
      select: {
        id: true,
        name: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        // Include the full invention data
        invention: {
          select: {
            id: true,
            title: true,
            summary: true,
            abstract: true,
            patentCategory: true,
            technicalField: true,
            noveltyStatement: true,
            // JSON fields that contain structured data
            backgroundJson: true,
            advantagesJson: true,
            featuresJson: true,
            useCasesJson: true,
            priorArtJson: true,
            technicalImplementationJson: true,
            processStepsJson: true,
            definitionsJson: true,
            futureDirectionsJson: true,
            // Claim parsing data
            parsedClaimElementsJson: true,
            searchQueriesJson: true,
            claimSyncedAt: true,
            lastSyncedClaim: true,
            // Include normalized claims from invention
            claims: {
              select: {
                id: true,
                number: true,
                text: true,
              },
              orderBy: {
                number: 'asc',
              },
            },
          },
        },
        // Include saved prior art for context
        savedPriorArtItems: {
          select: {
            id: true,
            patentNumber: true,
            title: true,
            abstract: true,
            claim1: true,
            summary: true,
            publicationDate: true,
            savedAt: true,
          },
          orderBy: {
            savedAt: 'desc',
          },
          take: 10, // Limit to most recent 10 to avoid huge context
        },
        // Include figures with their reference numerals
        figures: {
          where: {
            deletedAt: null,
            figureKey: { not: null }, // Only include assigned figures
          },
          select: {
            id: true,
            figureKey: true,
            title: true,
            description: true,
            status: true,
            figureElements: {
              select: {
                element: {
                  select: {
                    elementKey: true,
                    name: true,
                  },
                },
                calloutDescription: true,
              },
            },
          },
          orderBy: {
            displayOrder: 'asc',
          },
        },
      },
    });

    if (!project) {
      logger.warn(
        `[ChatRepository] Project ${projectId} not found for tenant ${tenantId}`
      );
      return null;
    }

    // Parse JSON fields safely
    const parseJsonSafely = (
      jsonString: string | null,
      defaultValue: any = null
    ) => {
      if (!jsonString) return defaultValue;
      try {
        return JSON.parse(jsonString);
      } catch (error) {
        logger.error('[ChatRepository] Failed to parse JSON', {
          error,
          jsonString,
        });
        return defaultValue;
      }
    };

    // Transform the data into a structured format for the chat agent
    const context: InventionChatContext = {
      project: {
        id: project.id,
        name: project.name,
        status: project.status,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
      invention: project.invention
        ? {
            id: project.invention.id,
            title: project.invention.title,
            summary: project.invention.summary,
            abstract: project.invention.abstract,
            patentCategory: project.invention.patentCategory,
            technicalField: project.invention.technicalField,
            noveltyStatement: project.invention.noveltyStatement,
            // Parse complex JSON fields
            background: parseJsonSafely(project.invention.backgroundJson, {}),
            advantages: parseJsonSafely(project.invention.advantagesJson, []),
            features: parseJsonSafely(project.invention.featuresJson, []),
            useCases: parseJsonSafely(project.invention.useCasesJson, []),
            priorArt: parseJsonSafely(project.invention.priorArtJson, []),
            technicalImplementation: parseJsonSafely(
              project.invention.technicalImplementationJson,
              {}
            ),
            processSteps: parseJsonSafely(
              project.invention.processStepsJson,
              []
            ),
            definitions: parseJsonSafely(project.invention.definitionsJson, {}),
            futureDirections: parseJsonSafely(
              project.invention.futureDirectionsJson,
              []
            ),
            // Claim parsing data
            parsedClaimElements: parseJsonSafely(
              project.invention.parsedClaimElementsJson,
              []
            ),
            searchQueries: parseJsonSafely(
              project.invention.searchQueriesJson,
              []
            ),
            claimSyncedAt: project.invention.claimSyncedAt,
            lastSyncedClaim: project.invention.lastSyncedClaim,
          }
        : null,
      claims: project.invention?.claims || [],
      savedPriorArt: project.savedPriorArtItems || [],
      figures: project.figures.map(fig => ({
        id: fig.id,
        figureKey: fig.figureKey!,
        title: fig.title || '',
        description: fig.description || '',
        status: (fig as any).status || 'ASSIGNED',
        elements: fig.figureElements.map(fe => ({
          elementKey: fe.element.elementKey,
          elementName: fe.element.name,
          calloutDescription: fe.calloutDescription || '',
        })),
      })),
    };

    // Add debug logging for claims
    logger.info(
      `[ChatRepository] Successfully loaded invention context for project ${projectId}`,
      {
        hasInvention: !!project.invention,
        claimsCount: context.claims.length,
        figuresCount: context.figures.length,
        inventionId: project.invention?.id,
      }
    );

    return context;
  } catch (error) {
    logger.error('[ChatRepository] Error loading invention context', {
      error,
      projectId,
      tenantId,
    });
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to load invention context: ${errorMessage}`
    );
  }
}

// Type definition for the invention context
export interface InventionChatContext {
  project: {
    id: string;
    name: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  };
  invention: {
    id: string;
    title: string | null;
    summary: string | null;
    abstract: string | null;
    patentCategory: string | null;
    technicalField: string | null;
    noveltyStatement: string | null;
    background: any;
    advantages: string[];
    features: string[];
    useCases: string[];
    priorArt: any[];
    technicalImplementation: any;
    processSteps: string[];
    definitions: Record<string, string>;
    futureDirections: string[];
    parsedClaimElements: string[];
    searchQueries: string[];
    claimSyncedAt: Date | null;
    lastSyncedClaim: string | null;
  } | null;
  claims: Array<{
    id: string;
    number: number;
    text: string;
  }>;
  savedPriorArt: Array<{
    id: string;
    patentNumber: string;
    title: string | null;
    abstract: string | null;
    claim1: string | null;
    summary: string | null;
    publicationDate: string | null;
    savedAt: Date;
  }>;
  figures: Array<{
    id: string;
    figureKey: string;
    title: string;
    description: string;
    status: string;
    elements: Array<{
      elementKey: string;
      elementName: string;
      calloutDescription: string;
    }>;
  }>;
}
