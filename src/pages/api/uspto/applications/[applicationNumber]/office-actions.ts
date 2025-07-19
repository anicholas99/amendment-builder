import type { NextApiResponse } from 'next';
import { z } from 'zod';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { AuthenticatedRequest } from '@/types/middleware';
import { apiResponse } from '@/utils/api/responses';
import { fetchApplicationOfficeActions } from '@/lib/api/uspto/services/officeActionService';
import { logAIOperation } from '@/server/services/aiAuditService';

const apiLogger = createApiLogger('uspto-office-actions');

// Query schema
const querySchema = z.object({
  applicationNumber: z.string().min(1, 'Application number is required'),
  includeContent: z
    .string()
    .optional()
    .transform(val => val === 'true'),
  filterCodes: z
    .string()
    .optional()
    .transform(val => val ? val.split(',') : undefined),
});

/**
 * USPTO Office Actions API Handler
 * Fetches Office Actions for a patent application from USPTO
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
    const { applicationNumber, includeContent, filterCodes } = querySchema.parse(req.query);
    const { userId, tenantId } = req.user!;

    apiLogger.info('Fetching USPTO Office Actions', {
      applicationNumber,
      includeContent,
      filterCodes,
      userId,
      tenantId,
    });

    // Fetch Office Actions from USPTO
    const result = await fetchApplicationOfficeActions(applicationNumber, {
      includeDocumentContent: includeContent,
      filterCodes: filterCodes as any,
    });

    // Log the AI operation for compliance
    await logAIOperation({
      tenantId: tenantId!,
      userId: userId!,
      projectId: null, // No project context for direct USPTO queries
      operationType: 'uspto_office_action_fetch',
      model: 'USPTO API',
      prompt: `Fetch Office Actions for application ${applicationNumber}`,
      response: `Found ${result.officeActions.length} Office Actions`,
      tokenUsage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      },
      cost: 0, // USPTO API is free
      metadata: {
        applicationNumber,
        officeActionCount: result.officeActions.length,
        includeContent,
      },
    });

    apiLogger.info('USPTO Office Actions fetched successfully', {
      applicationNumber,
      count: result.officeActions.length,
    });

    return apiResponse.ok(res, {
      success: true,
      data: result,
    });
  } catch (error) {
    apiLogger.errorSafe('Failed to fetch USPTO Office Actions', error as Error);
    
    if (error instanceof ApplicationError) {
      throw error;
    }
    
    throw new ApplicationError(
      ErrorCode.API_NETWORK_ERROR,
      'Failed to fetch Office Actions from USPTO'
    );
  }
}

// SECURITY: This endpoint requires authentication but not tenant context
// as it's fetching public USPTO data
export default SecurePresets.userPrivate(handler, {
  validate: {
    query: querySchema,
  },
  rateLimit: 'search', // Use search rate limit for external API calls
});