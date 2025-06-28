/**
 * Search History Item API
 *
 * This API handles retrieving a specific search history item by ID.
 */
import { NextApiRequest, NextApiResponse } from 'next';

import { createApiLogger } from '@/lib/monitoring/apiLogger';
import {
  deleteSearchHistoryById,
  getSearchHistoryWithTenant,
  findSearchHistoryWithProjectAccess,
} from '../../../repositories/searchRepository';
import { z, ZodError } from 'zod';
import { CustomApiRequest, ParsedElement } from '@/types/api';
import { AuthenticatedRequest } from '@/types/middleware';
import { idQuerySchema } from '@/lib/validation/schemas/shared/querySchemas';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { SearchDataService } from '@/server/services/search-data.server-service';
import { SecurePresets, TenantResolvers } from '@/lib/api/securePresets';

// Initialize apiLogger
const apiLogger = createApiLogger('search-history/:id');

// Define request body type for PATCH requests
interface UpdateSearchHistoryBody {
  parsedElements?: ParsedElement[];
}

// Input validation schema for PATCH
const patchSchema = z.object({
  parsedElements: z.any().optional(),
});

/**
 * Search History Item API handler
 */
async function handler(
  req: CustomApiRequest<UpdateSearchHistoryBody>,
  res: NextApiResponse
): Promise<void> {
  apiLogger.logRequest(req);

  // User and tenant context guaranteed by middleware
  const user = (req as AuthenticatedRequest).user!;
  const tenantId = user.tenantId;

  // Query parameters are validated by middleware
  const { id } = (req as any).validatedQuery as z.infer<typeof idQuerySchema>;

  const logData = { searchHistoryId: id, userId: user.id, tenantId };

  // GET method - Retrieve a search history entry
  if (req.method === 'GET') {
    apiLogger.info('Retrieving search history', logData);

    // First, check if the search history exists and belongs to the user's project
    const searchHistoryWithTenant = await getSearchHistoryWithTenant(id);

    if (!searchHistoryWithTenant) {
      apiLogger.warn('Search history not found', logData);
      throw new ApplicationError(
        ErrorCode.DB_RECORD_NOT_FOUND,
        'Search history not found'
      );
    }

    // Check if the user has access to the project (through project ownership)
    // Instead of checking tenant match, verify the user owns the project
    const searchHistoryWithProject = await findSearchHistoryWithProjectAccess(
      id,
      user.id
    );

    if (!searchHistoryWithProject) {
      apiLogger.warn(
        'Forbidden: User does not have access to this search history',
        logData
      );
      throw new ApplicationError(
        ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS,
        'Forbidden'
      );
    }

    // Get parsed elements using SearchDataService
    let parsedElementsFromVersion = null;
    const parsedElements = await SearchDataService.getSearchInputs(
      id, // searchHistoryId
      undefined // citationJobId
    );

    if (parsedElements && parsedElements.length > 0) {
      parsedElementsFromVersion = parsedElements;
      apiLogger.info('Retrieved parsed elements via SearchDataService', {
        searchHistoryId: id,
        elementCount: parsedElements.length,
      });
    }

    // Construct the response object
    const responseData = {
      ...searchHistoryWithProject,
      parsedElementsFromVersion,
    };

    return res.status(200).json(responseData);
  }

  // PATCH method - Update a search history entry
  else if (req.method === 'PATCH') {
    const validationResult = patchSchema.safeParse(req.body);
    if (!validationResult.success) {
      apiLogger.warn('Invalid PATCH body', {
        ...logData,
        errors: validationResult.error.errors,
      });
      throw new ApplicationError(
        ErrorCode.VALIDATION_FAILED,
        'Invalid request body: ' +
          validationResult.error.errors.map(e => e.message).join(', ')
      );
    }

    const { parsedElements } = validationResult.data;
    apiLogger.info('Updating search history', {
      ...logData,
      hasParsedElements: !!parsedElements,
    });

    // Note: ClaimSetVersion has been removed from the codebase
    if (parsedElements) {
      apiLogger.warn(
        'Attempted to update parsedElements on SearchHistory - this functionality has been deprecated',
        logData
      );
      throw new ApplicationError(
        ErrorCode.DEPRECATED_ENDPOINT,
        'Cannot update parsedElements on SearchHistory. This functionality has been deprecated.'
      );
    }

    apiLogger.warn('No valid fields to update', logData);
    throw new ApplicationError(
      ErrorCode.VALIDATION_FAILED,
      'No valid fields to update'
    );
  }

  // DELETE method - Allow users to delete their own search history
  else if (req.method === 'DELETE') {
    apiLogger.info('Deleting search history', logData);

    // Check if the user has access to the project (through project ownership)
    const searchHistoryWithProject = await findSearchHistoryWithProjectAccess(
      id,
      user.id
    );

    if (!searchHistoryWithProject) {
      apiLogger.warn(
        'Forbidden: User does not have access to delete this search history',
        logData
      );
      throw new ApplicationError(
        ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS,
        'Forbidden'
      );
    }

    const deleted = await deleteSearchHistoryById(id);
    if (!deleted) {
      apiLogger.warn('Search history not found for deletion', logData);
      throw new ApplicationError(
        ErrorCode.DB_RECORD_NOT_FOUND,
        'Search history not found'
      );
    }

    apiLogger.info('Successfully deleted search history', logData);
    return res
      .status(200)
      .json({ success: true, message: 'Search history deleted' });
  }

  // Other methods not allowed
  else {
    apiLogger.warn('Method not allowed', { ...logData, method: req.method });
    res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
    throw new ApplicationError(
      ErrorCode.VALIDATION_FAILED,
      'Method not allowed'
    );
  }
}

// Custom tenant resolver for the [id] route
const searchHistoryByIdTenantResolver = async (
  req: AuthenticatedRequest
): Promise<string | null> => {
  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return null;
  }

  const searchHistory = await getSearchHistoryWithTenant(id);
  return searchHistory?.tenantId || null;
};

// SECURITY: This endpoint is tenant-protected using search history-based resolution
// Users can only access/modify search history entries within their own tenant
export default SecurePresets.tenantProtected(
  searchHistoryByIdTenantResolver,
  handler,
  {
    validate: {
      query: idQuerySchema, // Always validate the ID parameter
      body: patchSchema,
      bodyMethods: ['PATCH'], // Only PATCH needs body validation
    },
    rateLimit: 'api',
  }
);
