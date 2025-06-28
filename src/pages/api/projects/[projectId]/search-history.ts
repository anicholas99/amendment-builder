import { NextApiRequest, NextApiResponse } from 'next';
import { createApiLogger } from '@/lib/monitoring/apiLogger';
import { findManySearchHistory } from '@/repositories/search';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { CustomApiRequest } from '@/types/api';
import { z } from 'zod';
import { RawSearchHistoryEntry } from '@/types/domain/searchHistory';
import { projectIdWithOptionsQuerySchema } from '@/lib/validation/schemas/shared/querySchemas';
import { AuthenticatedRequest } from '@/types/middleware';
import { SecurePresets, TenantResolvers } from '@/lib/api/securePresets';

const apiLogger = createApiLogger('project-search-history');

// Schema for request body
const bodySchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
});

type RequestBody = z.infer<typeof bodySchema>;

// Define a more complete type for our SearchHistory entries
interface EnhancedSearchHistory {
  id: string;
  timestamp: string; // ProcessedSearchHistoryEntry uses string
  [key: string]: any; // Allow other fields from ProcessedSearchHistoryEntry
}

/**
 * Search History API for a specific project
 *
 * This API handles retrieving search history for a specific project.
 */
async function handler(
  req: CustomApiRequest<RequestBody>,
  res: NextApiResponse
): Promise<void> {
  apiLogger.logRequest(req);

  try {
    if (req.method === 'GET') {
      // Query parameters are validated by middleware
      const { projectId, limit, includeResults } = (req as any)
        .validatedQuery as z.infer<typeof projectIdWithOptionsQuerySchema>;

      apiLogger.debug('Processing GET request', {
        projectId,
        limit,
        includeResults,
      });

      const queryOptions = {
        orderBy: { timestamp: 'desc' } as const,
        where: { projectId: projectId as string },
        ...(limit && { take: limit }),
      };

      apiLogger.info('Fetching search history for project', {
        projectId,
        limit,
      });
      const searchHistory = await findManySearchHistory(queryOptions);

      apiLogger.info('Successfully fetched search history for project', {
        count: searchHistory.length,
        projectId,
      });

      apiLogger.logResponse(200, { count: searchHistory.length });
      res.status(200).json(searchHistory);
    } else if (req.method === 'POST') {
      const validation = bodySchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: 'Invalid request body',
          details: validation.error.flatten(),
        });
      }
      const { projectId } = validation.data;
      apiLogger.debug('Processing POST request', { projectId });

      // This endpoint is for project-specific operations
      // For now, we'll return a method not allowed as the main search-history endpoint handles creation
      apiLogger.warn(
        'POST method not implemented for project-specific endpoint'
      );
      res
        .status(405)
        .json({ error: 'Use /api/search-history to create new entries' });
    } else {
      apiLogger.warn('Method not allowed', { method: req.method });
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    apiLogger.error('Error in project search history API handler', {
      error: err,
      method: req.method,
      projectId: req.query.projectId,
      operation: 'projectSearchHistoryHandler',
    });

    // Use ApplicationError instead of legacy error handling
    throw new ApplicationError(
      ErrorCode.INTERNAL_ERROR,
      'Failed to process search history request'
    );
  }
}

// Use the new secure preset for project search history
export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    validate: {
      query: projectIdWithOptionsQuerySchema,
    },
  }
);
