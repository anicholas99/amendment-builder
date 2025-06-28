import { useMemo } from 'react';
import { GroupedCitationMatch } from '../types/citationResultsTable';
import { FALLBACK_VERSION_ID } from '../constants/citationConstants';

// Local type definition since ClaimSetVersion was removed from the codebase
interface ClaimSetVersion {
  id: string;
  name: string;
  createdAt: string;
}

/**
 * Hook for managing citation claim set versions
 *
 * @param claimSetVersions - Provided versions from parent
 * @param groupedResults - Citation results that may contain version IDs
 * @param latestClaimSetVersionId - The ID of the latest version
 * @returns Effective versions and sorted versions
 */
export function useCitationVersions(
  claimSetVersions: ClaimSetVersion[] | undefined,
  groupedResults: GroupedCitationMatch[],
  latestClaimSetVersionId?: string
) {
  // Create effective versions if none provided
  const effectiveClaimSetVersions = useMemo(() => {
    if (claimSetVersions && claimSetVersions.length > 0) {
      return claimSetVersions;
    }

    // Extract version IDs from citation matches
    const extractedVersionIds = new Set<string>();
    groupedResults.forEach(group => {
      group.matches.forEach(match => {
        // ClaimSetVersionId has been removed from the codebase
        // This functionality is no longer supported
      });
    });

    if (extractedVersionIds.size > 0) {
      return Array.from(extractedVersionIds).map(id => ({
        id,
        name: `Version ${id.substring(0, 8)}...`,
        createdAt: new Date().toISOString(),
      }));
    }

    // Use latest version ID as fallback
    if (latestClaimSetVersionId) {
      return [
        {
          id: latestClaimSetVersionId,
          name: 'Latest Version',
          createdAt: new Date().toISOString(),
        },
      ];
    }

    // Last resort: create a dummy version for development
    return [
      {
        id: FALLBACK_VERSION_ID,
        name: 'Version 1',
        createdAt: new Date().toISOString(),
      },
    ];
  }, [claimSetVersions, groupedResults, latestClaimSetVersionId]);

  // Sort versions by creation date (newest first)
  const sortedVersions = useMemo(() => {
    if (!effectiveClaimSetVersions || effectiveClaimSetVersions.length === 0) {
      return [];
    }
    return [...effectiveClaimSetVersions].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [effectiveClaimSetVersions]);

  // Check if there's a newer version than the currently selected one
  const hasNewerVersion = (selectedClaimSetVersionId?: string) => {
    if (!selectedClaimSetVersionId || !latestClaimSetVersionId) return false;
    return selectedClaimSetVersionId !== latestClaimSetVersionId;
  };

  // Check if the selected version is the first/oldest version
  const isFirstVersion = (selectedClaimSetVersionId?: string) => {
    if (!selectedClaimSetVersionId || sortedVersions.length === 0) return false;
    const oldestVersion = sortedVersions[sortedVersions.length - 1];
    return oldestVersion
      ? oldestVersion.id === selectedClaimSetVersionId
      : false;
  };

  return {
    effectiveClaimSetVersions,
    sortedVersions,
    hasNewerVersion,
    isFirstVersion,
  };
}
