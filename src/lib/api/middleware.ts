import { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';

/**
 * Type for a middleware function that returns a handler
 */
export type Middleware<T = any> = (
  handler: (
    req: NextApiRequest,
    res: NextApiResponse<T>
  ) => void | Promise<void>
) => (req: NextApiRequest, res: NextApiResponse<T>) => void | Promise<void>;

/**
 * Type for a middleware factory (like withTenantGuard that takes a resolver)
 */
export type MiddlewareFactory<T = any> = (...args: unknown[]) => Middleware<T>;

/**
 * Compose multiple middleware functions into a single middleware
 * This properly types the composition to return NextApiHandler
 */
export function compose<T = any>(
  ...middlewares: Array<(handler: NextApiHandler<T>) => NextApiHandler<T>>
): (handler: NextApiHandler<T>) => NextApiHandler<T> {
  return middlewares.reduce(
    (acc, middleware) => (handler: NextApiHandler<T>) =>
      middleware(acc(handler)),
    (handler: NextApiHandler<T>) => handler
  );
}

/**
 * Helper to properly type the final API handler export
 * This ensures compatibility with Next.js expectations
 */
export function createApiHandler<T = any>(
  handler: (
    req: NextApiRequest,
    res: NextApiResponse<T>
  ) => void | Promise<void>,
  ...middlewares: Array<Middleware<T>>
): NextApiHandler<T> {
  const composed = compose(
    ...middlewares.map(
      middleware =>
        middleware as (handler: NextApiHandler<T>) => NextApiHandler<T>
    )
  );
  return composed(handler as NextApiHandler<T>);
}

/**
 * Type-safe wrapper for handlers that ensures NextApiHandler compatibility
 * Use this when middleware composition is causing type issues
 */
export function wrapHandler<T = any>(
  handler: (
    req: NextApiRequest,
    res: NextApiResponse<T>
  ) => void | Promise<void>
): NextApiHandler<T> {
  return handler as NextApiHandler<T>;
}

/**
 * Type-safe wrapper that ensures proper NextApiHandler typing
 * Use this as the final step in middleware composition to guarantee type compatibility
 */
export function asApiHandler(
  handler: (
    req: NextApiRequest,
    res: NextApiResponse
  ) => void | Promise<void> | Promise<NextApiResponse | void>
): NextApiHandler {
  return handler as NextApiHandler;
}
