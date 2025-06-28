/* eslint-disable local/no-direct-react-query-hooks */
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { ProjectApiService } from '@/client/services/project.client-service';
import { ApplicationVersionWithDocuments } from '@/types/versioning';
import { projectKeys } from '@/lib/queryKeys';
import { versionQueryKeys } from '@/lib/queryKeys/versionQueryKeys';
import { logger } from '@/lib/monitoring/logger';
import { STALE_TIME } from '@/constants/time';

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
    retry: (failureCount, error: any) => {
      if (error?.details?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
    gcTime: 5 * 60 * 1000,
    meta: {
      errorBoundary: false,
      onError: (error: any) => {
        if (error?.details?.status !== 404) {
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
    retry: (failureCount, error: any) => {
      // Don't retry on 404s
      if (error?.details?.status === 404) {
        return false;
      }
      // Standard retry for other errors
      return failureCount < 2;
    },
  });
};

export const useCreateVersionMutation = () => {
  return useMutation({
    mutationFn: ({
      projectId,
      payload,
    }: {
      projectId: string;
      payload: { name: string; sections?: Record<string, string> };
    }) => ProjectApiService.createVersion(projectId, payload),
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
    onSuccess: (data, variables) => {
      // Invalidate all version-related queries for this project
      queryClient.invalidateQueries({
        queryKey: versionQueryKeys.all(variables.projectId),
      });
      // Also invalidate the project detail to update any version counts
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(variables.projectId),
      });
      logger.info(
        'Patent generated successfully, invalidating version queries',
        {
          projectId: variables.projectId,
        }
      );
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
