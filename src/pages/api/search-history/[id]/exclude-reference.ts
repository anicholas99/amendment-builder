import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest } from '@/types/middleware';
import { CustomApiRequest } from '@/types/api';
import { logger } from '@/server/logger';
import {
  findSearchHistoryById,
  updateSearchHistory,
  getSearchHistoryWithTenant,
} from '../../../../repositories/searchRepository';
import { addProjectExclusions } from '@/repositories/project/exclusions.repository';
import { ProjectExclusionMetadata } from '@/repositories/project/types';
import { z } from 'zod';
import { hasExcludedReferences, isRecord } from '@/types/safe-type-helpers';
import { safeJsonParse } from '@/utils/jsonUtils';
import { idQuerySchema } from '@/lib/validation/schemas/shared/querySchemas';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { SecurePresets } from '@/server/api/securePresets';

const apiLogger = createApiLogger('exclude-reference');

// Define request body type for excluding references
interface ExcludeReferenceBody {
  referenceNumber: string;
  projectId?: string;
  metadata?: Record<string, unknown>;
  matchId?: string;
}

// Define request body schema
const bodySchema = z.object({
  referenceNumber: z.string().min(1, 'Reference number is required'),
  projectId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  matchId: z.string().optional(),
});

const handler = async (
  req: CustomApiRequest<ExcludeReferenceBody>,
  res: NextApiResponse
): Promise<void> => {
  apiLogger.logRequest(req);

  // Only allow POST requests
  if (req.method !== 'POST') {
    apiLogger.warn('Method not allowed', { method: req.method });
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Query parameters are validated by middleware
  const { id: searchHistoryId } = (req as any).validatedQuery as z.infer<
    typeof idQuerySchema
  >;
  const { referenceNumber, projectId, metadata, matchId } = req.body;

  // User is already authenticated via withAuth middleware
  const userId = req.user?.id;

  if (!userId) {
    apiLogger.error('User ID not found in authenticated request');
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    apiLogger.info('Excluding reference from search history', {
      userId,
      searchHistoryId,
      referenceNumber,
      matchId,
    });

    if (!searchHistoryId) {
      res.status(400).json({ error: 'Missing or invalid search history ID' });
      return;
    }

    if (!referenceNumber || typeof referenceNumber !== 'string') {
      res.status(400).json({ error: 'Missing or invalid reference number' });
      return;
    }

    // Get current search history entry using repository
    const searchHistory = await findSearchHistoryById(searchHistoryId, {
      projectId: true, // Only select projectId for exclusion
    });

    if (!searchHistory) {
      res.status(404).json({ error: 'Search history not found' });
      return;
    }

    // Use the projectId from the fetched search history if not provided in the body
    const effectiveProjectId = projectId || searchHistory.projectId;
    if (!effectiveProjectId) {
      logger.error(
        `Project ID not found in body or search history record ${searchHistoryId} for exclusion.`
      );
      res.status(400).json({
        error: 'Project ID required for exclusion management',
      });
      return;
    }

    // Note: After migration, exclusions are managed entirely through ProjectExclusion table
    // searchData field no longer exists on SearchHistory
    logger.info('Managing exclusion through ProjectExclusion table only', {
      projectId: effectiveProjectId,
      referenceNumber,
    });

    // Add exclusion to ProjectExclusion table using repository
    try {
      // The addProjectExclusions repository function handles checking for duplicates
      const exclusionResult = await addProjectExclusions(
        effectiveProjectId,
        [referenceNumber],
        // Add metadata for the exclusion if provided - transform to expected type
        metadata
          ? { [referenceNumber]: metadata as ProjectExclusionMetadata }
          : {}
      );

      const isNewlyExcluded = exclusionResult.added > 0;

      if (isNewlyExcluded) {
        logger.info(
          `Saved exclusion to ProjectExclusion table: ${referenceNumber} for project ${effectiveProjectId}`
        );
      } else if (exclusionResult.skipped > 0) {
        logger.info(
          `Exclusion already existed in ProjectExclusion table: ${referenceNumber} for project ${effectiveProjectId}`
        );
      }

      res.status(200).json({
        success: true,
        excluded: true, // After migration, this endpoint only adds exclusions
        message: isNewlyExcluded
          ? 'Reference successfully excluded'
          : 'Reference was already excluded',
      });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Error saving to ProjectExclusion via repository', {
        error: err,
        projectId: effectiveProjectId,
        referenceNumber,
      });
      res.status(500).json({
        error: 'Failed to exclude reference',
        details: err.message,
      });
    }
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Error excluding reference', err);
    res.status(500).json({ error: 'Failed to exclude reference' });
  }
};

export default SecurePresets.tenantProtected(
  async (req: AuthenticatedRequest) => {
    const { id: searchHistoryId } = req.query;
    if (!searchHistoryId) return null;

    // Use repository function instead of direct Prisma call
    const searchHistory = await getSearchHistoryWithTenant(
      String(searchHistoryId)
    );
    return searchHistory?.tenantId || null;
  },
  handler,
  {
    validate: {
      query: idQuerySchema, // Validate search history ID parameter
      body: bodySchema,
      bodyMethods: ['POST'], // Only POST needs body validation
    },
    rateLimit: 'api',
  }
);
