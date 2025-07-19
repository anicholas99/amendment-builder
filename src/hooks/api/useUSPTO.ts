/* eslint-disable local/no-direct-react-query-hooks */
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useToast } from '@/hooks/useToastWrapper';
import { logger } from '@/utils/clientLogger';
import { USPTOService, FetchOfficeActionsOptions, ProsecutionDocument } from '@/client/services/uspto.client-service';
import { usptoQueryKeys } from '@/lib/queryKeys';
import { STALE_TIME } from '@/constants/time';

/**
 * Hook to fetch Office Actions from USPTO
 */
export const useUSPTOOfficeActions = (
  applicationNumber: string | null,
  options?: FetchOfficeActionsOptions
) => {
  return useQuery({
    queryKey: usptoQueryKeys.officeActions(applicationNumber || '', options),
    queryFn: () => {
      if (!applicationNumber) {
        throw new Error('Application number is required');
      }
      return USPTOService.fetchOfficeActions(applicationNumber, options);
    },
    enabled: !!applicationNumber,
    staleTime: STALE_TIME.LONG, // Cache for longer since USPTO data doesn't change frequently
    retry: 2,
  });
};

/**
 * Hook to get the most recent Office Action
 */
export const useMostRecentOfficeAction = (
  applicationNumber: string | null,
  includeContent = false
) => {
  return useQuery({
    queryKey: usptoQueryKeys.mostRecent(applicationNumber || '', includeContent),
    queryFn: () => {
      if (!applicationNumber) {
        throw new Error('Application number is required');
      }
      return USPTOService.getMostRecentOfficeAction(applicationNumber, includeContent);
    },
    enabled: !!applicationNumber,
    staleTime: STALE_TIME.LONG,
  });
};

/**
 * Hook to check if an application has Office Actions
 */
export const useUSPTOStatus = (applicationNumber: string | null) => {
  return useQuery({
    queryKey: usptoQueryKeys.status(applicationNumber || ''),
    queryFn: () => {
      if (!applicationNumber) {
        throw new Error('Application number is required');
      }
      return USPTOService.checkOfficeActionStatus(applicationNumber);
    },
    enabled: !!applicationNumber,
    staleTime: STALE_TIME.DEFAULT,
  });
};

/**
 * Hook to download an Office Action document
 */
export const useDownloadOfficeAction = () => {
  const toast = useToast();

  return useMutation({
    mutationFn: (documentId: string) => 
      USPTOService.downloadOfficeAction(documentId),
    onSuccess: (data) => {
      logger.info('Office Action download initiated', { 
        documentId: data.documentId,
        filename: data.filename 
      });
      
      // Open download URL in new tab
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      }
      
      toast.success('Office Action download started');
    },
    onError: (error) => {
      logger.error('Failed to download Office Action', { error });
      toast.error('Failed to download Office Action');
    },
  });
};

/**
 * Hook to process a USPTO document for a project
 */
export const useProcessUSPTODocument = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ documentId, projectId }: { documentId: string; projectId: string }) =>
      USPTOService.processOfficeActionPDF(documentId, projectId),
    onSuccess: (data, variables) => {
      logger.info('USPTO document processing initiated', { 
        jobId: data.jobId,
        projectId: variables.projectId 
      });
      
      // Invalidate project Office Actions list
      queryClient.invalidateQueries({
        queryKey: ['projects', variables.projectId, 'office-actions'],
      });
      
      toast.success('Office Action processing started');
    },
    onError: (error) => {
      logger.error('Failed to process USPTO document', { error });
      toast.error('Failed to process Office Action');
    },
  });
};

/**
 * Hook to refresh USPTO data for an application
 */
export const useRefreshUSPTOData = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (applicationNumber: string) => {
      // Fetch fresh data from USPTO
      const data = await USPTOService.fetchOfficeActions(applicationNumber, {
        includeDocumentContent: false,
      });
      return { applicationNumber, data };
    },
    onSuccess: ({ applicationNumber }) => {
      // Invalidate all USPTO queries for this application
      queryClient.invalidateQueries({
        queryKey: usptoQueryKeys.all(applicationNumber),
      });
      
      toast.success('USPTO data refreshed');
    },
    onError: (error) => {
      logger.error('Failed to refresh USPTO data', { error });
      toast.error('Failed to refresh USPTO data');
    },
  });
};

/**
 * Hook to fetch complete prosecution history from USPTO
 */
export const useUSPTOProsecutionHistory = (
  applicationNumber: string | null,
  options?: {
    includeTimeline?: boolean;
    enabled?: boolean;
  }
) => {
  return useQuery({
    queryKey: usptoQueryKeys.prosecutionHistory(applicationNumber || '', options?.includeTimeline),
    queryFn: () => {
      if (!applicationNumber) {
        throw new Error('Application number is required');
      }
      return USPTOService.fetchProsecutionHistory(applicationNumber, options?.includeTimeline);
    },
    enabled: !!applicationNumber && (options?.enabled !== false),
    staleTime: STALE_TIME.LONG,
    retry: 2,
  });
};

/**
 * Hook to download a USPTO document (supports new API format)
 */
export const useDownloadUSPTODocument = () => {
  const toast = useToast();

  return useMutation({
    mutationFn: (document: ProsecutionDocument | string) => {
      if (typeof document === 'string') {
        // Legacy support for document ID
        return USPTOService.downloadOfficeAction(document);
      }
      // New format with full document object
      return USPTOService.downloadOfficeAction(document);
    },
    onSuccess: (data, document) => {
      logger.info('USPTO document download initiated', { 
        documentId: typeof document === 'string' ? document : document.documentId,
        filename: data.filename,
      });
      
      // Open download URL in new tab
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      }
      
      toast.success('Document download started');
    },
    onError: (error) => {
      logger.error('Failed to download USPTO document', { error });
      toast.error('Failed to download document');
    },
  });
};

/**
 * Hook to get USPTO timeline data formatted for existing UI
 */
export const useUSPTOTimelineForProject = (applicationNumber: string | null) => {
  const { data: prosecutionHistory } = useUSPTOProsecutionHistory(applicationNumber, {
    includeTimeline: true,
  });

  return useQuery({
    queryKey: ['uspto', 'timeline-formatted', applicationNumber],
    queryFn: () => {
      if (!prosecutionHistory?.timeline) {
        return [];
      }

      // Transform USPTO timeline to match existing format
      return prosecutionHistory.timeline.map((event, index, array) => ({
        id: event.documentId,
        type: mapUSPTOEventType(event.type),
        date: new Date(event.date),
        title: event.title,
        description: undefined,
        status: index === array.length - 1 ? 'ACTIVE' : 'COMPLETED',
        daysFromPrevious: index > 0 ? calculateDaysBetween(
          array[index - 1].date,
          event.date
        ) : undefined,
      }));
    },
    enabled: !!prosecutionHistory?.timeline,
    staleTime: STALE_TIME.LONG,
  });
};

// Helper functions
function mapUSPTOEventType(usptoType: string): 'FILING' | 'OFFICE_ACTION' | 'RESPONSE' | 'NOTICE_OF_ALLOWANCE' | 'FINAL_REJECTION' | 'RCE' {
  const typeMap: Record<string, any> = {
    'office-action': 'OFFICE_ACTION',
    'response': 'RESPONSE',
    'claims': 'RESPONSE',
    'notice': 'NOTICE_OF_ALLOWANCE',
    'other': 'FILING',
  };
  
  return typeMap[usptoType] || 'OFFICE_ACTION';
}

function calculateDaysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}