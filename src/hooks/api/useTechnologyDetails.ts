import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToastWrapper';
import { queryKeys } from '@/config/reactQueryConfig';
import { TechnologyDetailsService } from '@/client/services/technology-details.client-service';
import { InventionData } from '@/types/invention';
import { inventionKeys } from '@/lib/queryKeys';
import { STALE_TIME } from '@/constants/time';
import { useApiQuery, useApiMutation } from '@/lib/api/queryClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import { claimQueryKeys } from '@/hooks/api/useClaims';
import { projectKeys } from '@/lib/queryKeys';

interface ProcessInventionParams {
  projectId: string;
  textInput: string;
}

export function useProcessInvention() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useApiMutation<any, ProcessInventionParams>({
    mutationFn: (data: ProcessInventionParams) =>
      TechnologyDetailsService.processInvention(data),
    onSuccess: async (data: any, { projectId }) => {
      queryClient.setQueryData(inventionKeys.detail(projectId), data.data);

      if (data.claims) {
        queryClient.setQueryData(claimQueryKeys.list(projectId), {
          claims: data.claims,
        });

        queryClient.invalidateQueries({
          queryKey: claimQueryKeys.list(projectId),
          refetchType: 'none',
        });
      }

      // IMPORTANT: Use invalidateQueries instead of resetQueries to maintain cache stability
      // This prevents the "active project not found" issue during processing

      // Invalidate project detail query with immediate refetch
      await queryClient.invalidateQueries({
        queryKey: projectKeys.detail(projectId),
        refetchType: 'active', // Force immediate refetch
      });

      // Invalidate ALL project list queries with controlled refetch
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

      // Invalidate the invention queries to ensure fresh data
      await queryClient.invalidateQueries({
        queryKey: inventionKeys.detail(projectId),
        refetchType: 'active',
      });

      // Wait for queries to settle before showing success message
      await queryClient.refetchQueries({
        queryKey: projectKeys.lists(),
        exact: false,
      });

      toast({
        title: 'Success',
        description: 'Your invention has been processed successfully!',
        status: 'success',
      });

      // Emit a custom event to notify other components
      window.dispatchEvent(
        new CustomEvent('invention-processed', {
          detail: { projectId },
        })
      );
    },
    onError: () => {
      toast({
        title: 'Processing Failed',
        description: 'Failed to process your invention. Please try again.',
        status: 'error',
      });
    },
  });
}

export function useTechnologyDetails(projectId: string | null) {
  return useApiQuery<InventionData | null>(
    [...inventionKeys.detail(projectId || '')],
    {
      url: API_ROUTES.PROJECTS.TECHNOLOGY_DETAILS(projectId || ''),
      enabled: !!projectId,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: STALE_TIME.DEFAULT,
      placeholderData: previousData => previousData,
    }
  );
}

export function useUpdateInvention(projectId: string | null) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useApiMutation<any, Partial<InventionData>>({
    mutationFn: (updates: Partial<InventionData>) => {
      if (!projectId) throw new Error('No active project');
      return TechnologyDetailsService.updateInvention(projectId, updates);
    },
    onMutate: async updates => {
      await queryClient.cancelQueries({
        queryKey: inventionKeys.detail(projectId || ''),
      });
      const previousData = queryClient.getQueryData(
        inventionKeys.detail(projectId || '')
      );
      queryClient.setQueryData(
        inventionKeys.detail(projectId || ''),
        (oldData: InventionData) => ({ ...oldData, ...updates })
      );
      return { previousData };
    },
    onError: (_error, _updates, context) => {
      const ctx = context as { previousData?: any } | undefined;
      if (ctx?.previousData) {
        queryClient.setQueryData(
          inventionKeys.detail(projectId || ''),
          ctx.previousData
        );
      }
      toast({
        title: 'Update Failed',
        description: 'Failed to save changes',
        status: 'error',
      });
    },
    onSuccess: data => {
      queryClient.setQueryData(inventionKeys.detail(projectId || ''), data);
    },
  });
}

export function useExtractText() {
  const toast = useToast();
  return useApiMutation<any, { file: File }>({
    mutationFn: ({ file }) => TechnologyDetailsService.extractText(file),
    onError: () => {
      toast({
        title: 'Extraction Failed',
        description: 'Failed to extract text from file.',
        status: 'error',
      });
    },
  });
}

export function useUploadFigure(projectId: string | null) {
  const toast = useToast();
  return useApiMutation<any, File>({
    mutationFn: (file: File) => {
      if (!projectId) throw new Error('No active project');
      return TechnologyDetailsService.uploadFigure(projectId, file);
    },
    onError: () => {
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload figure.',
        status: 'error',
      });
    },
  });
}

export function useDeleteFigure() {
  const toast = useToast();
  return useApiMutation<any, string>({
    mutationFn: (url: string) => TechnologyDetailsService.deleteFigure(url),
    onError: () => {
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete figure.',
        status: 'error',
      });
    },
  });
}
