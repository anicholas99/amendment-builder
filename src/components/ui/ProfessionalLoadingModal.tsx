import React, { useEffect, useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  VStack,
  Text,
  Spinner,
  useColorModeValue,
  Box,
  Progress,
  HStack,
  Icon,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { FiCpu, FiFileText, FiCheckCircle } from 'react-icons/fi';

interface ProfessionalLoadingModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  showProgress?: boolean;
}

const fadeIn = keyframes`
  0% { opacity: 0; transform: translateY(-10px); }
  100% { opacity: 1; transform: translateY(0); }
`;

export const ProfessionalLoadingModal: React.FC<
  ProfessionalLoadingModalProps
> = ({
  isOpen,
  title = 'AI Analysis in Progress',
  message = 'Analyzing your invention details...',
  showProgress = true,
}) => {
  const [step, setStep] = useState(0);
  const steps = [
    { icon: FiFileText, text: 'Reading' },
    { icon: FiCpu, text: 'Analyzing' },
    { icon: FiCheckCircle, text: 'Finalizing' },
  ];

  useEffect(() => {
    if (!isOpen) {
      setStep(0);
      return;
    }

    const interval = setInterval(() => {
      setStep(prev => (prev + 1) % steps.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isOpen, steps.length]);

  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const spinnerColor = useColorModeValue('blue.500', 'blue.300');
  const progressBg = useColorModeValue('gray.100', 'gray.700');
  const stepActiveColor = useColorModeValue('blue.500', 'blue.400');
  const stepInactiveColor = useColorModeValue('gray.300', 'gray.600');

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}}
      isCentered
      closeOnOverlayClick={false}
      size="sm"
    >
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent
        bg={bgColor}
        borderRadius="lg"
        boxShadow="lg"
        animation={`${fadeIn} 0.3s ease-out`}
      >
        <ModalBody py={8} px={6}>
          <VStack spacing={5}>
            {/* Clean spinner */}
            <Spinner
              size="lg"
              color={spinnerColor}
              thickness="2px"
              speed="0.65s"
            />

            {/* Title and message */}
            <VStack spacing={1} textAlign="center">
              <Text fontSize="md" fontWeight="medium" color="text.primary">
                {title}
              </Text>
              <Text fontSize="sm" color={textColor}>
                {message}
              </Text>
            </VStack>

            {/* Minimal step indicators */}
            <HStack spacing={4}>
              {steps.map((s, index) => (
                <HStack
                  key={index}
                  spacing={2}
                  opacity={index === step ? 1 : 0.5}
                  transition="all 0.3s"
                >
                  <Icon
                    as={s.icon}
                    boxSize={4}
                    color={index === step ? stepActiveColor : stepInactiveColor}
                  />
                  <Text
                    fontSize="xs"
                    color={index === step ? stepActiveColor : stepInactiveColor}
                    fontWeight={index === step ? 'medium' : 'normal'}
                  >
                    {s.text}
                  </Text>
                </HStack>
              ))}
            </HStack>

            {/* Clean progress bar */}
            {showProgress && (
              <Box width="100%" px={4}>
                <Progress
                  size="xs"
                  isIndeterminate
                  colorScheme="blue"
                  bg={progressBg}
                  borderRadius="full"
                  height="2px"
                />
              </Box>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ProfessionalLoadingModal;
