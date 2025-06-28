import React from 'react';
import { Box, Skeleton, SkeletonText, VStack, HStack } from '@chakra-ui/react';

export const EditorSkeleton: React.FC = () => {
  return (
    <Box flex="1" p={4}>
      <VStack spacing={4} align="stretch">
        {/* Skeleton for Toolbar */}
        <HStack
          spacing={2}
          p={2}
          borderBottomWidth="1px"
          borderColor="gray.200"
        >
          <Skeleton height="20px" width="40px" />
          <Skeleton height="20px" width="40px" />
          <Skeleton height="20px" width="40px" />
          <Skeleton height="20px" width="60px" />
          <Skeleton height="20px" width="60px" />
        </HStack>
        {/* Skeleton for Text Area */}
        <Box flex="1" p={2}>
          <SkeletonText mt="4" noOfLines={15} spacing="4" skeletonHeight="3" />
        </Box>
      </VStack>
    </Box>
  );
};
