import React from 'react';
import {
  Box,
  Button,
  Icon,
  Text,
  VStack,
  HStack,
  Spinner,
} from '@chakra-ui/react';
import { FiFileText, FiRefreshCw } from 'react-icons/fi';
import { useColorModeValue } from '@chakra-ui/react';

interface PatentGenerationPlaceholderProps {
  onGenerate: () => void;
  isGenerating: boolean;
  generationProgress?: number;
  extras?: React.ReactNode;
}

const PatentGenerationPlaceholder: React.FC<
  PatentGenerationPlaceholderProps
> = ({ onGenerate, isGenerating, generationProgress = 0, extras }) => {
  // Move all color values outside JSX
  const iconColor = useColorModeValue('gray.400', 'gray.500');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const bgSecondary = useColorModeValue('bg.secondary', 'bg.secondary');
  const borderPrimary = useColorModeValue('border.primary', 'border.primary');
  const spinnerColor = useColorModeValue('white', 'white');

  // Helper function to get progress text based on percentage
  const getProgressText = (progress: number) => {
    if (progress < 10) return 'Initializing generation...';
    if (progress < 25) return 'Analyzing technology details...';
    if (progress < 40) return 'Processing claim elements...';
    if (progress < 55) return 'Generating detailed description...';
    if (progress < 70) return 'Creating patent drawings references...';
    if (progress < 85) return 'Formatting patent sections...';
    if (progress < 95) return 'Finalizing application...';
    return 'Almost complete...';
  };

  return (
    <Box
      width="100%"
      height="100%"
      display="flex"
      flexDirection="column"
      justifyContent="flex-start"
      alignItems="center"
      p={6}
      pt={8}
    >
      <VStack spacing={8} align="center" w="100%" maxW="700px">
        <VStack spacing={4} align="center">
          <Icon as={FiFileText} size="48px" color={iconColor} />
          <Text fontSize="2xl" fontWeight="medium" textAlign="center">
            Generate Your Patent Application
          </Text>
          <Text color={textColor} textAlign="center">
            Create a complete patent application based on your technology
            details and claims.
          </Text>
        </VStack>

        {/* Prior Art Selection Section */}
        {extras && (
          <Box
            width="100%"
            p={6}
            bg={bgSecondary}
            borderRadius="lg"
            border="1px solid"
            borderColor={borderPrimary}
          >
            <VStack spacing={4} align="stretch">
              <Box>
                <Text fontSize="lg" fontWeight="semibold" mb={2}>
                  Select Prior Art References
                </Text>
                <Text fontSize="sm" color={textColor} lineHeight="1.6">
                  Including prior art references helps create a stronger patent
                  application by:
                </Text>
                <Box
                  as="ul"
                  mt={2}
                  ml={5}
                  fontSize="sm"
                  color={textColor}
                  lineHeight="1.8"
                >
                  <li>
                    Demonstrating novelty by clearly distinguishing your
                    invention from existing technologies
                  </li>
                  <li>
                    Providing context for your technical improvements and
                    innovations
                  </li>
                  <li>
                    Strengthening claim language to avoid potential conflicts
                  </li>
                  <li>
                    Showing awareness of the technical field and related
                    solutions
                  </li>
                </Box>
              </Box>
              {extras}
            </VStack>
          </Box>
        )}

        <Button
          colorScheme="blue"
          size="lg"
          leftIcon={isGenerating ? undefined : <Icon as={FiFileText} />}
          onClick={onGenerate}
          isLoading={isGenerating}
          isDisabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Box
                position="absolute"
                top={0}
                left={0}
                bottom={0}
                width={`${generationProgress}%`}
                bg="blue.300"
                opacity={0.3}
                transition="width 0.5s ease-out"
                className="z-0"
              />
              <Box className="relative z-1 w-full">
                <HStack spacing={2} justify="center" width="100%">
                  <Spinner size="sm" color={spinnerColor} />
                  <Text fontWeight="medium">
                    {getProgressText(generationProgress)}
                  </Text>
                  <Text fontWeight="medium" opacity={0.8}>
                    {Math.round(generationProgress)}%
                  </Text>
                </HStack>
              </Box>
            </>
          ) : (
            <Text className="relative z-1">Generate Patent Application</Text>
          )}
        </Button>

        {/* Optional: Show a separate progress bar below the button */}
        {isGenerating && (
          <Box width="100%" maxWidth="400px" mt={4}>
            <Box
              width="100%"
              height="4px"
              bg={bgSecondary}
              borderRadius="full"
              overflow="hidden"
            >
              <Box
                width={`${generationProgress}%`}
                height="100%"
                bg="blue.500"
                transition="width 0.5s ease-out"
              />
            </Box>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default PatentGenerationPlaceholder;
