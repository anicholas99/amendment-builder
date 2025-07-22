import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { AmendmentGenerationService } from '@/server/services/amendment-generation.server-service';
import { RequestContext } from '@/types/request';
import { AuthenticatedRequest } from '@/types/middleware';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/server/logger';

// Request validation
const requestSchema = z.object({
  regenerate: z.boolean().optional().default(false),
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { projectId } = req.query;
  
  if (!projectId || typeof projectId !== 'string') {
    return res.status(400).json({ error: 'Invalid project ID' });
  }
  
  const context: RequestContext = {
    userId: req.userId!,
    tenantId: req.tenantId!,
    userPermissions: req.userPermissions || [],
  };
  
  logger.info('[API] Amendment generation request', {
    projectId,
    method: req.method,
    userId: context.userId,
  });

  try {
    switch (req.method) {
      case 'GET': {
        // Get existing amendments
        const amendments = await AmendmentGenerationService.getAmendments(
          projectId as string,
          context
        );
        
        return res.status(200).json(amendments);
      }

      case 'POST': {
        // Generate new amendments
        const { regenerate } = requestSchema.parse(req.body || {});
        
        // Check if we should regenerate
        if (!regenerate) {
          try {
            const existing = await AmendmentGenerationService.getAmendments(
              projectId as string,
              context
            );
            return res.status(200).json(existing);
          } catch (error) {
            // No existing amendments, proceed with generation
          }
        }
        
        const amendments = await AmendmentGenerationService.generateAmendments(
          projectId as string,
          context
        );
        
        return res.status(201).json(amendments);
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
    
    if (error instanceof ApplicationError) {
      return res.status(error.statusCode || 500).json({ 
        error: error.message,
        code: error.code,
      });
    }
    
    return res.status(500).json({ error: 'Failed to process amendment generation request' });
  }
}

// Apply security middleware with tenant resolution from project
export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    rateLimit: 'ai', // Use AI rate limit for amendment generation
    validate: { body: requestSchema },
  }
);