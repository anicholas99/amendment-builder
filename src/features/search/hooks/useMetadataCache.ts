import { useRef, useMemo } from 'react';
import { ProcessedCitationMatch } from '@/types/domain/citation';

export interface DisplayableMetadata {
  title?: string | null;
  applicant?: string | null;
  assignee?: string | null;
  publicationDate?: string | null;
  isMetadataOnly?: boolean;
}

interface UseMetadataCacheProps {
  selectedReference: string | null;
  citationMatchesData: ProcessedCitationMatch[] | undefined;
}

/**
 * Custom hook to cache reference metadata and prevent UI flickering
 */
export function useMetadataCache({
  selectedReference,
  citationMatchesData,
}: UseMetadataCacheProps) {
  // Cache for metadata to prevent flickering
  const metadataCache = useRef<{
    [key: string]: DisplayableMetadata;
  }>({});

  const selectedReferenceMetadata = useMemo(() => {
    if (!selectedReference) return null;

    // Return cached metadata immediately if we have it
    if (metadataCache.current[selectedReference]) {
      // If we have fresh data, update the cache
      if (citationMatchesData) {
        const match = citationMatchesData.find(
          m => m.referenceNumber === selectedReference
        );
        if (match) {
          const newMetadata: DisplayableMetadata = {
            title: match.referenceTitle,
            applicant: match.referenceApplicant,
            assignee:
              ('referenceAssignee' in match &&
              typeof match.referenceAssignee === 'string'
                ? match.referenceAssignee
                : null) || match.referenceApplicant,
            publicationDate: match.referencePublicationDate,
            isMetadataOnly:
              'isMetadataOnly' in match ? !!match.isMetadataOnly : false,
          };
          metadataCache.current[selectedReference] = newMetadata;
          return newMetadata;
        }
      }
      // Return cached version while loading
      return metadataCache.current[selectedReference];
    }

    // No cache, try to get from fresh data
    if (!citationMatchesData) return null;

    const match = citationMatchesData.find(
      m => m.referenceNumber === selectedReference
    );
    if (!match) return null;

    const metadata: DisplayableMetadata = {
      title: match.referenceTitle,
      applicant: match.referenceApplicant,
      assignee:
        ('referenceAssignee' in match &&
        typeof match.referenceAssignee === 'string'
          ? match.referenceAssignee
          : null) || match.referenceApplicant,
      publicationDate: match.referencePublicationDate,
      isMetadataOnly:
        'isMetadataOnly' in match ? !!match.isMetadataOnly : false,
    };

    // Cache the metadata
    metadataCache.current[selectedReference] = metadata;
    return metadata;
  }, [selectedReference, citationMatchesData]);

  return {
    selectedReferenceMetadata,
    metadataCache: metadataCache.current,
  };
}
