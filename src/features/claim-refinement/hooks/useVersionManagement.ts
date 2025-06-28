import React, { useState } from 'react';
import { ClaimVersion } from '../../../types/claimTypes';
import { useToast } from '@chakra-ui/react';
import { InventionData } from '../../../types';

/**
 * Custom hook for managing claim versions
 */
export const useVersionManagement = (
  analyzedInvention: InventionData | null,
  setAnalyzedInvention: React.Dispatch<
    React.SetStateAction<InventionData | null>
  >,
  setIsVersionHistoryModalOpen: (value: boolean) => void
) => {
  const [claimVersions, setClaimVersions] = useState<ClaimVersion[]>([]);
  const toast = useToast();

  /**
   * Save a version of the current claims
   * @param description Description of the version
   */
  const saveClaimVersion = (description: string) => {
    if (!analyzedInvention?.claims) return;

    // Normalize claims to object format
    let normalizedClaims: Record<string, string>;
    if (Array.isArray(analyzedInvention.claims)) {
      normalizedClaims = analyzedInvention.claims.reduce(
        (acc, claim, index) => {
          acc[String(index + 1)] = claim;
          return acc;
        },
        {} as Record<string, string>
      );
    } else {
      normalizedClaims = { ...analyzedInvention.claims };
    }

    const newVersion: ClaimVersion = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      timestamp: Date.now(),
      claims: normalizedClaims,
      description,
    };

    setClaimVersions(prev => [newVersion, ...prev]);

    toast({
      title: 'Version saved',
      description: description,
      status: 'info',
      duration: 2000,
      isClosable: true,
    });

    setIsVersionHistoryModalOpen(false);
  };

  /**
   * Revert to a previous version of the claims
   * @param version The version to revert to
   */
  const revertToClaims = (version: ClaimVersion) => {
    if (!setAnalyzedInvention) return;

    setAnalyzedInvention((prev: InventionData | null) => {
      if (!prev) return null;

      return {
        ...prev,
        claims: { ...version.claims },
      };
    });

    toast({
      title: 'Reverted to previous version',
      description: version.description,
      status: 'info',
      duration: 2000,
      isClosable: true,
    });

    setIsVersionHistoryModalOpen(false);
  };

  return {
    claimVersions,
    setClaimVersions,
    saveClaimVersion,
    revertToClaims,
  };
};

export default useVersionManagement;
