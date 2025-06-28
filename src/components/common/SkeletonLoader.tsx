import React from 'react';
import {
  Box,
  Flex,
  Stack,
  Skeleton,
  SkeletonText,
  VStack,
  HStack,
  useColorModeValue,
  Spacer,
} from '@chakra-ui/react';

interface SkeletonLoaderProps {
  type?: 'document' | 'project' | 'sidebar' | 'projects-dashboard';
  count?: number;
}

/**
 * A component that displays skeleton placeholders during loading states
 * to improve perceived performance and provide visual feedback
 */
const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = 'document',
  count = 1,
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Render a skeleton for a document view
  if (type === 'document') {
    return (
      <Box
        w="100%"
        minH="400px"
        bg={bgColor}
        p={{ base: 4, md: 6 }}
        borderRadius="md"
        borderWidth="1px"
        borderColor={borderColor}
        boxShadow="sm"
      >
        <VStack spacing={{ base: 4, md: 6 }} align="stretch">
          {/* Document Header */}
          <HStack spacing={{ base: 3, md: 4 }}>
            <Skeleton
              height={{ base: '32px', md: '40px' }}
              width={{ base: '32px', md: '40px' }}
              borderRadius="md"
            />
            <Skeleton
              height={{ base: '32px', md: '40px' }}
              width={{ base: '50%', md: '60%' }}
            />
          </HStack>

          {/* Document Content Sections */}
          <Skeleton height="12px" width={{ base: '40%', md: '30%' }} />
          <SkeletonText
            mt="4"
            noOfLines={{ base: 4, md: 6 }}
            spacing="4"
            skeletonHeight="4"
          />

          <>
            <Skeleton height="12px" width={{ base: '50%', md: '40%' }} />
            <SkeletonText
              mt="4"
              noOfLines={{ base: 6, md: 8 }}
              spacing="4"
              skeletonHeight="4"
            />

            <Box mt={4}>
              <Skeleton
                height="12px"
                width={{ base: '35%', md: '25%' }}
                mb={4}
              />
              <HStack spacing={{ base: 3, md: 4 }} overflowX="auto" pb={2}>
                <Skeleton
                  height={{ base: '80px', md: '100px' }}
                  width={{ base: '80px', md: '100px' }}
                  borderRadius="md"
                  flexShrink={0}
                />
                <Skeleton
                  height={{ base: '80px', md: '100px' }}
                  width={{ base: '80px', md: '100px' }}
                  borderRadius="md"
                  flexShrink={0}
                />
                <Skeleton
                  height={{ base: '80px', md: '100px' }}
                  width={{ base: '80px', md: '100px' }}
                  borderRadius="md"
                  flexShrink={0}
                />
              </HStack>
            </Box>
          </>
        </VStack>
      </Box>
    );
  }

  // Render a skeleton for the projects dashboard
  if (type === 'projects-dashboard') {
    return (
      <VStack spacing={6} align="stretch" w="100%">
        {/* Dashboard Header Skeleton */}
        <Flex justify="space-between" align="center" mb={4}>
          <VStack align="start" spacing={2}>
            <Skeleton height="32px" width="200px" />
            <Skeleton height="16px" width="120px" />
          </VStack>
          <Skeleton height="40px" width="140px" borderRadius="md" />
        </Flex>

        {/* Search and Filter Bar Skeleton */}
        <Box
          p={4}
          bg={bgColor}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <Flex gap={4} align="center" wrap="wrap">
            <Skeleton height="40px" width="300px" borderRadius="md" />
            <Skeleton height="40px" width="120px" borderRadius="md" />
            <Skeleton height="40px" width="120px" borderRadius="md" />
            <Spacer />
            <Skeleton height="16px" width="80px" />
          </Flex>
        </Box>

        {/* Project Cards Skeleton */}
        <VStack spacing={4} align="stretch">
          {Array.from({ length: count }).map((_, index) => (
            <Box
              key={index}
              p={5}
              borderWidth="1px"
              borderRadius="lg"
              borderColor={borderColor}
              bg={bgColor}
              boxShadow="md"
            >
              <VStack spacing={4} align="stretch">
                {/* Project Header */}
                <Flex alignItems="center">
                  <Skeleton height="24px" width="250px" />
                  <Spacer />
                  <Skeleton height="20px" width="60px" borderRadius="full" />
                </Flex>

                {/* Date Information */}
                <HStack spacing={6}>
                  <HStack spacing={2}>
                    <Skeleton height="16px" width="16px" />
                    <Skeleton height="16px" width="120px" />
                  </HStack>
                  <HStack spacing={2}>
                    <Skeleton height="16px" width="16px" />
                    <Skeleton height="16px" width="100px" />
                  </HStack>
                </HStack>

                {/* Status Tags */}
                <HStack spacing={2}>
                  <Skeleton height="24px" width="120px" borderRadius="full" />
                  <Skeleton height="24px" width="80px" borderRadius="full" />
                  <Skeleton height="24px" width="70px" borderRadius="full" />
                </HStack>

                <Spacer />

                {/* Action Buttons */}
                <Flex justify="flex-end">
                  <HStack spacing={3}>
                    <Skeleton height="32px" width="80px" borderRadius="md" />
                    <Skeleton height="32px" width="70px" borderRadius="md" />
                    <Skeleton height="32px" width="80px" borderRadius="md" />
                  </HStack>
                </Flex>
              </VStack>
            </Box>
          ))}
        </VStack>
      </VStack>
    );
  }

  // Render a skeleton for a project selection (legacy - keeping for compatibility)
  if (type === 'project') {
    return (
      <VStack spacing={4} align="stretch" w="100%">
        {Array.from({ length: count }).map((_, index) => (
          <Box
            key={index}
            borderWidth="1px"
            borderRadius="md"
            borderColor={borderColor}
            p={4}
            bg={bgColor}
          >
            <Flex justify="space-between" align="center">
              <HStack spacing={3}>
                <Skeleton height="24px" width="24px" borderRadius="md" />
                <Skeleton height="20px" width="120px" />
              </HStack>
              <Skeleton height="24px" width="60px" />
            </Flex>
          </Box>
        ))}
      </VStack>
    );
  }

  // Render a skeleton for a sidebar
  if (type === 'sidebar') {
    return (
      <VStack spacing={4} align="stretch" w="100%" p={{ base: 2, md: 3 }}>
        <Skeleton
          height={{ base: '32px', md: '40px' }}
          width="100%"
          borderRadius="md"
          mb={2}
        />

        <Box pt={2}>
          <Skeleton height={{ base: '16px', md: '20px' }} width="80%" mb={3} />
          <VStack spacing={2} align="stretch" pl={{ base: 2, md: 3 }}>
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                key={index}
                height={{ base: '14px', md: '16px' }}
                width={`${90 - index * 10}%`}
              />
            ))}
          </VStack>
        </Box>

        <Box pt={2}>
          <Skeleton height={{ base: '16px', md: '20px' }} width="70%" mb={3} />
          <VStack spacing={2} align="stretch" pl={{ base: 2, md: 3 }}>
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton
                key={index}
                height={{ base: '14px', md: '16px' }}
                width={`${85 - index * 10}%`}
              />
            ))}
          </VStack>
        </Box>
      </VStack>
    );
  }

  // Default fallback
  return <SkeletonText mt="4" noOfLines={8} spacing="4" skeletonHeight="4" />;
};

export default SkeletonLoader;
