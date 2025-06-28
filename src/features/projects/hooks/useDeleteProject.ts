import { useDeleteProjectMutation } from '@/hooks/api/useProjects';

/**
 * Hook for deleting a project.
 * Wraps the centralized mutation hook.
 */
export const useDeleteProject = () => {
  const deleteMutation = useDeleteProjectMutation();

  return {
    mutate: deleteMutation.mutate,
    mutateAsync: deleteMutation.mutateAsync,
    isPending: deleteMutation.isPending,
    isLoading: deleteMutation.isPending, // Backward compatibility
    deleteProject: deleteMutation.mutate, // Backward compatibility
  };
};
