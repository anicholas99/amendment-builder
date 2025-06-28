import { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';

/**
 * Type-safe handler that matches our middleware expectations
 */
export type TypedApiHandler = (
  req: NextApiRequest,
  res: NextApiResponse
) => Promise<void | NextApiResponse>;

/**
 * Wraps a standard Next.js API handler to ensure it returns the correct type
 */
export function createTypedHandler(
  handler: (req: NextApiRequest, res: NextApiResponse) => void | Promise<void>
): TypedApiHandler {
  return async (
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<void | NextApiResponse> => {
    await handler(req, res);
    return;
  };
}

/**
 * Type guard to check if a value is a NextApiResponse
 */
export function isNextApiResponse(value: unknown): value is NextApiResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'status' in value &&
    'json' in value &&
    'send' in value
  );
}

/**
 * Type assertion helper for middleware composition
 * Use this when middleware chain returns incompatible types
 */
export function asNextApiHandler(handler: unknown): NextApiHandler {
  return handler as NextApiHandler;
}
