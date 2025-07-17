import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, initializeApiSecurity } from '@/lib/api/apiClient';
import { logger } from '@/utils/clientLogger';
import { API_ROUTES } from '@/constants/apiRoutes';

interface UploadPatentFileParams {
  projectId: string;
  file: File;
  linkToProject?: boolean;
  fileType?:
    | 'parent-patent'
    | 'office-action'
    | 'cited-reference'
    | 'uploaded-doc';
  sessionId?: string;
}

interface UploadPatentFileResponse {
  success: boolean;
  file: {
    id: string;
    type: 'linked' | 'referenced';
    fileType: string;
    filename: string;
    storageUrl: string;
    projectId: string | null;
    sessionId: string | null;
    extractedMetadata?: {
      patentNumber?: string;
      title?: string;
      claim1?: string;
    };
  };
}

export function useUploadPatentFile() {
  const queryClient = useQueryClient();

  return useMutation<UploadPatentFileResponse, Error, UploadPatentFileParams>({
    mutationFn: async ({
      projectId,
      file,
      linkToProject = true,
      fileType = 'uploaded-doc',
      sessionId,
    }) => {
      // Ensure CSRF token is initialized
      await initializeApiSecurity();

      const formData = new FormData();
      formData.append('file', file);
      formData.append('linkToProject', linkToProject.toString());
      formData.append('fileType', fileType);
      if (sessionId) {
        formData.append('sessionId', sessionId);
      }

      logger.debug('[useUploadPatentFile] Uploading file', {
        projectId,
        filename: file.name,
        linkToProject,
        fileType,
        currentPath: window.location.pathname,
        tenantSlug: window.location.pathname.split('/')[1],
      });

      const response = await apiFetch(
        `/api/projects/${projectId}/upload-patent`,
        {
          method: 'POST',
          body: formData,
          // Don't set Content-Type header - browser will set it with boundary for FormData
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        let error;
        try {
          error = JSON.parse(errorText);
        } catch {
          error = { message: errorText };
        }

        logger.error('[useUploadPatentFile] Upload failed', {
          status: response.status,
          error,
          headers: Object.fromEntries(response.headers.entries()),
        });

        throw new Error(
          error.message || error.error || 'Failed to upload file'
        );
      }

      const result = await response.json();
      // The apiResponse.ok utility wraps the response in a 'data' property
      return result.data;
    },

    onSuccess: (data, variables) => {
      logger.info('[useUploadPatentFile] File uploaded successfully', {
        fileId: data.file.id,
        type: data.file.type,
      });

      // Invalidate relevant queries
      if (variables.linkToProject) {
        // Invalidate project/invention data if file was linked
        queryClient.invalidateQueries({
          queryKey: ['invention', variables.projectId],
        });
        queryClient.invalidateQueries({
          queryKey: ['project', variables.projectId],
        });
        // Also invalidate the linked files query
        queryClient.invalidateQueries({
          queryKey: ['linkedPatentFiles', variables.projectId],
        });
      }

      // If this was a session file, we might want to update chat context
      // This would be handled by the chat component
    },

    onError: error => {
      logger.error('[useUploadPatentFile] Upload failed', {
        error: error.message,
      });
    },
  });
}
