import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest } from '@/types/middleware';
import { z } from 'zod';
import { logger } from '@/server/logger';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { prisma } from '@/lib/prisma';
import { ProsecutionEventType } from '@/lib/api/uspto/types/prosecution-events';

/**
 * Prosecution Timeline Events API
 * 
 * Provides access to prosecution timeline data for a project's patent application.
 * Supports fetching timeline events and syncing from USPTO.
 * 
 * @endpoint /api/projects/[projectId]/timeline-events
 * @methods GET, POST
 * @security tenant-protected
 */

// Validation schemas
const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  eventType: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

const syncRequestSchema = z.object({
  force: z.boolean().optional().default(false),
});

// Response type definitions
interface TimelineEventResponse {
  id: string;
  eventType: string;
  eventDate: string;
  title: string;
  documentId?: string;
  metadata?: Record<string, any>;
}

interface TimelineResponse {
  success: boolean;
  data: {
    events: TimelineEventResponse[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    metadata: {
      applicationNumber?: string;
      lastSyncedAt?: string;
      totalEvents: number;
    };
  };
}

interface SyncResponse {
  success: boolean;
  data: {
    synced: boolean;
    eventsAdded: number;
    eventsUpdated: number;
    lastSyncedAt: string;
  };
  message: string;
}

/**
 * Main handler for prosecution timeline events
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { projectId } = req.query;

  if (!projectId || typeof projectId !== 'string') {
    throw new ApplicationError(
      'Invalid project ID',
      ErrorCode.INVALID_INPUT,
      400
    );
  }

  // Ensure project exists and user has access (handled by tenant middleware)
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      tenantId: req.tenantContext.tenantId,
      deletedAt: null,
    },
    include: {
      patentApplication: true,
    },
  });

  if (!project) {
    throw new ApplicationError(
      'Project not found',
      ErrorCode.RESOURCE_NOT_FOUND,
      404
    );
  }

  switch (req.method) {
    case 'GET':
      return handleGetTimeline(req, res, project);
    case 'POST':
      return handleSyncTimeline(req, res, project);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      throw new ApplicationError(
        'Method not allowed',
        ErrorCode.METHOD_NOT_ALLOWED,
        405
      );
  }
}

/**
 * GET /api/projects/[projectId]/timeline-events
 * 
 * Fetch prosecution timeline events with pagination and filtering
 */
async function handleGetTimeline(
  req: AuthenticatedRequest,
  res: NextApiResponse<TimelineResponse>,
  project: any
) {
  const { page, limit, eventType, startDate, endDate } = paginationSchema.parse(req.query);

  if (!project.patentApplication) {
    logger.info('[Timeline] No patent application found for project', { projectId: project.id });
    return res.status(200).json({
      success: true,
      data: {
        events: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
        metadata: {
          totalEvents: 0,
        },
      },
    });
  }

  // Build query filters
  const where: any = {
    applicationId: project.patentApplication.id,
  };

  if (eventType) {
    where.eventType = eventType;
  }

  if (startDate || endDate) {
    where.eventDate = {};
    if (startDate) {
      where.eventDate.gte = new Date(startDate);
    }
    if (endDate) {
      where.eventDate.lte = new Date(endDate);
    }
  }

  // Execute queries in parallel
  const [events, total] = await Promise.all([
    prisma.prosecutionEvent.findMany({
      where,
      orderBy: { eventDate: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.prosecutionEvent.count({ where }),
  ]);

  logger.info('[Timeline] Retrieved prosecution events', {
    projectId: project.id,
    eventCount: events.length,
    total,
    filters: { eventType, startDate, endDate },
  });

  const response: TimelineResponse = {
    success: true,
    data: {
      events: events.map(event => ({
        id: event.id,
        eventType: event.eventType,
        eventDate: event.eventDate.toISOString(),
        title: event.title,
        documentId: event.documentId || undefined,
        metadata: event.metadata ? JSON.parse(event.metadata) : undefined,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      metadata: {
        applicationNumber: project.patentApplication.applicationNumber || undefined,
        lastSyncedAt: project.patentApplication.updatedAt.toISOString(),
        totalEvents: total,
      },
    },
  };

  return res.status(200).json(response);
}

/**
 * POST /api/projects/[projectId]/timeline-events
 * 
 * Sync prosecution timeline from USPTO
 */
async function handleSyncTimeline(
  req: AuthenticatedRequest,
  res: NextApiResponse<SyncResponse>,
  project: any
) {
  const { force } = syncRequestSchema.parse(req.body);

  if (!project.patentApplication) {
    throw new ApplicationError(
      'No patent application associated with this project',
      ErrorCode.PRECONDITION_FAILED,
      412
    );
  }

  if (!project.patentApplication.applicationNumber) {
    throw new ApplicationError(
      'Patent application number not set. Cannot sync with USPTO.',
      ErrorCode.PRECONDITION_FAILED,
      412
    );
  }

  // Check if sync is needed (unless forced)
  if (!force) {
    const lastSync = project.patentApplication.updatedAt;
    const hoursSinceSync = (Date.now() - lastSync.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceSync < 24) {
      logger.info('[Timeline] Skipping sync - recently synced', {
        projectId: project.id,
        lastSync,
        hoursSinceSync,
      });

      return res.status(200).json({
        success: true,
        data: {
          synced: false,
          eventsAdded: 0,
          eventsUpdated: 0,
          lastSyncedAt: lastSync.toISOString(),
        },
        message: 'Timeline was recently synced. Use force=true to sync anyway.',
      });
    }
  }

  try {
    // Import USPTO sync service
    const { USPTOSyncService } = await import('@/server/services/usptoSync.server-service');
    
    // Create service instance with tenant context
    const syncService = new USPTOSyncService(req.serviceContext);
    
    // Perform sync
    logger.info('[Timeline] Starting USPTO sync', {
      projectId: project.id,
      applicationNumber: project.patentApplication.applicationNumber,
      force,
    });

    const syncResult = await syncService.syncProsecutionEvents(
      project.patentApplication.id,
      project.patentApplication.applicationNumber
    );

    // Update last sync timestamp
    await prisma.patentApplication.update({
      where: { id: project.patentApplication.id },
      data: { updatedAt: new Date() },
    });

    logger.info('[Timeline] USPTO sync completed', {
      projectId: project.id,
      ...syncResult,
    });

    return res.status(200).json({
      success: true,
      data: {
        synced: true,
        eventsAdded: syncResult.eventsAdded || 0,
        eventsUpdated: syncResult.eventsUpdated || 0,
        lastSyncedAt: new Date().toISOString(),
      },
      message: 'Timeline successfully synced from USPTO',
    });
  } catch (error) {
    logger.error('[Timeline] USPTO sync failed', {
      projectId: project.id,
      error,
    });

    throw new ApplicationError(
      'Failed to sync timeline from USPTO',
      ErrorCode.EXTERNAL_SERVICE_ERROR,
      503,
      { originalError: error instanceof Error ? error.message : String(error) }
    );
  }
}

// Export with security presets
export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    validate: {
      query: paginationSchema,
      body: syncRequestSchema,
      bodyMethods: ['POST'],
    },
    rateLimit: 'api',
  }
);