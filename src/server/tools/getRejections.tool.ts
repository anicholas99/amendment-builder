import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { findProjectByIdAndTenant } from '@/repositories/project/core.repository';
import { findOfficeActionsByProject } from '@/repositories/officeActionRepository';
import { findRejectionsByOfficeAction } from '@/repositories/rejectionRepository';

/**
 * Get rejection details from Office Actions
 * Provides detailed information about examiner rejections including claim numbers,
 * rejection types, cited prior art, and examiner reasoning
 *
 * SECURITY: Always validates tenant ownership before accessing data
 */
export async function getRejections(
  projectId: string,
  tenantId: string,
  officeActionId?: string,
  rejectionType?: string
): Promise<{
  success: boolean;
  rejections: any[];
  summary: {
    totalRejections: number;
    rejectionTypes: { [type: string]: number };
    totalClaimsRejected: Set<string>;
    mostCommonType: string;
  };
  message: string;
}> {
  logger.info('[GetRejectionsTools] Fetching rejections', {
    projectId,
    officeActionId,
    rejectionType,
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

    // Get Office Actions for the project
    const officeActions = await findOfficeActionsByProject(projectId, tenantId);

    if (!officeActions || officeActions.length === 0) {
      return {
        success: true,
        rejections: [],
        summary: {
          totalRejections: 0,
          rejectionTypes: {},
          totalClaimsRejected: new Set(),
          mostCommonType: 'None',
        },
        message: 'No Office Actions found. Upload an Office Action to see rejections.',
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

    // Collect all rejections from target Office Actions
    const allRejections = [];
    for (const oa of targetOfficeActions) {
      const rejections = await findRejectionsByOfficeAction(oa.id);
      
      // Filter by rejection type if specified
      const filteredRejections = rejectionType
        ? rejections.filter(r => r.type.toLowerCase().includes(rejectionType.toLowerCase()))
        : rejections;

      // Format rejection data
      for (const rejection of filteredRejections) {
        // Parse JSON fields
        let claimNumbers: string[] = [];
        let citedPriorArt: string[] = [];
        let parsedElements: any = {};

        try {
          claimNumbers = typeof rejection.claimNumbers === 'string' 
            ? JSON.parse(rejection.claimNumbers)
            : rejection.claimNumbers || [];
        } catch (e) {
          logger.warn('[GetRejectionsTools] Failed to parse claim numbers', {
            rejectionId: rejection.id,
            error: e,
          });
        }

        try {
          citedPriorArt = typeof rejection.citedPriorArt === 'string' 
            ? JSON.parse(rejection.citedPriorArt || '[]')
            : rejection.citedPriorArt || [];
        } catch (e) {
          logger.warn('[GetRejectionsTools] Failed to parse cited prior art', {
            rejectionId: rejection.id,
            error: e,
          });
        }

        try {
          parsedElements = typeof rejection.parsedElements === 'string'
            ? JSON.parse(rejection.parsedElements || '{}')
            : rejection.parsedElements || {};
        } catch (e) {
          logger.warn('[GetRejectionsTools] Failed to parse elements', {
            rejectionId: rejection.id,
            error: e,
          });
        }

        allRejections.push({
          id: rejection.id,
          officeActionId: oa.id,
          officeActionFileName: oa.originalFileName,
          type: rejection.type,
          claimNumbers,
          citedPriorArt,
          examinerText: rejection.examinerText,
          parsedElements,
          displayOrder: rejection.displayOrder,
          createdAt: rejection.createdAt,
          // Analysis summary
          affectedClaimsCount: claimNumbers.length,
          priorArtCount: citedPriorArt.length,
          examinerTextLength: rejection.examinerText?.length || 0,
        });
      }
    }

    // Generate summary statistics
    const rejectionTypeCounts: { [type: string]: number } = {};
    const allClaimsRejected = new Set<string>();

    allRejections.forEach(rejection => {
      rejectionTypeCounts[rejection.type] = (rejectionTypeCounts[rejection.type] || 0) + 1;
      rejection.claimNumbers.forEach((claim: string) => allClaimsRejected.add(claim));
    });

    const mostCommonType = Object.entries(rejectionTypeCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';

    let message = `Found ${allRejections.length} rejection(s)`;
    if (rejectionType) {
      message += ` of type "${rejectionType}"`;
    }
    if (officeActionId) {
      message += ` in Office Action ${officeActionId}`;
    }
    message += ` affecting ${allClaimsRejected.size} claim(s)`;

    return {
      success: true,
      rejections: allRejections,
      summary: {
        totalRejections: allRejections.length,
        rejectionTypes: rejectionTypeCounts,
        totalClaimsRejected: allClaimsRejected,
        mostCommonType,
      },
      message,
    };

  } catch (error) {
    logger.error('[GetRejectionsTools] Failed to fetch rejections', {
      projectId,
      error,
    });

    if (error instanceof ApplicationError) {
      throw error;
    }

    throw new ApplicationError(
      ErrorCode.INTERNAL_ERROR,
      'Failed to fetch rejection data'
    );
  }
} 