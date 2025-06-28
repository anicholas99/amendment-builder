import { NextApiRequest, NextApiResponse } from 'next';
import { ZodSchema } from 'zod';
import { AuthenticatedRequest, ApiHandler } from '../middleware';

/**
 * Type-safe middleware handler that preserves the request body type
 */
export type TypedApiHandler<TBody = unknown> = (
  req: AuthenticatedRequest & { body: TBody },
  res: NextApiResponse
) => Promise<void> | void;

/**
 * Middleware that preserves type information through composition
 */
export type TypedMiddleware<TBody = unknown> = (
  handler: TypedApiHandler<TBody>
) => TypedApiHandler<TBody>;

/**
 * Error handling middleware that accepts any handler type
 */
export type ErrorHandlingMiddleware = <T>(
  handler: TypedApiHandler<T>
) => TypedApiHandler<T>;

/**
 * Validation middleware that transforms the body type
 */
export type ValidationMiddleware<TSchema extends ZodSchema> = <TIn>(
  schema: TSchema,
  handler: TypedApiHandler<TSchema['_output']>
) => TypedApiHandler<TIn>;

/**
 * Composed handler with known request/response types
 */
export type ComposedApiHandler = (
  req: NextApiRequest,
  res: NextApiResponse
) => Promise<void>;

/**
 * Tenant guard middleware type
 */
export type TenantGuardMiddleware = (
  resolveTenantId: (
    req: AuthenticatedRequest
  ) => Promise<string | null> | string | null
) => <T>(handler: TypedApiHandler<T>) => TypedApiHandler<T>;

/**
 * Auth middleware type
 */
export type AuthMiddleware = <T>(
  handler: TypedApiHandler<T>
) => ComposedApiHandler;
