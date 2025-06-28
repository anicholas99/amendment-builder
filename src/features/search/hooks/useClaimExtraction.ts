import { useState, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { logger } from '@/lib/monitoring/logger';
import { normalizeClaims } from '@/utils/dataHelpers';

interface AnalyzedInvention {
  claims?: string[] | Record<string, string>;
}

interface UseClaimExtractionProps {
  analyzedInvention?: AnalyzedInvention | null;
}

/**
 * Custom hook to extract claim 1 text from analyzed invention data
 */
export function useClaimExtraction({
  analyzedInvention,
}: UseClaimExtractionProps) {
  const [claim1Text, setClaim1Text] = useState<string | undefined>(undefined);
  const toast = useToast();

  useEffect(() => {
    logger.debug(
      '[useClaimExtraction] Attempting to extract claim 1 text from analyzedInvention',
      { analyzedInvention }
    );

    if (analyzedInvention?.claims) {
      try {
        const normalized = normalizeClaims(analyzedInvention.claims);
        const claimText = normalized['1']; // Get text for claim "1"

        if (claimText) {
          setClaim1Text(claimText);
          logger.debug(
            '[useClaimExtraction] Successfully extracted claim 1 text from analyzedInvention'
          );
        } else {
          setClaim1Text(undefined); // Explicitly set to undefined if claim "1" not found
          logger.debug(
            '[useClaimExtraction] Claim "1" not found within analyzedInvention.claims'
          );
        }
      } catch (error) {
        logger.error(
          '[useClaimExtraction] Error normalizing or accessing claims from analyzedInvention',
          { error }
        );
        setClaim1Text(undefined);
        toast({
          title: 'Error Processing Claims',
          description: 'Could not process claim data from the project.',
          status: 'error',
          duration: 5000,
        });
      }
    } else {
      setClaim1Text(undefined); // Set to undefined if no claims exist
      logger.debug(
        '[useClaimExtraction] No claims found in analyzedInvention to extract claim 1 text from.'
      );
    }
  }, [analyzedInvention, toast]);

  return { claim1Text };
}
