/**
 * Office Action Detail API Endpoint
 * 
 * GET /api/office-actions/[officeActionId]
 * 
 * Retrieves detailed information about a specific office action including:
 * - Basic office action metadata
 * - Parsed rejections with claim numbers and prior art
 * - Examiner information and dates
 * - Security: Tenant isolation via office action ownership
 */

import { NextApiResponse } from 'next';
import { z } from 'zod';
import { AuthenticatedRequest } from '@/types/middleware';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { apiResponse } from '@/utils/api/responses';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { 
  findOfficeActionWithRelationsById,
  findOfficeActionById 
} from '@/repositories/officeActionRepository';
import { findRejectionsByOfficeAction } from '@/repositories/rejectionRepository';

const apiLogger = createApiLogger('office-actions/detail');

// ============ VALIDATION SCHEMAS ============

const querySchema = z.object({
  officeActionId: z.string().uuid('Invalid office action ID format'),
});

// ============ TENANT RESOLVER ============

const resolveTenantId = async (req: AuthenticatedRequest): Promise<string | null> => {
  const { officeActionId } = querySchema.parse(req.query);
  
  // Get the office action to resolve its tenant
  const officeAction = await findOfficeActionById(officeActionId, req.user!.tenantId!);
  return officeAction?.tenantId || null;
};

// ============ HANDLER ============

/**
 * Office Action Detail Handler
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
    // Validate query parameters
    const { officeActionId } = querySchema.parse(req.query);
    const { tenantId } = req.user!;

    if (!tenantId) {
      throw new ApplicationError(
        ErrorCode.TENANT_NOT_FOUND,
        'Tenant context is required'
      );
    }

    // Get office action with basic info
    const officeAction = await findOfficeActionById(officeActionId, tenantId);
    
    if (!officeAction) {
      throw new ApplicationError(
        ErrorCode.DB_RECORD_NOT_FOUND,
        'Office Action not found'
      );
    }

    // Get rejections for this office action
    const rejections = await findRejectionsByOfficeAction(officeActionId);

    apiLogger.info('Office Action detail retrieved successfully', {
      officeActionId,
      rejectionCount: rejections.length,
      tenantId,
    });

    return apiResponse.ok(res, {
      id: officeAction.id,
      projectId: officeAction.projectId,
      oaNumber: officeAction.oaNumber,
      dateIssued: officeAction.dateIssued,
      examinerId: officeAction.examinerId,
      artUnit: officeAction.artUnit,
      originalFileName: officeAction.originalFileName,
      status: officeAction.status,
      parsedJson: officeAction.parsedJson,
      createdAt: officeAction.createdAt,
      updatedAt: officeAction.updatedAt,
      rejections: rejections.map(r => ({
        id: r.id,
        type: r.type,
        claimNumbers: r.claimNumbers, // JSON string
        citedPriorArt: r.citedPriorArt, // JSON string or null
        examinerText: r.examinerText,
        displayOrder: r.displayOrder,
      })),
    });

  } catch (error) {
    apiLogger.error('Failed to retrieve office action detail', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (error instanceof ApplicationError) {
      throw error;
    }

    throw new ApplicationError(
      ErrorCode.INTERNAL_ERROR,
      'Failed to retrieve office action detail'
    );
  }
}

// ============ EXPORT WITH SECURITY ============

export default SecurePresets.tenantProtected(
  resolveTenantId,
  handler,
  {
    validate: {
      query: querySchema,
    },
    rateLimit: 'api',
  }
); 