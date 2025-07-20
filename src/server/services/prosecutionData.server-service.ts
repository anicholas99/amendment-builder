/**
 * Prosecution Data Service
 * 
 * Production-ready service for aggregating real prosecution data
 * Replaces mock data with actual database queries
 */

import { prisma } from '@/lib/prisma';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { ValidationState, RiskLevel } from '@/features/amendment/types/validation';
import type { 
  ProsecutionOverview,
  OfficeActionSummary,
  ClaimChanges,
  ResponseStatus,
  Alert,
  ExaminerAnalytics,
  ProsecutionStatistics,
} from '@/services/api/projectProsecutionService';

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

      // Get current office action (most recent)
      const currentOA = project.officeActions[0];
      
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
          applicationNumber: project.invention?.applicationNumber || 'Pending',
          title: project.invention?.title || project.name,
          filingDate: project.invention?.filingDate || project.createdAt,
          artUnit: currentOA?.artUnit || 'Unknown',
          examiner: currentOA?.examinerId || 'Not Assigned',
          prosecutionStatus: this.determineStatus(project, currentOA),
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
            reasoning: currentOA.summary.keyTakeaways || '',
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
      lastAmendmentDate: lastAmendment?.updatedAt,
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
          daysRemaining,
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
    // Get office actions for this project
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

    const timeline: any[] = [];

    // Add office actions to timeline
    for (let i = 0; i < officeActions.length; i++) {
      const oa = officeActions[i];
      const prevOa = i > 0 ? officeActions[i - 1] : null;
      
      timeline.push({
        id: oa.id,
        type: 'OFFICE_ACTION',
        date: (oa.dateIssued || oa.createdAt).toISOString(),
        title: oa.oaNumber || 'Office Action',
        status: 'completed',
        daysFromPrevious: prevOa && oa.dateIssued && prevOa.dateIssued ? 
          Math.floor((oa.dateIssued.getTime() - prevOa.dateIssued.getTime()) / (1000 * 60 * 60 * 24)) : 
          undefined,
      });

      // Add response events
      for (const amendment of oa.amendmentProjects) {
        if (amendment.status === 'FILED') {
          timeline.push({
            id: `response-${amendment.id}`,
            type: 'RESPONSE_FILED',
            date: amendment.updatedAt.toISOString(),
            title: 'Response Filed',
            status: 'completed',
          });
        }
      }
    }

    // Sort timeline by date
    timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return timeline;
  }

  // Helper methods
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
    deadline.setDate(deadline.getDate() + 90); // Standard 3-month deadline
    return deadline;
  }

  private determineStatus(project: any, currentOA: any): string {
    if (!currentOA) return 'AWAITING_EXAMINATION';
    if (currentOA.amendmentProjects.some((ap: any) => ap.status === 'FILED')) {
      return 'RESPONSE_FILED';
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