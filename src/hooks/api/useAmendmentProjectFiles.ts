/**
 * React Query hooks for Amendment Project Files
 * 
 * Provides hooks for managing amendment project file data with caching,
 * optimistic updates, and error handling following established patterns
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logger } from '@/utils/clientLogger';
import { useToast } from '@/hooks/useToastWrapper';
import { AmendmentProjectFileApiService } from '@/services/api/amendmentProjectFileApiService';
import type { 
  AmendmentProjectFile, 
  AmendmentProjectFileWithRelations,
  AmendmentFileType,
  AmendmentFileStatus 
} from '@/types/amendment';

// ============ QUERY KEYS ============

export const amendmentProjectFileQueryKeys = {
  all: ['amendmentProjectFiles'] as const,
  lists: () => [...amendmentProjectFileQueryKeys.all, 'list'] as const,
  list: (amendmentProjectId: string, filters?: {
    fileType?: AmendmentFileType;
    status?: AmendmentFileStatus;
    search?: string;
  }) => [...amendmentProjectFileQueryKeys.lists(), amendmentProjectId, filters] as const,
  details: () => [...amendmentProjectFileQueryKeys.all, 'detail'] as const,
  detail: (fileId: string) => [...amendmentProjectFileQueryKeys.details(), fileId] as const,
  stats: (amendmentProjectId: string) => [...amendmentProjectFileQueryKeys.all, 'stats', amendmentProjectId] as const,
};

// ============ QUERY HOOKS ============

/**
 * Hook to fetch amendment project files with filtering and pagination
 */
export function useAmendmentProjectFiles(
  amendmentProjectId: string,
  options?: {
    fileType?: AmendmentFileType;
    status?: AmendmentFileStatus;
    search?: string;
    page?: number;
    limit?: number;
    includeStats?: boolean;
    enabled?: boolean;
  }
) {
  const {
    fileType,
    status,
    search,
    page = 1,
    limit = 20,
    includeStats = false,
    enabled = true,
  } = options || {};

  return useQuery({
    queryKey: amendmentProjectFileQueryKeys.list(amendmentProjectId, { fileType, status, search }),
    queryFn: () => AmendmentProjectFileApiService.getAmendmentProjectFiles(
      amendmentProjectId,
      { fileType, status, search, page, limit, includeStats }
    ),
    enabled: enabled && !!amendmentProjectId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to fetch a single amendment project file by ID
 */
export function useAmendmentProjectFile(
  fileId: string,
  options?: {
    includeRelations?: boolean;
    enabled?: boolean;
  }
) {
  const { includeRelations = false, enabled = true } = options || {};

  return useQuery({
    queryKey: amendmentProjectFileQueryKeys.detail(fileId),
    queryFn: () => AmendmentProjectFileApiService.getAmendmentProjectFile(fileId, includeRelations),
    enabled: enabled && !!fileId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to fetch file version history
 */
export function useAmendmentProjectFileHistory(
  fileId: string,
  options?: {
    enabled?: boolean;
  }
) {
  const { enabled = true } = options || {};

  return useQuery({
    queryKey: [...amendmentProjectFileQueryKeys.detail(fileId), 'history'],
    queryFn: () => AmendmentProjectFileApiService.getFileVersionHistory(fileId),
    enabled: enabled && !!fileId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ============ MUTATION HOOKS ============

/**
 * Hook to upload a new amendment project file
 */
export function useUploadAmendmentProjectFile() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ amendmentProjectId, file, metadata }: {
      amendmentProjectId: string;
      file: File;
      metadata: {
        fileType: AmendmentFileType;
        description?: string;
        tags?: string[];
        linkedDraftId?: string;
        parentFileId?: string;
      };
    }) => AmendmentProjectFileApiService.uploadFile(amendmentProjectId, file, metadata),
    
    onSuccess: (data: AmendmentProjectFile, variables) => {
      const { amendmentProjectId } = variables;
      
      // Invalidate the files list to refetch with new file
      queryClient.invalidateQueries({
        queryKey: amendmentProjectFileQueryKeys.list(amendmentProjectId),
      });
      
      // Set the new file in the cache
      queryClient.setQueryData(
        amendmentProjectFileQueryKeys.detail(data.id),
        data
      );
      
      toast.success({
        title: 'File Uploaded',
        description: `File "${data.fileName}" has been uploaded successfully`,
      });
      
      logger.info('[useUploadAmendmentProjectFile] File uploaded successfully', {
        fileId: data.id,
        amendmentProjectId,
        fileName: data.fileName,
      });
    },
    
    onError: (error: Error, variables) => {
      const { amendmentProjectId } = variables;
      
      toast.error({
        title: 'Failed to Upload File',
        description: error.message || 'An error occurred while uploading the file',
      });
      
      logger.error('[useUploadAmendmentProjectFile] Failed to upload file', {
        amendmentProjectId,
        error: error.message,
      });
    },
  });
}

/**
 * Hook to update an amendment project file
 */
export function useUpdateAmendmentProjectFile() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ fileId, updates }: {
      fileId: string;
      updates: {
        fileName?: string;
        status?: AmendmentFileStatus;
        description?: string;
        tags?: string[];
      };
    }) => AmendmentProjectFileApiService.updateFile(fileId, updates),
    
    onMutate: async ({ fileId, updates }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: amendmentProjectFileQueryKeys.detail(fileId) });
      
      // Snapshot the previous value
      const previousFile = queryClient.getQueryData<AmendmentProjectFile>(
        amendmentProjectFileQueryKeys.detail(fileId)
      );
      
      // Optimistically update the cache
      if (previousFile) {
        queryClient.setQueryData(
          amendmentProjectFileQueryKeys.detail(fileId),
          { ...previousFile, ...updates }
        );
      }
      
      return { previousFile };
    },
    
    onSuccess: (data: AmendmentProjectFile, variables) => {
      const { fileId } = variables;
      
      // Update the file in cache with the response data
      queryClient.setQueryData(
        amendmentProjectFileQueryKeys.detail(fileId),
        data
      );
      
      // Invalidate any lists that might contain this file
      queryClient.invalidateQueries({
        queryKey: amendmentProjectFileQueryKeys.lists(),
      });
      
      toast.success({
        title: 'File Updated',
        description: `File "${data.fileName}" has been updated successfully`,
      });
      
      logger.info('[useUpdateAmendmentProjectFile] File updated successfully', {
        fileId,
        fileName: data.fileName,
      });
    },
    
    onError: (error: Error, variables, context) => {
      const { fileId } = variables;
      
      // Rollback the optimistic update
      if (context?.previousFile) {
        queryClient.setQueryData(
          amendmentProjectFileQueryKeys.detail(fileId),
          context.previousFile
        );
      }
      
      toast.error({
        title: 'Failed to Update File',
        description: error.message || 'An error occurred while updating the file',
      });
      
      logger.error('[useUpdateAmendmentProjectFile] Failed to update file', {
        fileId,
        error: error.message,
      });
    },
  });
}

/**
 * Hook to delete an amendment project file
 */
export function useDeleteAmendmentProjectFile() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (fileId: string) => AmendmentProjectFileApiService.deleteFile(fileId),
    
    onMutate: async (fileId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: amendmentProjectFileQueryKeys.detail(fileId) });
      
      // Snapshot the previous value
      const previousFile = queryClient.getQueryData<AmendmentProjectFile>(
        amendmentProjectFileQueryKeys.detail(fileId)
      );
      
      return { previousFile };
    },
    
    onSuccess: (data, fileId, context) => {
      // Remove the file from cache
      queryClient.removeQueries({
        queryKey: amendmentProjectFileQueryKeys.detail(fileId),
      });
      
      // Invalidate all file lists to refetch without the deleted file
      queryClient.invalidateQueries({
        queryKey: amendmentProjectFileQueryKeys.lists(),
      });
      
      const fileName = context?.previousFile?.fileName || 'File';
      
      toast.success({
        title: 'File Deleted',
        description: `${fileName} has been deleted successfully`,
      });
      
      logger.info('[useDeleteAmendmentProjectFile] File deleted successfully', {
        fileId,
        fileName,
      });
    },
    
    onError: (error: Error, fileId, context) => {
      toast.error({
        title: 'Failed to Delete File',
        description: error.message || 'An error occurred while deleting the file',
      });
      
      logger.error('[useDeleteAmendmentProjectFile] Failed to delete file', {
        fileId,
        error: error.message,
      });
    },
  });
}

/**
 * Hook to create a new version of an existing file
 */
export function useCreateAmendmentProjectFileVersion() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ parentFileId, file, metadata }: {
      parentFileId: string;
      file: File;
      metadata: {
        description?: string;
        tags?: string[];
      };
    }) => AmendmentProjectFileApiService.createFileVersion(parentFileId, file, metadata),
    
    onSuccess: (data: AmendmentProjectFile, variables) => {
      const { parentFileId } = variables;
      
      // Get the parent file to know which amendment project to invalidate
      const parentFile = queryClient.getQueryData<AmendmentProjectFile>(
        amendmentProjectFileQueryKeys.detail(parentFileId)
      );
      
      if (parentFile) {
        // Invalidate the files list for the amendment project
        queryClient.invalidateQueries({
          queryKey: amendmentProjectFileQueryKeys.list(parentFile.amendmentProjectId),
        });
        
        // Invalidate version history for the parent file
        queryClient.invalidateQueries({
          queryKey: [...amendmentProjectFileQueryKeys.detail(parentFileId), 'history'],
        });
      }
      
      // Set the new version in the cache
      queryClient.setQueryData(
        amendmentProjectFileQueryKeys.detail(data.id),
        data
      );
      
      toast.success({
        title: 'New Version Created',
        description: `Version ${data.version} of "${data.fileName}" has been created`,
      });
      
      logger.info('[useCreateAmendmentProjectFileVersion] File version created successfully', {
        newFileId: data.id,
        parentFileId,
        version: data.version,
      });
    },
    
    onError: (error: Error, variables) => {
      const { parentFileId } = variables;
      
      toast.error({
        title: 'Failed to Create Version',
        description: error.message || 'An error occurred while creating the file version',
      });
      
      logger.error('[useCreateAmendmentProjectFileVersion] Failed to create file version', {
        parentFileId,
        error: error.message,
      });
    },
  });
} 