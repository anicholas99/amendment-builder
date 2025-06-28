import { useQuery } from '@tanstack/react-query';
import { ClaimRepository } from '@/repositories/claimRepository';
import { API_ROUTES } from '@/constants/apiRoutes';
import { apiFetch } from '@/lib/api/apiClient';
import { logger } from '@/lib/monitoring/logger';

export const claimHistoryQueryKeys = {
  all: ['claimHistory'] as const,
  list: (claimId: string) =>
    [...claimHistoryQueryKeys.all, 'list', claimId] as const,
};

interface ClaimHistory {
  id: string;
  previousText: string;
  newText: string;
  timestamp: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface ClaimHistoryResponse {
  history: ClaimHistory[];
}

export const useClaimHistoryQuery = (claimId: string) => {
  // Don't fetch for temporary IDs
  const isValidId = Boolean(
    claimId && !claimId.startsWith('temp-') && claimId.length > 0
  );

  const query = useQuery<ClaimHistoryResponse>({
    queryKey: claimHistoryQueryKeys.list(claimId),
    queryFn: async () => {
      try {
        const response = await apiFetch(API_ROUTES.CLAIMS.HISTORY(claimId));
        const data = await response.json();
        return data;
      } catch (error: any) {
        // Handle 404s gracefully - this is expected for deleted claims
        if (
          error?.statusCode === 404 ||
          error?.code === 'DB_RECORD_NOT_FOUND'
        ) {
          // Return empty history for non-existent claims
          return { history: [] };
        }
        // Re-throw other errors
        throw error;
      }
    },
    enabled: isValidId,
    staleTime: 5000, // Reduced from 30 seconds to 5 seconds for more responsive updates
    gcTime: 60000, // 1 minute
    refetchOnMount: false, // Don't refetch on mount to avoid 404s for deleted claims
    refetchOnWindowFocus: false, // Don't refetch on window focus to prevent disruption
    retry: (failureCount, error: any) => {
      // Don't retry 404s
      if (error?.statusCode === 404 || error?.code === 'DB_RECORD_NOT_FOUND') {
        return false;
      }
      // Retry other errors up to 2 times
      return failureCount < 2;
    },
  });

  return query;
};
