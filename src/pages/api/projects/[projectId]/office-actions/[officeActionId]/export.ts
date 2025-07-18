/**
 * Amendment Export API Endpoint
 * 
 * Generates and exports amendment response documents as DOCX/PDF.
 * Follows security patterns with tenant isolation and proper validation.
 */

import { NextApiResponse } from 'next';
import { z } from 'zod';
import { AuthenticatedRequest } from '@/types/middleware';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { apiResponse } from '@/utils/api/responses';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { AmendmentExportServerService } from '@/server/services/amendment-export.server-service';
import { findOfficeActionById } from '@/repositories/officeActionRepository';
import { withAuth } from '@/middleware/auth';
import { withTenantGuard } from '@/middleware/authorization';
import { prisma } from '@/lib/prisma';

const apiLogger = createApiLogger('amendment-export');

// ============ VALIDATION SCHEMAS ============

const querySchema = z.object({
  projectId: z.string().uuid('Invalid project ID format'),
  officeActionId: z.string().uuid('Invalid office action ID format'),
});

const exportRequestSchema = z.object({
  content: z.object({
    title: z.string().min(1, 'Title is required'),
    responseType: z.enum(['AMENDMENT', 'CONTINUATION', 'RCE']),
    claimAmendments: z.array(
      z.object({
        id: z.string(),
        claimNumber: z.string(),
        status: z.enum(['CURRENTLY_AMENDED', 'PREVIOUSLY_PRESENTED', 'NEW', 'CANCELLED']),
        originalText: z.string(),
        amendedText: z.string(),
        reasoning: z.string(),
      })
    ),
    argumentSections: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        content: z.string(),
        type: z.string(),
        rejectionId: z.string().optional(),
      })
    ),
  }),
  options: z.object({
    format: z.enum(['docx', 'pdf']).default('docx'),
    includeMetadata: z.boolean().default(true),
    firmName: z.string().optional(),
    attorneyName: z.string().optional(),
    docketNumber: z.string().optional(),
  }).optional(),
});

// ============ MAIN HANDLER ============

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  apiLogger.logRequest(req);

  if (req.method !== 'POST') {
    return apiResponse.methodNotAllowed(res, ['POST']);
  }

  const { projectId, officeActionId } = querySchema.parse(req.query);
  const { id: userId, tenantId } = req.user!;

  // TypeScript safety check - middleware guarantees this
  if (!tenantId) {
    throw new Error('Tenant ID is required but was not provided by middleware');
  }

  try {
    // Validate request body
    const exportRequest = exportRequestSchema.parse(req.body);

    // Get office action with metadata
    const officeAction = await findOfficeActionById(officeActionId, tenantId);
    if (!officeAction) {
      return apiResponse.notFound(res, 'Office Action not found');
    }

    // Parse office action metadata for export options
    let parsedMetadata: any = {};
    if (officeAction.parsedJson) {
      try {
        parsedMetadata = JSON.parse(officeAction.parsedJson);
      } catch (error) {
        apiLogger.warn('Failed to parse office action metadata', {
          officeActionId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Prepare export options with metadata
    const exportOptions = {
      format: exportRequest.options?.format || 'docx',
      includeMetadata: exportRequest.options?.includeMetadata ?? true,
      firmName: exportRequest.options?.firmName,
      attorneyName: exportRequest.options?.attorneyName,
      docketNumber: exportRequest.options?.docketNumber,
      // Office action metadata
      applicationNumber: parsedMetadata.applicationNumber || officeAction.oaNumber,
      mailingDate: parsedMetadata.mailingDate || officeAction.dateIssued?.toISOString(),
      examinerName: parsedMetadata.examiner?.name || officeAction.examinerId,
    };

    apiLogger.info('Starting amendment document export', {
      projectId,
      officeActionId,
      format: exportOptions.format,
      claimCount: exportRequest.content.claimAmendments.length,
      argumentCount: exportRequest.content.argumentSections.length,
      hasMetadata: !!parsedMetadata.applicationNumber,
    });

    // Generate document
    const exportResult = await AmendmentExportServerService.generateAmendmentDocument(
      exportRequest.content,
      exportOptions,
      {
        projectId,
        officeActionId,
        tenantId,
      }
    );

    if (!exportResult.success || !exportResult.documentBuffer) {
      return apiResponse.serverError(res, new Error('Document generation failed'));
    }

    // Set appropriate headers for file download
    const contentType = exportResult.mimeType;
    const fileName = exportResult.fileName;

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', exportResult.fileSize);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    apiLogger.info('Amendment document exported successfully', {
      projectId,
      officeActionId,
      fileName: exportResult.fileName,
      fileSize: exportResult.fileSize,
      format: exportResult.format,
      wordCount: exportResult.metadata.wordCount,
      pageCount: exportResult.metadata.pageCount,
    });

    // Send the file buffer
    res.status(200).send(exportResult.documentBuffer);
  } catch (error) {
    apiLogger.errorSafe('Amendment export failed', error as Error);

    if (error instanceof ApplicationError) {
      // Route to appropriate response method based on status code
      switch (error.statusCode) {
        case 400:
          return apiResponse.badRequest(res, error.message);
        case 401:
          return apiResponse.unauthorized(res, error.message);
        case 403:
          return apiResponse.forbidden(res, error.message);
        case 404:
          return apiResponse.notFound(res, error.message);
        case 409:
          return apiResponse.conflict(res, error.message);
        case 429:
          return apiResponse.tooManyRequests(res);
        default:
          return apiResponse.serverError(res, error);
      }
    }

    return apiResponse.serverError(res, error as Error);
  }
}

// ============ TENANT GUARD RESOLVER ============

/**
 * Resolve tenant ID from office action
 */
const resolveTenantId = async (req: AuthenticatedRequest): Promise<string | null> => {
  const { officeActionId } = req.query;
  
  if (!prisma || !officeActionId) {
    return null;
  }

  const officeAction = await (prisma as any).officeAction.findUnique({
    where: { id: String(officeActionId) },
    select: { tenantId: true },
  });
  
  return officeAction?.tenantId || null;
};

// Apply middleware in correct order
const guardedHandler = withTenantGuard(resolveTenantId)(handler);
export default withAuth(guardedHandler as any); 