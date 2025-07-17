import { useApiMutation } from '@/lib/api/queryClient';
import { useToast } from '@/hooks/useToastWrapper';

interface PatentLookupResult {
  referenceNumber: string;
  patentNumber: string;
  title?: string;
  publicationDate?: string;
  assignee?: string;
  found: boolean;
}

interface BulkPatentLookupResponse {
  results: PatentLookupResult[];
}

/**
 * Stub implementation for bulk patent lookup
 * TODO: Implement actual API integration when PatBase API is configured
 */
export const useBulkPatentLookup = () => {
  const toast = useToast();

  return useApiMutation<BulkPatentLookupResponse, string[]>({
    mutationFn: async (patentNumbers: string[]) => {
      // Return mock data to prevent runtime errors
      return {
        results: patentNumbers.map(num => ({
          referenceNumber: num,
          patentNumber: num,
          title: 'Patent lookup not implemented',
          publicationDate: 'N/A',
          assignee: 'N/A',
          found: false,
        })),
      };
    },
    onError: () => {
      toast({
        title: 'Patent Lookup Error',
        description: 'Patent lookup feature is not yet implemented',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'bottom-right',
      });
    },
  });
};
