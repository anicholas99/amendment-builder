import { useMemo, useEffect } from 'react';
import { useProject } from '@/hooks/api/useProjects';
import { useClaimsQuery } from '@/hooks/api/useClaims';
import { logger } from '@/utils/clientLogger';

interface UseClaimsDataProps {
  projectId: string;
}

export interface UseClaimsDataResult {
  claim1Text: string;
  isLoadingClaims: boolean;
  claimsError: unknown;
}

// Type for a claim object
interface Claim {
  id: string;
  number: number;
  text: string;
  inventionId: string | null;
  createdAt: string;
  updatedAt: string;
}

// Type for claims data response
type ClaimsData = Claim[] | { claims: Claim[] } | undefined;

export function useClaimsData({
  projectId,
}: UseClaimsDataProps): UseClaimsDataResult {
  const { data: projectData } = useProject(projectId);
  const {
    data: claimsData,
    isLoading: isLoadingClaims,
    error: claimsError,
  } = useClaimsQuery(projectId);

  // Log the claims query state only on significant changes
  useEffect(() => {
    if (isLoadingClaims || claimsError) {
      logger.debug('[ClaimsData] Claims query state', {
        projectId,
        isLoadingClaims,
        hasClaimsData: !!claimsData,
        claimsError,
      });
    }
  }, [projectId, isLoadingClaims, claimsData, claimsError]);

  const claim1Text = useMemo(() => {
    const typedClaimsData = claimsData as ClaimsData;

    // Handle direct array format (newer API response)
    if (Array.isArray(typedClaimsData)) {
      const claim1 = typedClaimsData.find(claim => claim.number === 1);

      // Only log if claim 1 is missing
      if (!claim1?.text && typedClaimsData.length > 0) {
        logger.warn('[ClaimsData] Claim 1 not found in array', {
          allClaimNumbers: typedClaimsData.map(c => c.number),
        });
      }

      if (claim1?.text) {
        return claim1.text;
      }
    }

    // Handle wrapped object format
    if (
      typedClaimsData &&
      typeof typedClaimsData === 'object' &&
      'claims' in typedClaimsData
    ) {
      const claims = typedClaimsData.claims;

      if (Array.isArray(claims)) {
        const claim1 = claims.find(claim => claim.number === 1);

        // Only log if claim 1 is missing
        if (!claim1?.text && claims.length > 0) {
          logger.warn('[ClaimsData] Claim 1 not found in wrapped object', {
            allClaimNumbers: claims.map(c => c.number),
          });
        }

        if (claim1?.text) {
          return claim1.text;
        }
      }
    }

    // Fallback to the old structure if it still exists
    if (
      projectData?.invention?.claims &&
      typeof projectData.invention.claims === 'object' &&
      !Array.isArray(projectData.invention.claims) &&
      typeof (projectData.invention.claims as Record<string, unknown>)['1'] ===
        'string'
    ) {
      return (projectData.invention.claims as Record<string, string>)['1'];
    }

    // Only log warning if we expected to find claims
    if (typedClaimsData || projectData?.invention?.claims) {
      logger.warn('[ClaimsData] No claim 1 found in any structure');
    }
    return '';
  }, [projectData, claimsData]);

  return {
    claim1Text,
    isLoadingClaims,
    claimsError,
  };
}
