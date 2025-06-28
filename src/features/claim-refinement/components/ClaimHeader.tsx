import React, { useState } from 'react';
import { Button, Icon, Flex } from '@chakra-ui/react';
import { FiSettings, FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import { useRouter } from 'next/router';
import ViewHeader from '../../../components/common/ViewHeader';
import { logger } from '@/lib/monitoring/logger';
import { NavigationButton } from '@/components/common/NavigationButton';

interface ClaimHeaderProps {
  onOpenSettings?: () => void;
}

/**
 * Header component for the Claim Refinement view
 * Contains the title and main action buttons
 */
const ClaimHeader: React.FC<ClaimHeaderProps> = ({ onOpenSettings }) => {
  const router = useRouter();
  const { projectId, tenant } = router.query;
  const [isNavigating, setIsNavigating] = useState(false);

  // Removed handleGoToPatentApplication - using NavigationButton instead

  return (
    <ViewHeader
      title="Claim Refinement"
      actions={
        <>
          {/* Settings button */}
          {onOpenSettings && (
            <Button
              leftIcon={<Icon as={FiSettings} />}
              onClick={onOpenSettings}
              variant="secondary"
              size="md"
            >
              Settings
            </Button>
          )}
          {projectId && tenant && (
            <Flex gap={2} align="center">
              {/* Back to Technology Details */}
              <NavigationButton
                href={`/${tenant}/projects/${projectId}/technology`}
                viewType="technology"
                projectId={projectId as string}
                leftIcon={<Icon as={FiChevronLeft} boxSize={3.5} />}
                variant="ghost"
                size="xs"
                style={{
                  color: 'var(--chakra-colors-gray-400)',
                  fontSize: '12px',
                }}
              >
                Technology Details
              </NavigationButton>

              {/* Forward to Patent Application */}
              <NavigationButton
                href={`/${tenant}/projects/${projectId}/patent`}
                viewType="patent"
                projectId={projectId as string}
                rightIcon={<Icon as={FiChevronRight} boxSize={3.5} />}
                variant="ghost"
                size="xs"
                style={{
                  color: 'var(--chakra-colors-gray-400)',
                  fontSize: '12px',
                }}
              >
                Patent Application
              </NavigationButton>
            </Flex>
          )}
        </>
      }
    />
  );
};

export default ClaimHeader;
