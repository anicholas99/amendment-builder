/**
 * Clean hook for saving citations
 *
 * Non-blocking, optimistic updates, minimal complexity
 */

import { useCallback, useMemo } from 'react';
import { useToast } from '@/utils/toast';
import { useQueryClient } from '@tanstack/react-query';
import { ProcessedCitationMatch } from '@/types/domain/citation';
import { CitationSaveService } from '@/services/api/citations.service';
import { priorArtQueryKeys } from '@/hooks/api/usePriorArt';
import { priorArtKeys } from '@/lib/queryKeys';

import { logger } from '@/utils/clientLogger';
import { clearApiCacheForUrl } from '@/lib/api/apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import { emitCitationSaved } from '@/utils/events/citationEvents';
import {
  ProcessedSavedPriorArt,
  SavedCitationUI,
} from '@/types/domain/priorArt';

interface UseSaveCitationOptions {
  projectId: string;
  savedPriorArt?: ProcessedSavedPriorArt[];
  onSuccess?: () => void;
  addOptimisticUpdate?: (citationId: string, referenceNumber?: string) => void;
  removeOptimisticUpdate?: (citationId: string) => void;
}

export function useSaveCitation({
  projectId,
  savedPriorArt,
  onSuccess,
  addOptimisticUpdate,
  removeOptimisticUpdate,
}: UseSaveCitationOptions) {
  const toast = useToast();
  const queryClient = useQueryClient();

  // Create a Set of saved citation IDs for quick lookup
  const savedCitationIds = useMemo(() => {
    const ids = new Set<string>();

    if (savedPriorArt) {
      savedPriorArt.forEach(art => {
        if (art.savedCitations) {
          art.savedCitations.forEach((citation: SavedCitationUI) => {
            // Create a unique ID from element text and citation
            const id = `${citation.elementText}-${citation.citation}`;
            ids.add(id);
          });
        }
      });
    }

    return ids;
  }, [savedPriorArt]);

  // Check if a specific citation is already saved
  const isCitationSaved = useCallback(
    (citationMatch: ProcessedCitationMatch) => {
      const id = `${citationMatch.parsedElementText}-${citationMatch.citation}`;
      return savedCitationIds.has(id);
    },
    [savedCitationIds]
  );

  // Save citation handler - non-blocking
  const saveCitation = useCallback(
    (citationMatch: ProcessedCitationMatch) => {
      // Check if already saved
      if (isCitationSaved(citationMatch)) {
        toast.success('Citation already saved');
        return;
      }

      // Add optimistic update immediately if handler provided
      if (addOptimisticUpdate && citationMatch.id) {
        addOptimisticUpdate(citationMatch.id, citationMatch.referenceNumber);
      }

      // ---------- Optimistic update for Saved Prior Art ----------
      const normalizedRef = citationMatch.referenceNumber
        .replace(/-/g, '')
        .toUpperCase();

      const newCitation: SavedCitationUI = {
        elementText: citationMatch.parsedElementText || '',
        citation: citationMatch.citation,
        location: citationMatch.locationDataRaw || undefined,
        reasoning: citationMatch.reasoning?.summary || undefined,
      };

      queryClient.setQueryData<ProcessedSavedPriorArt[] | undefined>(
        priorArtQueryKeys.project(projectId),
        old => {
          let list = Array.isArray(old) ? [...old] : [];

          const idx = list.findIndex(
            art =>
              art.patentNumber.replace(/-/g, '').toUpperCase() === normalizedRef
          );

          if (idx !== -1) {
            const art = { ...list[idx] };
            const current = Array.isArray(art.savedCitations)
              ? [...art.savedCitations]
              : [];
            if (!current.some(c => c.citation === newCitation.citation)) {
              art.savedCitations = [...current, newCitation];
              list[idx] = art;
            }
          } else {
            const optimisticArt: ProcessedSavedPriorArt = {
              id: `temp-${Date.now()}`,
              projectId,
              patentNumber: normalizedRef,
              title: citationMatch.referenceTitle || '',
              abstract: undefined,
              url: undefined,
              notes: undefined,
              authors: citationMatch.referenceApplicant || undefined,
              publicationDate:
                citationMatch.referencePublicationDate || undefined,
              savedAt: new Date().toISOString(),
              priorArtData: {
                number: normalizedRef,
                patentNumber: normalizedRef,
                title: citationMatch.referenceTitle || '',
                source: 'Manual',
                relevance: 100,
              },
              savedCitations: [newCitation],
            };
            list = [optimisticArt, ...list];
          }

          return list;
        }
      );
      // Mirror update for alternate cache used in sidebar/search views
      queryClient.setQueryData<ProcessedSavedPriorArt[] | undefined>(
        priorArtKeys.saved.byProject(projectId),
        prev => {
          let list = Array.isArray(prev) ? [...prev] : [];
          const idx = list.findIndex(
            art =>
              art.patentNumber.replace(/-/g, '').toUpperCase() === normalizedRef
          );
          if (idx !== -1) {
            const art = { ...list[idx] };
            const current = Array.isArray(art.savedCitations)
              ? [...art.savedCitations]
              : [];
            if (!current.some(c => c.citation === newCitation.citation)) {
              art.savedCitations = [...current, newCitation];
              list[idx] = art;
            }
          } else {
            const optimisticArt: ProcessedSavedPriorArt = {
              id: `temp-${Date.now()}`,
              projectId,
              patentNumber: normalizedRef,
              title: citationMatch.referenceTitle || '',
              abstract: undefined,
              url: undefined,
              notes: undefined,
              authors: citationMatch.referenceApplicant || undefined,
              publicationDate:
                citationMatch.referencePublicationDate || undefined,
              savedAt: new Date().toISOString(),
              priorArtData: {
                number: normalizedRef,
                patentNumber: normalizedRef,
                title: citationMatch.referenceTitle || '',
                source: 'Manual',
                relevance: 100,
              },
              savedCitations: [newCitation],
            };
            list = [optimisticArt, ...list];
          }
          return list;
        }
      );

      // Find existing prior art for this patent
      const existingArt = savedPriorArt?.find(
        art =>
          art.patentNumber.replace(/-/g, '').toUpperCase() ===
          citationMatch.referenceNumber.replace(/-/g, '').toUpperCase()
      );

      // Call the success callback immediately if provided
      onSuccess?.();

      // Add a data attribute to help debug blocking issues
      if (typeof window !== 'undefined') {
        document.body.setAttribute('data-saving-citation', 'true');

        // Use requestAnimationFrame to defer the removal
        requestAnimationFrame(() => {
          document.body.removeAttribute('data-saving-citation');
        });
      }

      // Fire the save request - non-blocking
      // Don't await - let it complete in background
      const savePromise = existingArt?.savedCitations
        ? CitationSaveService.addCitationToExisting(
            projectId,
            citationMatch,
            existingArt.savedCitations
          )
        : CitationSaveService.saveCitation(projectId, citationMatch);

      // Handle success/error in the background
      // Explicitly void the promise to indicate fire-and-forget
      // eslint-disable-next-line no-restricted-syntax
      void savePromise
        .then(async () => {
          // Show success toast when actually saved
          toast.success('Citation saved');

          // CRITICAL: Clear the HTTP cache first to force fresh data
          clearApiCacheForUrl(API_ROUTES.PROJECTS.PRIOR_ART.LIST(projectId));

          // Invalidate both prior art query keys to trigger refetch
          await queryClient.invalidateQueries({
            queryKey: priorArtQueryKeys.project(projectId),
          });
          await queryClient.invalidateQueries({
            queryKey: priorArtKeys.saved.byProject(projectId),
          });

          // Emit citation saved event
          emitCitationSaved(
            projectId,
            citationMatch.referenceNumber,
            citationMatch.id
          );
        })
        .catch(() => {
          // Error is already logged in the service
          // Just show user-friendly error
          toast.error('Failed to save citation');

          // Remove optimistic update on error
          if (removeOptimisticUpdate && citationMatch.id) {
            removeOptimisticUpdate(citationMatch.id);
            logger.info(
              '[useSaveCitation] Removed optimistic update after error',
              {
                citationId: citationMatch.id,
              }
            );
          }
        });
    },
    [
      projectId,
      savedPriorArt,
      isCitationSaved,
      toast,
      queryClient,
      onSuccess,
      addOptimisticUpdate,
      removeOptimisticUpdate,
    ]
  );

  return {
    saveCitation,
    isCitationSaved,
    savedCitationIds,
  };
}
