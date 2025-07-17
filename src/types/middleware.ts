import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
    email: string;
    picture?: string;
    tenantId?: string;
    role?: string;
  };
  userId?: string; // Add for backward compatibility
  csrfToken?: string;
}

/**
 * Request with request-scoped services
 */
export interface RequestWithServices extends AuthenticatedRequest {
  services: {
    searchCache: import('@/lib/cache/searchCache').SearchResultCache;
    inventionService: import('@/server/services/invention-data.server-service').InventionDataService;
    projectService: import('@/server/services/project.server-service').ProjectService;
    claimGenerationService: import('@/server/services/claim-generation.server-service').ClaimGenerationService;
    citationProcessingService: import('@/server/services/citation-processing.server-service').CitationProcessingService;
    queueService: import('@/server/services/queue.server.service').QueueServerService;
    cacheManager: import('@/lib/cache/cache-manager').CacheManager;
    healthCheckService: import('@/server/monitoring/health-check').HealthCheckService;
    performanceMonitor: import('@/server/monitoring/performance').PerformanceMonitor;
  };
}

// Base handler type that all API handlers extend from
export type BaseApiHandler = (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => void | Promise<void>;

// Generic API handler type that supports typed request bodies
export type ApiHandler<T = unknown> = (
  req: T extends z.ZodSchema
    ? AuthenticatedRequest & { body: z.infer<T> }
    : AuthenticatedRequest,
  res: NextApiResponse
) => void | Promise<void>;

// Alias for composed handlers
export type ComposedHandler = NextApiHandler;

// Tenant resolver can be sync or async
export type TenantResolver = (
  req: AuthenticatedRequest
) => Promise<string | null> | string | null;

// Export InferSchemaType for validation utilities
export type InferSchemaType<T extends z.ZodSchema> = z.infer<T>;
