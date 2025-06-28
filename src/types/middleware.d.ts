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
