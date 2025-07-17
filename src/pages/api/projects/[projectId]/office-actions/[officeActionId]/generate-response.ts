/**
 * Generate Office Action Response Shell API Endpoint
 * 
 * POST /api/projects/[projectId]/office-actions/[officeActionId]/generate-response
 * 
 * Generates a structured Office Action response document shell with:
 * - AI-powered content generation
 * - Firm template customization
 * - Rejection-specific sections
 * - Editable field placeholders
 */

import { NextApiResponse } from 'next';
import { z } from 'zod';
import { AuthenticatedRequest } from '@/types/middleware';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { apiResponse } from '@/utils/api/responses';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { ResponseShellGenerationService } from '@/server/services/response-shell-generation.server-service';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';

const apiLogger = createApiLogger('office-actions/generate-response');

// ============ VALIDATION SCHEMAS ============

const querySchema = z.object({
  projectId: z.string().uuid('Invalid project ID format'),
  officeActionId: z.string().uuid('Invalid office action ID format'),
});

const requestBodySchema = z.object({
  templateStyle: z.enum(['formal', 'standard', 'concise']).optional().default('standard'),
  includeBoilerplate: z.boolean().optional().default(true),
  firmName: z.string().optional(),
}).strict();

// ============ HANDLER ============

/**
 * Generate Office Action Response Shell Handler
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  apiLogger.logRequest(req);

  if (req.method !== 'POST') {
    throw new ApplicationError(
      ErrorCode.VALIDATION_FAILED,
      `Method ${req.method} not allowed`
    );
  }

  try {
    // Validate query parameters
    const { projectId, officeActionId } = querySchema.parse(req.query);
    const { id: userId, tenantId } = req.user!;

    if (!tenantId) {
      throw new ApplicationError(
        ErrorCode.TENANT_NOT_FOUND,
        'Tenant context is required'
      );
    }

    // Validate request body
    const requestData = requestBodySchema.parse(req.body);

    // Generate response shell
    const shellResult = await ResponseShellGenerationService.generateResponseShell({
      officeActionId,
      projectId,
      tenantId,
      userId,
      templateStyle: requestData.templateStyle,
      includeBoilerplate: requestData.includeBoilerplate,
      firmName: requestData.firmName,
    });

    apiLogger.info('Office Action response shell generated successfully', {
      officeActionId,
      projectId,
      sectionCount: shellResult.sections.length,
      templateStyle: requestData.templateStyle,
      totalRejections: shellResult.metadata.totalRejections,
    });

    return apiResponse.ok(res, {
      responseShell: shellResult,
      message: 'Response shell generated successfully',
    });

  } catch (error) {
    apiLogger.error('Failed to generate response shell', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (error instanceof ApplicationError) {
      return apiResponse.serverError(res, error);
    }

    return apiResponse.serverError(res, 
      new ApplicationError(
        ErrorCode.INTERNAL_ERROR,
        'Failed to generate response shell'
      )
    );
  }
}

// ============ EXPORT WITH SECURITY ============

export default SecurePresets.tenantProtected(
  TenantResolvers.fromUser,
  handler,
  {
    rateLimit: 'ai',
  }
); 