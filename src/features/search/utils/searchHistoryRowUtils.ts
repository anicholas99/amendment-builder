import React from 'react';
import { logger } from '@/lib/monitoring/logger';
import { useToast } from '@chakra-ui/react';
import { PriorArtReference } from '../../../types/claimTypes';

/**
 * Utility functions for SearchHistoryRow component business logic
 */

/**
 * Normalizes a patent reference number by removing hyphens and converting to uppercase
 */
export const normalizeReferenceNumber = (refNumber: string): string => {
  if (!refNumber) {
    return '';
  }
  return refNumber.replace(/-/g, '').toUpperCase();
};

/**
 * Formats a date string for display in the search history row
 */
export const formatDisplayDate = (
  timestamp?: string,
  date?: string
): string => {
  return timestamp || date || '';
};

/**
 * Checks if a reference is saved locally or via the isReferenceSaved prop
 */
export const isReferenceSavedLocally = (
  refNumber: string,
  savedArtNumbers: Set<string>,
  isReferenceSaved?: (referenceNumber: string) => boolean
): boolean => {
  const normalizedRefNumber = normalizeReferenceNumber(refNumber);
  return (
    savedArtNumbers.has(normalizedRefNumber) ||
    (isReferenceSaved ? isReferenceSaved(refNumber) : false)
  );
};

/**
 * Checks if a reference is excluded locally
 */
export const isReferenceExcludedLocally = (
  refNumber: string,
  excludedPatentNumbers: Set<string>
): boolean => {
  const normalizedRefNumber = normalizeReferenceNumber(refNumber);
  return excludedPatentNumbers.has(normalizedRefNumber);
};

/**
 * Extracts family member numbers from a prior art reference
 */
export const extractFamilyMemberNumbers = (
  reference: PriorArtReference
): string[] => {
  return (reference.otherFamilyMembers || [])
    .map(member => (typeof member === 'string' ? member : member?.number))
    .filter((num): num is string => typeof num === 'string' && num.length > 0);
};

/**
 * Gets all numbers to exclude (main + family members)
 */
export const getAllNumbersToExclude = (
  reference: PriorArtReference
): string[] => {
  const mainNumber = reference.number;
  const familyNumberStrings = extractFamilyMemberNumbers(reference);
  return [mainNumber, ...familyNumberStrings];
};

/**
 * Extracts metadata from a prior art reference for exclusion
 */
export const extractReferenceMetadata = (reference: PriorArtReference) => {
  const authors = Array.isArray(reference.authors)
    ? reference.authors.filter(Boolean).join(', ')
    : typeof reference.authors === 'string'
      ? reference.authors
      : '';

  const metadata = {
    title: reference.title || '',
    abstract: reference.abstract || '',
    url: reference.url || '',
    authors,
    publicationDate: reference.year || '',
  };

  // Add date information if available
  if ('date' in reference && typeof reference.date === 'string') {
    metadata.publicationDate = reference.date;
  }

  return metadata;
};

/**
 * Handles the logic for excluding a reference and its family members
 */
export const processReferenceExclusion = async (
  referenceToExclude: PriorArtReference,
  projectId: string,
  addExclusion: (params: {
    projectId: string;
    patentNumbers: string[];
    metadata: any;
  }) => Promise<void>,
  setExcludedPatentNumbers: React.Dispatch<React.SetStateAction<Set<string>>>,
  toast: ReturnType<typeof useToast>
): Promise<void> => {
  const allNumbersToExclude = getAllNumbersToExclude(referenceToExclude);
  const normalizedNumbers = allNumbersToExclude.map(normalizeReferenceNumber);

  try {
    const metadata = extractReferenceMetadata(referenceToExclude);

    await addExclusion({
      projectId,
      patentNumbers: allNumbersToExclude,
      metadata,
    });

    setExcludedPatentNumbers(
      prev => new Set([...Array.from(prev), ...normalizedNumbers])
    );

    toast({
      title: 'Reference(s) excluded',
      status: 'success',
      duration: 3000,
    });
  } catch (error) {
    logger.error('Error excluding reference(s):', error);
    toast({
      title: 'Error excluding',
      status: 'error',
      duration: 3000,
    });
    throw error;
  }
};

/**
 * Handles the logic for saving a prior art reference
 */
export const processPriorArtSave = async (
  priorArtRef: PriorArtReference,
  onSavePriorArt: (priorArtRef: PriorArtReference) => Promise<void> | void,
  refreshSavedArtData?: (projectId: string) => Promise<void>,
  projectId?: string,
  toast?: ReturnType<typeof useToast>
): Promise<void> => {
  logger.log('[SearchHistoryRow] Calling onSavePriorArt', {
    referenceNumber: priorArtRef.number,
    title: priorArtRef.title,
  });

  try {
    // Wait for the API call to complete before refreshing
    await onSavePriorArt(priorArtRef);

    logger.log('[SearchHistoryRow] onSavePriorArt completed successfully', {
      referenceNumber: priorArtRef.number,
    });

    // Now refresh the data since the API call completed
    if (refreshSavedArtData && projectId) {
      // Defer the refresh slightly to ensure the backend has committed the new record
      setTimeout(async () => {
        logger.log('[SearchHistoryRow] Refreshing saved art data (deferred)', {
          projectId,
        });

        try {
          await refreshSavedArtData(projectId);
          logger.log('[SearchHistoryRow] refreshSavedArtData completed');
        } catch (refreshError) {
          logger.error(
            '[SearchHistoryRow] Error calling refreshSavedArtData:',
            refreshError
          );

          if (toast) {
            toast({
              title: 'Reference saved, but refresh failed',
              description:
                'The reference was saved successfully, but we could not refresh the list. You may need to refresh the page.',
              status: 'warning',
              duration: 5000,
              isClosable: true,
            });
          }
        }
      }, 800); // ~0.8 s gives the API time to commit
    } else {
      logger.warn(
        '[SearchHistoryRow] refreshSavedArtData or projectId not available, cannot refresh.'
      );
    }
  } catch (saveError) {
    logger.error('[SearchHistoryRow] Error in onSavePriorArt:', saveError);

    throw saveError;
  }
};

/**
 * Generates pagination display text
 */
export const generatePaginationText = (
  remainingResults: number,
  incrementCount: number
): string => {
  const showNextCount = Math.min(incrementCount, remainingResults);

  if (remainingResults <= incrementCount) {
    return `Show all ${remainingResults === 1 ? 'remaining result' : `remaining results (${remainingResults} remaining)`}`;
  }

  return `Show ${showNextCount} more results (${remainingResults} remaining)`;
};
