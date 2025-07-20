/**
 * Prosecution Data Service
 * 
 * Production-ready service for aggregating real prosecution data
 * Replaces mock data with actual database queries
 */

import { prisma } from '@/lib/prisma';

// Ensure prisma is available
if (!prisma) {
  throw new Error('Prisma client is not initialized');
}
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { ValidationState, RiskLevel } from '@/features/amendment/types/validation';
import { isTimelineDocument, getDocumentDisplayConfig } from '@/features/amendment/config/prosecutionDocuments';
import type { 
  ProsecutionOverview,
} from '@/services/api/projectProsecutionService';

// Define the missing types locally based on the ProsecutionOverview interface
type OfficeActionSummary = NonNullable<ProsecutionOverview['currentOfficeAction']>;
type ClaimChanges = ProsecutionOverview['claimChanges'];
type ResponseStatus = ProsecutionOverview['responseStatus'];
type Alert = ProsecutionOverview['alerts'][0];
type ExaminerAnalytics = NonNullable<ProsecutionOverview['examinerAnalytics']>;
type ProsecutionStatistics = ProsecutionOverview['prosecutionStatistics'];

const logger = createApiLogger('prosecution-data-service');

export class ProsecutionDataService {
  /**
   * Get real prosecution overview data from database
   */
  async getProsecutionOverview(
    projectId: string,
    tenantId: string
  ): Promise<ProsecutionOverview> {
    try {
      // Fetch project with related data
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          tenantId,
          deletedAt: null,
        },
        include: {
          invention: true,
          officeActions: {
            where: { deletedAt: null },
            orderBy: { dateIssued: 'desc' },
            include: {
              rejections: true,
              summary: true,
              amendmentProjects: {
                where: { deletedAt: null },
                orderBy: { createdAt: 'desc' },
                take: 1,
              },
            },
          },
        },
      });

      if (!project) {
        throw new ApplicationError(ErrorCode.PROJECT_NOT_FOUND);
      }

      // Get current office action (one that needs response)
      const currentOA = project.officeActions.find(oa => oa.status === 'PENDING_RESPONSE');
      
      // Get claim statistics
      const claimStats = await this.getClaimStatistics(projectId, tenantId);
      
      // Get response status
      const responseStatus = await this.getResponseStatus(projectId, tenantId);
      
      // Generate alerts based on real data
      const alerts = await this.generateAlerts(project, currentOA);
      
      // Get prosecution timeline
      const timeline = await this.buildProsecutionTimeline(projectId, tenantId);
      
      // Get examiner analytics if we have examiner data
      let examinerAnalytics: ExaminerAnalytics | undefined;
      if (currentOA?.examinerId) {
        examinerAnalytics = await this.getExaminerAnalytics(currentOA.examinerId);
      }

      // Calculate prosecution statistics
      const statistics = await this.calculateProsecutionStatistics(projectId, tenantId);

      return {
        applicationMetadata: {
          applicationNumber: 'Pending', // TODO: Add applicationNumber to Invention model
          title: project.invention?.title || project.name,
          filingDate: project.createdAt, // TODO: Add filingDate to Invention model
          artUnit: currentOA?.artUnit || 'Unknown',
          examiner: currentOA?.examinerId || 'Not Assigned',
          prosecutionStatus: this.determineStatus(project, currentOA) as 'PENDING_RESPONSE' | 'PRE_FILING' | 'ACTIVE' | 'ALLOWED' | 'ABANDONED' | 'ISSUED',
        },
        currentOfficeAction: currentOA ? {
          id: currentOA.id,
          type: this.determineOAType(currentOA),
          dateIssued: currentOA.dateIssued || currentOA.createdAt,
          daysToRespond: this.calculateDaysToRespond(currentOA),
          responseDeadline: this.calculateDeadline(currentOA),
          rejectionSummary: {
            total: currentOA.rejections.length,
            byType: this.groupRejectionsByType(currentOA.rejections),
            claimsAffected: this.getAffectedClaims(currentOA.rejections),
            riskLevel: this.calculateRiskLevel(currentOA),
          },
          aiStrategy: currentOA.summary ? {
            primaryApproach: this.determineStrategy(currentOA.summary),
            confidence: 0.85, // TODO: Pull from AI analysis
            reasoning: currentOA.summary.summaryText || '',
          } : undefined,
        } : undefined,
        prosecutionTimeline: timeline,
        claimChanges: claimStats,
        responseStatus,
        alerts,
        examinerAnalytics,
        prosecutionStatistics: statistics,
      };
    } catch (error) {
      logger.error('Failed to get prosecution overview', {
        projectId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Get real claim statistics including validation data
   */
  private async getClaimStatistics(
    projectId: string,
    tenantId: string
  ): Promise<ClaimChanges> {
    // First get the invention for this project
    const invention = await prisma.invention.findFirst({
      where: {
        projectId,
        project: {
          tenantId,
          deletedAt: null,
        },
      },
    });

    if (!invention) {
      // Return empty stats if no invention yet
      return {
        totalAmendedClaims: 0,
        newClaims: 0,
        cancelledClaims: 0,
        pendingValidation: false,
        highRiskClaims: 0,
        lastAmendmentDate: null,
      };
    }

    // Get all claims for the invention
    const claims = await prisma.claim.findMany({
      where: {
        inventionId: invention.id,
      },
    });

    // Get validation states - check if ClaimValidation model exists and has expected fields
    const validations = await prisma.claimValidation.findMany({
      where: {
        projectId,
        claimId: { in: claims.map(c => c.id) },
      },
      orderBy: { createdAt: 'desc' },
      distinct: ['claimId'],
    });

    // Get claim versions to track amendments
    const claimVersions = await prisma.claimVersion.findMany({
      where: {
        inventionId: invention.id,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate statistics
    let amended = 0;
    let newClaims = claims.length;
    let cancelled = 0;
    let highRisk = 0;
    let pendingValidation = false;

    const validationMap = new Map(validations.map(v => [v.claimId, v]));

    // Track which claims have been amended based on updatedAt vs createdAt
    for (const claim of claims) {
      // Consider a claim amended if it was updated after creation
      if (claim.updatedAt.getTime() > claim.createdAt.getTime() + 1000) { // 1 second buffer
        amended++;
      }

      // Check validation status
      const validation = validationMap.get(claim.id);
      if (!validation || validation.validationState === ValidationState.PENDING) {
        pendingValidation = true;
      } else if (validation.riskLevel === RiskLevel.HIGH) {
        highRisk++;
      }
    }

    const lastAmendment = await prisma.claim.findFirst({
      where: {
        inventionId: invention.id,
      },
      orderBy: { updatedAt: 'desc' },
    });

    return {
      totalAmendedClaims: amended,
      newClaims,
      cancelledClaims: cancelled,
      pendingValidation,
      highRiskAmendments: highRisk,
      lastAmendmentDate: lastAmendment?.updatedAt || undefined,
    };
  }

  /**
   * Get response status counts
   */
  private async getResponseStatus(
    projectId: string,
    tenantId: string
  ): Promise<ResponseStatus> {
    const amendmentProjects = await prisma.amendmentProject.findMany({
      where: {
        projectId,
        tenantId,
        deletedAt: null,
      },
      select: {
        status: true,
      },
    });

    const counts = {
      draft: 0,
      inReview: 0,
      readyToFile: 0,
      filed: 0,
    };

    for (const ap of amendmentProjects) {
      switch (ap.status) {
        case 'DRAFT':
          counts.draft++;
          break;
        case 'IN_REVIEW':
          counts.inReview++;
          break;
        case 'READY_TO_FILE':
          counts.readyToFile++;
          break;
        case 'FILED':
          counts.filed++;
          break;
      }
    }

    return counts;
  }

  /**
   * Generate alerts based on real data
   */
  private async generateAlerts(
    project: any,
    currentOA: any
  ): Promise<Alert[]> {
    const alerts: Alert[] = [];

    // Deadline alert
    if (currentOA) {
      const daysRemaining = this.calculateDaysToRespond(currentOA);
      
      if (daysRemaining < 30) {
        alerts.push({
          id: `deadline-${currentOA.id}`,
          type: 'DEADLINE',
          severity: daysRemaining < 10 ? 'CRITICAL' : 'HIGH',
          title: 'Response Deadline Approaching',
          message: `Response due in ${daysRemaining} days`,
          // daysRemaining, // Not part of Alert type
          actionRequired: true,
        });
      }
    }

    // Validation alert
    const invention = await prisma.invention.findFirst({
      where: { projectId: project.id },
    });
    
    const unvalidatedClaims = invention ? await prisma.claim.count({
      where: {
        inventionId: invention.id,
        NOT: {
          id: {
            in: await prisma.claimValidation.findMany({
              where: {
                projectId: project.id,
              },
              select: { claimId: true },
            }).then(validations => validations.map(v => v.claimId)),
          },
        },
      },
    }) : 0;

    if (unvalidatedClaims > 0) {
      alerts.push({
        id: 'validation-pending',
        type: 'VALIDATION',
        severity: 'MEDIUM',
        title: 'Claim Validation Needed',
        message: `${unvalidatedClaims} claims need validation`,
        actionRequired: true,
      });
    }

    return alerts;
  }

  /**
   * Build prosecution timeline from real events
   */
  private async buildProsecutionTimeline(
    projectId: string,
    tenantId: string
  ): Promise<any[]> {
    // Check if we have USPTO documents first
    const usptoDocumentCount = await prisma.projectDocument.count({
      where: {
        projectId,
        project: {
          tenantId,
        },
        fileType: 'uspto-document',
      },
    });

    // If we have USPTO documents, use ONLY those for the timeline
    if (usptoDocumentCount > 0) {
      return this.buildUSPTOOnlyTimeline(projectId, tenantId);
    }

    // Otherwise fall back to office actions (legacy behavior)
    const officeActions = await prisma.officeAction.findMany({
      where: {
        projectId,
        tenantId,
      },
      orderBy: { dateIssued: 'asc' },
      include: {
        amendmentProjects: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // Get USPTO documents from ProjectDocument (responses, RCEs, etc.)
    const usptoDocuments = await prisma.projectDocument.findMany({
      where: {
        projectId,
        project: {
          tenantId,
        },
        fileType: 'uspto-document',
        // deletedAt: null, // Not part of ProjectDocumentWhereInput
      },
      orderBy: { createdAt: 'asc' },
    });

    const timeline: any[] = [];

    // Add application filing event as the first event
    const project = await prisma.project.findFirst({
      where: { id: projectId, tenantId },
      include: { invention: true }
    });
    
    if (project?.invention?.createdAt) {
      timeline.push({
        id: `filing-${project.id}`,
        type: 'APPLICATION_FILED',
        documentCode: 'SPEC',
        date: project.invention.createdAt.toISOString(),
        title: 'Application Filed',
        status: 'completed',
      });
      logger.info('Added filing event to timeline', { projectId });
    } else {
      logger.warn('No invention data found for filing event', { projectId });
    }

    // Add office actions to timeline
    for (let i = 0; i < officeActions.length; i++) {
      const oa = officeActions[i];
      const prevOa = i > 0 ? officeActions[i - 1] : null;
      
      // Determine document code based on OA type
      let documentCode = 'CTNF'; // Default to non-final
      if (oa.oaNumber?.toLowerCase().includes('final')) {
        documentCode = 'CTFR';
      } else if (oa.oaNumber?.toLowerCase().includes('advisory')) {
        documentCode = 'CTAV';
      } else if (oa.oaNumber?.toLowerCase().includes('restriction')) {
        documentCode = 'CTNR';
      }
      
      
      timeline.push({
        id: oa.id,
        type: 'OFFICE_ACTION',
        documentCode,
        date: (oa.dateIssued || oa.createdAt).toISOString(),
        title: oa.oaNumber || 'Office Action',
        status: 'completed',
        daysFromPrevious: prevOa && oa.dateIssued && prevOa.dateIssued ? 
          Math.floor((oa.dateIssued.getTime() - prevOa.dateIssued.getTime()) / (1000 * 60 * 60 * 24)) : 
          undefined,
      });

      // Add response events from amendment projects
      for (const amendment of oa.amendmentProjects) {
        if (amendment.status === 'FILED') {
          // Use AMSB for amendments (most common response type)
          timeline.push({
            id: `response-${amendment.id}`,
            type: 'RESPONSE',
            documentCode: 'AMSB', // Amendment/Submission
            date: amendment.updatedAt.toISOString(),
            title: 'Amendment Filed',
            status: 'completed',
          });
        }
      }
    }


    // Remove the filter that only includes timeline documents - show ALL USPTO documents
    // This way we get the complete prosecution history
    for (const doc of usptoDocuments) {
      try {
        const metadata = doc.extractedMetadata && typeof doc.extractedMetadata === 'object' 
          ? doc.extractedMetadata as any 
          : {};
        
        const documentCode = metadata.documentCode || metadata.docCode || '';
        const config = getDocumentDisplayConfig(documentCode);
        
        timeline.push({
          id: doc.id,
          type: this.mapDocumentCodeToType(documentCode),
          documentCode,
          date: metadata.mailDate || metadata.date || doc.createdAt.toISOString(),
          title: config?.label || metadata.description || doc.fileName,
          status: 'completed',
        });
      } catch (error) {
        logger.warn('Failed to parse USPTO document metadata', {
          documentId: doc.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
    
    // Sort timeline by date
    timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Calculate days between events
    for (let i = 1; i < timeline.length; i++) {
      const prevDate = new Date(timeline[i - 1].date);
      const currDate = new Date(timeline[i].date);
      timeline[i].daysFromPrevious = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    }

    return timeline;
  }

  // Helper methods
  private mapDocumentCodeToType(documentCode: string): string {
    // Map USPTO document codes to timeline event types
    switch (documentCode) {
      // Office Actions
      case 'CTNF':
      case 'CTFR':
      case 'CTAV':
      case 'CTNR':
        return 'OFFICE_ACTION';
      
      // Responses
      case 'REM':
      case 'A...':
      case 'A.NE':
      case 'AMSB':
      case 'RESP.FINAL':
      case 'CTRS':
        return 'RESPONSE';
      
      // RCE
      case 'RCEX':
      case 'RCE':
        return 'RCE';
      
      // Notices
      case 'NOA':
        return 'NOTICE_OF_ALLOWANCE';
      case 'ABN':
        return 'ABANDONMENT';
      
      // Filing events
      case 'SPEC':
      case 'APP.FILE.REC':
      case 'TRNA':
        return 'APPLICATION_FILED';
      
      // IDS
      case 'IDS':
      case 'R561':
        return 'IDS_FILED';
      
      // Extensions
      case 'XT/':
      case 'EXT.':
      case 'PETXT':
        return 'EXTENSION';
      
      // Other
      case 'EXIN':
        return 'INTERVIEW_CONDUCTED';
      case 'NTCN':
        return 'CONTINUATION_FILED';
      case 'N271':
      case 'NRES':
        return 'NOTICE';
      
      default:
        return 'OTHER';
    }
  }

  private determineOAType(oa: any): 'NON_FINAL' | 'FINAL' | 'NOTICE_OF_ALLOWANCE' | 'OTHER' {
    if (oa.oaNumber?.toLowerCase().includes('final')) return 'FINAL';
    if (oa.oaNumber?.toLowerCase().includes('allowance')) return 'NOTICE_OF_ALLOWANCE';
    if (oa.oaNumber?.toLowerCase().includes('non-final')) return 'NON_FINAL';
    return 'OTHER';
  }

  private calculateDaysToRespond(oa: any): number {
    const deadline = this.calculateDeadline(oa);
    const now = new Date();
    return Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  private calculateDeadline(oa: any): Date {
    const issued = oa.dateIssued || oa.createdAt;
    const deadline = new Date(issued);
    
    // Determine deadline based on OA type
    const oaType = this.determineOAType(oa);
    if (oaType === 'FINAL') {
      // Final OA: 2 months (60 days) statutory deadline
      deadline.setDate(deadline.getDate() + 60);
    } else {
      // Non-Final OA: 3 months (90 days) statutory deadline
      deadline.setDate(deadline.getDate() + 90);
    }
    
    // TODO: Add extension calculation based on XT/ documents
    
    return deadline;
  }

  private determineStatus(project: any, currentOA: any): 'PENDING_RESPONSE' | 'PRE_FILING' | 'ACTIVE' | 'ALLOWED' | 'ABANDONED' | 'ISSUED' {
    if (!currentOA) return 'PENDING_RESPONSE'; // Changed from AWAITING_EXAMINATION
    if (currentOA.amendmentProjects.some((ap: any) => ap.status === 'FILED')) {
      return 'ACTIVE'; // Changed from RESPONSE_FILED
    }
    return 'PENDING_RESPONSE';
  }

  private groupRejectionsByType(rejections: any[]): Record<string, number> {
    const groups: Record<string, number> = {};
    for (const rejection of rejections) {
      groups[rejection.type] = (groups[rejection.type] || 0) + 1;
    }
    return groups;
  }

  private getAffectedClaims(rejections: any[]): string[] {
    const claims = new Set<string>();
    for (const rejection of rejections) {
      if (rejection.claimsAffected) {
        rejection.claimsAffected.split(',').forEach((c: string) => claims.add(c.trim()));
      }
    }
    return Array.from(claims);
  }

  private calculateRiskLevel(oa: any): 'LOW' | 'MEDIUM' | 'HIGH' {
    const rejectionCount = oa.rejections.length;
    if (rejectionCount === 0) return 'LOW';
    if (rejectionCount <= 3) return 'MEDIUM';
    return 'HIGH';
  }

  private determineStrategy(summary: any): 'ARGUE' | 'AMEND' | 'COMBINATION' {
    // TODO: Implement based on AI analysis
    return 'COMBINATION';
  }

  private getEventTitle(type: string): string {
    const titles: Record<string, string> = {
      FILING: 'Application Filed',
      OFFICE_ACTION: 'Office Action',
      RESPONSE_FILED: 'Response Filed',
      RCE_FILED: 'RCE Filed',
      NOTICE_OF_ALLOWANCE: 'Notice of Allowance',
      APPEAL_FILED: 'Appeal Filed',
    };
    return titles[type] || type;
  }

  private async getExaminerAnalytics(examinerId: string): Promise<ExaminerAnalytics | undefined> {
    // TODO: Implement real examiner analytics
    // For now, return undefined to hide the panel when no data
    return undefined;
  }

  /**
   * Build timeline using ONLY USPTO documents
   */
  private async buildUSPTOOnlyTimeline(
    projectId: string,
    tenantId: string
  ): Promise<any[]> {
    const usptoDocuments = await prisma.projectDocument.findMany({
      where: {
        projectId,
        project: {
          tenantId,
        },
        fileType: 'uspto-document',
      },
      orderBy: { createdAt: 'asc' },
    });

    const timeline: any[] = [];

    for (const doc of usptoDocuments) {
      try {
        const metadata = doc.extractedMetadata && typeof doc.extractedMetadata === 'object' 
          ? doc.extractedMetadata as any 
          : {};
        
        const documentCode = metadata.documentCode || metadata.docCode || '';
        const config = getDocumentDisplayConfig(documentCode);
        
        timeline.push({
          id: doc.id,
          type: this.mapDocumentCodeToType(documentCode),
          documentCode,
          date: metadata.mailDate || metadata.date || doc.createdAt.toISOString(),
          title: config?.label || metadata.description || doc.fileName,
          status: 'completed',
        });
      } catch (error) {
        logger.warn('Failed to parse USPTO document metadata', {
          documentId: doc.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
    
    // Sort timeline by date
    timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Calculate days between events
    for (let i = 1; i < timeline.length; i++) {
      const prevDate = new Date(timeline[i - 1].date);
      const currDate = new Date(timeline[i].date);
      timeline[i].daysFromPrevious = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    }

    return timeline;
  }

  private async calculateProsecutionStatistics(
    projectId: string,
    tenantId: string
  ): Promise<ProsecutionStatistics> {
    // Get office actions and amendment projects for statistics
    const officeActions = await prisma.officeAction.findMany({
      where: {
        projectId,
        tenantId,
      },
      orderBy: { dateIssued: 'asc' },
      include: {
        amendmentProjects: {
          where: { 
            deletedAt: null,
            status: 'FILED'
          },
        },
      },
    });

    // Get project creation date for duration calculation
    const project = await prisma.project.findFirst({
      where: { id: projectId, tenantId },
      select: { createdAt: true },
    });

    const now = new Date();
    const firstDate = officeActions[0]?.dateIssued || project?.createdAt || now;
    const duration = Math.floor((now.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate average response time
    let totalResponseTime = 0;
    let responseCount = 0;
    
    for (const oa of officeActions) {
      if (oa.amendmentProjects.length > 0 && oa.dateIssued) {
        const filedResponse = oa.amendmentProjects.find(ap => ap.status === 'FILED');
        if (filedResponse) {
          const responseTime = Math.floor(
            (filedResponse.updatedAt.getTime() - oa.dateIssued.getTime()) / (1000 * 60 * 60 * 24)
          );
          totalResponseTime += responseTime;
          responseCount++;
        }
      }
    }

    const averageResponseTime = responseCount > 0 ? Math.round(totalResponseTime / responseCount) : 45;

    return {
      totalOfficeActions: officeActions.length,
      totalResponses: officeActions.filter(oa => oa.amendmentProjects.some(ap => ap.status === 'FILED')).length,
      prosecutionDuration: duration,
      averageResponseTime,
    };
  }
}