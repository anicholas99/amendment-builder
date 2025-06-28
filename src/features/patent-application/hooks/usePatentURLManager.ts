import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { logger } from '@/lib/monitoring/logger';
import { ApplicationVersionWithDocuments } from '@/types/versioning';

interface UsePatentURLManagerProps {
  currentVersion: ApplicationVersionWithDocuments | null | undefined;
  setCurrentVersion: (versionId: string) => Promise<void>;
  projectId: string | null;
  isLatestVersionSuccess: boolean;
  latestVersion: any;
}

export const usePatentURLManager = ({
  currentVersion,
  setCurrentVersion,
  projectId,
  isLatestVersionSuccess,
  latestVersion,
}: UsePatentURLManagerProps) => {
  const router = useRouter();

  // Add URL-based version persistence and auto-load latest version
  useEffect(() => {
    const urlVersionId = router.query.version as string;

    if (urlVersionId && urlVersionId !== currentVersion?.id) {
      logger.debug('Loading version from URL', { urlVersionId });
      setCurrentVersion(urlVersionId).catch(error => {
        logger.error('Failed to load version from URL', { error });
        router.replace(
          {
            pathname: router.pathname,
            query: { ...router.query, version: undefined },
          },
          undefined,
          { shallow: true }
        );
      });
    } else if (
      !urlVersionId &&
      !currentVersion &&
      projectId &&
      isLatestVersionSuccess
    ) {
      if (latestVersion?.id) {
        logger.info('Auto-loading latest version', {
          versionId: latestVersion.id,
          projectId,
          versionName: latestVersion.name,
          documentCount: latestVersion.documents?.length || 0,
        });
        setCurrentVersion(latestVersion.id);
      } else {
        logger.debug('No latest version found for project', { projectId });
      }
    }
  }, [
    router.query.version,
    projectId,
    currentVersion?.id,
    setCurrentVersion,
    latestVersion,
    isLatestVersionSuccess,
  ]);

  // Update URL when currentVersion changes
  useEffect(() => {
    if (currentVersion?.id && router.query.version !== currentVersion.id) {
      logger.debug('Updating URL with version', {
        versionId: currentVersion.id,
      });
      router.replace(
        {
          pathname: router.pathname,
          query: { ...router.query, version: currentVersion.id },
        },
        undefined,
        { shallow: true }
      );
    } else if (!currentVersion?.id && router.query.version) {
      logger.debug('Removing version from URL (no current version)');
      router.replace(
        {
          pathname: router.pathname,
          query: { ...router.query, version: undefined },
        },
        undefined,
        { shallow: true }
      );
    }
  }, [currentVersion?.id, router]);
};
