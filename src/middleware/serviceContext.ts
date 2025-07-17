/**
 * Service Context Middleware
 *
 * Provides request-scoped service instances to prevent cross-tenant data leaks.
 * Services are created per-request and properly isolated.
 */
import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest } from '@/types/middleware';
import { SearchResultCache } from '@/lib/cache/searchCache';
import { InventionDataService } from '@/server/services/invention-data.server-service';
import { ProjectService } from '@/server/services/project.server-service';
import { ClaimGenerationService } from '@/server/services/claim-generation.server-service';
import { CitationProcessingService } from '@/server/services/citation-processing.server-service';
import { QueueServerService } from '@/server/services/queue.server.service';
import { CacheManager } from '@/lib/cache/cache-manager';
import { HealthCheckService } from '@/server/monitoring/health-check';
import { PerformanceMonitor } from '@/server/monitoring/performance';
import { logger } from '@/server/logger';

/**
 * Request-scoped services available to handlers
 */
export interface ServiceContext {
  searchCache: SearchResultCache;
  inventionService: InventionDataService;
  projectService: ProjectService;
  claimGenerationService: ClaimGenerationService;
  citationProcessingService: CitationProcessingService;
  queueService: QueueServerService;
  cacheManager: CacheManager;
  healthCheckService: HealthCheckService;
  performanceMonitor: PerformanceMonitor;
}

/**
 * Extended request with service context
 */
export interface RequestWithServices extends AuthenticatedRequest {
  services: ServiceContext;
}

/**
 * Creates a new service context for the request
 */
function createServiceContext(tenantId?: string): ServiceContext {
  logger.debug('Creating request-scoped service context', { tenantId });

  // Create tenant-scoped cache manager
  const cacheManager = new CacheManager(tenantId);

  return {
    searchCache: new SearchResultCache(),
    inventionService: new InventionDataService(),
    projectService: new ProjectService(),
    claimGenerationService: new ClaimGenerationService(),
    citationProcessingService: new CitationProcessingService(),
    queueService: new QueueServerService(),
    cacheManager,
    healthCheckService: new HealthCheckService(),
    performanceMonitor: new PerformanceMonitor(),
  };
}

/**
 * Middleware that attaches request-scoped services to the request
 */
export function withServiceContext(
  handler: (req: RequestWithServices, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const authenticatedReq = req as AuthenticatedRequest;
    const tenantId = authenticatedReq.user?.tenantId;

    // Create request-scoped services
    const services = createServiceContext(tenantId);

    // Attach to request
    const requestWithServices = authenticatedReq as RequestWithServices;
    requestWithServices.services = services;

    // Clean up any resources after request if needed
    try {
      await handler(requestWithServices, res);
    } finally {
      // Cleanup if services need it (e.g., clear caches)
      if (
        services.searchCache &&
        typeof services.searchCache.clearCache === 'function'
      ) {
        await services.searchCache.clearCache();
      }
    }
  };
}

/**
 * Type guard to check if request has services
 */
export function hasServices(req: NextApiRequest): req is RequestWithServices {
  return 'services' in req && req.services != null;
}
