import { UseMutationOptions } from '@tanstack/react-query';
import { ApplicationError } from '@/lib/error';
import { useGeneratePatentMutation as useApiGeneratePatentMutation } from '@/hooks/api/useProjects';
import { GeneratePatentResponse } from '@/types/api/responses';

interface GeneratePatentParams {
  projectId: string;
  versionId: string;
}

export function useGeneratePatent(
  options?: Omit<
    UseMutationOptions<
      GeneratePatentResponse,
      ApplicationError,
      GeneratePatentParams
    >,
    'mutationFn'
  >
) {
  const mutation = useApiGeneratePatentMutation();
  return {
    ...mutation,
    ...options,
  };
}
