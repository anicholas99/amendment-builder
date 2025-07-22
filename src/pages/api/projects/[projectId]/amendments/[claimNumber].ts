import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { AmendmentGenerationService } from '@/server/services/amendment-generation.server-service';
import { RequestContext } from '@/types/request';
import { AuthenticatedRequest } from '@/types/middleware';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/server/logger';

// Request validation for updating amendment
const updateSchema = z.object({
  amendedText: z.string().min(1),
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { projectId, claimNumber } = req.query;
  
  if (!projectId || typeof projectId !== 'string' || !claimNumber || typeof claimNumber !== 'string') {
    return res.status(400).json({ error: 'Invalid project ID or claim number' });
  }
  
  const context: RequestContext = {
    userId: req.userId!,
    tenantId: req.tenantId!,
    userPermissions: req.userPermissions || [],
  };
  
  logger.info('[API] Amendment update request', {
    projectId,
    claimNumber,
    method: req.method,
    userId: context.userId,
  });

  try {
    switch (req.method) {
      case 'PUT': {
        // Update specific claim amendment
        const { amendedText } = updateSchema.parse(req.body);
        
        await AmendmentGenerationService.updateAmendment(
          projectId as string,
          parseInt(claimNumber as string, 10),
          amendedText,
          context
        );
        
        // Return updated amendments
        const amendments = await AmendmentGenerationService.getAmendments(
          projectId as string,
          context
        );
        
        return res.status(200).json(amendments);
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    logger.error('[API] Error handling amendment update', {
      projectId,
      claimNumber,
      method: req.method,
      error: error instanceof Error ? error.message : String(error),
    });
    
    if (error instanceof ApplicationError) {
      return res.status(error.statusCode || 500).json({ 
        error: error.message,
        code: error.code,
      });
    }
    
    return res.status(500).json({ error: 'Failed to process amendment update request' });
  }
}

// Apply security middleware with tenant resolution from project
export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    rateLimit: 'standard',
    validate: { body: updateSchema },
  }
);