/**
 * Centralized hook for Reference Metadata API operations.
 * This hook provides a type-safe interface for fetching reference metadata
 * with proper error handling, loading states, and cache management via React Query.
 */
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import {
  CitationApiService,
  ReferenceMetadata,
} from '@/client/services/citation.client-service';
import { logger } from '@/lib/monitoring/logger';
import { ApplicationError } from '@/lib/error';
import { STALE_TIME } from '@/constants/time';

/**
 * Query key factory for reference metadata queries to ensure consistency.
 */
export const referenceMetadataQueryKeys = {
  all: ['referenceMetadata'] as const,
  detail: (referenceNumber: string) =>
    [...referenceMetadataQueryKeys.all, 'detail', referenceNumber] as const,
  batch: (referenceNumbers: string[]) =>
    [...referenceMetadataQueryKeys.all, 'batch', referenceNumbers] as const,
};

/**
 * Hook to fetch metadata for a single reference number.
 * @param referenceNumber The patent/publication number.
 * @param options Optional React Query options.
 */
export function useReferenceMetadata(
  referenceNumber: string | undefined,
  options?: Omit<
    UseQueryOptions<ReferenceMetadata | null, ApplicationError>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: referenceMetadataQueryKeys.detail(referenceNumber || ''),
    queryFn: () => {
      if (!referenceNumber) {
        logger.warn(
          '[useReferenceMetadata] No referenceNumber provided, skipping fetch.'
        );
        return null;
      }
      return CitationApiService.getReferenceMetadata(referenceNumber);
    },
    enabled: !!referenceNumber,
    staleTime: STALE_TIME.DEFAULT,
    retry: (failureCount, error) => {
      // Don't retry on 404s, which are expected if metadata doesn't exist.
      if (error.statusCode === 404) {
        return false;
      }
      return failureCount < 2;
    },
    ...options,
  });
}

/**
 * Hook to batch fetch metadata for multiple reference numbers.
 * @param referenceNumbers An array of patent/publication numbers.
 * @param options Optional React Query options.
 */
export function useReferenceMetadataBatch(
  referenceNumbers: string[],
  options?: Omit<
    UseQueryOptions<
      Record<string, ReferenceMetadata | undefined>,
      ApplicationError
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: referenceMetadataQueryKeys.batch(referenceNumbers),
    queryFn: () => {
      if (!referenceNumbers || referenceNumbers.length === 0) {
        logger.warn(
          '[useReferenceMetadataBatch] No referenceNumbers provided, skipping fetch.'
        );
        return {};
      }
      return CitationApiService.getReferenceMetadataBatch(referenceNumbers);
    },
    enabled: referenceNumbers && referenceNumbers.length > 0,
    staleTime: STALE_TIME.DEFAULT,
    ...options,
  });
}
