import React, { lazy, Suspense } from 'react';
import {
  Box,
  Center,
  Spinner,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';

// Lazy load the component that includes react-dnd
const ClaimRefinementViewClean = lazy(
  () => import('./ClaimRefinementViewClean')
);

interface ClaimRefinementViewCleanProps {
  analyzedInvention?: { id: string; title?: string; description?: string; background?: Record<string, unknown>; technicalImplementation?: Record<string, unknown> } | null;
  setAnalyzedInvention?: (invention: { id: string; title?: string; description?: string; background?: Record<string, unknown>; technicalImplementation?: Record<string, unknown> } | null) => void;
}

const LoadingFallback = () => {
  const spinnerColor = useColorModeValue('blue.500', 'blue.300');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Center h="100vh" w="100%">
      <Box textAlign="center">
        <Spinner size="xl" color={spinnerColor} thickness="4px" />
        <Text mt={4} color={textColor}>
          Loading claim refinement view...
        </Text>
      </Box>
    </Center>
  );
};

/**
 * Lazy-loaded wrapper for ClaimRefinementViewClean to improve initial page load performance
 */
const ClaimRefinementViewCleanLazy: React.FC<
  ClaimRefinementViewCleanProps
> = props => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ClaimRefinementViewClean {...props} />
    </Suspense>
  );
};

export default ClaimRefinementViewCleanLazy;
