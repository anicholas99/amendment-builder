import React from 'react';
import {
  Box,
  Text,
  Button,
  IconButton,
  Flex,
  VStack,
  Badge,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Icon,
} from '@chakra-ui/react';
import { FiX, FiFileText } from 'react-icons/fi';
import {
  modalStyles,
  modalButtonStyles,
} from '@/components/common/ModalStyles';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  claims: Record<string, string>;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  claims,
}) => {
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" isCentered>
      <ModalOverlay {...modalStyles.overlay} />
      <ModalContent>
        <ModalHeader {...modalStyles.header} borderColor={borderColor}>
          <Flex align="center">
            <Icon as={FiFileText} mr={2} />
            Preview Content
          </Flex>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody {...modalStyles.body} maxH="70vh" overflowY="auto">
          <VStack spacing={4} align="stretch">
            {Object.entries(claims).map(([number, text], index) => (
              <Box
                key={index}
                p={4}
                borderWidth="1px"
                borderRadius="md"
                borderColor={borderColor}
              >
                <Flex justify="space-between" align="center" mb={2}>
                  <Badge colorScheme="blue">Claim {number}</Badge>
                </Flex>
                <Text>{text}</Text>
              </Box>
            ))}
          </VStack>
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

export default PreviewModal;
