/**
 * Prosecution Overview Hooks
 * 
 * React Query hooks for prosecution timeline data and examiner analytics
 * Provides type-safe integration with ProjectProsecutionService
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ProjectProsecutionService, ProsecutionOverview } from '@/services/api/projectProsecutionService';
import { logger } from '@/utils/clientLogger';

// ============ QUERY KEYS ============

export const prosecutionQueryKeys = {
  all: ['prosecution'] as const,
  overview: (projectId: string) => ['prosecution', 'overview', projectId] as const,
  timeline: (projectId: string) => ['prosecution', 'timeline', projectId] as const,
  examinerAnalytics: (examinerId: string) => ['prosecution', 'examiner', examinerId] as const,
};

// ============ PROSECUTION OVERVIEW HOOKS ============

/**
 * Get comprehensive prosecution overview for a project
 */
export function useProsecutionOverview(projectId: string) {
  return useQuery({
    queryKey: prosecutionQueryKeys.overview(projectId),
    queryFn: async () => {
      return ProjectProsecutionService.getProsecutionOverview(projectId);
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchInterval: 30 * 60 * 1000, // Auto-refresh every 30 minutes for deadline tracking
  });
}

/**
 * Get prosecution timeline for a project
 */
export function useProsecutionTimeline(projectId: string) {
  return useQuery({
    queryKey: prosecutionQueryKeys.timeline(projectId),
    queryFn: async () => {
      return ProjectProsecutionService.getProsecutionTimeline(projectId);
    },
    enabled: !!projectId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Get examiner analytics for a specific examiner
 */
export function useExaminerAnalytics(examinerId: string | undefined) {
  return useQuery({
    queryKey: prosecutionQueryKeys.examinerAnalytics(examinerId || ''),
    queryFn: async () => {
      if (!examinerId) throw new Error('Examiner ID is required');
      return ProjectProsecutionService.getExaminerAnalytics(examinerId);
    },
    enabled: !!examinerId,
    staleTime: 30 * 60 * 1000, // 30 minutes (examiner stats change infrequently)
    refetchOnWindowFocus: false,
  });
}

// ============ DERIVED DATA HOOKS ============

/**
 * Get current office action urgency level
 */
export function useOfficeActionUrgency(projectId: string) {
  const { data: overview } = useProsecutionOverview(projectId);
  
  if (!overview?.currentOfficeAction) {
    return {
      urgencyLevel: 'LOW' as const,
      daysToRespond: undefined,
      isOverdue: false,
    };
  }

  const daysToRespond = ProjectProsecutionService.calculateDaysToRespond(
    overview.currentOfficeAction.responseDeadline
  );
  const urgencyLevel = ProjectProsecutionService.getUrgencyLevel(daysToRespond);
  
  return {
    urgencyLevel,
    daysToRespond,
    isOverdue: daysToRespond < 0,
    deadline: overview.currentOfficeAction.responseDeadline,
  };
}

/**
 * Get prosecution status summary
 */
export function useProsecutionStatus(projectId: string) {
  const { data: overview, isLoading, error } = useProsecutionOverview(projectId);
  
  return {
    status: overview?.applicationMetadata.prosecutionStatus,
    statusLabel: overview ? ProjectProsecutionService.formatProsecutionStatus(overview.applicationMetadata.prosecutionStatus) : undefined,
    applicationNumber: overview?.applicationMetadata.applicationNumber,
    examiner: overview?.examinerAnalytics?.examiner,
    isLoading,
    error,
  };
}

/**
 * Get prosecution alerts by severity
 */
export function useProsecutionAlerts(projectId: string) {
  const { data: overview } = useProsecutionOverview(projectId);
  
  if (!overview?.alerts) {
    return {
      criticalAlerts: [],
      highAlerts: [],
      mediumAlerts: [],
      lowAlerts: [],
      totalAlerts: 0,
      actionRequiredCount: 0,
    };
  }
  
  const alerts = overview.alerts;
  
  return {
    criticalAlerts: alerts.filter(a => a.severity === 'CRITICAL'),
    highAlerts: alerts.filter(a => a.severity === 'HIGH'),
    mediumAlerts: alerts.filter(a => a.severity === 'MEDIUM'),
    lowAlerts: alerts.filter(a => a.severity === 'LOW'),
    totalAlerts: alerts.length,
    actionRequiredCount: alerts.filter(a => a.actionRequired).length,
  };
}

// ============ UTILITY HOOKS ============

/**
 * Get formatted prosecution statistics
 */
export function useProsecutionStatistics(projectId: string) {
  const { data: overview } = useProsecutionOverview(projectId);
  
  if (!overview) {
    return {
      totalOfficeActions: 0,
      totalResponses: 0,
      prosecutionDurationDays: 0,
      prosecutionDurationMonths: 0,
      averageResponseTime: 0,
      nextMilestone: undefined,
    };
  }
  
  const stats = overview.prosecutionStatistics;
  
  return {
    totalOfficeActions: stats.totalOfficeActions,
    totalResponses: stats.totalResponses,
    prosecutionDurationDays: stats.prosecutionDuration,
    prosecutionDurationMonths: Math.round(stats.prosecutionDuration / 30),
    averageResponseTime: stats.averageResponseTime,
    nextMilestone: stats.nextMilestone,
  };
}

/**
 * Get claim changes summary with formatting
 */
export function useClaimChangesSummary(projectId: string) {
  const { data: overview } = useProsecutionOverview(projectId);
  
  if (!overview) {
    return {
      totalAmended: 0,
      newClaims: 0,
      cancelledClaims: 0,
      highRiskCount: 0,
      pendingValidation: false,
      lastAmendmentDate: undefined,
      hasChanges: false,
    };
  }
  
  const changes = overview.claimChanges;
  
  return {
    totalAmended: changes.totalAmendedClaims,
    newClaims: changes.newClaims,
    cancelledClaims: changes.cancelledClaims,
    highRiskCount: changes.highRiskAmendments,
    pendingValidation: changes.pendingValidation,
    lastAmendmentDate: changes.lastAmendmentDate,
    hasChanges: changes.totalAmendedClaims > 0 || changes.newClaims > 0 || changes.cancelledClaims > 0,
  };
}

// ============ INVALIDATION HELPERS ============

/**
 * Invalidate prosecution queries
 */
export function useInvalidateProsecutionQueries() {
  const queryClient = useQueryClient();

  return {
    invalidateOverview: (projectId: string) => {
      queryClient.invalidateQueries({
        queryKey: prosecutionQueryKeys.overview(projectId),
      });
    },
    invalidateTimeline: (projectId: string) => {
      queryClient.invalidateQueries({
        queryKey: prosecutionQueryKeys.timeline(projectId),
      });
    },
    invalidateExaminer: (examinerId: string) => {
      queryClient.invalidateQueries({
        queryKey: prosecutionQueryKeys.examinerAnalytics(examinerId),
      });
    },
    invalidateAll: () => {
      queryClient.invalidateQueries({
        queryKey: prosecutionQueryKeys.all,
      });
    },
  };
} 