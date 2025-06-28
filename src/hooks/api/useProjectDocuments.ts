/* eslint-disable local/no-direct-react-query-hooks */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ProjectApiService } from '@/client/services/project.client-service';
import {
  ApplicationVersionWithDocuments,
  DocumentData,
} from '@/types/versioning';
import { versionQueryKeys } from '@/lib/queryKeys/versionQueryKeys';

export const useSaveFullContentMutation = ({
  projectId,
  versionId,
}: {
  projectId: string;
  versionId: string;
}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { content: string; type?: string }) =>
      ProjectApiService.saveFullContent(projectId, payload),
    onMutate: async ({ content }) => {
      if (!projectId || !versionId) return;

      await queryClient.cancelQueries({
        queryKey: versionQueryKeys.detail(projectId, versionId),
      });

      const previousVersion =
        queryClient.getQueryData<ApplicationVersionWithDocuments>(
          versionQueryKeys.detail(projectId, versionId)
        );

      queryClient.setQueryData<ApplicationVersionWithDocuments>(
        versionQueryKeys.detail(projectId, versionId),
        (old: ApplicationVersionWithDocuments | undefined) => {
          if (!old) return old;

          const updatedDocuments = old.documents.map((doc: DocumentData) => {
            if (doc.type === 'FULL_CONTENT') {
              return { ...doc, content, updatedAt: new Date() };
            }
            return doc;
          });

          return {
            ...old,
            documents: updatedDocuments,
          };
        }
      );

      return { previousVersion };
    },
    onError: (error, variables, context: any) => {
      if (context?.previousVersion && projectId && versionId) {
        queryClient.setQueryData(
          versionQueryKeys.detail(projectId, versionId),
          context.previousVersion
        );
      }
    },
    onSettled: () => {
      if (projectId) {
        queryClient.invalidateQueries({
          queryKey: versionQueryKeys.all(projectId),
          exact: false,
        });
      }
    },
  });
};

export const useUpdateDocumentMutation = (
  projectId: string,
  versionId: string
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      documentId: string;
      content: string;
      type: string;
    }) => ProjectApiService.updateDocument(projectId, versionId, payload),
    onMutate: async ({ documentId, content }) => {
      await queryClient.cancelQueries({
        queryKey: versionQueryKeys.detail(projectId, versionId),
      });

      const previousVersion =
        queryClient.getQueryData<ApplicationVersionWithDocuments>(
          versionQueryKeys.detail(projectId, versionId)
        );

      queryClient.setQueryData<ApplicationVersionWithDocuments>(
        versionQueryKeys.detail(projectId, versionId),
        old => {
          if (!old) return old;
          return {
            ...old,
            documents: old.documents.map(doc =>
              doc.id === documentId
                ? { ...doc, content, updatedAt: new Date() }
                : doc
            ),
          };
        }
      );
      return { previousVersion };
    },
    onError: (err, variables, context: any) => {
      if (context?.previousVersion) {
        queryClient.setQueryData(
          versionQueryKeys.detail(projectId, versionId),
          context.previousVersion
        );
      }
    },
    onSettled: () => {
      if (projectId && versionId) {
        queryClient.invalidateQueries({
          queryKey: versionQueryKeys.detail(projectId, versionId),
        });
      }
    },
  });
};
