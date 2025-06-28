import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  HStack,
  Badge,
  Flex,
  Spinner,
  Box,
  useToast,
  IconButton,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiCopy } from 'react-icons/fi';
import {
  modalStyles,
  modalButtonStyles,
} from '@/components/common/ModalStyles';

interface CombinedAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  result: string | null;
  selectedReferences: string[];
}

const CombinedAnalysisModal: React.FC<CombinedAnalysisModalProps> = ({
  isOpen,
  onClose,
  isLoading,
  result,
  selectedReferences,
}) => {
  const toast = useToast();
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
  const emptyTextColor = useColorModeValue('gray.500', 'gray.400');
  const resultBg = useColorModeValue('gray.50', 'gray.800');

  const safeSelectedReferences = Array.isArray(selectedReferences)
    ? selectedReferences
    : [];

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result).then(() => {
      toast({
        title: 'Copied to clipboard',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalOverlay {...modalStyles.overlay} />
      <ModalContent maxH="90vh">
        <ModalHeader {...modalStyles.header} borderColor={borderColor}>
          Combined Examiner Analysis
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody {...modalStyles.body}>
          {/* Selected references */}
          <Text
            fontSize="sm"
            color={mutedTextColor}
            mb={2}
            fontWeight="semibold"
          >
            Selected References:
          </Text>
          <HStack spacing={2} mb={4} flexWrap="wrap">
            {safeSelectedReferences.map(ref => (
              <Badge
                key={ref}
                colorScheme="blue"
                px={2}
                py={1}
                borderRadius="md"
              >
                {ref}
              </Badge>
            ))}
          </HStack>

          <Divider mb={4} borderColor={borderColor} />

          {isLoading ? (
            <Flex align="center" justify="center" minH="200px">
              <Spinner size="lg" />
              <Text ml={4} color={mutedTextColor}>
                Analyzing selected references...
              </Text>
            </Flex>
          ) : result ? (
            <Box>
              <Flex justify="flex-end" mb={2}>
                <IconButton
                  aria-label="copy"
                  icon={<FiCopy />}
                  size="sm"
                  variant="ghost"
                  onClick={handleCopy}
                  title="Copy analysis to clipboard"
                />
              </Flex>
              <Box
                whiteSpace="pre-wrap"
                fontSize="sm"
                lineHeight="1.4"
                maxH="60vh"
                overflowY="auto"
                px={2}
                py={3}
                bg={resultBg}
                borderRadius="md"
                borderWidth="1px"
                borderColor={borderColor}
              >
                {result}
              </Box>
            </Box>
          ) : (
            <Text color={emptyTextColor}>No analysis result available.</Text>
          )}
        </ModalBody>
        <ModalFooter {...modalStyles.footer} borderColor={borderColor}>
          <Button onClick={onClose} {...modalButtonStyles.secondary}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CombinedAnalysisModal;
