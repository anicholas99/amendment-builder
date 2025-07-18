/**
 * Office Action Extracted Text API Endpoint
 * 
 * GET /api/office-actions/[officeActionId]/extracted-text
 * Returns the raw extracted text for debugging purposes
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/middleware/auth';
import { withTenantGuard } from '@/middleware/authorization';
import { apiResponse } from '@/utils/api/responses';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { prisma } from '@/lib/prisma';
import { ApplicationError, ErrorCode } from '@/lib/error';

const apiLogger = createApiLogger('office-actions/extracted-text');

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return apiResponse.methodNotAllowed(res);
  }

  const { officeActionId } = req.query;

  if (!officeActionId || typeof officeActionId !== 'string') {
    return apiResponse.badRequest(res, 'Office Action ID is required');
  }

  try {
    apiLogger.info('Fetching extracted text', {
      officeActionId,
      userId: req.user?.userId,
    });

    // Get the office action with extracted text
    const officeAction = await prisma.officeAction.findFirst({
      where: {
        id: officeActionId,
        tenantId: req.user!.tenantId!,
        deletedAt: null,
      },
      select: {
        id: true,
        originalFileName: true,
        extractedText: true,
        status: true,
        createdAt: true,
      },
    });

    if (!officeAction) {
      return apiResponse.notFound(res, 'Office Action not found');
    }

    apiLogger.info('Extracted text retrieved', {
      officeActionId,
      hasExtractedText: !!officeAction.extractedText,
      textLength: officeAction.extractedText?.length || 0,
    });

    return apiResponse.ok(res, {
      id: officeAction.id,
      fileName: officeAction.originalFileName,
      status: officeAction.status,
      createdAt: officeAction.createdAt,
      extractedText: officeAction.extractedText,
      textLength: officeAction.extractedText?.length || 0,
      contains112: officeAction.extractedText?.includes('112') || false,
    });

  } catch (error) {
    apiLogger.error('Failed to fetch extracted text', {
      error: error instanceof Error ? error.message : String(error),
      officeActionId,
    });

    if (error instanceof ApplicationError) {
      return apiResponse.error(res, error.code, error.message);
    }

    return apiResponse.internalServerError(res, 'Failed to fetch extracted text');
  }
}

// Tenant resolver for the guard
const resolveTenantId = async (req: NextApiRequest): Promise<string | null> => {
  const { officeActionId } = req.query;
  
  const officeAction = await prisma.officeAction.findUnique({
    where: { id: String(officeActionId) },
    select: { tenantId: true }
  });
  
  return officeAction?.tenantId || null;
};

const guardedHandler = withTenantGuard(resolveTenantId)(handler);
export default withAuth(guardedHandler as any); 