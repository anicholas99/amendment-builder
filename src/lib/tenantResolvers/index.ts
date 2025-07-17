import { AuthenticatedRequest } from '@/types/middleware';
import { findWithTenantInfo } from '@/repositories/citationJobRepository';
import { getProjectTenantId } from '@/repositories/project';
import { findSearchHistoryById } from '@/repositories/search';
import { logger } from '@/server/logger';
import { resolveTenantIdFromCitation } from '@/utils/objectUtils';

/**
 * Common tenant resolver functions to be used with withTenantGuard middleware.
 *
 * These resolvers centralize tenant resolution logic to avoid code duplication
 * and ensure consistent security checks across all API routes.
 */

/**
 * Resolves tenant ID from the authenticated user's session.
 * Use this for endpoints that don't reference a specific resource.
 *
 * @example
 * // For user-specific operations like uploads or preferences
 * export default withTenantGuard(resolveTenantFromUser)(handler);
 */
export const resolveTenantFromUser = async (
  req: AuthenticatedRequest
): Promise<string | null> => {
  return req.user?.tenantId || null;
};

/**
 * Resolves tenant ID from a project ID in the query parameters.
 * Use this for project-specific endpoints.
 *
 * @example
 * // For endpoints like /api/projects/[projectId]/...
 * export default withTenantGuard(resolveTenantFromProjectId)(handler);
 */
export const resolveTenantFromProjectId = async (
  req: AuthenticatedRequest
): Promise<string | null> => {
  const { projectId } = req.query;
  if (!projectId || typeof projectId !== 'string') return null;

  const project = await getProjectTenantId(projectId);
  return project?.tenantId || null;
};

/**
 * Resolves tenant ID from a project ID in the request body.
 * Use this for POST/PUT endpoints that receive projectId in the body.
 *
 * @example
 * // For endpoints that create resources under a project
 * export default withTenantGuard(resolveTenantFromProjectIdInBody)(handler);
 */
export const resolveTenantFromProjectIdInBody = async (
  req: AuthenticatedRequest
): Promise<string | null> => {
  const { projectId } = req.body || {};
  if (!projectId || typeof projectId !== 'string') {
    return req.user?.tenantId || null;
  }

  const project = await getProjectTenantId(projectId);
  return project?.tenantId || null;
};

/**
 * Resolves tenant ID from a citation job ID by traversing the relationship:
 * CitationJob -> SearchHistory -> Project -> tenantId
 *
 * @example
 * // For endpoints like /api/citation-jobs/[id]/...
 * export default withTenantGuard(resolveTenantFromCitationJobId)(handler);
 */
export const resolveTenantFromCitationJobId = async (
  req: AuthenticatedRequest
): Promise<string | null> => {
  const { id } = req.query;
  if (!id || typeof id !== 'string') return null;

  try {
    const job = await findWithTenantInfo(id);
    return job?.searchHistory?.project?.tenantId || null;
  } catch (error) {
    logger.error('Error resolving tenant from citation job', {
      citationJobId: id,
      error,
    });
    return null;
  }
};

/**
 * Resolves tenant ID from a search history ID.
 * Handles both query parameters and request body.
 *
 * @example
 * // For endpoints that work with search history
 * export default withTenantGuard(resolveTenantFromSearchHistory)(handler);
 */
export const resolveTenantFromSearchHistory = async (
  req: AuthenticatedRequest
): Promise<string | null> => {
  // Check query params first
  let searchHistoryId = req.query.searchHistoryId;

  // Check body if not in query
  if (!searchHistoryId && req.body) {
    searchHistoryId = req.body.searchHistoryId;
  }

  if (!searchHistoryId || typeof searchHistoryId !== 'string') {
    logger.warn('No searchHistoryId found in request');
    return req.user?.tenantId || null;
  }

  try {
    // Use getSearchHistoryWithTenant since it's specifically designed to get tenant information
    const { getSearchHistoryWithTenant } = require('@/repositories/search');
    const searchHistoryWithTenant =
      await getSearchHistoryWithTenant(searchHistoryId);

    if (!searchHistoryWithTenant) {
      logger.warn('Search history not found for tenant resolution', {
        searchHistoryId,
      });
      return req.user?.tenantId || null;
    }

    const tenantId = searchHistoryWithTenant.tenantId;

    if (!tenantId) {
      logger.warn(
        'Could not resolve tenant from search history, using user tenant',
        {
          searchHistoryId,
          userTenantId: req.user?.tenantId,
        }
      );
      return req.user?.tenantId || null;
    }

    return tenantId;
  } catch (error) {
    logger.error('Error resolving tenant from search history', {
      searchHistoryId,
      error,
    });
    return req.user?.tenantId || null;
  }
};

/**
 * Resolves tenant ID for citation job operations.
 * Handles GET (query param), POST (body), and PUT (job ID in query).
 *
 * @example
 * // For /api/citation-jobs endpoint with multiple methods
 * export default withTenantGuard(resolveTenantForCitationJobs)(handler);
 */
export const resolveTenantForCitationJobs = async (
  req: AuthenticatedRequest
): Promise<string | null> => {
  if (req.method === 'GET' || req.method === 'POST') {
    // For GET and POST, use searchHistoryId
    return resolveTenantFromSearchHistory(req);
  } else if (req.method === 'PUT') {
    // For PUT, we have jobId in query
    const { jobId } = req.query;
    if (jobId && typeof jobId === 'string') {
      const job = await findWithTenantInfo(jobId);

      if (!job) {
        logger.warn('Citation job not found for tenant resolution', { jobId });
        return req.user?.tenantId || null;
      }

      const tenantId = resolveTenantIdFromCitation(job);

      if (!tenantId) {
        logger.warn(
          'Could not resolve tenant from citation job, using user tenant',
          {
            jobId,
            userTenantId: req.user?.tenantId,
          }
        );
        return req.user?.tenantId || null;
      }

      return tenantId;
    }
  }

  // Default to user's tenant
  return req.user?.tenantId || null;
};

/**
 * Factory function to create a tenant resolver from a query parameter.
 * Useful for simple cases where the tenant ID is directly in the query.
 *
 * @example
 * // For endpoints that receive tenantId directly
 * export default withTenantGuard(createTenantResolverFromQuery('tenantId'))(handler);
 */
export const createTenantResolverFromQuery = (paramName: string) => {
  return async (req: AuthenticatedRequest): Promise<string | null> => {
    const value = req.query[paramName];
    return typeof value === 'string' ? value : null;
  };
};
