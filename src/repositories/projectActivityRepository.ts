import { prisma } from '@/lib/prisma';
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';

/**
 * Repository for calculating comprehensive project activity timestamps
 * Centralizes all project activity queries to enforce security and consistency
 */
export class ProjectActivityRepository {
  /**
   * Gets the most recent activity timestamp across all project-related data
   * @param projectId The project ID
   * @param tenantId The tenant ID for security verification
   * @returns The most recent activity date or null
   */
  static async getLastActivity(
    projectId: string,
    tenantId: string
  ): Promise<Date | null> {
    try {
      if (!prisma) {
        throw new ApplicationError(
          ErrorCode.DB_CONNECTION_ERROR,
          'Database client not initialized'
        );
      }

      // Verify project exists and belongs to tenant
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          tenantId: tenantId,
          deletedAt: null,
        },
        select: {
          updatedAt: true,
        },
      });

      if (!project) {
        return null;
      }

      // Fetch latest timestamps from all related tables in parallel
      const [
        invention,
        latestClaim,
        latestFigure,
        latestPriorArt,
        latestSearch,
        latestChat,
        latestDraft,
        latestDocument,
      ] = await Promise.all([
        // Invention updates
        prisma.invention.findUnique({
          where: { projectId },
          select: { updatedAt: true },
        }),

        // Latest claim update
        prisma.claim.findFirst({
          where: {
            invention: { projectId },
          },
          orderBy: { updatedAt: 'desc' },
          select: { updatedAt: true },
        }),

        // Latest figure update
        prisma.projectFigure.findFirst({
          where: { projectId },
          orderBy: { updatedAt: 'desc' },
          select: { updatedAt: true },
        }),

        // Latest saved prior art
        prisma.savedPriorArt.findFirst({
          where: { projectId },
          orderBy: { savedAt: 'desc' },
          select: { savedAt: true },
        }),

        // Latest search
        prisma.searchHistory.findFirst({
          where: { projectId },
          orderBy: { timestamp: 'desc' },
          select: { timestamp: true },
        }),

        // Latest chat message
        prisma.chatMessage.findFirst({
          where: { projectId },
          orderBy: { updatedAt: 'desc' },
          select: { updatedAt: true },
        }),

        // Latest draft document
        prisma.draftDocument.findFirst({
          where: { projectId },
          orderBy: { updatedAt: 'desc' },
          select: { updatedAt: true },
        }),

        // Latest application version document
        prisma.document.findFirst({
          where: {
            applicationVersion: {
              projectId,
            },
          },
          orderBy: { updatedAt: 'desc' },
          select: { updatedAt: true },
        }),
      ]);

      // Collect all timestamps
      const timestamps: Date[] = [project.updatedAt];

      if (invention?.updatedAt) timestamps.push(invention.updatedAt);
      if (latestClaim?.updatedAt) timestamps.push(latestClaim.updatedAt);
      if (latestFigure?.updatedAt) timestamps.push(latestFigure.updatedAt);
      if (latestPriorArt?.savedAt) timestamps.push(latestPriorArt.savedAt);
      if (latestSearch?.timestamp) timestamps.push(latestSearch.timestamp);
      if (latestChat?.updatedAt) timestamps.push(latestChat.updatedAt);
      if (latestDraft?.updatedAt) timestamps.push(latestDraft.updatedAt);
      if (latestDocument?.updatedAt) timestamps.push(latestDocument.updatedAt);

      // Return the most recent timestamp
      return new Date(Math.max(...timestamps.map(t => t.getTime())));
    } catch (error) {
      logger.error('[ProjectActivityRepository] Failed to get last activity', {
        projectId,
        tenantId,
        error,
      });
      throw error;
    }
  }

  /**
   * Gets last activity for multiple projects efficiently
   * @param projectIds Array of project IDs
   * @param tenantId The tenant ID for security verification
   * @returns Map of project ID to last activity date
   */
  static async getLastActivityBatch(
    projectIds: string[],
    tenantId: string
  ): Promise<Map<string, Date>> {
    const activityMap = new Map<string, Date>();

    try {
      if (!prisma) {
        throw new ApplicationError(
          ErrorCode.DB_CONNECTION_ERROR,
          'Database client not initialized'
        );
      }

      // Get all projects with their updatedAt as baseline
      const projects = await prisma.project.findMany({
        where: {
          id: { in: projectIds },
          tenantId: tenantId,
          deletedAt: null,
        },
        select: {
          id: true,
          updatedAt: true,
        },
      });

      // Initialize map with project updatedAt
      projects.forEach(p => {
        activityMap.set(p.id, p.updatedAt);
      });

      // Get latest activities for each type in batch
      const [inventions, claims, figures, priorArt, searches, chats, drafts] =
        await Promise.all([
          // Inventions
          prisma.invention.findMany({
            where: { projectId: { in: projectIds } },
            select: { projectId: true, updatedAt: true },
          }),

          // Latest claim per project (through invention)
          prisma.claim.groupBy({
            by: ['inventionId'],
            where: {
              invention: {
                projectId: { in: projectIds },
              },
            },
            _max: { updatedAt: true },
          }),

          // Latest figure per project
          prisma.projectFigure.groupBy({
            by: ['projectId'],
            where: { projectId: { in: projectIds } },
            _max: { updatedAt: true },
          }),

          // Latest prior art per project
          prisma.savedPriorArt.groupBy({
            by: ['projectId'],
            where: { projectId: { in: projectIds } },
            _max: { savedAt: true },
          }),

          // Latest search per project
          prisma.searchHistory.groupBy({
            by: ['projectId'],
            where: {
              projectId: { in: projectIds },
              AND: { projectId: { not: null } },
            },
            _max: { timestamp: true },
          }),

          // Latest chat per project
          prisma.chatMessage.groupBy({
            by: ['projectId'],
            where: { projectId: { in: projectIds } },
            _max: { updatedAt: true },
          }),

          // Latest draft per project
          prisma.draftDocument.groupBy({
            by: ['projectId'],
            where: { projectId: { in: projectIds } },
            _max: { updatedAt: true },
          }),
        ]);

      // Update map with more recent timestamps
      inventions.forEach(inv => {
        const current = activityMap.get(inv.projectId);
        if (current && inv.updatedAt > current) {
          activityMap.set(inv.projectId, inv.updatedAt);
        }
      });

      figures.forEach(fig => {
        const current = activityMap.get(fig.projectId);
        if (current && fig._max.updatedAt && fig._max.updatedAt > current) {
          activityMap.set(fig.projectId, fig._max.updatedAt);
        }
      });

      priorArt.forEach(pa => {
        const current = activityMap.get(pa.projectId);
        if (current && pa._max.savedAt && pa._max.savedAt > current) {
          activityMap.set(pa.projectId, pa._max.savedAt);
        }
      });

      searches.forEach(search => {
        if (search.projectId) {
          const current = activityMap.get(search.projectId);
          if (
            current &&
            search._max.timestamp &&
            search._max.timestamp > current
          ) {
            activityMap.set(search.projectId, search._max.timestamp);
          }
        }
      });

      chats.forEach(chat => {
        const current = activityMap.get(chat.projectId);
        if (current && chat._max.updatedAt && chat._max.updatedAt > current) {
          activityMap.set(chat.projectId, chat._max.updatedAt);
        }
      });

      drafts.forEach(draft => {
        const current = activityMap.get(draft.projectId);
        if (current && draft._max.updatedAt && draft._max.updatedAt > current) {
          activityMap.set(draft.projectId, draft._max.updatedAt);
        }
      });

      return activityMap;
    } catch (error) {
      logger.error(
        '[ProjectActivityRepository] Failed to get batch activities',
        {
          projectIds,
          tenantId,
          error,
        }
      );
      throw error;
    }
  }

  /**
   * Verifies a project exists and belongs to the specified tenant
   * @param projectId The project ID
   * @param tenantId The tenant ID
   * @returns true if project exists and belongs to tenant
   */
  static async verifyProjectTenant(
    projectId: string,
    tenantId: string
  ): Promise<boolean> {
    if (!prisma) {
      throw new ApplicationError(
        ErrorCode.DB_CONNECTION_ERROR,
        'Database client not initialized'
      );
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        tenantId: tenantId,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    return !!project;
  }
}
