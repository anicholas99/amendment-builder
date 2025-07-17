import { NextApiRequest, NextApiResponse } from 'next';
import { ZodError, ZodSchema } from 'zod';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { AuthenticatedRequest } from '@/types/middleware';

const apiLogger = createApiLogger('query-validation');

/**
 * Creates a middleware that validates API route query parameters using a Zod schema.
 * If validation fails, it logs a warning and returns a 400 response.
 * The validated query is attached to `req.validatedQuery`.
 *
 * @param schema The Zod schema to validate the query against.
 * @returns A middleware function.
 */
export const withQueryValidation = <T extends ZodSchema>(schema: T) => {
  return (
      handler: (
        req: AuthenticatedRequest & { validatedQuery: T['_output'] },
        res: NextApiResponse
      ) => Promise<void> | unknown
    ) =>
    async (req: AuthenticatedRequest, res: NextApiResponse): Promise<void> => {
      try {
        const validatedQuery = schema.parse(req.query);
        // Attach the validated query to a custom property
        (req as any).validatedQuery = validatedQuery;
        await handler(
          req as AuthenticatedRequest & { validatedQuery: T['_output'] },
          res
        );
      } catch (error) {
        if (error instanceof ZodError) {
          apiLogger.warn('Query validation failed', {
            errors: error.errors,
            path: req.url,
          });
          res.status(400).json({
            error: 'Query validation failed',
            details: error.errors.map(err => ({
              path: err.path.join('.'),
              message: err.message,
            })),
          });
          return;
        }
        // For any other error, re-throw to be handled by the global error handler
        throw error;
      }
    };
};
