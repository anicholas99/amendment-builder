import React from 'react';
import { logger } from '@/lib/monitoring/logger';
import {
  Box,
  Text,
  Flex,
  Button,
  Icon,
  VStack,
  HStack,
  Center,
} from '@chakra-ui/react';
import { FiEdit, FiFileText } from 'react-icons/fi';
import { TechSectionProps } from '../types';
import { hasSectionData } from '../../../../../utils/sectionUtils';
import { useRouter } from 'next/router';
import { useColorModeValue } from '@/hooks/useColorModeValue';
import { NavigationButton } from '@/components/common/NavigationButton';

/**
 * Component for displaying the invention's claims with navigation to claim refinement
 */
export const TechClaimsSection: React.FC<TechSectionProps> = React.memo(
  ({ analyzedInvention, getFontSize }) => {
    const router = useRouter();
    const iconColor = useColorModeValue('gray.600', 'gray.400');
    const titleColor = useColorModeValue('gray.700', 'gray.300');
    const claimBg = useColorModeValue('gray.50', 'gray.700');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const hoverBorderColor = useColorModeValue('blue.300', 'blue.500');
    const hoverBg = useColorModeValue('blue.50', 'gray.600');
    const claimNumberColor = useColorModeValue('blue.600', 'blue.400');
    const textMuted = useColorModeValue('gray.500', 'gray.400');
    const buttonHoverBg = useColorModeValue('blue.100', 'blue.800');

    /**
     * Robustly resolve projectId & tenant.
     * router.query can briefly be undefined on first render – e.g. when navigating
     * via shallow routing or during fast refresh – causing our button to render
     * in a disabled state even though the values are available a few ms later.
     *
     * We therefore:
     *   1. Try to grab them from `router.query`.
     *   2. Fallback to parsing the current `asPath` when they are missing.
     */
    const queryProjectId = router.query.projectId as string | undefined;
    const queryTenant = router.query.tenant as string | undefined;

    const projectId =
      queryProjectId ?? router.asPath.match(/projects\/([^/]+)/)?.[1] ?? '';
    const tenant = queryTenant ?? router.asPath.match(/^\/([^/]+)/)?.[1] ?? '';

    /**
     * Build the navigation target.
     * When both `tenant` & `projectId` are present we construct the canonical
     * route directly. Otherwise, we fall back to a simple string replacement on
     * the current pathname so the user can still navigate even during the brief
     * window before dynamic route params are populated.
     */
    const claimRefinementHref = React.useMemo(() => {
      if (tenant && projectId) {
        return `/${tenant}/projects/${projectId}/claim-refinement`;
      }
      // Fallback: replace trailing documentType segment (e.g. "technology")
      // with "claim-refinement".
      return router.asPath.replace(/\/[^/]+$/, '/claim-refinement');
    }, [tenant, projectId, router.asPath]);

    if (!hasSectionData(analyzedInvention?.claims)) {
      return null;
    }

    return (
      <Box p={3}>
        {/* Header */}
        <Flex align="center" justify="space-between" mb={4}>
          <HStack spacing={3}>
            <Icon as={FiFileText} boxSize={5} color={iconColor} />
            <Text
              fontSize={getFontSize('lg')}
              fontWeight="bold"
              color={titleColor}
            >
              Claims
            </Text>
          </HStack>
          <NavigationButton
            href={claimRefinementHref}
            viewType="claims"
            projectId={projectId || undefined}
            size="sm"
            variant="outline"
            leftIcon={<Icon as={FiEdit} />}
            aria-label="Navigate to claim refinement view"
            _hover={{ bg: buttonHoverBg }}
          >
            Refine Claims
          </NavigationButton>
        </Flex>

        {/* Content */}
        {hasSectionData(analyzedInvention?.claims) ? (
          <VStack align="stretch" spacing={3}>
            {Object.entries(analyzedInvention?.claims || {}).map(
              ([number, claim]) => (
                <Box
                  key={number}
                  p={4}
                  bg={claimBg}
                  borderRadius="md"
                  border="1px solid"
                  borderColor={borderColor}
                  _hover={{ borderColor: hoverBorderColor, bg: hoverBg }}
                  transition="border-color 0.15s ease-out, background-color 0.15s ease-out"
                >
                  <Text fontSize={getFontSize('md')} lineHeight={1.6}>
                    <Text as="span" fontWeight="bold" color={claimNumberColor}>
                      {number}.
                    </Text>{' '}
                    {claim}
                  </Text>
                </Box>
              )
            )}
          </VStack>
        ) : (
          <Center py={8}>
            <Text color={textMuted} fontSize="md">
              No claims have been generated yet
            </Text>
          </Center>
        )}
      </Box>
    );
  }
);

TechClaimsSection.displayName = 'TechClaimsSection';

export default TechClaimsSection;
