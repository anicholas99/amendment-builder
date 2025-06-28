import React from 'react';
import { Icon } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { FiChevronLeft } from 'react-icons/fi';
import ViewHeader from '../../../components/common/ViewHeader';
import { NavigationButton } from '@/components/common/NavigationButton';

interface PatentHeaderProps {
  // Keeping the interface minimal since we're not using any actions
}

/**
 * Header component for the Patent Application view
 */
const PatentHeader: React.FC<PatentHeaderProps> = () => {
  const router = useRouter();
  const { projectId, tenant } = router.query;

  return (
    <ViewHeader
      title="Patent Application"
      actions={
        projectId && tenant ? (
          <NavigationButton
            href={`/${tenant}/projects/${projectId}/claim-refinement`}
            viewType="claims"
            projectId={projectId as string}
            leftIcon={<Icon as={FiChevronLeft} boxSize={3.5} />}
            variant="ghost"
            size="xs"
            color="gray.400"
            fontSize="xs"
          >
            Claim Refinement
          </NavigationButton>
        ) : (
          <></>
        )
      }
    />
  );
};

export default PatentHeader;
