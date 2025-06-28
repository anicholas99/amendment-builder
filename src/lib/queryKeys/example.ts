/**
 * React Query Key Factory Example
 *
 * Centralizes all query keys to prevent duplication and make cache invalidation easier.
 * Each domain gets its own key factory.
 */

// Project keys
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters: { tenantId?: string; userId?: string }) =>
    [...projectKeys.lists(), filters] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
  documents: (id: string) => [...projectKeys.detail(id), 'documents'] as const,
  versions: (id: string) => [...projectKeys.detail(id), 'versions'] as const,
};

// Search history keys
export const searchKeys = {
  all: ['searchHistory'] as const,
  lists: () => [...searchKeys.all, 'list'] as const,
  list: (projectId: string) => [...searchKeys.lists(), { projectId }] as const,
  details: () => [...searchKeys.all, 'detail'] as const,
  detail: (id: string) => [...searchKeys.details(), id] as const,
  citations: (id: string) => [...searchKeys.detail(id), 'citations'] as const,
};

// Prior art keys
export const priorArtKeys = {
  all: ['priorArt'] as const,
  lists: () => [...priorArtKeys.all, 'list'] as const,
  list: (projectId: string) =>
    [...priorArtKeys.lists(), { projectId }] as const,
  analysis: (projectId: string, searchId: string) =>
    [...priorArtKeys.all, 'analysis', { projectId, searchId }] as const,
};

// Usage examples:

/*
// In hooks:
const { data } = useQuery({
  queryKey: projectKeys.detail(projectId),
  queryFn: () => fetchProject(projectId),
});

// Invalidate specific project:
queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });

// Invalidate all project lists:
queryClient.invalidateQueries({ queryKey: projectKeys.lists() });

// Invalidate everything project-related:
queryClient.invalidateQueries({ queryKey: projectKeys.all });

// In mutations:
const mutation = useMutation({
  mutationFn: updateProject,
  onSuccess: (data) => {
    // Update the specific project
    queryClient.setQueryData(projectKeys.detail(data.id), data);
    // Invalidate all lists since the project may appear there
    queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
  },
});
*/
