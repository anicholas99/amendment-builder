import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToastWrapper';
import { logger } from '@/utils/clientLogger';
import { apiFetch } from '@/lib/api/apiClient';
import { STALE_TIME } from '@/constants/time';

// ============ TYPES ============

interface OCRStatus {
  documentId: string;
  ocrStatus: 'pending' | 'completed' | 'failed' | null;
  ocrProcessedAt: string | null;
  ocrError: string | null;
  hasOcrText: boolean;
  ocrTextLength: number;
}

interface RunOCRResponse {
  success: boolean;
  message: string;
  documentId: string;
  status: string;
}

// ============ QUERY KEYS ============

export const documentOCRQueryKeys = {
  all: ['documentOCR'] as const,
  status: (projectId: string, documentId: string) => 
    [...documentOCRQueryKeys.all, 'status', projectId, documentId] as const,
};

// ============ HOOKS ============

/**
 * Hook to get OCR status for a document
 */
export function useDocumentOCRStatus(
  projectId: string | undefined,
  documentId: string | undefined,
  options?: {
    enabled?: boolean;
    polling?: boolean;
  }
) {
  const { enabled = true, polling = false } = options || {};

  return useQuery({
    queryKey: documentOCRQueryKeys.status(projectId || '', documentId || ''),
    queryFn: async (): Promise<OCRStatus> => {
      if (!projectId || !documentId) {
        throw new Error('Project ID and Document ID are required');
      }

      const response = await apiFetch(
        `/api/projects/${projectId}/documents/${documentId}/ocr`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch OCR status');
      }

      const data = await response.json();
      return data;
    },
    enabled: enabled && !!projectId && !!documentId,
    staleTime: polling ? 0 : STALE_TIME.DEFAULT,
    refetchInterval: (data) => {
      // Poll every 3 seconds while OCR is pending
      if (polling && data?.ocrStatus === 'pending') {
        return 3000;
      }
      return false;
    },
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Don't retry on 404s (document not found)
      if (error.message?.includes('404')) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

/**
 * Hook to run OCR processing on a document
 */
export function useRunDocumentOCR() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({
      projectId,
      documentId,
    }: {
      projectId: string;
      documentId: string;
    }): Promise<RunOCRResponse> => {
      logger.debug('[useRunDocumentOCR] Starting OCR processing', {
        projectId,
        documentId,
      });

      const response = await apiFetch(
        `/api/projects/${projectId}/documents/${documentId}/ocr`,
        {
          method: 'POST',
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to start OCR processing');
      }

      const data = await response.json();
      logger.info('[useRunDocumentOCR] OCR processing started', {
        projectId,
        documentId,
        status: data.status,
      });

      return data;
    },
    onMutate: async ({ projectId, documentId }) => {
      // Cancel any outgoing refetches to prevent race conditions
      const queryKey = documentOCRQueryKeys.status(projectId, documentId);
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousStatus = queryClient.getQueryData<OCRStatus>(queryKey);

      // Optimistically update to pending state
      queryClient.setQueryData<OCRStatus>(queryKey, (old) => ({
        documentId,
        ocrStatus: 'pending',
        ocrProcessedAt: new Date().toISOString(),
        ocrError: null,
        hasOcrText: old?.hasOcrText || false,
        ocrTextLength: old?.ocrTextLength || 0,
      }));

      logger.debug('[useRunDocumentOCR] Applied optimistic update', {
        projectId,
        documentId,
      });

      return { previousStatus };
    },
    onError: (error, { projectId, documentId }, context) => {
      // Rollback optimistic update on error
      if (context?.previousStatus) {
        const queryKey = documentOCRQueryKeys.status(projectId, documentId);
        queryClient.setQueryData(queryKey, context.previousStatus);
      }

      logger.error('[useRunDocumentOCR] OCR processing failed', {
        error,
        projectId,
        documentId,
      });

      toast.error({
        title: 'OCR Processing Failed',
        description: error instanceof Error 
          ? error.message 
          : 'Failed to start OCR processing',
      });
    },
    onSuccess: (data, { projectId, documentId }) => {
      // The optimistic update already set status to 'pending'
      // The status will be updated by polling or manual refetch
      
      logger.info('[useRunDocumentOCR] OCR processing started successfully', {
        projectId,
        documentId,
        message: data.message,
      });

      toast.success({
        title: 'OCR Processing Started',
        description: 'This may take a few moments to complete.',
      });
    },
    onSettled: (data, error, { projectId, documentId }) => {
      // Always invalidate queries to ensure fresh data
      const queryKey = documentOCRQueryKeys.status(projectId, documentId);
      queryClient.invalidateQueries({ queryKey });

      // Also invalidate project documents list to show updated status
      queryClient.invalidateQueries({
        queryKey: ['project-documents', projectId],
        exact: false,
      });
    },
  });
}

/**
 * Hook that combines OCR status with automatic polling
 * Useful for showing real-time status updates during processing
 */
export function useDocumentOCRWithPolling(
  projectId: string | undefined,
  documentId: string | undefined,
  options?: {
    enabled?: boolean;
  }
) {
  const { enabled = true } = options || {};

  const statusQuery = useDocumentOCRStatus(projectId, documentId, {
    enabled,
    polling: true, // Enable automatic polling
  });

  const runOCRMutation = useRunDocumentOCR();

  const startOCR = (projectId: string, documentId: string) => {
    return runOCRMutation.mutateAsync({ projectId, documentId });
  };

  return {
    ...statusQuery,
    startOCR,
    isProcessing: statusQuery.data?.ocrStatus === 'pending',
    isCompleted: statusQuery.data?.ocrStatus === 'completed',
    isFailed: statusQuery.data?.ocrStatus === 'failed',
    hasText: statusQuery.data?.hasOcrText || false,
    textLength: statusQuery.data?.ocrTextLength || 0,
    error: statusQuery.data?.ocrError,
  };
} 