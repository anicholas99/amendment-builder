/**
 * Amendment Workflow Hooks
 * 
 * React Query hooks for Office Action response and amendment generation
 * Provides type-safe integration with amendment APIs
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/apiClient';
import { logger } from '@/utils/clientLogger';
import { useToast } from '@/hooks/useToastWrapper';
import { AmendmentApiService } from '@/services/api/amendmentApiService';
import type { 
  ResponseShellResult, 
  ResponseShellRequest 
} from '@/server/services/response-shell-generation.server-service';

// ============ TYPES ============

interface OfficeActionUploadRequest {
  file: File;
  metadata?: {
    applicationNumber?: string;
    mailingDate?: string;
    examinerName?: string;
  };
}

interface OfficeActionUploadResponse {
  id: string;
  projectId: string;
  fileName: string;
  extractedTextLength: number;
  rejectionCount: number;
  textExtractionWarning?: string;
  message: string;
}

interface OfficeAction {
  id: string;
  projectId: string;
  fileName: string;
  uploadedAt: string;
  status: 'UPLOADED' | 'PARSED' | 'ERROR';
  metadata?: any;
  rejections?: any[];
}

interface GenerateResponseShellRequest {
  templateStyle?: 'formal' | 'standard' | 'concise';
  includeBoilerplate?: boolean;
  firmName?: string;
}

interface GenerateResponseShellResponse {
  responseShell: ResponseShellResult;
  message: string;
}

// ============ QUERY KEYS ============

export const amendmentQueryKeys = {
  all: ['amendment'] as const,
  officeActions: (projectId: string) => ['amendment', 'office-actions', projectId] as const,
  officeAction: (officeActionId: string) => ['amendment', 'office-action', officeActionId] as const,
  responseShell: (officeActionId: string) => ['amendment', 'response-shell', officeActionId] as const,
};

// ============ OFFICE ACTION HOOKS ============

/**
 * Upload Office Action document
 */
export function useUploadOfficeAction(projectId: string) {
  const toast = useToast();

  return useMutation({
    mutationFn: async (request: OfficeActionUploadRequest): Promise<OfficeActionUploadResponse> => {
      const result = await AmendmentApiService.uploadOfficeAction(
        projectId,
        request.file,
        request.metadata
      );

      // Adapt the service response to match the hook interface
      return {
        id: result.id,
        projectId,
        fileName: result.fileName,
        extractedTextLength: 0, // Not available from service
        rejectionCount: result.rejectionCount,
        textExtractionWarning: result.warning,
        message: 'Office Action uploaded successfully',
      };
    },
    onSuccess: (data) => {
      toast.success({
        title: 'Office Action uploaded successfully',
        description: `Parsed ${data.rejectionCount} rejection${data.rejectionCount !== 1 ? 's' : ''}`,
      });
    },
    onError: (error) => {
      logger.error('[useUploadOfficeAction] Upload failed', {
        projectId,
        error: error instanceof Error ? error.message : String(error),
      });
      
      toast.error({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload Office Action',
      });
    },
  });
}

/**
 * Get Office Actions for a project
 */
export function useOfficeActions(projectId: string) {
  return useQuery({
    queryKey: amendmentQueryKeys.officeActions(projectId),
    queryFn: async () => {
      return AmendmentApiService.getOfficeActions(projectId);
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Get specific Office Action details
 */
export function useOfficeAction(officeActionId: string) {
  return useQuery({
    queryKey: amendmentQueryKeys.officeAction(officeActionId),
    queryFn: async () => {
      return AmendmentApiService.getOfficeActionDetail(officeActionId);
    },
    enabled: !!officeActionId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

// ============ RESPONSE SHELL HOOKS ============

/**
 * Generate Office Action response shell
 */
export function useGenerateResponseShell(projectId: string, officeActionId: string) {
  const toast = useToast();

  return useMutation({
    mutationFn: async (request: GenerateResponseShellRequest): Promise<GenerateResponseShellResponse> => {
      logger.info('[useGenerateResponseShell] Starting response generation', {
        projectId,
        officeActionId,
        templateStyle: request.templateStyle,
      });

      const response = await apiFetch(
        `/api/projects/${projectId}/office-actions/${officeActionId}/generate-response`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        throw new Error(`Response generation failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      logger.info('[useGenerateResponseShell] Response generated successfully', {
        projectId,
        officeActionId,
        sectionCount: data.responseShell.sections.length,
        totalRejections: data.responseShell.metadata.totalRejections,
      });

      return data;
    },
    onSuccess: (data) => {
      toast.success({
        title: 'Response shell generated',
        description: `Created ${data.responseShell.sections.length} sections for ${data.responseShell.metadata.totalRejections} rejection${data.responseShell.metadata.totalRejections !== 1 ? 's' : ''}`,
      });
    },
    onError: (error) => {
      logger.error('[useGenerateResponseShell] Generation failed', {
        projectId,
        officeActionId,
        error: error instanceof Error ? error.message : String(error),
      });
      
      toast.error({
        title: 'Generation failed',
        description: error instanceof Error ? error.message : 'Failed to generate response shell',
      });
    },
  });
}

/**
 * Get cached response shell (if available)
 */
export function useResponseShell(officeActionId: string) {
  return useQuery({
    queryKey: amendmentQueryKeys.responseShell(officeActionId),
    queryFn: async (): Promise<ResponseShellResult | null> => {
      logger.debug('[useResponseShell] Fetching response shell', { officeActionId });

      try {
        const response = await apiFetch(`/api/office-actions/${officeActionId}/response-shell`);
        
        if (!response.ok) {
          if (response.status === 404) {
            return null; // No response shell generated yet
          }
          throw new Error(`Failed to fetch response shell: ${response.statusText}`);
        }

        const data = await response.json();
        return data.responseShell;
      } catch (error) {
        // If response shell doesn't exist, return null instead of throwing
        logger.debug('[useResponseShell] Response shell not found', { officeActionId });
        return null;
      }
    },
    enabled: !!officeActionId,
    staleTime: 15 * 60 * 1000, // 15 minutes (response shells don't change often)
    refetchOnWindowFocus: false,
  });
}

// ============ INVALIDATION HELPERS ============

/**
 * Invalidate amendment queries
 */
export function useInvalidateAmendmentQueries() {
  const queryClient = useQueryClient();

  return {
    invalidateOfficeActions: (projectId: string) => {
      queryClient.invalidateQueries({
        queryKey: amendmentQueryKeys.officeActions(projectId),
      });
    },
    invalidateOfficeAction: (officeActionId: string) => {
      queryClient.invalidateQueries({
        queryKey: amendmentQueryKeys.officeAction(officeActionId),
      });
    },
    invalidateResponseShell: (officeActionId: string) => {
      queryClient.invalidateQueries({
        queryKey: amendmentQueryKeys.responseShell(officeActionId),
      });
    },
    invalidateAll: () => {
      queryClient.invalidateQueries({
        queryKey: amendmentQueryKeys.all,
      });
    },
  };
} 