import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

// Extend NextApiRequest with our custom properties
export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
    email: string;
    role: string;
    tenantId?: string;
  };
  userId?: string;
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

// Generic API handler type
export type ApiHandler<TBody = unknown> = (
  req: NextApiRequest & { body: TBody },
  res: NextApiResponse
) => Promise<void> | void;

// Middleware type that wraps an API handler
export type Middleware<TBody = unknown> = (
  handler: ApiHandler<TBody>
) => ApiHandler<TBody>;

// Transforming middleware that changes the request body type
export type TransformingMiddleware<TIn = unknown, TOut = unknown> = (
  handler: ApiHandler<TOut>
) => ApiHandler<TIn>;

// Type for tenant resolver functions
export type TenantResolver = (
  req: AuthenticatedRequest
) => Promise<string | null> | string | null;

// Type for the final composed handler
export type ComposedHandler = (
  req: NextApiRequest,
  res: NextApiResponse
) => Promise<void>;

// Helper type to extract the schema type from a Zod schema
export type InferSchemaType<T> = T extends z.ZodSchema<infer U> ? U : never;

// Re-export types that are expected by other files
export type ApiHandler = import('next').NextApiHandler;
export type ComposedHandler = import('next').NextApiHandler;
export type TenantResolver = (
  req: AuthenticatedRequest
) => Promise<string | null>;
