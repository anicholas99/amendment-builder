import { prisma } from '@/lib/prisma';
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { Prisma, ProsecutionEvent } from '@prisma/client';

/**
 * Prosecution Event Repository
 * 
 * Handles all database operations for ProsecutionEvent entities with proper tenant isolation.
 * Provides methods for tracking patent prosecution timeline events and milestones.
 */

interface CreateProsecutionEventData {
  applicationId: string;
  eventType: string;
  eventDate: Date;
  title: string;
  documentId?: string;
  metadata?: Record<string, any>;
}

interface UpdateProsecutionEventData {
  eventType?: string;
  eventDate?: Date;
  title?: string;
  documentId?: string;
  metadata?: Record<string, any>;
}

interface ProsecutionEventFilters {
  applicationId?: string;
  eventType?: string;
  eventDateFrom?: Date;
  eventDateTo?: Date;
  documentId?: string;
}

interface PaginationOptions {
  skip?: number;
  take?: number;
  orderBy?: Prisma.ProsecutionEventOrderByWithRelationInput;
}

/**
 * Creates a new prosecution event
 * Verifies tenant access through the patent application
 */
async function create(
  data: CreateProsecutionEventData,
  tenantId: string
): Promise<ProsecutionEvent> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    logger.debug('[ProsecutionEventRepo] Creating new prosecution event', {
      applicationId: data.applicationId,
      eventType: data.eventType,
      tenantId,
    });

    // Verify application belongs to tenant through project
    const application = await prisma.patentApplication.findFirst({
      where: {
        id: data.applicationId,
        project: {
          tenantId: tenantId,
        },
      },
      select: { id: true },
    });

    if (!application) {
      throw new ApplicationError(
        ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS,
        'Patent application not found or access denied'
      );
    }

    const event = await prisma.prosecutionEvent.create({
      data: {
        applicationId: data.applicationId,
        eventType: data.eventType,
        eventDate: data.eventDate,
        title: data.title,
        documentId: data.documentId || null,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      },
    });

    logger.info('[ProsecutionEventRepo] Prosecution event created successfully', {
      id: event.id,
      applicationId: data.applicationId,
      eventType: data.eventType,
    });

    return event;
  } catch (error) {
    logger.error('[ProsecutionEventRepo] Failed to create prosecution event', {
      error,
      data,
      tenantId,
    });

    if (error instanceof ApplicationError) {
      throw error;
    }

    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to create prosecution event: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Updates an existing prosecution event
 * Verifies tenant access through the patent application
 */
async function update(
  id: string,
  data: UpdateProsecutionEventData,
  tenantId: string
): Promise<ProsecutionEvent> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    // Verify event belongs to tenant through application->project
    const existingEvent = await prisma.prosecutionEvent.findFirst({
      where: {
        id: id,
        application: {
          project: {
            tenantId: tenantId,
          },
        },
      },
      select: { id: true },
    });

    if (!existingEvent) {
      throw new ApplicationError(
        ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS,
        'Prosecution event not found or access denied'
      );
    }

    const updatedEvent = await prisma.prosecutionEvent.update({
      where: { id },
      data: {
        ...(data.eventType !== undefined && { eventType: data.eventType }),
        ...(data.eventDate !== undefined && { eventDate: data.eventDate }),
        ...(data.title !== undefined && { title: data.title }),
        ...(data.documentId !== undefined && { documentId: data.documentId }),
        ...(data.metadata !== undefined && { 
          metadata: data.metadata ? JSON.stringify(data.metadata) : null 
        }),
      },
    });

    logger.info('[ProsecutionEventRepo] Prosecution event updated', {
      id,
      tenantId,
    });

    return updatedEvent;
  } catch (error) {
    logger.error('[ProsecutionEventRepo] Failed to update prosecution event', {
      error,
      id,
      data,
      tenantId,
    });

    if (error instanceof ApplicationError) {
      throw error;
    }

    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to update prosecution event: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Deletes a prosecution event (hard delete)
 * Verifies tenant access through the patent application
 */
async function deleteById(
  id: string,
  tenantId: string
): Promise<boolean> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    // Verify event belongs to tenant
    const existingEvent = await prisma.prosecutionEvent.findFirst({
      where: {
        id: id,
        application: {
          project: {
            tenantId: tenantId,
          },
        },
      },
      select: { id: true },
    });

    if (!existingEvent) {
      throw new ApplicationError(
        ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS,
        'Prosecution event not found or access denied'
      );
    }

    await prisma.prosecutionEvent.delete({
      where: { id },
    });

    logger.info('[ProsecutionEventRepo] Prosecution event deleted', {
      id,
      tenantId,
    });

    return true;
  } catch (error) {
    logger.error('[ProsecutionEventRepo] Failed to delete prosecution event', {
      error,
      id,
      tenantId,
    });

    if (error instanceof ApplicationError) {
      throw error;
    }

    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to delete prosecution event: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Finds a prosecution event by ID
 * Verifies tenant access through the patent application
 */
async function findById(
  id: string,
  tenantId: string
): Promise<ProsecutionEvent | null> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    const event = await prisma.prosecutionEvent.findFirst({
      where: {
        id: id,
        application: {
          project: {
            tenantId: tenantId,
          },
        },
      },
      include: {
        application: {
          select: {
            id: true,
            applicationNumber: true,
            title: true,
            status: true,
          },
        },
      },
    });

    return event;
  } catch (error) {
    logger.error('[ProsecutionEventRepo] Failed to find prosecution event', {
      error,
      id,
      tenantId,
    });

    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to find prosecution event: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Finds prosecution events by application ID
 * Verifies tenant access through the patent application
 */
async function findByApplicationId(
  applicationId: string,
  tenantId: string,
  options?: PaginationOptions
): Promise<ProsecutionEvent[]> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    // Verify application belongs to tenant
    const application = await prisma.patentApplication.findFirst({
      where: {
        id: applicationId,
        project: {
          tenantId: tenantId,
        },
      },
      select: { id: true },
    });

    if (!application) {
      throw new ApplicationError(
        ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS,
        'Patent application not found or access denied'
      );
    }

    const events = await prisma.prosecutionEvent.findMany({
      where: {
        applicationId: applicationId,
      },
      orderBy: options?.orderBy || { eventDate: 'desc' },
      skip: options?.skip,
      take: options?.take,
    });

    return events;
  } catch (error) {
    logger.error('[ProsecutionEventRepo] Failed to find events by application', {
      error,
      applicationId,
      tenantId,
    });

    if (error instanceof ApplicationError) {
      throw error;
    }

    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to find prosecution events: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Finds prosecution events by project ID
 * Gets all events for all applications in a project
 */
async function findByProjectId(
  projectId: string,
  tenantId: string,
  options?: PaginationOptions
): Promise<ProsecutionEvent[]> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    // Verify project belongs to tenant
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        tenantId: tenantId,
      },
      select: { id: true },
    });

    if (!project) {
      throw new ApplicationError(
        ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS,
        'Project not found or access denied'
      );
    }

    const events = await prisma.prosecutionEvent.findMany({
      where: {
        application: {
          projectId: projectId,
        },
      },
      include: {
        application: {
          select: {
            id: true,
            applicationNumber: true,
            title: true,
          },
        },
      },
      orderBy: options?.orderBy || { eventDate: 'desc' },
      skip: options?.skip,
      take: options?.take,
    });

    return events;
  } catch (error) {
    logger.error('[ProsecutionEventRepo] Failed to find events by project', {
      error,
      projectId,
      tenantId,
    });

    if (error instanceof ApplicationError) {
      throw error;
    }

    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to find prosecution events: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Finds prosecution events with filters
 * Ensures tenant isolation through application->project relationship
 */
async function findMany(
  filters: ProsecutionEventFilters,
  tenantId: string,
  options?: PaginationOptions
): Promise<ProsecutionEvent[]> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    const where: Prisma.ProsecutionEventWhereInput = {
      application: {
        project: {
          tenantId: tenantId,
        },
      },
      ...(filters.applicationId && { applicationId: filters.applicationId }),
      ...(filters.eventType && { eventType: filters.eventType }),
      ...(filters.documentId && { documentId: filters.documentId }),
      ...((filters.eventDateFrom || filters.eventDateTo) && {
        eventDate: {
          ...(filters.eventDateFrom && { gte: filters.eventDateFrom }),
          ...(filters.eventDateTo && { lte: filters.eventDateTo }),
        },
      }),
    };

    const events = await prisma.prosecutionEvent.findMany({
      where,
      include: {
        application: {
          select: {
            id: true,
            applicationNumber: true,
            title: true,
            status: true,
            projectId: true,
          },
        },
      },
      orderBy: options?.orderBy || { eventDate: 'desc' },
      skip: options?.skip,
      take: options?.take,
    });

    return events;
  } catch (error) {
    logger.error('[ProsecutionEventRepo] Failed to find prosecution events', {
      error,
      filters,
      tenantId,
    });

    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to find prosecution events: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Bulk creates prosecution events for sync operations
 * Verifies all applications belong to the tenant
 */
async function bulkCreate(
  events: CreateProsecutionEventData[],
  tenantId: string
): Promise<ProsecutionEvent[]> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    // Get unique application IDs
    const applicationIds = [...new Set(events.map(e => e.applicationId))];

    // Verify all applications belong to tenant
    const validApplications = await prisma.patentApplication.findMany({
      where: {
        id: { in: applicationIds },
        project: {
          tenantId: tenantId,
        },
      },
      select: { id: true },
    });

    const validApplicationIds = new Set(validApplications.map(a => a.id));

    // Filter events to only include those with valid applications
    const validEvents = events.filter(e => validApplicationIds.has(e.applicationId));

    if (validEvents.length === 0) {
      throw new ApplicationError(
        ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS,
        'No valid applications found for the provided events'
      );
    }

    if (validEvents.length < events.length) {
      logger.warn('[ProsecutionEventRepo] Some events filtered due to invalid applications', {
        totalEvents: events.length,
        validEvents: validEvents.length,
        tenantId,
      });
    }

    // Create events in a transaction
    const createdEvents = await prisma.$transaction(
      validEvents.map(event =>
        prisma.prosecutionEvent.create({
          data: {
            applicationId: event.applicationId,
            eventType: event.eventType,
            eventDate: event.eventDate,
            title: event.title,
            documentId: event.documentId || null,
            metadata: event.metadata ? JSON.stringify(event.metadata) : null,
          },
        })
      )
    );

    logger.info('[ProsecutionEventRepo] Bulk created prosecution events', {
      count: createdEvents.length,
      tenantId,
    });

    return createdEvents;
  } catch (error) {
    logger.error('[ProsecutionEventRepo] Failed to bulk create prosecution events', {
      error,
      eventCount: events.length,
      tenantId,
    });

    if (error instanceof ApplicationError) {
      throw error;
    }

    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to bulk create prosecution events: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Gets the latest event for an application by event type
 * Useful for AI operations that need the most recent event of a specific type
 */
async function getLatestByType(
  applicationId: string,
  eventType: string,
  tenantId: string
): Promise<ProsecutionEvent | null> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    const event = await prisma.prosecutionEvent.findFirst({
      where: {
        applicationId: applicationId,
        eventType: eventType,
        application: {
          project: {
            tenantId: tenantId,
          },
        },
      },
      orderBy: { eventDate: 'desc' },
    });

    return event;
  } catch (error) {
    logger.error('[ProsecutionEventRepo] Failed to get latest event by type', {
      error,
      applicationId,
      eventType,
      tenantId,
    });

    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to get latest prosecution event: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Gets prosecution timeline for AI analysis
 * Returns events with parsed metadata for easier processing
 */
async function getTimelineForAnalysis(
  applicationId: string,
  tenantId: string,
  options?: {
    eventTypes?: string[];
    fromDate?: Date;
    toDate?: Date;
  }
): Promise<Array<ProsecutionEvent & { parsedMetadata?: any }>> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    // Verify application belongs to tenant
    const application = await prisma.patentApplication.findFirst({
      where: {
        id: applicationId,
        project: {
          tenantId: tenantId,
        },
      },
      select: { id: true },
    });

    if (!application) {
      throw new ApplicationError(
        ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS,
        'Patent application not found or access denied'
      );
    }

    const where: Prisma.ProsecutionEventWhereInput = {
      applicationId: applicationId,
      ...(options?.eventTypes && { eventType: { in: options.eventTypes } }),
      ...((options?.fromDate || options?.toDate) && {
        eventDate: {
          ...(options?.fromDate && { gte: options.fromDate }),
          ...(options?.toDate && { lte: options.toDate }),
        },
      }),
    };

    const events = await prisma.prosecutionEvent.findMany({
      where,
      orderBy: { eventDate: 'asc' },
    });

    // Parse metadata for easier AI processing
    const eventsWithParsedMetadata = events.map(event => {
      let parsedMetadata = null;
      if (event.metadata) {
        try {
          parsedMetadata = JSON.parse(event.metadata);
        } catch (error) {
          logger.warn('[ProsecutionEventRepo] Failed to parse event metadata', {
            eventId: event.id,
            error,
          });
        }
      }

      return {
        ...event,
        parsedMetadata,
      };
    });

    return eventsWithParsedMetadata;
  } catch (error) {
    logger.error('[ProsecutionEventRepo] Failed to get timeline for analysis', {
      error,
      applicationId,
      tenantId,
    });

    if (error instanceof ApplicationError) {
      throw error;
    }

    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to get prosecution timeline: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Counts events by type for an application
 * Useful for dashboard statistics and AI summaries
 */
async function countByType(
  applicationId: string,
  tenantId: string
): Promise<Record<string, number>> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    // Verify application belongs to tenant
    const application = await prisma.patentApplication.findFirst({
      where: {
        id: applicationId,
        project: {
          tenantId: tenantId,
        },
      },
      select: { id: true },
    });

    if (!application) {
      throw new ApplicationError(
        ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS,
        'Patent application not found or access denied'
      );
    }

    const counts = await prisma.prosecutionEvent.groupBy({
      by: ['eventType'],
      where: {
        applicationId: applicationId,
      },
      _count: {
        eventType: true,
      },
    });

    // Transform to a more convenient format
    const countsByType: Record<string, number> = {};
    counts.forEach(count => {
      countsByType[count.eventType] = count._count.eventType;
    });

    return countsByType;
  } catch (error) {
    logger.error('[ProsecutionEventRepo] Failed to count events by type', {
      error,
      applicationId,
      tenantId,
    });

    if (error instanceof ApplicationError) {
      throw error;
    }

    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to count prosecution events: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Export all repository functions
 */
export const prosecutionEventRepository = {
  create,
  update,
  deleteById,
  findById,
  findByApplicationId,
  findByProjectId,
  findMany,
  bulkCreate,
  getLatestByType,
  getTimelineForAnalysis,
  countByType,
};