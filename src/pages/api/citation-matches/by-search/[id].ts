import type { NextApiResponse, NextApiRequest } from 'next';

import { AuthenticatedRequest } from '@/types/middleware';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { findBySearchHistory } from '@/repositories/citationRepository';
import { getSearchHistoryWithTenant } from '@/repositories/search';
import { CustomApiRequest } from '@/types/api';
import { z } from 'zod';
import { idQuerySchema } from '@/lib/validation/schemas/shared/querySchemas';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { serializeCitationMatch } from '@/features/citation-extraction/utils/citation';
import { withAuth } from '@/middleware/auth';
import { withTenantGuard } from '@/middleware/authorization';
import { withErrorHandling } from '@/middleware/errorHandling';
import { withRateLimit } from '@/middleware/rateLimiter';
import { requireRole } from '@/middleware/role';
import { withMethod } from '@/middleware/method';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { apiResponse } from '@/utils/api/responses';

// Define request body type (empty for this GET endpoint)
interface EmptyBody {}

// Define the citation match type based on repository return
interface CitationMatchFromRepo {
  parsedElementText: string | null;
  [key: string]: unknown;
}

// Define the grouped element structure to match serialized citation matches
interface GroupedElement {
  elementText: string;
  matches: Array<Record<string, any>>; // Serialized citation matches are plain objects
}

// Tenant resolver - get tenant from search history
const resolveTenantId = async (
  req: AuthenticatedRequest
): Promise<string | null> => {
  const { id } = req.query as z.infer<typeof idQuerySchema>;

  // Use repository function instead of direct Prisma call
  const searchHistory = await getSearchHistoryWithTenant(id);
  return searchHistory?.tenantId || null;
};

// Create the handler function separately for use with withAuth
async function handler(
  req: CustomApiRequest<EmptyBody>,
  res: NextApiResponse
): Promise<void> {
  const apiLogger = createApiLogger('citation-matches-by-search');
  apiLogger.logRequest(req);

  if (req.method !== 'GET') {
    apiLogger.warn('Method not allowed', { method: req.method });
    return apiResponse.methodNotAllowed(res, ['GET']);
  }

  // Query parameters are validated by middleware
  const { id } = req.query as z.infer<typeof idQuerySchema>;

  try {
    apiLogger.info('Fetching citation matches for search history', {
      searchHistoryId: id,
    });

    // ✅ Migrated to repository for consistency and testability
    const citationMatches = await findBySearchHistory(id);

    // Serialize the matches for backward compatibility
    const serializedMatches = citationMatches.map(match => ({
      ...serializeCitationMatch(match),
      searchId: id, // Add the searchId to each match
    }));

    // Group the matches by parsed element text
    // IMPORTANT: We use a Map to preserve insertion order, and since
    // matches come from DB ordered by elementOrder, the first occurrence
    // of each element determines its position in the final array
    const groupedByElement: Map<string, GroupedElement> = new Map();

    // Process matches in the order they come from the database
    serializedMatches.forEach(match => {
      const elementText = match.parsedElementText || 'Unknown Element';

      if (!groupedByElement.has(elementText)) {
        // First time seeing this element - Map preserves insertion order
        groupedByElement.set(elementText, {
          elementText,
          matches: [],
        });
      }

      groupedByElement.get(elementText)!.matches.push(match);
    });

    // Convert Map to array - insertion order is preserved by Map
    const groupedResults = Array.from(groupedByElement.values());

    // Sort groups by the elementOrder of their first match
    // This ensures the table displays elements in the correct order (0, 1, 2, 3, etc.)
    groupedResults.sort((a, b) => {
      const aOrder =
        (a.matches[0] as any)?.elementOrder ?? Number.MAX_SAFE_INTEGER;
      const bOrder =
        (b.matches[0] as any)?.elementOrder ?? Number.MAX_SAFE_INTEGER;
      return aOrder - bOrder;
    });

    // Debug logging to verify order
    apiLogger.debug('Citation matches grouping order', {
      searchHistoryId: id,
      matchOrder: serializedMatches.slice(0, 10).map(m => ({
        elementOrder: (m as any).elementOrder,
        elementText: m.parsedElementText?.substring(0, 50),
      })),
      groupOrder: groupedResults.map((g, i) => ({
        index: i,
        elementText: g.elementText.substring(0, 50),
        firstMatchElementOrder: (g.matches[0] as any)?.elementOrder,
      })),
    });

    apiLogger.info('Citation matches retrieved successfully', {
      searchHistoryId: id,
      groupCount: groupedResults.length,
      totalMatches: citationMatches.length,
    });

    return apiResponse.ok(res, {
      groupedResults,
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    apiLogger.error('Error fetching citation matches', {
      error: err,
      searchHistoryId: id,
    });
    // Use ApplicationError instead of legacy error handling
    throw new ApplicationError(
      ErrorCode.INTERNAL_ERROR,
      'Failed to retrieve citation matches'
    );
  }
}

// Middleware wrapper to validate query parameters
const withQueryValidation = (handler: any) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const validatedQuery = idQuerySchema.parse(req.query);
      req.query = validatedQuery;
      return handler(req, res);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return apiResponse.badRequest(res, 'Query validation failed');
      }
      throw error;
    }
  };
};

// Use the new secure preset to simplify the middleware chain
export default SecurePresets.tenantProtected(resolveTenantId, handler, {
  validate: {
    query: idQuerySchema,
  },
  rateLimit: 'read', // Use read-only rate limits for this GET endpoint
});
