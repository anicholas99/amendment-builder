import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/middleware/auth';
import { withTenantGuard } from '@/middleware/authorization';
import { AmendmentContextService } from '@/server/services/amendment-context.server-service';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/server/logger';
import { prisma } from '@/lib/prisma';
import { AuthenticatedRequest } from '@/types/middleware';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { projectId } = req.query;
  const tenantId = req.user?.tenantId;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    logger.info('[AmendmentContextAPI] Getting amendment context', {
      projectId,
      tenantId,
      userId: req.user?.id,
    });

    // Get the amendment context bundle
    const contextBundle = await AmendmentContextService.getAmendmentDraftingContext(
      projectId as string,
      tenantId!
    );

    // Optionally generate AI prompt context
    const aiPromptContext = AmendmentContextService.generateAIPromptContext(contextBundle);

    logger.info('[AmendmentContextAPI] Successfully retrieved amendment context', {
      projectId,
      contextComplete: contextBundle.metadata.contextComplete,
      totalDocuments: contextBundle.metadata.totalDocuments,
      ocrDocuments: contextBundle.metadata.ocrDocuments,
    });

    return res.status(200).json({
      success: true,
      context: contextBundle,
      aiPromptContext: aiPromptContext.substring(0, 500) + '...', // Preview only
      summary: {
        hasOfficeAction: !!contextBundle.officeAction,
        hasClaims: !!contextBundle.claims,
        hasSpecification: !!contextBundle.specification,
        hasLastResponse: !!contextBundle.lastResponse,
        hasExtras: Object.values(contextBundle.extras).some(Boolean),
        readyForAI: contextBundle.metadata.contextComplete,
      },
    });

  } catch (error) {
    logger.error('[AmendmentContextAPI] Failed to get amendment context', {
      projectId,
      tenantId,
      error: error instanceof Error ? error.message : String(error),
    });

    if (error instanceof ApplicationError) {
      return res.status(error.statusCode).json({
        error: error.message,
        code: error.code,
      });
    }

    return res.status(500).json({
      error: 'Failed to retrieve amendment context',
    });
  }
}

// Tenant resolver for security
const resolveTenantId = async (req: NextApiRequest): Promise<string | null> => {
  const { projectId } = req.query;
  if (!prisma) {
    throw new ApplicationError(ErrorCode.DB_CONNECTION_ERROR, 'Database not available');
  }
  const project = await prisma.project.findUnique({
    where: { id: String(projectId) },
    select: { tenantId: true }
  });
  return project?.tenantId || null;
};

const guardedHandler = withTenantGuard(resolveTenantId)(handler);
export default withAuth(guardedHandler as any); 