/* eslint-disable local/no-direct-react-query-hooks */
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { ProjectApiService } from '@/client/services/project.client-service';
import { projectKeys } from '@/lib/queryKeys';
import { versionQueryKeys } from '@/lib/queryKeys/versionQueryKeys';
import { draftQueryKeys } from '@/lib/queryKeys/draftQueryKeys';
import { logger } from '@/utils/clientLogger';
import { STALE_TIME } from '@/constants/time';
import { DraftApiService } from '@/services/api/draftApiService';
import { delay } from '@/utils/delay';

export const useProjectVersionsQuery = (projectId: string) => {
  return useQuery({
    queryKey: versionQueryKeys.list(projectId),
    queryFn: () => ProjectApiService.getProjectVersions(projectId),
    enabled: !!projectId,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

export const useLatestVersionQuery = (projectId: string) => {
  return useQuery({
    queryKey: versionQueryKeys.latest(projectId),
    queryFn: () => ProjectApiService.getLatestVersion(projectId),
    enabled: !!projectId,
    staleTime: STALE_TIME.DEFAULT,
    placeholderData: keepPreviousData,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: (failureCount, error: unknown) => {
      const typedError = error as { details?: { status?: number } };
      if (typedError?.details?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
    gcTime: 5 * 60 * 1000,
    meta: {
      errorBoundary: false,
      onError: (error: unknown) => {
        const typedError = error as { details?: { status?: number } };
        if (typedError?.details?.status !== 404) {
          logger.error('Failed to fetch latest version', { error });
        }
      },
    },
  });
};

export const useVersionQuery = (projectId: string, versionId: string) => {
  return useQuery({
    queryKey: versionQueryKeys.detail(projectId, versionId),
    queryFn: () => ProjectApiService.getVersion(projectId, versionId),
    enabled: !!projectId && !!versionId,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: unknown) => {
      // Don't retry on 404s
      const typedError = error as { details?: { status?: number } };
      if (typedError?.details?.status === 404) {
        return false;
      }
      // Standard retry for other errors
      return failureCount < 2;
    },
  });
};

export const useCreateVersionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      payload,
    }: {
      projectId: string;
      payload: { name: string; sections?: Record<string, string> };
    }) => ProjectApiService.createVersion(projectId, payload),
    onSuccess: async (data, variables) => {
      // Invalidate version queries
      await queryClient.invalidateQueries({
        queryKey: versionQueryKeys.all(variables.projectId),
      });

      // Force refetch the version list to ensure the UI updates immediately
      await queryClient.refetchQueries({
        queryKey: versionQueryKeys.list(variables.projectId),
      });

      logger.info('Version created successfully, refetched version list', {
        projectId: variables.projectId,
        versionId: data.id,
      });
    },
  });
};

export const useGeneratePatentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      versionName,
      selectedRefs,
    }: {
      projectId: string;
      versionName?: string;
      selectedRefs?: string[];
    }) =>
      ProjectApiService.generatePatent(projectId, versionName, selectedRefs),
    onSuccess: async (data, variables) => {
      logger.info('Patent generated successfully', {
        projectId: variables.projectId,
        hasSections: !!('sections' in data && data.sections),
        sectionCount:
          'sections' in data && data.sections
            ? Object.keys(data.sections as Record<string, unknown>).length
            : 0,
      });

      // Give backend a moment to finish writing data, then invalidate
      setTimeout(() => {
        logger.info('Invalidating caches after backend processing delay', {
          projectId: variables.projectId,
        });
        
        queryClient.invalidateQueries({
          queryKey: draftQueryKeys.all(variables.projectId),
          exact: false,
          refetchType: 'active', // Force active queries to refetch immediately
        });
        
        queryClient.invalidateQueries({
          queryKey: projectKeys.detail(variables.projectId),
          refetchType: 'active',
        });
        
        // Additional force refresh after another few seconds if needed
        setTimeout(() => {
          logger.info('Force refreshing draft documents cache', {
            projectId: variables.projectId,
          });
          
          queryClient.refetchQueries({
            queryKey: draftQueryKeys.all(variables.projectId),
            exact: false,
          });
        }, 3000); // Additional 3 second delay for force refresh
        
      }, 2000); // 2 second delay to let backend finish

      logger.info('Patent generation complete - cache invalidation scheduled', {
        projectId: variables.projectId,
      });
    },
    onError: (error, variables) => {
      logger.error('Patent generation failed', {
        error,
        projectId: variables.projectId,
      });
    },
  });
};

export const useDeleteVersionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      versionId,
    }: {
      projectId: string;
      versionId: string;
    }) => ProjectApiService.deleteVersion(projectId, versionId),
    onSuccess: (data, variables) => {
      // Invalidate version list for this project
      queryClient.invalidateQueries({
        queryKey: versionQueryKeys.list(variables.projectId),
      });
      // Invalidate specific version query
      queryClient.invalidateQueries({
        queryKey: versionQueryKeys.detail(
          variables.projectId,
          variables.versionId
        ),
      });
      logger.info('Version deleted successfully', {
        projectId: variables.projectId,
        versionId: variables.versionId,
      });
    },
  });
};
