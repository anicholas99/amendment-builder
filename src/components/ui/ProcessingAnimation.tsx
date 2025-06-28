import React from 'react';
import {
  Box,
  Flex,
  Text,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  useTheme,
  CircularProgress,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { FiCpu, FiSearch, FiFileText, FiCheckCircle } from 'react-icons/fi';

export interface ProcessingAnimationProps {
  isOpen: boolean;
  message?: string;
  variant?: 'modal' | 'inline';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Animated component shown during processing operations
 * Displays a visually engaging animation with CPU icon and floating elements
 */
const ProcessingAnimation = ({
  isOpen,
  message = 'Analyzing your invention details...',
  variant = 'modal',
  size = 'md',
}: ProcessingAnimationProps) => {
  const theme = useTheme();

  // Define keyframes for animations
  const pulse = keyframes`
    0% { transform: scale(1); opacity: 0.7; }
    50% { transform: scale(1.1); opacity: 1; }
    100% { transform: scale(1); opacity: 0.7; }
  `;

  const rotate = keyframes`
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  `;

  const float = keyframes`
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  `;

  const fadeIn = keyframes`
    0% { opacity: 0; }
    100% { opacity: 1; }
  `;

  // Animation styles
  const pulseAnim = `${pulse} 2s ease-in-out infinite`;
  const rotateAnim = `${rotate} 8s linear infinite`;
  const floatAnim = `${float} 3s ease-in-out infinite`;
  const fadeInAnim = `${fadeIn} 0.5s ease-in-out`;

  // Size multiplier
  const sizeMultiplier = size === 'sm' ? 0.6 : size === 'lg' ? 1.2 : 1;
  const containerSize = 200 * sizeMultiplier;

  // Animation content
  const animationContent = (
    <Flex
      direction="column"
      align="center"
      justify="center"
      animation={fadeInAnim}
    >
      {/* Main animation container */}
      <Box
        position="relative"
        h={`${containerSize}px`}
        w={`${containerSize}px`}
        mb={6}
      >
        {/* Rotating outer ring */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          borderRadius="full"
          border="3px dashed"
          borderColor="blue.400"
          animation={rotateAnim}
        />

        {/* Pulsing middle ring */}
        <Box
          position="absolute"
          top={`${15 * sizeMultiplier}px`}
          left={`${15 * sizeMultiplier}px`}
          right={`${15 * sizeMultiplier}px`}
          bottom={`${15 * sizeMultiplier}px`}
          borderRadius="full"
          border="2px solid"
          borderColor="blue.300"
          animation={pulseAnim}
        />

        {/* Center icon */}
        <Flex
          position="absolute"
          top={`${40 * sizeMultiplier}px`}
          left={`${40 * sizeMultiplier}px`}
          right={`${40 * sizeMultiplier}px`}
          bottom={`${40 * sizeMultiplier}px`}
          borderRadius="full"
          bg="blue.500"
          align="center"
          justify="center"
          animation={pulseAnim}
          boxShadow={`0 0 ${20 * sizeMultiplier}px ${theme.colors.blue[300]}`}
        >
          <Icon as={FiCpu} color="white" boxSize={12 * sizeMultiplier} />
        </Flex>

        {/* Floating elements */}
        <Box
          position="absolute"
          top={`${20 * sizeMultiplier}px`}
          left={`${20 * sizeMultiplier}px`}
          bg="purple.400"
          p={2 * sizeMultiplier}
          borderRadius="md"
          animation={`${floatAnim} 2.5s ease-in-out infinite`}
          boxShadow="lg"
          display={size === 'sm' ? 'none' : 'block'}
        >
          <Icon as={FiSearch} color="white" boxSize={size === 'sm' ? 3 : 4} />
        </Box>

        <Box
          position="absolute"
          bottom={`${30 * sizeMultiplier}px`}
          right={`${20 * sizeMultiplier}px`}
          bg="green.400"
          p={2 * sizeMultiplier}
          borderRadius="md"
          animation={`${floatAnim} 3.2s ease-in-out infinite 0.5s`}
          boxShadow="lg"
          display={size === 'sm' ? 'none' : 'block'}
        >
          <Icon as={FiFileText} color="white" boxSize={size === 'sm' ? 3 : 4} />
        </Box>

        <Box
          position="absolute"
          bottom={`${20 * sizeMultiplier}px`}
          left={`${30 * sizeMultiplier}px`}
          bg="orange.400"
          p={2 * sizeMultiplier}
          borderRadius="md"
          animation={`${floatAnim} 2.8s ease-in-out infinite 1s`}
          boxShadow="lg"
          display={size === 'sm' ? 'none' : 'block'}
        >
          <Icon
            as={FiCheckCircle}
            color="white"
            boxSize={size === 'sm' ? 3 : 4}
          />
        </Box>
      </Box>

      {/* Text content */}
      {size !== 'sm' && (
        <>
          <Text
            fontSize={size === 'lg' ? '2xl' : 'xl'}
            fontWeight="bold"
            color={variant === 'modal' ? 'white' : 'blue.600'}
            textShadow={
              variant === 'modal' ? '0 0 10px rgba(0,0,0,0.5)' : 'none'
            }
            mb={2}
          >
            AI Analysis in Progress
          </Text>

          <Text
            color={variant === 'modal' ? 'white' : 'gray.600'}
            textShadow={
              variant === 'modal' ? '0 0 10px rgba(0,0,0,0.5)' : 'none'
            }
            textAlign="center"
            maxW="400px"
          >
            {message}
          </Text>
        </>
      )}

      {/* Progress dots */}
      <Flex mt={4}>
        {[0, 1, 2].map(i => (
          <Box
            key={i}
            h={`${10 * sizeMultiplier}px`}
            w={`${10 * sizeMultiplier}px`}
            borderRadius="full"
            bg={variant === 'modal' ? 'white' : 'blue.500'}
            mx={1}
            animation={`${pulse} 1.5s ease-in-out infinite ${i * 0.3}s`}
          />
        ))}
      </Flex>
    </Flex>
  );

  // Render inline or as modal based on variant
  if (variant === 'inline') {
    if (!isOpen) return null;
    return (
      <Box w="100%" display="flex" justifyContent="center" alignItems="center">
        {animationContent}
      </Box>
    );
  }

  // Default modal version
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}}
      isCentered
      closeOnOverlayClick={false}
      motionPreset="scale"
    >
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent bg="transparent" boxShadow="none" maxW="600px">
        <ModalBody>{animationContent}</ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ProcessingAnimation;
