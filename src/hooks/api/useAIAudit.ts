/* eslint-disable local/no-direct-react-query-hooks */
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { useToast } from '@/hooks/useToastWrapper';
import { logger } from '@/utils/clientLogger';
import {
  AIAuditApiService,
  AIAuditLogsQueryParams,
  AIAuditLog,
  AIAuditLogsResponse,
  AIAuditExportResponse,
} from '@/client/services/ai-audit.client-service';
import { aiAuditKeys } from '@/lib/queryKeys';
import { STALE_TIME } from '@/constants/time';

/**
 * Hook to fetch AI audit logs with filtering
 */
export const useAIAuditLogs = (params: AIAuditLogsQueryParams) => {
  return useQuery<AIAuditLogsResponse, Error>({
    queryKey: aiAuditKeys.list(params),
    queryFn: () => AIAuditApiService.getAuditLogs(params),
    staleTime: STALE_TIME.SHORT, // 30 seconds
    placeholderData: keepPreviousData,
  });
};

/**
 * Hook to fetch a single AI audit log
 */
export const useAIAuditLog = (auditLogId: string | null) => {
  return useQuery<AIAuditLog, Error>({
    queryKey: aiAuditKeys.detail(auditLogId || ''),
    queryFn: () => {
      if (!auditLogId) {
        throw new Error('Audit log ID is required');
      }
      return AIAuditApiService.getAuditLog(auditLogId);
    },
    enabled: !!auditLogId,
    staleTime: STALE_TIME.DEFAULT,
  });
};

/**
 * Hook to mark an AI audit log as reviewed
 */
export const useMarkAIAuditAsReviewed = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation<AIAuditLog, Error, string>({
    mutationFn: (auditLogId: string) =>
      AIAuditApiService.markAsReviewed(auditLogId),
    onSuccess: (data, auditLogId) => {
      // Update the specific audit log in cache
      queryClient.setQueryData(aiAuditKeys.detail(auditLogId), data);

      // Invalidate lists to show updated review status
      queryClient.invalidateQueries({
        queryKey: aiAuditKeys.logs(),
      });

      toast({
        title: 'Success',
        description: 'AI content marked as reviewed',
      });
    },
    onError: error => {
      logger.error('Failed to mark AI audit as reviewed', { error });
      toast({
        title: 'Error',
        description: 'Failed to mark as reviewed. Please try again.',
        status: 'error',
      });
    },
  });
};

/**
 * Hook to export AI audit logs for USPTO compliance
 */
export const useExportAIAuditLogs = () => {
  const toast = useToast();

  return useMutation<AIAuditExportResponse, Error, string>({
    mutationFn: (projectId: string) =>
      AIAuditApiService.exportAuditLogs(projectId),
    onSuccess: data => {
      toast({
        title: 'Export Complete',
        description: `Exported ${data.logs.length} AI audit logs for USPTO compliance`,
      });
    },
    onError: error => {
      logger.error('Failed to export AI audit logs', { error });
      toast({
        title: 'Export Failed',
        description: 'Unable to export audit logs. Please try again.',
        status: 'error',
      });
    },
  });
};

/**
 * Hook to download AI audit logs as a file
 */
export const useDownloadAIAuditLogs = () => {
  const toast = useToast();

  return useMutation<
    void,
    Error,
    { projectId: string; format: 'pdf' | 'json' }
  >({
    mutationFn: async ({ projectId, format }) => {
      const blob = await AIAuditApiService.downloadAuditLogs(projectId, format);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-audit-logs-${projectId}-${new Date().toISOString()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    },
    onSuccess: (_, variables) => {
      toast({
        title: 'Download Started',
        description: `AI audit logs downloaded as ${variables.format.toUpperCase()}`,
      });
    },
    onError: error => {
      logger.error('Failed to download AI audit logs', { error });
      toast({
        title: 'Download Failed',
        description: 'Unable to download audit logs. Please try again.',
        status: 'error',
      });
    },
  });
};

/**
 * Hook to get AI audit statistics for a project
 */
export const useAIAuditStats = (projectId: string | null) => {
  return useQuery({
    queryKey: aiAuditKeys.stats(projectId || ''),
    queryFn: () => {
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      return AIAuditApiService.getAuditStats(projectId);
    },
    enabled: !!projectId,
    staleTime: STALE_TIME.DEFAULT,
  });
};
