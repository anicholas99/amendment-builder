import type { NextApiResponse } from 'next';
import { z } from 'zod';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { SecurePresets } from '@/server/api/securePresets';
import { AuthenticatedRequest } from '@/types/middleware';
import { apiResponse } from '@/utils/api/responses';
import { hasOfficeActions } from '@/lib/api/uspto/services/officeActionService';

const apiLogger = createApiLogger('uspto-status-check');

// Query schema
const querySchema = z.object({
  applicationNumber: z.string().min(1, 'Application number is required'),
});

/**
 * USPTO Application Status API Handler
 * Checks if an application has Office Actions
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
    const { applicationNumber } = querySchema.parse(req.query);
    const { userId, tenantId } = req.user!;

    apiLogger.info('Checking USPTO application status', {
      applicationNumber,
      userId,
      tenantId,
    });

    // Check if the application has Office Actions
    const hasOAs = await hasOfficeActions(applicationNumber);

    apiLogger.info('USPTO application status checked', {
      applicationNumber,
      hasOfficeActions: hasOAs,
    });

    return apiResponse.ok(res, {
      success: true,
      data: {
        applicationNumber,
        hasOfficeActions: hasOAs,
        lastChecked: new Date().toISOString(),
      },
    });
  } catch (error) {
    apiLogger.errorSafe('Failed to check USPTO application status', error as Error);
    
    if (error instanceof ApplicationError) {
      throw error;
    }
    
    throw new ApplicationError(
      ErrorCode.API_NETWORK_ERROR,
      'Failed to check application status'
    );
  }
}

// SECURITY: Requires authentication
export default SecurePresets.authenticated(handler, {
  validate: {
    query: querySchema,
  },
  rateLimit: 'api', // Use standard API rate limit for status checks
});