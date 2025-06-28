import { useMemo, useEffect } from 'react';
import { useProject } from '@/hooks/api/useProjects';
import { useClaimsQuery } from '@/hooks/api/useClaims';
import { logger } from '@/lib/monitoring/logger';

interface UseClaimsDataProps {
  projectId: string;
}

export function useClaimsData({ projectId }: UseClaimsDataProps) {
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
    // Handle direct array format (newer API response)
    if (Array.isArray(claimsData)) {
      const claim1 = claimsData.find((claim: any) => claim.number === 1);

      // Only log if claim 1 is missing
      if (!claim1?.text && claimsData.length > 0) {
        logger.warn('[ClaimsData] Claim 1 not found in array', {
          allClaimNumbers: claimsData.map((c: any) => c.number),
        });
      }

      if (claim1?.text) {
        return claim1.text;
      }
    }

    // Handle wrapped object format
    if (
      claimsData &&
      typeof claimsData === 'object' &&
      'claims' in claimsData
    ) {
      const claims = (claimsData as any).claims;

      if (Array.isArray(claims)) {
        const claim1 = claims.find((claim: any) => claim.number === 1);

        // Only log if claim 1 is missing
        if (!claim1?.text && claims.length > 0) {
          logger.warn('[ClaimsData] Claim 1 not found in wrapped object', {
            allClaimNumbers: claims.map((c: any) => c.number),
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
      typeof projectData.invention.claims['1'] === 'string'
    ) {
      return projectData.invention.claims['1'];
    }

    // Only log warning if we expected to find claims
    if (claimsData || projectData?.invention?.claims) {
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
