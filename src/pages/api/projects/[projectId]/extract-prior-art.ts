import type { NextApiResponse, NextApiRequest } from 'next';
import { CustomApiRequest } from '@/types/api';
import { AuthenticatedRequest } from '@/types/middleware';
import { z } from 'zod';
import { logger } from '@/lib/monitoring/logger';
import { extractPriorArtFromInventionData } from '@/client/services/patent/priorArtExtractionService';
import { InventionData } from '@/types/invention';
import { getProjectTenantId, addProjectPriorArt } from '@/repositories/project';
import { SecurePresets, TenantResolvers } from '@/lib/api/securePresets';
import { sendSafeErrorResponse } from '@/utils/secure-error-response';
import { ApplicationError } from '@/lib/error';

const querySchema = z.object({
  projectId: z.string().uuid(),
});

async function baseHandler(
  req: CustomApiRequest<any>,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { projectId } = req.query as z.infer<typeof querySchema>;

  try {
    // Parse the body manually if needed
    let bodyData = req.body;

    // If body is a string, parse it
    if (typeof bodyData === 'string') {
      try {
        bodyData = JSON.parse(bodyData);
      } catch (e) {
        logger.error('Failed to parse request body', {
          error: e,
          body: bodyData,
        });
        res.status(400).json({ error: 'Invalid JSON in request body' });
        return;
      }
    }

    const { inventionData } = bodyData;

    if (!inventionData) {
      res.status(400).json({ error: 'Missing invention data' });
      return;
    }

    // Extract prior art references
    const extractedReferences = extractPriorArtFromInventionData(
      inventionData as InventionData
    );

    logger.info('Extracted prior art references', {
      projectId,
      count: extractedReferences.length,
    });

    // Save each reference directly to the database without PatBase enrichment
    const savedReferences = [];
    const errors = [];

    for (const ref of extractedReferences) {
      try {
        if (!ref.patentNumber) {
          logger.warn('Skipping reference without patent number', {
            reference: ref.reference,
          });
          continue;
        }

        // Save directly to database without PatBase enrichment
        const savedPriorArt = await addProjectPriorArt(projectId, {
          patentNumber: ref.patentNumber,
          notes: `Extracted from invention disclosure. Context: ${ref.context || 'N/A'}. Relevance: ${ref.relevance || 'N/A'}. Original: ${ref.reference}`,
          // Leave title, abstract, and other fields empty since we're not fetching from PatBase
        });

        savedReferences.push(savedPriorArt);
        logger.info('Saved prior art reference without PatBase enrichment', {
          projectId,
          patentNumber: ref.patentNumber,
        });
      } catch (error) {
        logger.error('Error saving prior art reference', {
          error,
          reference: ref,
          projectId,
        });
        errors.push({
          patentNumber: ref.patentNumber || ref.reference,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    res.status(200).json({
      success: true,
      extracted: extractedReferences.length,
      saved: savedReferences.length,
      references: savedReferences,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    logger.error('Failed to extract prior art', {
      error: error instanceof Error ? error : String(error),
      projectId,
    });

    if (error instanceof ApplicationError) {
      sendSafeErrorResponse(res, error, error.statusCode || 500, error.message);
      return;
    }

    sendSafeErrorResponse(
      res,
      error,
      500,
      'Failed to extract prior art information. Please try again later.'
    );
  }
}

// SECURITY: This endpoint is tenant-protected using project-based resolution
// Users can only extract prior art for projects within their own tenant
export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  baseHandler,
  {
    validate: {
      query: querySchema, // Validate the projectId parameter
    },
    rateLimit: 'api',
  }
);

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};
