import { useState, useEffect } from 'react';
import { logger } from '@/utils/clientLogger';
import { ProcessedSearchHistoryEntry as SearchHistoryEntry } from '@/types/domain/searchHistory';

interface ClaimSetVersion {
  id: string;
  name: string;
  createdAt: string;
}

interface CurrentVersion {
  id?: string;
  name?: string;
}

interface UseVersionInfoProps {
  activeSearchEntry: SearchHistoryEntry | null;
  claimSetVersions?: ClaimSetVersion[];
  currentVersion?: CurrentVersion | null;
}

interface VersionInfo {
  name: string;
  id: string | null;
  isNewerVersionAvailable: boolean;
  newerVersionName: string | null;
  newerVersionId: string | null;
}

/**
 * Custom hook to manage version information display
 */
export function useVersionInfo({
  activeSearchEntry,
  claimSetVersions,
  currentVersion,
}: UseVersionInfoProps) {
  const [activeVersionInfo, setActiveVersionInfo] = useState<VersionInfo>({
    name: 'Current Version',
    id: null,
    isNewerVersionAvailable: false,
    newerVersionName: null,
    newerVersionId: null,
  });

  useEffect(() => {
    if (!activeSearchEntry) return;

    // Since claimSetVersionId was removed from the database,
    // we'll default to showing the current version
    const currentVersionId = currentVersion?.id;
    const currentVersionName = currentVersion?.name || 'Current Version';

    setActiveVersionInfo({
      name: currentVersionName,
      id: currentVersionId || null,
      isNewerVersionAvailable: false,
      newerVersionName: null,
      newerVersionId: null,
    });

    logger.debug(
      `[useVersionInfo] Updated version info: Using current version "${currentVersionName}"`
    );
  }, [activeSearchEntry, currentVersion]);

  return { activeVersionInfo };
}
