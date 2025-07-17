import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/apiClient';
import { ApplicationError } from '@/lib/error';
import { API_ROUTES } from '@/constants/apiRoutes';
import { DataChangeType } from '@/features/patent-application/utils/patent-sections/sectionDependencies';

export interface RegenerateSectionRequest {
  section?: string;
  changeTypes?: DataChangeType[];
  selectedRefs?: string[];
  preview?: boolean;
}

export interface SectionDiff {
  section: string;
  oldContent: string | null;
  newContent: string;
  hasChanged: boolean;
  usage?: {
    totalTokens: number;
    promptTokens: number;
    completionTokens: number;
  };
}

export interface RegenerateSectionResponse {
  success: boolean;
  preview: boolean;
  sections: SectionDiff[];
  summary: {
    total: number;
    changed: number;
    unchanged: number;
  };
}

/**
 * Hook for regenerating patent sections with diff preview
 */
export function useRegenerateSection(
  projectId: string,
  options?: UseMutationOptions<
    RegenerateSectionResponse,
    ApplicationError,
    RegenerateSectionRequest
  >
) {
  return useMutation<
    RegenerateSectionResponse,
    ApplicationError,
    RegenerateSectionRequest
  >({
    mutationFn: async data => {
      const response = await apiFetch(
        API_ROUTES.PROJECTS.REGENERATE_SECTION(projectId),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApplicationError(
          errorData.code || 'API_ERROR',
          errorData.message || 'Failed to regenerate section'
        );
      }

      return response.json();
    },
    ...options,
  });
}

/**
 * Hook for getting a preview of section changes based on data modifications
 */
export function useSectionChangePreview(projectId: string) {
  const mutation = useRegenerateSection(projectId);

  const previewChanges = async (changeTypes: DataChangeType[]) => {
    return mutation.mutateAsync({
      changeTypes,
      preview: true,
    });
  };

  const applySectionChanges = async (sections: string[]) => {
    const results = await Promise.all(
      sections.map(section =>
        mutation.mutateAsync({
          section,
          preview: false,
        })
      )
    );
    return results;
  };

  return {
    previewChanges,
    applySectionChanges,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
