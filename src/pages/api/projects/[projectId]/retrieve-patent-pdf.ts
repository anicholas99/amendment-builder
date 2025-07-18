/**
 * Patent PDF Retrieval API Endpoint
 * 
 * POST /api/projects/[projectId]/retrieve-patent-pdf
 * 
 * Retrieves patent PDFs for examiner-cited prior art and stores them securely
 */

import { NextApiResponse } from 'next';
import { z } from 'zod';
import { AuthenticatedRequest } from '@/types/middleware';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { PatentPdfRetrievalService } from '@/server/services/patent-pdf-retrieval.server-service';

const apiLogger = createApiLogger('retrieve-patent-pdf');

// ============ VALIDATION SCHEMAS ============

const querySchema = z.object({
  projectId: z.string().uuid('Invalid project ID format'),
});

const bodySchema = z.object({
  patentNumbers: z.array(z.string()).min(1, 'At least one patent number required'),
  fileType: z.enum(['cited-reference', 'examiner-citation']).default('examiner-citation'),
  forceRefresh: z.boolean().default(false),
});

// ============ HANDLER ============

/**
 * Patent PDF Retrieval Handler
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
    const { projectId } = querySchema.parse(req.query);
    const { patentNumbers, fileType, forceRefresh } = bodySchema.parse(req.body);
    const { id: userId, tenantId } = req.user!;

    if (!tenantId) {
      throw new ApplicationError(
        ErrorCode.TENANT_NOT_FOUND,
        'Tenant context is required'
      );
    }

    apiLogger.info('Patent PDF retrieval requested', {
      projectId,
      userId,
      tenantId,
      patentCount: patentNumbers.length,
      fileType,
      forceRefresh,
      patentNumbers: patentNumbers.slice(0, 5), // Log first 5 for debugging
    });

    // Process patents based on count
    let results;
    if (patentNumbers.length === 1) {
      // Single patent - process immediately
      const result = await PatentPdfRetrievalService.retrievePatentPdf(
        patentNumbers[0],
        projectId,
        tenantId,
        userId,
        { fileType, forceRefresh }
      );
      results = [result];
    } else {
      // Multiple patents - use bulk processing
      results = await PatentPdfRetrievalService.bulkRetrievePatentPdfs(
        patentNumbers,
        projectId,
        tenantId,
        userId,
        { fileType, maxConcurrent: 3 }
      );
    }

    // Summarize results
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    apiLogger.info('Patent PDF retrieval completed', {
      projectId,
      total: results.length,
      successful: successful.length,
      failed: failed.length,
      sources: successful.map(r => r.source),
    });

    return res.status(200).json({
      success: true,
      results: results.map(result => ({
        patentNumber: patentNumbers[results.indexOf(result)],
        success: result.success,
        priorArtId: result.priorArtId,
        source: result.source,
        error: result.error,
      })),
      summary: {
        total: results.length,
        successful: successful.length,
        failed: failed.length,
        fromCache: successful.filter(r => r.source === 'cache').length,
        fromPatbase: successful.filter(r => r.source === 'patbase').length,
        fromUSPTO: successful.filter(r => r.source === 'uspto').length,
        fromGooglePatents: successful.filter(r => r.source === 'google_patents').length,
      },
    });

  } catch (error) {
    apiLogger.error('Failed to retrieve patent PDFs', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (error instanceof ApplicationError) {
      throw error;
    }

    throw new ApplicationError(
      ErrorCode.INTERNAL_ERROR,
      'Failed to retrieve patent PDFs'
    );
  }
}

// ============ EXPORT WITH SECURITY ============

export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    validate: {
      query: querySchema,
      body: bodySchema,
    },
    rateLimit: 'api', // Standard rate limit
  }
); 