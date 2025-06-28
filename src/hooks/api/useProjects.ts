/* eslint-disable local/no-direct-react-query-hooks */
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  useQuery,
  keepPreviousData,
} from '@tanstack/react-query';
import { useToast } from '@chakra-ui/react';
import { logger } from '@/lib/monitoring/logger';
import {
  ProjectApiService,
  ProjectsQueryParams,
} from '@/client/services/project.client-service';
import {
  ProjectData,
  UpdateProjectData,
  CreateProjectData,
  transformProject,
} from '@/types/project';
import { projectKeys } from '@/lib/queryKeys';
import { ProjectsListResponse } from '@/types/api/responses';
import { STALE_TIME } from '@/constants/time';
import { useEffect, useMemo } from 'react';
import { claimQueryKeys } from '@/hooks/api/useClaims';

export const useProjects = (
  params?: Omit<ProjectsQueryParams, 'pageParam'>
) => {
  return useInfiniteQuery({
    queryKey: projectKeys.list(params),
    queryFn: ({ pageParam }) =>
      ProjectApiService.getProjects({
        ...params,
        pageParam,
      }),
    getNextPageParam: (lastPage: ProjectsListResponse) =>
      lastPage.pagination.nextCursor,
    initialPageParam: 1,
    staleTime: STALE_TIME.DEFAULT,
    gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes (renamed from cacheTime)
    select: data => ({
      ...data,
      pages: data.pages.map(page => ({
        ...page,
        projects: page.projects.map((project: any) =>
          transformProject(project)
        ),
      })),
    }),
  });
};

export const useProject = (projectId: string | null) => {
  return useQuery<ProjectData, Error>({
    queryKey: projectKeys.detail(projectId!),
    queryFn: () => {
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      return ProjectApiService.getProject(projectId);
    },
    enabled: !!projectId,
    staleTime: STALE_TIME.DEFAULT,
    retry: 1,
    placeholderData: keepPreviousData,
  });
};

export const useCreateProject = (options?: {
  onSuccess?: (data: any, variables: CreateProjectData) => void;
  onError?: (error: Error, variables: CreateProjectData) => void;
}) => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation<
    any, 
    Error, 
    CreateProjectData, 
    { 
      optimisticProject: any; 
      previousQueries: { queryKey: readonly unknown[]; data: unknown }[] 
    }
  >({
    mutationFn: (data: CreateProjectData) =>
      ProjectApiService.createProject(data),
    onMutate: async (newProjectData) => {
      // Cancel any outgoing refetches to prevent race conditions
      await queryClient.cancelQueries({ 
        predicate: (query) => {
          return Array.isArray(query.queryKey) && 
            query.queryKey.includes('projects') &&
            query.queryKey.includes('list');
        }
      });

      // Create optimistic project data with all required fields
      const optimisticProject = {
        id: `temp-${Date.now()}`, // Temporary ID
        name: newProjectData.name,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        lastUpdated: Date.now(), // For sorting
        invention: null,
        documents: [],
        // Add other required fields with defaults
        userId: '',
        tenantId: '',
        textInput: '',
        savedPriorArtItems: []
      };

      // Store previous data for rollback
      const previousQueries: { queryKey: readonly unknown[]; data: unknown }[] = [];
      
      // Get all project list queries
      const queryCache = queryClient.getQueryCache();
      const projectQueries = queryCache.findAll({
        predicate: (query) => {
          return Array.isArray(query.queryKey) && 
            query.queryKey.includes('projects') &&
            query.queryKey.includes('list');
        },
        type: 'active',
      });
      
      logger.debug('[useCreateProject] Found active project queries:', {
        count: projectQueries.length,
        queryKeys: projectQueries.map(q => q.queryKey)
      });

      // Update all matching queries optimistically
      projectQueries.forEach(query => {
        const queryKey = query.queryKey;
        const oldData = queryClient.getQueryData(queryKey);
        
        if (oldData) {
          previousQueries.push({ queryKey, data: oldData });
          
          queryClient.setQueryData(queryKey, (old: any) => {
            if (!old || !old.pages) return old;
            
            // Create new pages array with the optimistic project added to the first page
            const newPages = [...old.pages];
            if (newPages[0]) {
              newPages[0] = {
                ...newPages[0],
                projects: [optimisticProject, ...newPages[0].projects]
              };
            }
            
            return {
              ...old,
              pages: newPages
            };
          });
        }
      });

      // Return the optimistic data and previous queries for rollback
      return { optimisticProject, previousQueries };
    },
    onSuccess: async (newProject, variables, context) => {
      // Log for debugging
      logger.info('[useCreateProject] Project created, updating caches', {
        projectId: newProject.id,
        projectName: variables.name,
        tempId: context?.optimisticProject.id,
      });

      // First, let's see what queries we have
      const queryCache = queryClient.getQueryCache();
      const projectQueries = queryCache.findAll({
        predicate: (query) => {
          return Array.isArray(query.queryKey) && 
            query.queryKey.includes('projects') &&
            query.queryKey.includes('list');
        }
      });
      
      logger.debug('[useCreateProject] Updating queries with real data:', {
        count: projectQueries.length,
        queryKeys: projectQueries.map(q => q.queryKey)
      });

      // Update the optimistic project with the real data
      let updatedCount = 0;
      queryClient.setQueriesData(
        { 
          predicate: (query) => {
            // Query key structure: [tenant, 'projects', 'list', filters]
            return Array.isArray(query.queryKey) && 
              query.queryKey.includes('projects') &&
              query.queryKey.includes('list');
          }
        },
        (old: any) => {
          if (!old) return old;
          
          updatedCount++;
          
          // Replace the temporary project with the real one
          const newPages = old.pages.map((page: any) => ({
            ...page,
            projects: page.projects.map((p: any) => {
              if (p.id === context?.optimisticProject.id) {
                logger.debug('[useCreateProject] Replacing temp project with real data', {
                  tempId: p.id,
                  realId: newProject.id
                });
                return transformProject(newProject);
              }
              return p;
            })
          }));
          
          return {
            ...old,
            pages: newPages
          };
        }
      );
      
      logger.debug('[useCreateProject] Updated query count:', { updatedCount });

      // Invalidate with controlled refetch
      await queryClient.invalidateQueries({
        queryKey: projectKeys.lists(),
        exact: false, // Match all list queries with any filters
        refetchType: 'none', // Don't refetch immediately since we just updated the data
      });

      // Also mark the new project detail as fresh
      queryClient.setQueryData(
        projectKeys.detail(newProject.id),
        transformProject(newProject)
      );
      
      // Pre-populate invention query to avoid loading state on navigation
      queryClient.setQueryData(
        ['invention', newProject.id],
        null // New projects have no invention data yet
      );
      
      // Pre-populate versions queries to avoid 404s
      queryClient.setQueryData(['versions', newProject.id, 'latest'], null);
      queryClient.setQueryData(['versions', newProject.id, 'list'], []);

      // Ensure cache is settled before proceeding
      await queryClient.invalidateQueries({
        queryKey: projectKeys.all,
        refetchType: 'none',
      });

      toast({
        title: 'Success',
        description: `Project "${variables.name}" created successfully`,
        status: 'success',
        duration: 5000,
        position: 'bottom-right',
        isClosable: true,
      });
      logger.info('Project created successfully', { projectId: newProject.id });
      
      // Still emit event for other components that might need it
      window.dispatchEvent(new CustomEvent('project-created', {
        detail: { projectId: newProject.id, project: newProject }
      }));
      
      options?.onSuccess?.(newProject, variables);
    },
    onError: (error, variables, context) => {
      // Rollback optimistic updates using stored data
      if (context?.previousQueries) {
        context.previousQueries.forEach(({ queryKey, data }) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      toast({
        title: 'Creation Failed',
        description: error.message || 'Failed to create the project.',
        status: 'error',
        position: 'bottom-right',
      });
      options?.onError?.(error, variables);
    },
  });
};

// Utility hook to retrieve *all* projects across every page.
// Automatically fetches subsequent pages until the API reports there are no more results.
// Accepts the same query params as `useProjects`, **excluding** `pageParam` which is managed internally.
export const useAllProjects = (
  params?: Omit<ProjectsQueryParams, 'pageParam'>
) => {
  const query = useProjects(params);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = query;

  // Automatically request additional pages until we've exhausted the list.
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) {
      // The React Query `fetchNextPage` call is idempotent – if we're already
      // in-flight the guard above prevents duplicate requests.
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten all loaded pages into a single array for easy consumption.
  const allProjects = useMemo(
    () => data?.pages.flatMap(page => page.projects) ?? [],
    [data]
  );

  return {
    projects: allProjects,
    ...query,
  };
};

export const useDeleteProjectMutation = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (projectId: string) =>
      ProjectApiService.deleteProject(projectId),
    onMutate: async (deletedProjectId: string) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: projectKeys.all });

      // Get all cached project list queries
      const queryCache = queryClient.getQueryCache();
      const projectListQueries = queryCache.findAll({
        queryKey: projectKeys.lists(),
        exact: false, // This will match all queries that start with the project lists key
        type: 'active',
      });

      // Store previous data for all queries
      const previousData: Map<string, any> = new Map();

      // Batch all cache updates to reduce re-renders
      queryClient.setQueriesData(
        { queryKey: projectKeys.lists(), exact: false },
        (oldData: any) => {
          if (!oldData) return oldData;

          // Store the original data for rollback
          const queryKey = projectListQueries.find(
            q => queryClient.getQueryData(q.queryKey) === oldData
          )?.queryKey;

          if (queryKey && !previousData.has(JSON.stringify(queryKey))) {
            previousData.set(JSON.stringify(queryKey), oldData);
          }

          return {
            ...oldData,
            pages: oldData.pages?.map((page: any) => ({
              ...page,
              projects: page.projects?.filter(
                (project: ProjectData) => project.id !== deletedProjectId
              ),
            })),
          };
        }
      );

      return { previousData };
    },
    onSuccess: (data, deletedProjectId) => {
      toast({
        title: 'Success',
        description: 'Project deleted successfully',
        status: 'success',
        duration: 3000,
        position: 'bottom-right',
      });
      logger.info('Project deleted successfully', {
        projectId: deletedProjectId,
      });

      // Use soft invalidation to avoid immediate refetch
      queryClient.invalidateQueries({
        queryKey: projectKeys.all,
        refetchType: 'none', // Don't refetch immediately
      });

      // Also invalidate the specific project detail
      queryClient.removeQueries({
        queryKey: projectKeys.detail(deletedProjectId),
      });
    },
    onError: (err, projectId, context: any) => {
      // Restore all previous data on error
      if (context?.previousData) {
        context.previousData.forEach((data: any, keyString: string) => {
          const queryKey = JSON.parse(keyString);
          queryClient.setQueryData(queryKey, data);
        });
      }

      toast({
        title: 'Error',
        description: 'Failed to delete project. Please try again.',
        status: 'error',
        duration: 5000,
        position: 'bottom-right',
      });

      logger.error('Project deletion failed', {
        projectId,
        error: err,
      });
    },
  });
};

export const useProcessInventionMutation = (options?: {
  onSuccess?: (
    data: any,
    variables: { projectId: string; text: string }
  ) => void;
  onError?: (
    error: Error,
    variables: { projectId: string; text: string }
  ) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, text }: { projectId: string; text: string }) =>
      ProjectApiService.processInvention(projectId, text),
    onSuccess: async (data, variables) => {
      // Pre-populate the claims cache if claims are returned
      if (data.claims && Array.isArray(data.claims)) {
        logger.info(
          '[useProcessInventionMutation] Pre-populating claims cache',
          {
            projectId: variables.projectId,
            claimCount: data.claims.length,
          }
        );
        queryClient.setQueryData(claimQueryKeys.list(variables.projectId), {
          claims: data.claims,
        });
      }

      // Ensure any newly created claims are fetched immediately
      queryClient.invalidateQueries({
        queryKey: claimQueryKeys.list(variables.projectId),
        refetchType: 'none', // Soft invalidation since we just set the data
      });
      
      // CRITICAL: Force update the specific project detail first
      await queryClient.invalidateQueries({
        queryKey: projectKeys.detail(variables.projectId),
        refetchType: 'active',
      });
      
      // Then invalidate ALL project list queries with immediate refetch
      // This ensures the sidebar gets the updated invention data
      await queryClient.invalidateQueries({
        queryKey: projectKeys.lists(),
        exact: false, // Match all list queries regardless of filters
        refetchType: 'active', // Force immediate refetch
      });
      
      // Also invalidate the base projects queries
      await queryClient.invalidateQueries({
        queryKey: projectKeys.all,
        refetchType: 'active',
      });
      
      // Add a small delay to ensure React Query has processed the updates
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Emit a custom event to notify other components
      window.dispatchEvent(new CustomEvent('invention-processed', {
        detail: { projectId: variables.projectId }
      }));

      options?.onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      options?.onError?.(error, variables);
    },
  });
};

export const useUpdateProjectMutation = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string;
      data: UpdateProjectData;
    }) => ProjectApiService.updateProject(projectId, data),
    onSuccess: async (updatedProject, variables) => {
      // Show success toast for name changes
      if (variables.data.name) {
        toast({
          title: 'Success',
          description: 'Project renamed successfully',
          status: 'success',
          duration: 3000,
          position: 'bottom-right',
        });
      }

      // Update the cache with the server response immediately
      if (updatedProject) {
        const transformed = transformProject(updatedProject);

        logger.info('Updating project cache after rename', {
          projectId: variables.projectId,
          oldName: variables.data.name,
          newName: transformed.name,
        });

        // Update all project lists with server data
        queryClient.setQueriesData(
          { queryKey: projectKeys.lists() },
          (old: any) => {
            if (!old) return old;

            return {
              ...old,
              pages: old.pages?.map((page: any) => ({
                ...page,
                projects: page.projects?.map((project: ProjectData) =>
                  project.id === variables.projectId ? transformed : project
                ),
              })),
            };
          }
        );

        // Update project detail with server data
        queryClient.setQueryData(
          projectKeys.detail(variables.projectId),
          transformed
        );
      }

      // Invalidate to ensure consistency but don't refetch immediately
      await queryClient.invalidateQueries({
        queryKey: projectKeys.lists(),
        refetchType: 'none',
      });
      await queryClient.invalidateQueries({
        queryKey: projectKeys.detail(variables.projectId),
        refetchType: 'none',
      });
    },
    onError: (err, { projectId }) => {
      toast({
        title: 'Update Failed',
        description: 'Failed to update project. Please try again.',
        status: 'error',
        duration: 5000,
        position: 'bottom-right',
      });

      logger.error('Project update failed', { projectId, error: err });
    },
  });
};

export const useSetActiveProjectMutation = () => {
  return useMutation({
    mutationFn: (projectId: string) =>
      ProjectApiService.setActiveProject(projectId),
    onError: (error: Error) => {
      logger.error('Error updating active project preference:', {
        error: error.message,
      });
    },
  });
};

export const useClearActiveProjectMutation = () => {
  return useMutation({
    mutationFn: () => ProjectApiService.clearActiveProject(),
    onError: (error: Error) => {
      logger.debug('Failed to clear active project preference:', {
        error: error.message,
      });
    },
  });
};

// Re-export hooks from split files for backward compatibility
export * from './useProjectVersions';
export * from './useProjectDocuments';
