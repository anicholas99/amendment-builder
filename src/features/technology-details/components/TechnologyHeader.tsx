import React from 'react';
import { Button, Icon, Tooltip } from '@chakra-ui/react';
import {
  FiUpload,
  FiDownload,
  FiCheckCircle,
  FiChevronRight,
} from 'react-icons/fi';
import { useRouter } from 'next/router';
import ViewHeader from '../../../components/common/ViewHeader';
import { NavigationButton } from '@/components/common/NavigationButton';

interface TechnologyHeaderProps {
  onImport?: () => void;
  onExport?: () => void;
  onCheckConsistency?: () => void;
}

/**
 * Header component for technology details view
 */
const TechnologyHeader: React.FC<TechnologyHeaderProps> = ({
  onImport,
  onExport,
  onCheckConsistency,
}) => {
  const router = useRouter();
  const { projectId, tenant } = router.query;

  // Removed handleGoToClaimRefinement - using NavigationButton instead

  return (
    <ViewHeader
      title="Technology Details"
      actions={
        <>
          {onImport && (
            <Button
              leftIcon={<Icon as={FiUpload} />}
              variant="solid"
              size="md"
              onClick={onImport}
            >
              Import
            </Button>
          )}
          {onExport && (
            <Button
              leftIcon={<Icon as={FiDownload} />}
              variant="outline"
              size="md"
              onClick={onExport}
            >
              Export
            </Button>
          )}
          {onCheckConsistency && (
            <Tooltip label="Check consistency across all sections">
              <Button
                leftIcon={<Icon as={FiCheckCircle} />}
                variant="solid"
                size="md"
                onClick={onCheckConsistency}
              >
                Check Consistency
              </Button>
            </Tooltip>
          )}
          {projectId && tenant && (
            <NavigationButton
              href={`/${tenant}/projects/${projectId}/claim-refinement`}
              viewType="claims"
              projectId={projectId as string}
              rightIcon={<Icon as={FiChevronRight} boxSize={3.5} />}
              variant="ghost"
              size="xs"
              style={{
                color: 'var(--chakra-colors-gray-400)',
                fontSize: '12px',
              }}
            >
              Claim Refinement
            </NavigationButton>
          )}
        </>
      }
    />
  );
};

export default TechnologyHeader;
