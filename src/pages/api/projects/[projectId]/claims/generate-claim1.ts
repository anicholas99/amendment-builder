/**
 * /pages/api/projects/[projectId]/claims/generate-claim1.ts
 * Patent-ready Claim 1 generator API endpoint
 *
 * This endpoint now:
 * 1. Generates a patent-ready Claim 1
 * 2. Saves it directly to the invention data
 * 3. Returns the updated invention data
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { claimGenerationService } from '@/server/services/claim-generation.server-service';
import { inventionDataService } from '@/server/services/invention-data.server-service';
import { AuthenticatedRequest } from '@/types/middleware';
import { createApiLogger } from '@/lib/monitoring/apiLogger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { SecurePresets, TenantResolvers } from '@/lib/api/securePresets';
import { sendSafeErrorResponse } from '@/utils/secure-error-response';

const apiLogger = createApiLogger('generate-claim1');

// Query params validation schema
const querySchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
});

/**
 * API handler for generating and saving Claim 1
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
  apiLogger.logRequest(req);
  const userId = (req as AuthenticatedRequest).user?.id;
  const { projectId } = req.query as { projectId: string };

  try {
    // Step 1: Get the current invention data
    apiLogger.info('Fetching invention data', { userId, projectId });
    const inventionData =
      await inventionDataService.getInventionData(projectId);

    if (!inventionData || Object.keys(inventionData).length === 0) {
      apiLogger.warn('No invention data found', { userId, projectId });
      return res.status(400).json({
        error:
          'No invention data found. Please add your invention details first.',
      });
    }

    // Step 2: Convert invention data to the format the claim generator expects
    const claimData = {
      title: inventionData.title || 'Untitled Invention',
      summary: inventionData.summary || inventionData.description || '',
      abstract: inventionData.abstract || '',
      novelty: inventionData.novelty || '',
      features: inventionData.features || [],
      technical_implementation: inventionData.technical_implementation ||
        inventionData.technicalImplementation || {
          preferred_embodiment:
            inventionData.detailedDescription ||
            inventionData.description ||
            '',
          alternative_embodiments: [],
        },
      background:
        typeof inventionData.background === 'object' && inventionData.background
          ? inventionData.background
          : {
              technical_field:
                inventionData.technical_field ||
                inventionData.technicalField ||
                '',
              problems_solved: [],
              existing_solutions: [],
            },
      advantages: inventionData.advantages || [],
      use_cases: inventionData.use_cases || inventionData.useCases || [],
      patent_category:
        inventionData.patent_category || inventionData.patentCategory || '',
      technical_field:
        inventionData.technical_field || inventionData.technicalField || '',
      definitions: inventionData.definitions || {},
    };

    apiLogger.info('Generating claim 1', {
      userId,
      projectId,
      title: claimData.title,
    });

    // Step 3: Generate the claim
    const result = await claimGenerationService.generateClaim(claimData);
    const generatedClaim = result.claims?.['1'];

    if (!generatedClaim) {
      throw new ApplicationError(
        ErrorCode.AI_SERVICE_ERROR,
        'Failed to generate claim - no claim returned from service'
      );
    }

    apiLogger.info('Claim generated successfully', {
      userId,
      projectId,
      claimLength: generatedClaim.length,
      metadata: result.metadata,
    });

    // Step 4: Update the invention data with the new claim
    const updatedClaims = {
      ...(inventionData.claims || {}),
      '1': generatedClaim, // Replace or add claim 1
    };

    await inventionDataService.updateMultipleFields(projectId, {
      claims: updatedClaims,
    });

    apiLogger.info('Claim saved to invention data', { userId, projectId });

    // Step 5: Return the result with the generated claim
    apiLogger.logResponse(200, {
      status: 'Success',
      hasMetadata: !!result.metadata,
    });

    return res.status(200).json({
      success: true,
      claim: generatedClaim,
      claims: updatedClaims,
      metadata: result.metadata,
    });
  } catch (error) {
    apiLogger.error('Claim generation failed', {
      userId,
      projectId,
      error: error instanceof Error ? error : String(error),
    });

    if (error instanceof ApplicationError) {
      sendSafeErrorResponse(
        res,
        error,
        error.statusCode || 500,
        error.message // ApplicationError messages are user-safe
      );
      return;
    }

    sendSafeErrorResponse(
      res,
      error,
      500,
      'Failed to generate claim. Please try again later.'
    );
  }
}

// Use the new secure preset
export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    validate: {
      query: querySchema,
    },
  }
);
