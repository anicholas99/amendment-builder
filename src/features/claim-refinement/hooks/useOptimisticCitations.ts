import { useState, useCallback } from 'react';
import { logger } from '@/utils/clientLogger';

/**
 * Hook to manage optimistic state for citation processing
 */
export function useOptimisticCitations() {
  const [optimisticallyProcessingRefs, setOptimisticallyProcessingRefs] =
    useState<Record<string, boolean>>({});

  const setOptimisticRef = useCallback(
    (referenceNumber: string, isProcessing: boolean) => {
      setOptimisticallyProcessingRefs(prev => {
        if (isProcessing) {
          return { ...prev, [referenceNumber]: true };
        } else {
          const updated = { ...prev };
          delete updated[referenceNumber];
          return updated;
        }
      });
    },
    []
  );

  const clearOptimisticRefs = useCallback((referenceNumbers: string[]) => {
    logger.debug(
      '[useOptimisticCitations] Clearing optimistic refs for completed jobs:',
      {
        referenceNumbers,
      }
    );

    setOptimisticallyProcessingRefs(prev => {
      const updated = { ...prev };

      // Clear each reference number and all possible variants
      referenceNumbers.forEach(refNum => {
        // Try multiple formats to ensure we clear it
        const variants = [
          refNum,
          refNum.toUpperCase(),
          refNum.toLowerCase(),
          refNum.replace(/-/g, ''),
          refNum.replace(/-/g, '').toUpperCase(),
          refNum.replace(/-/g, '').toLowerCase(),
        ];

        variants.forEach(variant => {
          if (updated[variant]) {
            logger.debug(
              `[useOptimisticCitations] Clearing optimistic ref variant: ${variant}`
            );
            delete updated[variant];
          }
        });
      });

      logger.debug(
        '[useOptimisticCitations] Updated optimistic refs after clearing:',
        {
          remainingKeys: Object.keys(updated),
          remainingCount: Object.keys(updated).length,
        }
      );

      return updated;
    });
  }, []);

  return {
    optimisticallyProcessingRefs,
    setOptimisticRef,
    clearOptimisticRefs,
  };
}
