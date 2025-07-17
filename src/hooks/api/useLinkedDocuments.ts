import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/apiClient';
import { logger } from '@/utils/clientLogger';

interface LinkedDocument {
  id: string;
  fileName: string;
  originalName: string;
  fileType: string;
  createdAt: string;
  uploadedBy: string;
  // Alias fields for backward compatibility with chat UI
  patentNumber?: string;
  title?: string;
}

export function useLinkedDocuments(projectId: string | undefined) {
  return useQuery<LinkedDocument[]>({
    queryKey: ['linked-documents', projectId],
    queryFn: async () => {
      if (!projectId) {
        return [];
      }

      try {
        const response = await apiFetch(`/api/projects/${projectId}/documents`);

        if (!response.ok) {
          throw new Error('Failed to fetch project documents');
        }

        const result = await response.json();
        // The apiResponse.ok utility wraps the response in a 'data' property
        const documents = result.data?.documents || [];
        // Map the documents to include backward-compatible fields
        return documents.map((doc: any) => ({
          ...doc,
          patentNumber: doc.fileName, // For backward compatibility
          title: doc.originalName, // For backward compatibility
        }));
      } catch (error) {
        logger.error('[useLinkedDocuments] Failed to fetch documents', {
          error,
        });
        return [];
      }
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
