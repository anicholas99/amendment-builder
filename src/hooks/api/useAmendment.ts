/**
 * Amendment React Query Hooks
 * 
 * Provides typed React Query hooks for amendment workflow operations:
 * - Office Action management
 * - Rejection analysis
 * - Amendment generation
 * 
 * Follows existing hook patterns with proper query keys, caching,
 * and error handling.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToastWrapper';
import { AmendmentClientService } from '@/client/services/amendment.client-service';
import { logger } from '@/utils/clientLogger';
import {
  CreateOfficeActionResponse,
  AnalyzeRejectionsRequest,
  AnalyzeRejectionsResponse,
  GenerateAmendmentRequest,
  GenerateAmendmentResponse,
  OfficeAction,
  AmendmentResponse,
} from '@/types/domain/amendment';

// ============ QUERY KEYS ============

export const amendmentQueryKeys = {
  all: ['amendments'] as const,
  officeActions: (projectId: string) => 
    [...amendmentQueryKeys.all, 'officeActions', projectId] as const,
  officeAction: (projectId: string, officeActionId: string) =>
    [...amendmentQueryKeys.officeActions(projectId), officeActionId] as const,
  rejectionAnalysis: (projectId: string, officeActionId: string) =>
    [...amendmentQueryKeys.officeAction(projectId, officeActionId), 'analysis'] as const,
  amendmentResponse: (projectId: string, responseId: string) =>
    [...amendmentQueryKeys.all, 'responses', projectId, responseId] as const,
} as const;

// ============ OFFICE ACTION HOOKS ============

/**
 * Hook to fetch Office Actions for a project
 */
export function useOfficeActions(projectId: string) {
  return useQuery({
    queryKey: amendmentQueryKeys.officeActions(projectId),
    queryFn: () => AmendmentClientService.listOfficeActions(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch a specific Office Action
 */
export function useOfficeAction(projectId: string, officeActionId: string) {
  return useQuery({
    queryKey: amendmentQueryKeys.officeAction(projectId, officeActionId),
    queryFn: () => AmendmentClientService.getOfficeAction(projectId, officeActionId),
    enabled: !!projectId && !!officeActionId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}

/**
 * Hook to upload Office Action
 */
export function useUploadOfficeAction() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({
      projectId,
      file,
      metadata,
    }: {
      projectId: string;
      file: File;
      metadata?: {
        applicationNumber?: string;
        mailingDate?: string;
        examinerName?: string;
      };
    }): Promise<CreateOfficeActionResponse> => {
      return AmendmentClientService.uploadOfficeAction(projectId, file, metadata);
    },
    onSuccess: (data, variables) => {
      // Invalidate office actions list to show the new upload
      queryClient.invalidateQueries({
        queryKey: amendmentQueryKeys.officeActions(variables.projectId),
      });

      // Add the new office action to the cache
      if (data.officeAction) {
        queryClient.setQueryData(
          amendmentQueryKeys.officeAction(variables.projectId, data.officeAction.id),
          data.officeAction
        );
      }

      toast({
        title: 'Office Action Uploaded',
        description: `Successfully uploaded "${variables.file.name}"`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      logger.info('[useUploadOfficeAction] Upload successful', {
        projectId: variables.projectId,
        fileName: variables.file.name,
        officeActionId: data.officeAction?.id,
      });
    },
    onError: (error, variables) => {
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Failed to upload Office Action',
        status: 'error',
        duration: 8000,
        isClosable: true,
      });

      logger.error('[useUploadOfficeAction] Upload failed', {
        error,
        projectId: variables.projectId,
        fileName: variables.file.name,
      });
    },
  });
}

/**
 * Hook to parse Office Action
 */
export function useParseOfficeAction() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({
      projectId,
      officeActionId,
    }: {
      projectId: string;
      officeActionId: string;
    }) => {
      return AmendmentClientService.parseOfficeAction(projectId, officeActionId);
    },
    onSuccess: (data, variables) => {
      // Invalidate the office action to refetch with updated status
      queryClient.invalidateQueries({
        queryKey: amendmentQueryKeys.officeAction(variables.projectId, variables.officeActionId),
      });

      toast({
        title: 'Office Action Parsed',
        description: `Found ${data.rejectionCount} rejection${data.rejectionCount !== 1 ? 's' : ''}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      logger.info('[useParseOfficeAction] Parse successful', {
        projectId: variables.projectId,
        officeActionId: variables.officeActionId,
        rejectionCount: data.rejectionCount,
      });
    },
    onError: (error, variables) => {
      toast({
        title: 'Parsing Failed',
        description: error instanceof Error ? error.message : 'Failed to parse Office Action',
        status: 'error',
        duration: 8000,
        isClosable: true,
      });

      logger.error('[useParseOfficeAction] Parse failed', {
        error,
        projectId: variables.projectId,
        officeActionId: variables.officeActionId,
      });
    },
  });
}

// ============ REJECTION ANALYSIS HOOKS ============

/**
 * Hook to analyze rejections
 */
export function useAnalyzeRejections() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (request: AnalyzeRejectionsRequest): Promise<AnalyzeRejectionsResponse> => {
      return AmendmentClientService.analyzeRejections(request);
    },
    onSuccess: (data, variables) => {
      // Cache the analysis results
      queryClient.setQueryData(
        amendmentQueryKeys.rejectionAnalysis(variables.projectId, variables.officeActionId),
        data
      );

      toast({
        title: 'Analysis Complete',
        description: `Analyzed ${data.analyses?.length || 0} rejection${data.analyses?.length !== 1 ? 's' : ''}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      logger.info('[useAnalyzeRejections] Analysis successful', {
        projectId: variables.projectId,
        officeActionId: variables.officeActionId,
        analysisCount: data.analyses?.length || 0,
        overallStrategy: data.overallStrategy,
      });
    },
    onError: (error, variables) => {
      toast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'Failed to analyze rejections',
        status: 'error',
        duration: 8000,
        isClosable: true,
      });

      logger.error('[useAnalyzeRejections] Analysis failed', {
        error,
        projectId: variables.projectId,
        officeActionId: variables.officeActionId,
      });
    },
  });
}

/**
 * Hook to fetch rejection analysis results
 */
export function useRejectionAnalysis(projectId: string, officeActionId: string) {
  return useQuery({
    queryKey: amendmentQueryKeys.rejectionAnalysis(projectId, officeActionId),
    queryFn: async (): Promise<AnalyzeRejectionsResponse | null> => {
      // This would typically be a separate API call, but for now we rely on cache
      // TODO: Implement API endpoint to fetch existing analysis
      return null;
    },
    enabled: !!projectId && !!officeActionId,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

// ============ AMENDMENT GENERATION HOOKS ============

/**
 * Hook to generate amendment response
 */
export function useGenerateAmendment() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (request: GenerateAmendmentRequest): Promise<GenerateAmendmentResponse> => {
      return AmendmentClientService.generateAmendment(request);
    },
    onSuccess: (data, variables) => {
      // Cache the amendment response
      if (data.amendment) {
        queryClient.setQueryData(
          amendmentQueryKeys.amendmentResponse(variables.projectId, data.amendment.id),
          data.amendment
        );
      }

      toast({
        title: 'Amendment Generated',
        description: 'Amendment response has been generated successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      logger.info('[useGenerateAmendment] Generation successful', {
        projectId: variables.projectId,
        officeActionId: variables.officeActionId,
        amendmentId: data.amendment?.id,
        strategy: variables.strategy,
      });
    },
    onError: (error, variables) => {
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate amendment',
        status: 'error',
        duration: 8000,
        isClosable: true,
      });

      logger.error('[useGenerateAmendment] Generation failed', {
        error,
        projectId: variables.projectId,
        officeActionId: variables.officeActionId,
        strategy: variables.strategy,
      });
    },
  });
}

/**
 * Hook to fetch amendment response
 */
export function useAmendmentResponse(projectId: string, responseId: string) {
  return useQuery({
    queryKey: amendmentQueryKeys.amendmentResponse(projectId, responseId),
    queryFn: () => AmendmentClientService.getAmendmentResponse(projectId, responseId),
    enabled: !!projectId && !!responseId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}

/**
 * Hook to export amendment response
 */
export function useExportAmendment() {
  const toast = useToast();

  return useMutation({
    mutationFn: async ({
      projectId,
      responseId,
      format = 'docx',
      filename,
    }: {
      projectId: string;
      responseId: string;
      format?: 'docx' | 'pdf';
      filename?: string;
    }) => {
      const blob = await AmendmentClientService.exportAmendmentResponse(
        projectId,
        responseId,
        format
      );

      // Auto-download the file
      const downloadFilename = filename || 
        AmendmentClientService.generateAmendmentFilename(`Response_${responseId}`, format);
      
      AmendmentClientService.downloadFile(blob, downloadFilename);

      return { blob, filename: downloadFilename };
    },
    onSuccess: (data, variables) => {
      toast({
        title: 'Export Complete',
        description: `Amendment exported as ${data.filename}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      logger.info('[useExportAmendment] Export successful', {
        projectId: variables.projectId,
        responseId: variables.responseId,
        format: variables.format,
        filename: data.filename,
      });
    },
    onError: (error, variables) => {
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Failed to export amendment',
        status: 'error',
        duration: 8000,
        isClosable: true,
      });

      logger.error('[useExportAmendment] Export failed', {
        error,
        projectId: variables.projectId,
        responseId: variables.responseId,
        format: variables.format,
      });
    },
  });
}

// ============ UTILITY HOOKS ============

/**
 * Hook to invalidate amendment-related queries
 */
export function useInvalidateAmendmentQueries() {
  const queryClient = useQueryClient();

  return {
    invalidateOfficeActions: (projectId: string) => {
      queryClient.invalidateQueries({
        queryKey: amendmentQueryKeys.officeActions(projectId),
      });
    },
    invalidateOfficeAction: (projectId: string, officeActionId: string) => {
      queryClient.invalidateQueries({
        queryKey: amendmentQueryKeys.officeAction(projectId, officeActionId),
      });
    },
    invalidateAll: () => {
      queryClient.invalidateQueries({
        queryKey: amendmentQueryKeys.all,
      });
    },
  };
} 