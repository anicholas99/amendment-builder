import { NextApiResponse, NextApiRequest } from 'next';

import { CitationResults } from '../../../types/searchTypes';
import { logger } from '@/server/logger';
import {
  getCitationResultsBySearchId,
  saveCitationResultsForSearchId,
  getSearchHistoryWithTenant,
} from '../../../repositories/searchRepository';
import { AuthenticatedRequest } from '@/types/middleware';
import { CustomApiRequest } from '@/types/api';
import { z, ZodError } from 'zod';
import { searchIdQuerySchema } from '@/lib/validation/schemas/shared/querySchemas';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';

// Define request body type for POST requests (CitationResults), GET has no body
interface CitationResultsBody extends CitationResults {}

/**
 * Citation Results API handler
 *
 * This endpoint allows saving and retrieving citation results for a search.
 */
const baseHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
): Promise<void> => {
  try {
    // Query parameters are validated by middleware
    const { searchId } = (req as any).validatedQuery as z.infer<
      typeof searchIdQuerySchema
    >;

    // GET method - retrieve citation results
    if (req.method === 'GET') {
      // Get citation results using the repository function
      const response = await getCitationResultsBySearchId(searchId);

      if (!response) {
        res.status(404).json({ error: 'Search history not found' });
        return;
      }

      res.status(200).json(response);
      return;
    }

    // POST method - save citation results
    else if (req.method === 'POST') {
      const citationResults = req.body as CitationResultsBody;

      if (!citationResults) {
        res.status(400).json({ error: 'Citation results are required' });
        return;
      }

      // Save citation results using the repository function
      const success = await saveCitationResultsForSearchId(
        searchId,
        citationResults
      );

      if (!success) {
        res.status(404).json({
          error: 'Failed to save citation results. Search history not found.',
        });
        return;
      }

      logger.info('Saved citation results', { searchId });

      res.status(200).json({
        message: 'Citation results saved successfully',
        searchId: searchId,
      });
      return;
    }

    // Method not allowed
    else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Error in citation results API', { error: err.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Define a tenant resolver specific to this endpoint
const resolveTenantFromSearchId = async (req: AuthenticatedRequest) => {
  const { searchId } = req.query;
  if (!searchId || typeof searchId !== 'string') return null;

  try {
    const searchHistory = await getSearchHistoryWithTenant(searchId);
    return searchHistory?.tenantId || null;
  } catch (error) {
    logger.error('Error resolving tenant ID from searchId', {
      searchId,
      error,
    });
    return null;
  }
};

// Use the new secure preset for tenant protection and validation
export default SecurePresets.tenantProtected(
  resolveTenantFromSearchId,
  baseHandler,
  {
    validate: {
      query: searchIdQuerySchema, // Validate searchId parameter
    },
  }
);
