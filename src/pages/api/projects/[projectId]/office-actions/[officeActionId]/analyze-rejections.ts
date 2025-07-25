import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest } from '@/types/middleware';
import { withAuth } from '@/middleware/auth';
import { withTenantGuard } from '@/middleware/authorization';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { apiResponse } from '@/utils/api/responses';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { prisma } from '@/lib/prisma';
import { RejectionAnalysisServerService } from '@/server/services/rejection-analysis.server-service';
import type { 
  AnalyzeOfficeActionRequest,
  AnalyzeOfficeActionResponse 
} from '@/types/domain/rejection-analysis';

const apiLogger = createApiLogger('office-action-rejection-analysis');

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  const { projectId, officeActionId } = req.query;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  if (req.method !== 'POST' && req.method !== 'GET') {
    return apiResponse.methodNotAllowed(res, ['GET', 'POST']);
  }

  // Validate parameters
  if (!projectId || typeof projectId !== 'string') {
    return apiResponse.badRequest(res, 'Invalid project ID');
  }

  if (!officeActionId || typeof officeActionId !== 'string') {
    return apiResponse.badRequest(res, 'Invalid office action ID');
  }

  if (!userId || !tenantId) {
    return apiResponse.unauthorized(res, 'User authentication required');
  }

  try {
    if (req.method === 'GET') {
      // GET: Fetch existing analysis
      apiLogger.info('Fetching saved Office Action rejection analysis', {
        projectId,
        officeActionId,
        userId,
      });

      const analysisResult = await RejectionAnalysisServerService.getSavedOfficeActionAnalysis(
        officeActionId,
        tenantId
      );

      if (!analysisResult) {
        return apiResponse.notFound(res, 'No analysis found for this Office Action');
      }

      apiLogger.info('Saved Office Action analysis retrieved successfully', {
        projectId,
        officeActionId,
        rejectionCount: analysisResult.analyses.length,
        overallStrategy: analysisResult.overallStrategy.primaryStrategy,
      });

      const response: AnalyzeOfficeActionResponse = {
        success: true,
        analyses: analysisResult.analyses,
        overallStrategy: analysisResult.overallStrategy,
      };

      return apiResponse.ok(res, response);

    } else {
      // POST: Run new analysis
      apiLogger.info('Analyzing Office Action rejections', {
        projectId,
        officeActionId,
        userId,
      });

      // Parse request body
      const { includeClaimCharts = true } = req.body as AnalyzeOfficeActionRequest;

      // Call rejection analysis service
      const analysisResult = await RejectionAnalysisServerService.analyzeOfficeActionRejections(
        officeActionId,
        tenantId
      );

      apiLogger.info('Office Action rejections analyzed successfully', {
        projectId,
        officeActionId,
        rejectionCount: analysisResult.analyses.length,
        overallStrategy: analysisResult.overallStrategy.primaryStrategy,
      });

      const response: AnalyzeOfficeActionResponse = {
        success: true,
        analyses: analysisResult.analyses,
        overallStrategy: analysisResult.overallStrategy,
      };

      return apiResponse.ok(res, response);
    }

  } catch (error) {
    const operation = req.method === 'GET' ? 'fetch saved' : 'analyze';
    apiLogger.error(`Failed to ${operation} Office Action rejections`, {
      projectId,
      officeActionId,
      error: error instanceof Error ? error.message : String(error),
    });

    return apiResponse.serverError(res, error);
  }
}

// Resolve tenant ID for security guard
const resolveTenantId = async (req: NextApiRequest): Promise<string | null> => {
  const { projectId } = req.query;
  
  if (!projectId || typeof projectId !== 'string') {
    return null;
  }

  if (!prisma) {
    return null;
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { tenantId: true },
  });

  return project?.tenantId || null;
};

const guardedHandler = withTenantGuard(resolveTenantId)(handler);
export default withAuth(guardedHandler as any); 