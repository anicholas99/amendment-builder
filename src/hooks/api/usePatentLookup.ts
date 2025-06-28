/* eslint-disable local/no-direct-react-query-hooks */
/**
 * Patent Lookup Hook
 *
 * React Query hooks for patent lookup operations.
 * This is the ONLY place where patent lookup queries should be defined.
 */

import { useMutation } from '@tanstack/react-query';
import { PatbaseApiService } from '@/client/services/patbase.client-service';
import { ApplicationError } from '@/lib/error';
import { logger } from '@/lib/monitoring/logger';
import { useToast } from '@chakra-ui/react';
import { showSuccessToast, showErrorToast } from '@/utils/toast';
import { patentKeys } from '@/lib/queryKeys';

interface LookupResult {
  patentNumber: string;
  referenceNumber?: string;
  found: boolean;
  title?: string;
  abstract?: string;
  CPCs?: string[];
  fullTextUrl?: string;
  publicationDate?: string;
  assignee?: string;
  metadata?: Record<string, unknown>;
  error?: string;
}

/**
 * Hook to perform bulk patent lookup
 */
export function useBulkPatentLookup() {
  const toast = useToast();

  return useMutation<{ results: LookupResult[] }, ApplicationError, string[]>({
    mutationFn: (references: string[]) =>
      PatbaseApiService.enhanceReferences(references),
    onSuccess: (data, references) => {
      const foundCount = data.results.filter(r => r.found).length;
      showSuccessToast(
        toast,
        'Patent lookup complete',
        `Found details for ${foundCount} out of ${references.length} patents`
      );
    },
    onError: (error: ApplicationError) => {
      logger.error('[useBulkPatentLookup] Error looking up patents:', error);
      showErrorToast(toast, 'Lookup failed', error.message);
    },
  });
}
