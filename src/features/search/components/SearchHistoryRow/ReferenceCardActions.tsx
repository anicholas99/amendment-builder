import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  Box,
  Tooltip,
  Spinner,
  IconButton,
  Icon,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiEye, FiList } from 'react-icons/fi';
import { logger } from '@/lib/monitoring/logger';
import { ReferenceCardActionsProps } from '../../types/searchHistoryRow';
import { normalizeReferenceNumber } from '../../utils/searchHistoryRowUtils';
import {
  hasReferenceWithCitations,
  addReferenceWithCitation,
} from '../../hooks/useCitationMatches';
import { useNextTick } from '@/hooks/useNextTick';

/**
 * ReferenceCardActions - Handles citation extraction and viewing for individual references
 * Separated from main component for better maintainability and testing
 */
export const ReferenceCardActions: React.FC<ReferenceCardActionsProps> =
  React.memo(
    ({
      referenceNumber,
      entry,
      onExtractCitationForReference,
      onViewCitationsForReference,
      citationJobNumbers,
      setCitationJobNumbers,
      extractingReferenceNumber,
      setExtractingReferenceNumber,
      isLoadingJobs = false,
    }) => {
      const toast = useToast();
      const extractingReferenceRef = useRef<string | null>(null);
      const [extractionTrigger, setExtractionTrigger] = useState(0);
      const nextTickUtils = useNextTick();

      // Define high-contrast colors for icons
      const iconColor = useColorModeValue('gray.600', 'blue.300');
      const iconHoverColor = useColorModeValue('gray.800', 'blue.100');

      // Cleanup nextTick on unmount
      useEffect(() => {
        return nextTickUtils.cleanup;
      }, [nextTickUtils]);

      // Common button props
      const commonProps = {
        variant: 'ghost' as const,
        size: 'xs' as const,
      };

      const normalizedRefNumber = normalizeReferenceNumber(referenceNumber);
      const hasJobLocal = citationJobNumbers.has(normalizedRefNumber);
      const hasJobFromCache =
        entry.id && hasReferenceWithCitations(entry.id, referenceNumber);
      const hasJob = hasJobLocal || hasJobFromCache;

      // Use the ref instead of state to determine if this reference is being extracted
      const isExtractingThisReference =
        extractingReferenceRef.current === referenceNumber;

      // Handle viewing citations
      const handleViewCitations = useCallback(
        (e: React.MouseEvent) => {
          e.stopPropagation();
          // Defer navigation until after tooltip closes
          nextTickUtils.nextTick(() => {
            if (onViewCitationsForReference) {
              onViewCitationsForReference(entry.id, referenceNumber);
            }
          });
        },
        [entry.id, referenceNumber, onViewCitationsForReference, nextTickUtils]
      );

      // Handle citation extraction
      const handleExtractCitation = useCallback(
        (e: React.MouseEvent) => {
          e.stopPropagation();

          if (!onExtractCitationForReference) return;

          // Set both state (for UI) and ref (for stable tracking across re-renders)
          setExtractingReferenceNumber(referenceNumber);
          extractingReferenceRef.current = referenceNumber;
          // Force re-render when setting the ref
          setExtractionTrigger(prev => prev + 1);

          logger.debug(
            `[ReferenceCardActions] Attempting to extract citation for ${referenceNumber}`
          );

          onExtractCitationForReference(entry.id, referenceNumber)
            .then(result => {
              logger.debug(
                `[ReferenceCardActions API_THEN] For ${referenceNumber}. Current extractingRef: ${extractingReferenceNumber}, Ref.current: ${extractingReferenceRef.current}`
              );

              if (extractingReferenceRef.current !== referenceNumber) {
                logger.warn(
                  `[ReferenceCardActions API_THEN_MISMATCH] Mismatch! Ref current is ${extractingReferenceRef.current}, but then is for ${referenceNumber}`
                );
                return;
              }

              // The backend logs indicate that extraction usually succeeds even when result is undefined
              if (
                !result ||
                (result && (result.id || result.isSuccess !== false))
              ) {
                logger.debug(
                  `[ReferenceCardActions] Extraction job appears successful for ${referenceNumber}, result:`,
                  result
                );
                setCitationJobNumbers(prev => {
                  const newSet = new Set(prev);
                  newSet.add(normalizedRefNumber);
                  return newSet;
                });
                // Update the global cache as well
                addReferenceWithCitation(entry.id, referenceNumber);
              } else {
                logger.error(
                  `[ReferenceCardActions] Extraction initiation explicitly failed for ${referenceNumber}, result:`,
                  result
                );
                toast({
                  title: 'Extraction Failed',
                  description: `Could not start citation extraction for ${referenceNumber}. Please try again.`,
                  status: 'error',
                  duration: 5000,
                  isClosable: true,
                });
                setCitationJobNumbers(prev => {
                  const newSet = new Set(prev);
                  newSet.delete(normalizedRefNumber);
                  return newSet;
                });
              }
            })
            .catch(err => {
              logger.debug(
                `[ReferenceCardActions API_CATCH] For ${referenceNumber}. Current extractingRef: ${extractingReferenceNumber}, Ref.current: ${extractingReferenceRef.current}`
              );

              if (extractingReferenceRef.current !== referenceNumber) {
                logger.warn(
                  `[ReferenceCardActions API_CATCH_MISMATCH] Mismatch! Ref current is ${extractingReferenceRef.current}, but catch is for ${referenceNumber}`
                );
                return;
              }

              logger.error(
                `[ReferenceCardActions API_CATCH_ERROR] Error starting extraction for ${referenceNumber}:`,
                err
              );
              toast({
                title: 'API Error',
                description: `Error during citation extraction for ${referenceNumber}: ${err.message || 'Unknown error'}.`,
                status: 'error',
                duration: 5000,
                isClosable: true,
              });
              setCitationJobNumbers(prev => {
                const newSet = new Set(prev);
                newSet.delete(normalizedRefNumber);
                return newSet;
              });
            })
            .finally(() => {
              logger.debug(
                `[ReferenceCardActions API_FINALLY] For ${referenceNumber}. Current extractingRef: ${extractingReferenceNumber}, Ref.current: ${extractingReferenceRef.current}`
              );

              // First clear the ref (which doesn't trigger re-render)
              if (extractingReferenceRef.current === referenceNumber) {
                extractingReferenceRef.current = null;
                // Force re-render when clearing the ref
                setExtractionTrigger(prev => prev + 1);
              } else {
                logger.warn(
                  `[ReferenceCardActions API_FINALLY_REF_MISMATCH] Not clearing ref. Ref current is ${extractingReferenceRef.current}, but finally is for ${referenceNumber}`
                );
              }

              // Now clear the state - this will update UI
              if (extractingReferenceNumber === referenceNumber) {
                setExtractingReferenceNumber(null);
                logger.debug(
                  `[ReferenceCardActions API_FINALLY] Spinner cleared for ${referenceNumber}`
                );
              } else {
                logger.warn(
                  `[ReferenceCardActions API_FINALLY_STATE_MISMATCH] Not clearing state. extractingRef is ${extractingReferenceNumber}, but finally is for ${referenceNumber}`
                );
              }
            });
        },
        [
          entry.id,
          referenceNumber,
          onExtractCitationForReference,
          extractingReferenceNumber,
          setExtractingReferenceNumber,
          setCitationJobNumbers,
          normalizedRefNumber,
          toast,
          nextTickUtils,
        ]
      );

      // Render based on current state
      if (isExtractingThisReference) {
        return (
          <Tooltip
            label="Requesting citation extraction..."
            placement="top"
            hasArrow
            gutter={8}
            closeOnMouseDown
            closeOnPointerDown
          >
            <Box p={1}>
              <Spinner size="xs" color="blue.500" />
            </Box>
          </Tooltip>
        );
      }

      // Show loading state while fetching citation jobs
      if (isLoadingJobs) {
        return (
          <Box p={1}>
            <Spinner size="xs" color="gray.400" opacity={0.6} />
          </Box>
        );
      }

      if (hasJob) {
        return (
          <Tooltip
            label="View citations"
            placement="top"
            hasArrow
            gutter={8}
            closeOnMouseDown
            closeOnPointerDown
          >
            <IconButton
              {...commonProps}
              icon={<Icon as={FiEye} color={iconColor} />}
              aria-label="View citations for this search"
              onClick={handleViewCitations}
              _hover={{
                color: iconHoverColor,
                bg: 'bg.hover',
              }}
            />
          </Tooltip>
        );
      }

      return (
        <Tooltip
          label="Extract citation data"
          placement="top"
          hasArrow
          gutter={8}
          closeOnMouseDown
          closeOnPointerDown
        >
          <IconButton
            {...commonProps}
            aria-label="Extract citation data"
            icon={<Icon as={FiList} color={iconColor} />}
            onClick={handleExtractCitation}
            _hover={{
              color: iconHoverColor,
              bg: 'bg.hover',
            }}
          />
        </Tooltip>
      );
    }
  );

ReferenceCardActions.displayName = 'ReferenceCardActions';
