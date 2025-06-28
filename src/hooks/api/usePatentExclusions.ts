/**
 * Centralized hook for managing patent exclusions.
 * Encapsulates all query and mutation logic for project-level patent exclusions.
 */
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import { useToast } from '@chakra-ui/react';
import {
  PatentExclusionsService,
  ProjectExclusion,
  AddExclusionResponse,
  RemoveExclusionResponse,
} from '@/client/services/patent-exclusions.client-service';
import { ApplicationError } from '@/lib/error';
import { showSuccessToast, showErrorToast } from '@/utils/toast';
import { STALE_TIME } from '@/constants/time';

/**
 * Query key factory for patent exclusion queries.
 */
export const patentExclusionQueryKeys = {
  all: ['patentExclusions'] as const,
  list: (projectId: string) =>
    [...patentExclusionQueryKeys.all, 'list', projectId] as const,
};

/**
 * Hook to fetch the list of patent exclusions for a project.
 */
export function usePatentExclusions(
  projectId: string | undefined,
  options?: Omit<
    UseQueryOptions<ProjectExclusion[], ApplicationError>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: patentExclusionQueryKeys.list(projectId || ''),
    queryFn: () => {
      if (!projectId) return [];
      return PatentExclusionsService.getProjectExclusions(projectId);
    },
    enabled: !!projectId,
    staleTime: STALE_TIME.DEFAULT,
    ...options,
  });
}

/**
 * Hook to add patent exclusions to a project.
 */
export function useAddPatentExclusion(
  options?: UseMutationOptions<
    AddExclusionResponse,
    ApplicationError,
    {
      projectId: string;
      patentNumbers: string[];
      metadata?: Record<string, unknown>;
    }
  >
) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({
      projectId,
      patentNumbers,
      metadata,
    }: {
      projectId: string;
      patentNumbers: string[];
      metadata?: Record<string, unknown>;
    }) =>
      PatentExclusionsService.addProjectExclusion(
        projectId,
        patentNumbers,
        metadata
      ),
    onSuccess: (data, variables) => {
      if (data.success) {
        showSuccessToast(toast, 'Patents excluded successfully.');
        queryClient.invalidateQueries({
          queryKey: patentExclusionQueryKeys.list(variables.projectId),
        });
      } else {
        showErrorToast(toast, 'Failed to exclude patents.');
      }
    },
    onError: error => {
      showErrorToast(
        toast,
        error.message || 'An error occurred while excluding patents.'
      );
    },
    ...options,
  });
}

/**
 * Hook to remove a patent exclusion from a project.
 */
export function useRemovePatentExclusion(
  options?: UseMutationOptions<
    RemoveExclusionResponse,
    ApplicationError,
    { projectId: string; patentNumber: string }
  >
) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({
      projectId,
      patentNumber,
    }: {
      projectId: string;
      patentNumber: string;
    }) =>
      PatentExclusionsService.removeProjectExclusion(projectId, patentNumber),
    onSuccess: (data, variables) => {
      if (data.success) {
        showSuccessToast(toast, 'Exclusion removed successfully.');
        queryClient.invalidateQueries({
          queryKey: patentExclusionQueryKeys.list(variables.projectId),
        });
      } else {
        showErrorToast(toast, 'Failed to remove exclusion.');
      }
    },
    onError: error => {
      showErrorToast(
        toast,
        error.message || 'An error occurred while removing the exclusion.'
      );
    },
    ...options,
  });
}
