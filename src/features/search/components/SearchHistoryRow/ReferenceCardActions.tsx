import React, { useCallback, useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { FiFileText, FiZap, FiCpu } from 'react-icons/fi';
import { LoadingMinimal } from '@/components/common/LoadingState';
import { logger } from '@/utils/clientLogger';
import { useToast } from '@/hooks/useToastWrapper';
import { useThemeContext } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
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
    }) => {
      const toast = useToast();
      const { isDarkMode } = useThemeContext();
      const extractingReferenceRef = useRef<string | null>(null);
      const [extractionTrigger, setExtractionTrigger] = useState(0);
      const nextTickUtils = useNextTick();

      // Define high-contrast colors for icons
      const iconColorClass = isDarkMode ? 'text-blue-300' : 'text-gray-600';
      const iconHoverColorClass = isDarkMode
        ? 'text-blue-100'
        : 'text-gray-800';

      // Cleanup nextTick on unmount
      useEffect(() => {
        return nextTickUtils.cleanup;
      }, [nextTickUtils]);

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
                toast.error({
                  title: 'Extraction Failed',
                  description: `Could not start citation extraction for ${referenceNumber}. Please try again.`,
                  duration: 5000,
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
              toast.error({
                title: 'API Error',
                description: `Error during citation extraction for ${referenceNumber}: ${err.message || 'Unknown error'}.`,
                duration: 5000,
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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-1">
                  <LoadingMinimal size="sm" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Requesting citation extraction...</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }

      if (hasJob) {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    'h-7 px-3 flex items-center gap-1.5',
                    'border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300',
                    'dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/20 dark:hover:border-green-700',
                    'font-medium transition-colors'
                  )}
                  onClick={handleViewCitations}
                >
                  <FiFileText className="h-3.5 w-3.5" />
                  <span className="text-xs">View Results</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View citation analysis results</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  'h-7 px-3 flex items-center gap-1.5',
                  'border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300',
                  'dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:hover:border-blue-700',
                  'font-medium transition-all duration-200 ease-in-out',
                  'hover:scale-[1.02]'
                )}
                onClick={handleExtractCitation}
                style={{
                  animation: 'pulse-glow 3s ease-in-out infinite',
                }}
              >
                <FiZap className="h-3.5 w-3.5" />
                <span className="text-xs">Analyze</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Analyze this reference for relevant citations</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
  );

ReferenceCardActions.displayName = 'ReferenceCardActions';
