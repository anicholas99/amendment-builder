import { NextApiResponse } from 'next';

import { updateCitationMatchReasoningStatus } from '../../../repositories/citationRepository';
import { createApiLogger } from '@/lib/monitoring/apiLogger';
import { z } from 'zod';
import { logger } from '@/lib/monitoring/logger';
import {
  getCitationMatchForReasoning,
  getCitationMatchWithTenantInfo,
} from '../../../repositories/citationRepository';
import { CustomApiRequest } from '@/types/api';
import { AuthenticatedRequest } from '@/types/middleware';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { AIAnalysisService } from '@/server/ai/reasoningService';
import { SecurePresets, TenantResolvers } from '@/lib/api/securePresets';

/**
 * API Route to queue a reasoning job for a specific citation match
 *
 * POST /api/citation-reasoning/queue
 * Body: { citationMatchId: string }
 */
const bodySchema = z.object({
  citationMatchId: z.string(),
});

// Define request body type for citation match reasoning
interface CitationReasoningBody {
  citationMatchId: string;
}

const MAX_JOBS_TO_PROCESS = 5; // Limit the number of jobs processed in one run

const handler = async (
  req: CustomApiRequest<CitationReasoningBody>,
  res: NextApiResponse
) => {
  const apiLogger = createApiLogger('citation-reasoning-queue');
  apiLogger.info('Citation reasoning queue endpoint called');

  // Only allow POST method
  if (req.method !== 'POST') {
    apiLogger.warn('Method not allowed', { method: req.method });
    throw new ApplicationError(
      ErrorCode.VALIDATION_FAILED,
      'Method not allowed'
    );
  }

  const { citationMatchId } = req.body;

  apiLogger.info('Queuing reasoning job for citation match', {
    citationMatchId,
  });

  // Fetch the citation match details
  const citationMatch = await getCitationMatchForReasoning(citationMatchId);

  if (!citationMatch) {
    apiLogger.warn('Citation match not found', { citationMatchId });
    throw new ApplicationError(
      ErrorCode.DB_RECORD_NOT_FOUND,
      'Citation match not found'
    );
  }

  // Update citation match status to PENDING
  await updateCitationMatchReasoningStatus(citationMatchId, 'PENDING');
  apiLogger.info('Updated citation match reasoning status to PENDING', {
    citationMatchId,
  });

  // Start the background processing (fire and forget)
  // Instead of waiting for the processing to complete, we'll trigger it
  // asynchronously and update the database when it's done
  const reasoningJobPromise =
    AIAnalysisService.processReasoningJobDirect(citationMatch);

  // Don't await the promise, let it run in the background
  // This is a "fire and forget" pattern
  reasoningJobPromise.catch((error: Error | unknown) => {
    logger.error('Error in background reasoning job processing', {
      error: error instanceof Error ? error : new Error(String(error)),
      citationMatchId,
    });
  });

  // Return success immediately
  return res.status(200).json({
    success: true,
    message: 'Reasoning job queued successfully',
    citationMatchId,
  });
};

const resolveTenantFromCitationMatchInBody = async (
  req: AuthenticatedRequest
) => {
  const { citationMatchId } = req.body as { citationMatchId?: string };
  if (!citationMatchId) return null;
  const citationMatch = await getCitationMatchWithTenantInfo(citationMatchId);
  return citationMatch?.searchHistory?.project?.tenantId ?? null;
};

// Use the new secure preset
export default SecurePresets.tenantProtected(
  resolveTenantFromCitationMatchInBody,
  handler,
  {
    validate: {
      body: bodySchema,
    },
  }
);
