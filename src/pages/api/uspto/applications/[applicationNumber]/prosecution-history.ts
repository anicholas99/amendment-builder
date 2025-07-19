import type { NextApiResponse } from 'next';
import { z } from 'zod';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { SecurePresets } from '@/server/api/securePresets';
import { AuthenticatedRequest } from '@/types/middleware';
import { apiResponse } from '@/utils/api/responses';
import { fetchProsecutionHistory, getProsecutionTimeline } from '@/lib/api/uspto/services/prosecutionHistoryService';

const apiLogger = createApiLogger('uspto-prosecution-history');

// Query schema
const querySchema = z.object({
  applicationNumber: z.string().min(1, 'Application number is required'),
  includeTimeline: z
    .string()
    .optional()
    .transform(val => val === 'true'),
});

/**
 * USPTO Prosecution History API Handler
 * Fetches complete prosecution history for a patent application
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  apiLogger.logRequest(req);

  if (req.method !== 'GET') {
    throw new ApplicationError(
      ErrorCode.VALIDATION_FAILED,
      `Method ${req.method} not allowed`
    );
  }

  try {
    const { applicationNumber, includeTimeline } = querySchema.parse(req.query);
    const { userId, tenantId } = req.user!;

    apiLogger.info('Fetching USPTO prosecution history', {
      applicationNumber,
      includeTimeline,
      userId,
      tenantId,
    });

    // Fetch prosecution history from USPTO
    const history = await fetchProsecutionHistory(applicationNumber);

    // Generate timeline if requested
    let timeline;
    if (includeTimeline) {
      timeline = getProsecutionTimeline(history);
    }

    apiLogger.info('USPTO prosecution history fetched successfully', {
      applicationNumber,
      documentCount: history.documents.length,
      statistics: history.statistics,
    });

    // Return the history data directly with timeline if requested
    return apiResponse.ok(res, {
      ...history,
      timeline,
    });
  } catch (error) {
    apiLogger.errorSafe('Failed to fetch USPTO prosecution history', error as Error);
    
    if (error instanceof ApplicationError) {
      throw error;
    }
    
    throw new ApplicationError(
      ErrorCode.API_NETWORK_ERROR,
      'Failed to fetch prosecution history from USPTO'
    );
  }
}

// SECURITY: This endpoint requires authentication
// Public USPTO data, so no tenant context needed
export default SecurePresets.userPrivate(handler, {
  validate: {
    query: querySchema,
  },
  rateLimit: 'search',
});