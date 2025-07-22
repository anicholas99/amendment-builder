import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { logger } from '@/server/logger';
import { prisma } from '@/lib/prisma';
import { AmendmentGenerationService } from '@/server/services/amendment-generation.server-service';
import { AuthenticatedRequest } from '@/types/middleware';

// Extended request interface with tenant properties
interface TenantAwareRequest extends AuthenticatedRequest {
  tenantId?: string;
}

// Request validation
const requestSchema = z.object({
  officeActionId: z.string().uuid().optional(),
  regenerate: z.boolean().optional().default(false),
  strategy: z.string().optional(),
  userInstructions: z.string().optional(),
});

async function handler(req: TenantAwareRequest, res: NextApiResponse) {
  const { projectId } = req.query;
  
  if (!projectId || typeof projectId !== 'string') {
    return res.status(400).json({ error: 'Invalid project ID' });
  }
  
  logger.info('[API] Amendment generation request', {
    projectId,
    method: req.method,
  });

  try {
    if (!prisma) {
      return res.status(500).json({ error: 'Database connection not available' });
    }

    // Extract context from secure middleware
    const context = {
      tenantId: req.tenantId || req.user?.tenantId || '',
      userId: req.user?.id || '',
    };

    switch (req.method) {
      case 'GET': {
        // Get officeActionId from query parameters
        const { officeActionId } = req.query;
        
        // Use service layer to get existing amendments
        const result = await AmendmentGenerationService.getAmendments(
          projectId, 
          context, 
          officeActionId as string | undefined
        );

        // Transform response to match both AmendmentStudio and ClaimAmendmentGenerator expectations
        if (result.claims.length > 0) {
          const amendmentStudioResponse = {
            success: true,
            amendment: {
              id: `amendment-existing`,
              officeActionId: officeActionId || '',
              projectId,
              status: 'COMPLETE' as const,
              strategy: 'COMBINATION' as const,
              claimAmendments: result.claims.map(claim => ({
                claimNumber: claim.claimNumber.toString(),
                originalText: claim.originalText,
                amendedText: claim.amendedText,
                justification: claim.changeReason,
              })),
              argumentSections: [],
              createdAt: result.generatedAt,
              updatedAt: result.generatedAt,
            },
            // Also include the original format for ClaimAmendmentGenerator
            claims: result.claims,
            summary: result.summary,
            generatedAt: result.generatedAt,
          };
          return res.status(200).json(amendmentStudioResponse);
        } else {
          // Return empty result with both formats
          return res.status(200).json({
            success: false,
            amendment: null,
            claims: [],
            summary: result.summary,
            generatedAt: result.generatedAt,
          });
        }
      }

      case 'POST': {
        // Generate new amendments using service layer
        const { officeActionId, regenerate, strategy, userInstructions } = requestSchema.parse(req.body || {});
        
        // Use the service to generate amendments
        const result = await AmendmentGenerationService.generateAmendments(projectId, context, officeActionId);
        
        logger.info('[API] Amendments generated via service', {
          projectId,
          officeActionId,
          claimCount: result.claims.length,
        });

        // Transform response to match AmendmentStudio expectations
        const amendmentStudioResponse = {
          success: true,
          amendment: {
            id: `amendment-${Date.now()}`,
            officeActionId: officeActionId || '',
            projectId,
            status: 'COMPLETE' as const,
            strategy: strategy || 'COMBINATION' as const,
            claimAmendments: result.claims.map(claim => ({
              claimNumber: claim.claimNumber.toString(),
              originalText: claim.originalText,
              amendedText: claim.amendedText,
              justification: claim.changeReason,
            })),
            argumentSections: [], // Will be populated by separate argument generation
            createdAt: result.generatedAt,
            updatedAt: result.generatedAt,
          },
          // Also include the original format for ClaimAmendmentGenerator
          claims: result.claims,
          summary: result.summary,
          generatedAt: result.generatedAt,
        };

        return res.status(201).json(amendmentStudioResponse);
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    logger.error('[API] Error handling amendment generation', {
      projectId,
      method: req.method,
      error: error instanceof Error ? error.message : String(error),
    });
    
    return res.status(500).json({ 
      error: 'Failed to process amendment generation request',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Apply security middleware with tenant resolution from project
export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    rateLimit: 'ai', // Use AI rate limit for amendment generation
  }
);