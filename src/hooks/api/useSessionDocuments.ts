import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import { logger } from '@/utils/clientLogger';

interface SessionDocument {
  id: string;
  patentNumber: string;
  title: string;
  fileType?: string;
  savedAt: Date;
}

export function useSessionDocuments(
  projectId: string | undefined,
  sessionId: string | undefined
) {
  return useQuery<SessionDocument[]>({
    queryKey: ['session-documents', projectId, sessionId],
    queryFn: async () => {
      if (!projectId || !sessionId) {
        return [];
      }

      try {
        const response = await apiFetch(
          `/api/projects/${projectId}/patent-files/session/${sessionId}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch session documents');
        }

        const data = await response.json();
        return data.documents || [];
      } catch (error) {
        logger.error('[useSessionDocuments] Failed to fetch documents', {
          error,
        });
        return [];
      }
    },
    enabled: !!projectId && !!sessionId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
