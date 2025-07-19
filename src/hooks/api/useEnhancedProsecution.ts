/**
 * Enhanced Prosecution Hooks
 * 
 * Combines USPTO real-time data with existing project prosecution data
 * Provides a unified interface for prosecution timeline and document access
 */

import { useQuery } from '@tanstack/react-query';
import { useProsecutionOverview, useProsecutionTimeline } from './useProsecutionOverview';
import { useUSPTOProsecutionHistory, useUSPTOTimelineForProject } from './useUSPTO';
import { logger } from '@/utils/clientLogger';

/**
 * Enhanced prosecution timeline that combines project data with USPTO data
 * Falls back to USPTO data if project timeline is empty
 */
export function useEnhancedProsecutionTimeline(
  projectId: string,
  applicationNumber?: string | null
) {
  // Get existing project timeline
  const { data: projectTimeline, isLoading: projectLoading } = useProsecutionTimeline(projectId);
  
  // Get USPTO timeline if we have an application number
  const { data: usptoTimeline, isLoading: usptoLoading } = useUSPTOTimelineForProject(
    applicationNumber || null
  );

  return useQuery({
    queryKey: ['enhanced-prosecution-timeline', projectId, applicationNumber],
    queryFn: () => {
      // If we have project timeline data, use it
      if (projectTimeline && projectTimeline.length > 0) {
        logger.debug('[Enhanced Prosecution] Using project timeline', {
          projectId,
          eventCount: projectTimeline.length,
        });
        return projectTimeline;
      }

      // Otherwise, use USPTO timeline if available
      if (usptoTimeline && usptoTimeline.length > 0) {
        logger.debug('[Enhanced Prosecution] Using USPTO timeline', {
          applicationNumber,
          eventCount: usptoTimeline.length,
        });
        return usptoTimeline;
      }

      // Return empty array if no data
      return [];
    },
    enabled: !!projectId && (!projectLoading || !usptoLoading),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Enhanced prosecution overview that includes USPTO document data
 */
export function useEnhancedProsecutionOverview(
  projectId: string,
  applicationNumber?: string | null
) {
  // Get existing project overview
  const { data: projectOverview, isLoading: projectLoading } = useProsecutionOverview(projectId);
  
  // Get USPTO prosecution history if we have an application number
  const { data: usptoHistory, isLoading: usptoLoading } = useUSPTOProsecutionHistory(
    applicationNumber || null,
    { enabled: !!applicationNumber }
  );

  return useQuery({
    queryKey: ['enhanced-prosecution-overview', projectId, applicationNumber],
    queryFn: () => {
      if (!projectOverview) return null;

      // Enhance with USPTO data if available
      const enhanced = { ...projectOverview };

      // Add USPTO document statistics if available
      if (usptoHistory) {
        enhanced.prosecutionStatistics = {
          ...enhanced.prosecutionStatistics,
          usptoDocumentCount: usptoHistory.documents.length,
          usptoOfficeActions: usptoHistory.statistics.officeActions,
          usptoResponses: usptoHistory.statistics.responses,
          usptoCitations: usptoHistory.statistics.citations,
        };

        // Update application metadata if missing
        if (!enhanced.applicationMetadata.applicationNumber && usptoHistory.applicationNumber) {
          enhanced.applicationMetadata.applicationNumber = usptoHistory.applicationNumber;
        }

        // Add USPTO application data if available
        if (usptoHistory.applicationData) {
          enhanced.applicationMetadata = {
            ...enhanced.applicationMetadata,
            title: enhanced.applicationMetadata.title || usptoHistory.applicationData.title,
            examinerName: enhanced.applicationMetadata.examiner || usptoHistory.applicationData.examinerName,
            artUnit: enhanced.applicationMetadata.artUnit || usptoHistory.applicationData.artUnit,
          };
        }
      }

      logger.debug('[Enhanced Prosecution] Overview enhanced with USPTO data', {
        projectId,
        hasUSPTOData: !!usptoHistory,
        usptoDocumentCount: usptoHistory?.documents.length || 0,
      });

      return enhanced;
    },
    enabled: !!projectOverview && !projectLoading,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get USPTO documents for a project
 */
export function useProjectUSPTODocuments(
  projectId: string,
  applicationNumber?: string | null,
  options?: {
    coreOnly?: boolean;
    category?: string;
  }
) {
  const { data: usptoHistory } = useUSPTOProsecutionHistory(
    applicationNumber || null,
    { enabled: !!applicationNumber }
  );

  return useQuery({
    queryKey: ['project-uspto-documents', projectId, applicationNumber, options],
    queryFn: () => {
      if (!usptoHistory) return [];

      let documents = usptoHistory.documents;

      // Filter by importance if requested
      if (options?.coreOnly) {
        documents = documents.filter(doc => doc.importance === 'core');
      }

      // Filter by category if requested
      if (options?.category) {
        documents = documents.filter(doc => doc.category === options.category);
      }

      return documents;
    },
    enabled: !!usptoHistory,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Check if project has USPTO data available
 */
export function useHasUSPTOData(applicationNumber?: string | null) {
  const { data: usptoHistory, isLoading } = useUSPTOProsecutionHistory(
    applicationNumber || null,
    { enabled: !!applicationNumber }
  );

  return {
    hasData: !!usptoHistory && usptoHistory.documents.length > 0,
    documentCount: usptoHistory?.documents.length || 0,
    isLoading,
    applicationNumber: usptoHistory?.applicationNumber,
  };
}