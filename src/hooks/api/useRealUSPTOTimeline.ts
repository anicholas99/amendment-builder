/**
 * Hook to get REAL USPTO timeline data from synced documents
 * This uses the actual USPTO documents stored in ProjectDocuments table
 */

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/apiClient';
import { logger } from '@/utils/clientLogger';

interface USPTOTimelineResponse {
  applicationNumber: string | null;
  timeline: Array<{
    id: string;
    documentCode: string;
    documentId?: string;
    title: string;
    date: string;
    eventType?: string;
    category?: string;
    pdfUrl?: string;
    pageCount?: number;
    metadata?: any;
  }>;
  filesDrawer: Array<any>;
  officeActions: Array<any>;
  stats: {
    totalDocuments: number;
    timelineEvents: number;
    officeActionCount: number;
  };
}

export function useRealUSPTOTimeline(projectId: string) {
  return useQuery({
    queryKey: ['uspto-timeline', projectId],
    queryFn: async () => {
      logger.debug('[useRealUSPTOTimeline] Fetching real USPTO timeline', { projectId });
      
      const response = await apiFetch(`/api/projects/${projectId}/uspto-timeline`);
      const rawData = await response.json();
      
      if (!rawData.success) {
        throw new Error(rawData.error || 'Failed to fetch USPTO timeline');
      }
      
      const data = rawData.data as USPTOTimelineResponse;
      
      // Transform timeline data to match expected format
      const transformedTimeline = data.timeline.map((event) => ({
        id: event.id,
        documentId: event.documentId,
        type: mapDocumentCodeToType(event.documentCode),
        documentCode: event.documentCode,
        date: new Date(event.date),
        title: event.title,
        description: event.metadata?.description,
        status: 'completed',
        category: event.category,
        pdfUrl: event.pdfUrl,
        pageCount: event.pageCount,
      }));
      
      logger.info('[useRealUSPTOTimeline] Fetched timeline', {
        projectId,
        totalEvents: transformedTimeline.length,
        stats: data.stats,
      });
      
      return {
        applicationNumber: data.applicationNumber,
        timeline: transformedTimeline,
        filesDrawer: data.filesDrawer,
        officeActions: data.officeActions,
        stats: data.stats,
      };
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Map document codes to event types
function mapDocumentCodeToType(documentCode: string): string {
  // Office Actions
  if (['CTNF', 'CTFR', 'CTAV', 'CTNR'].includes(documentCode)) {
    return 'OFFICE_ACTION';
  }
  
  // Responses
  if (['REM', 'A...', 'A.NE', 'AMSB', 'RESP.FINAL', 'CTRS'].includes(documentCode)) {
    return 'RESPONSE';
  }
  
  // RCE
  if (['RCEX', 'RCE'].includes(documentCode)) {
    return 'RCE';
  }
  
  // Notices
  if (['NOA', 'ISSUE.NTF'].includes(documentCode)) {
    return 'NOTICE_OF_ALLOWANCE';
  }
  
  if (documentCode === 'ABN') {
    return 'ABANDONMENT';
  }
  
  // Filing events
  if (['SPEC', 'APP.FILE.REC', 'TRNA'].includes(documentCode)) {
    return 'APPLICATION_FILED';
  }
  
  // IDS
  if (['IDS', 'R561'].includes(documentCode)) {
    return 'IDS_FILED';
  }
  
  // Extensions
  if (['XT/', 'EXT.', 'PETXT'].includes(documentCode)) {
    return 'EXTENSION';
  }
  
  // Interview
  if (documentCode === 'EXIN') {
    return 'INTERVIEW_CONDUCTED';
  }
  
  // Continuation
  if (documentCode === 'NTCN') {
    return 'CONTINUATION_FILED';
  }
  
  // Default
  return 'OTHER';
}