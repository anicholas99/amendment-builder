import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/utils/toast';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { useUpdateProjectMutation } from '@/hooks/api/useProjects';

interface RenameProjectVariables {
  projectId: string;
  newName: string;
}

export function useRenameProject(options?: any) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const updateProjectMutation = useUpdateProjectMutation();

  const renameProject = (variables: RenameProjectVariables) => {
    return updateProjectMutation.mutate(
      {
        projectId: variables.projectId,
        data: { name: variables.newName },
      },
      {
        onSuccess: (_, vars) => {
          toast.success('Project renamed', {
            description: `Project renamed to "${variables.newName}"`,
          });
          queryClient.invalidateQueries({ queryKey: ['projects'] });
          queryClient.invalidateQueries({
            queryKey: ['project', variables.projectId],
          });
        },
        ...options,
      }
    );
  };

  return {
    ...updateProjectMutation,
    renameProject,
    isLoading: updateProjectMutation.isPending,
  };
}
