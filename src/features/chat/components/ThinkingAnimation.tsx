import React, { memo } from 'react';
import { HStack, Box, Text } from '@chakra-ui/react';
import { thinkingDots } from '../styles/animations';

interface ThinkingAnimationProps {
  color?: string;
  message?: string;
}

export const ThinkingAnimation: React.FC<ThinkingAnimationProps> = memo(
  ({ color = 'blue.400', message = 'Thinking' }) => (
    <HStack spacing={1} align="center">
      <Text fontSize="sm" color="gray.600" mr={2}>
        {message}
      </Text>
      <Box
        w="4px"
        h="4px"
        borderRadius="full"
        bg={color}
        animation={`${thinkingDots} 1.4s ease-in-out infinite`}
      />
      <Box
        w="4px"
        h="4px"
        borderRadius="full"
        bg={color}
        animation={`${thinkingDots} 1.4s ease-in-out infinite 0.2s`}
      />
      <Box
        w="4px"
        h="4px"
        borderRadius="full"
        bg={color}
        animation={`${thinkingDots} 1.4s ease-in-out infinite 0.4s`}
      />
    </HStack>
  )
);

ThinkingAnimation.displayName = 'ThinkingAnimation';
