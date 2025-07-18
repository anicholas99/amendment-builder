import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { findProjectByIdAndTenant } from '@/repositories/project/core.repository';
import { findOfficeActionsByProject, findOfficeActionWithRelationsById } from '@/repositories/officeActionRepository';
import { findRejectionsByOfficeAction } from '@/repositories/rejectionRepository';

/**
 * Analyze Office Action data for a project
 * Provides access to parsed rejections, prior art, and examiner reasoning
 *
 * SECURITY: Always validates tenant ownership before accessing data
 */
export async function analyzeOfficeAction(
  projectId: string,
  tenantId: string,
  officeActionId?: string
): Promise<{
  success: boolean;
  officeActions: any[];
  analysis: {
    totalOfficeActions: number;
    totalRejections: number;
    rejectionTypes: string[];
    totalPriorArt: number;
    recentActivity: string;
  };
  message: string;
}> {
  logger.info('[AnalyzeOfficeActionTool] Analyzing Office Actions', {
    projectId,
    officeActionId,
  });

  try {
    // Verify project and tenant ownership
    const project = await findProjectByIdAndTenant(projectId, tenantId);
    if (!project) {
      throw new ApplicationError(
        ErrorCode.PROJECT_ACCESS_DENIED,
        'Project not found or access denied'
      );
    }

    // Fetch Office Actions for the project (with correct signature)
    const officeActions = await findOfficeActionsByProject(projectId, tenantId);

    if (!officeActions || officeActions.length === 0) {
      return {
        success: true,
        officeActions: [],
        analysis: {
          totalOfficeActions: 0,
          totalRejections: 0,
          rejectionTypes: [],
          totalPriorArt: 0,
          recentActivity: 'No Office Actions uploaded yet',
        },
        message: 'No Office Actions found for this project. Upload an Office Action to get started with amendment analysis.',
      };
    }

    // Filter to specific Office Action if requested
    const targetOfficeActions = officeActionId 
      ? officeActions.filter(oa => oa.id === officeActionId)
      : officeActions;

    if (officeActionId && targetOfficeActions.length === 0) {
      throw new ApplicationError(
        ErrorCode.DB_RECORD_NOT_FOUND,
        `Office Action ${officeActionId} not found`
      );
    }

    // Analyze the Office Action data
    let totalRejections = 0;
    const allRejectionTypes = new Set<string>();
    let totalPriorArt = 0;

    const formattedOfficeActions = await Promise.all(
      targetOfficeActions.map(async oa => {
        // Get rejections for this Office Action
        const rejections = await findRejectionsByOfficeAction(oa.id);
        
        // Parse the parsed JSON data if available
        let parsedData: any = {};
        if (oa.parsedJson) {
          try {
            parsedData = JSON.parse(oa.parsedJson);
          } catch (error) {
            logger.warn('[AnalyzeOfficeActionTool] Failed to parse Office Action JSON', {
              officeActionId: oa.id,
              error,
            });
          }
        }

        // Count rejections and extract types
        const rejectionCount = rejections.length;
        const rejectionTypes = rejections.map(r => r.type);
        
        // Extract prior art references from parsed data or rejections
        const priorArtRefs = parsedData.citedReferences || [];
        const priorArtCount = priorArtRefs.length;

        totalRejections += rejectionCount;
        rejectionTypes.forEach((type: string) => allRejectionTypes.add(type));
        totalPriorArt += priorArtCount;

        return {
          id: oa.id,
          fileName: oa.originalFileName,
          applicationNumber: parsedData.applicationNumber || 'Unknown',
          mailingDate: oa.dateIssued || parsedData.dateIssued,
          examinerName: parsedData.examiner?.name || 'Unknown',
          status: oa.status,
          rejections: rejections.map(r => ({
            id: r.id,
            type: r.type,
            claims: typeof r.claimNumbers === 'string' 
              ? JSON.parse(r.claimNumbers || '[]')
              : (r.claimNumbers || []),
            priorArt: typeof r.citedPriorArt === 'string'
              ? JSON.parse(r.citedPriorArt || '[]') 
              : (r.citedPriorArt || []),
            reasoning: r.examinerText,
          })),
          allPriorArtReferences: priorArtRefs,
          uploadedAt: oa.createdAt,
          extractedTextLength: parsedData.extractedText?.length || 0,
        };
      })
    );

    // Determine recent activity
    const mostRecent = targetOfficeActions.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];

    const daysSinceUpload = Math.floor(
      (Date.now() - new Date(mostRecent.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    let recentActivity = `Most recent Office Action uploaded ${daysSinceUpload} days ago`;
    if (daysSinceUpload === 0) recentActivity = 'Office Action uploaded today';
    else if (daysSinceUpload === 1) recentActivity = 'Office Action uploaded yesterday';

    return {
      success: true,
      officeActions: formattedOfficeActions,
      analysis: {
        totalOfficeActions: targetOfficeActions.length,
        totalRejections,
        rejectionTypes: Array.from(allRejectionTypes),
        totalPriorArt,
        recentActivity,
      },
      message: officeActionId 
        ? `Analyzed Office Action ${officeActionId} with ${totalRejections} rejection(s)`
        : `Analyzed ${targetOfficeActions.length} Office Action(s) with ${totalRejections} total rejection(s)`,
    };

  } catch (error) {
    logger.error('[AnalyzeOfficeActionTool] Analysis failed', {
      projectId,
      error,
    });

    if (error instanceof ApplicationError) {
      throw error;
    }

    throw new ApplicationError(
      ErrorCode.INTERNAL_ERROR,
      'Failed to analyze Office Action data'
    );
  }
} 