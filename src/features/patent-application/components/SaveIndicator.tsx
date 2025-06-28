import React, { useState, useEffect } from 'react';
import { Box, Text, Fade, HStack } from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';
import { keyframes } from '@emotion/react';

interface SaveIndicatorProps {
  isSaving: boolean;
  hasUnsavedChanges: boolean;
}

const pulse = keyframes`
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
`;

export const SaveIndicator: React.FC<SaveIndicatorProps> = ({
  isSaving,
  hasUnsavedChanges,
}) => {
  const [showSaved, setShowSaved] = useState(false);
  const [prevIsSaving, setPrevIsSaving] = useState(false);

  // Show "Saved" message briefly after save completes
  useEffect(() => {
    if (prevIsSaving && !isSaving && !hasUnsavedChanges) {
      setShowSaved(true);
      const timer = setTimeout(() => setShowSaved(false), 2000);
      return () => clearTimeout(timer);
    }
    setPrevIsSaving(isSaving);
  }, [isSaving, hasUnsavedChanges, prevIsSaving]);

  // Don't show anything if idle
  if (!isSaving && !hasUnsavedChanges && !showSaved) {
    return null;
  }

  return (
    <Box position="fixed" top={4} right={4} zIndex={1000} pointerEvents="none">
      <Fade in={isSaving || hasUnsavedChanges || showSaved}>
        <HStack
          spacing={2}
          bg="rgba(255, 255, 255, 0.95)"
          _dark={{ bg: 'rgba(26, 32, 44, 0.95)' }}
          px={3}
          py={1.5}
          borderRadius="full"
          boxShadow="sm"
        >
          {isSaving ? (
            <>
              <Box
                w={2}
                h={2}
                borderRadius="full"
                bg="blue.500"
                animation={`${pulse} 1.5s ease-in-out infinite`}
              />
              <Text
                fontSize="sm"
                color="gray.600"
                _dark={{ color: 'gray.400' }}
              >
                Saving...
              </Text>
            </>
          ) : showSaved ? (
            <>
              <CheckIcon color="green.500" boxSize={3} />
              <Text
                fontSize="sm"
                color="green.600"
                _dark={{ color: 'green.400' }}
              >
                Saved
              </Text>
            </>
          ) : hasUnsavedChanges ? (
            <>
              <Box w={2} h={2} borderRadius="full" bg="yellow.500" />
              <Text
                fontSize="sm"
                color="gray.600"
                _dark={{ color: 'gray.400' }}
              >
                Unsaved
              </Text>
            </>
          ) : null}
        </HStack>
      </Fade>
    </Box>
  );
};
