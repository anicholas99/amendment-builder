import React from 'react';
import {
  Button,
  Text,
  Icon,
  Box,
  Textarea,
  FormControl,
  FormLabel,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { FiInfo, FiPlus } from 'react-icons/fi';
import {
  modalStyles,
  modalButtonStyles,
} from '@/components/common/ModalStyles';

interface AddDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  additionalDetails: string;
  setAdditionalDetails: (details: string) => void;
  handleAddDetails: () => void;
  isProcessing: boolean;
  processingProgress: number;
}

/**
 * Modal for adding additional details to the invention
 */
export const AddDetailsModal: React.FC<AddDetailsModalProps> = ({
  isOpen,
  onClose,
  additionalDetails,
  setAdditionalDetails,
  handleAddDetails,
  isProcessing,
  processingProgress,
}) => {
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
  const infoBg = useColorModeValue('blue.50', 'blue.900');
  const infoColor = useColorModeValue('blue.600', 'blue.200');

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay {...modalStyles.overlay} />
      <ModalContent>
        <ModalHeader {...modalStyles.header} borderColor={borderColor}>
          Add Additional Technology Details
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody {...modalStyles.body}>
          <Text mb={4} color={mutedTextColor}>
            Describe any additional details about your invention. Our AI will
            automatically integrate this information into the appropriate
            sections.
          </Text>
          <FormControl isRequired>
            <FormLabel>Details</FormLabel>
            <Textarea
              value={additionalDetails}
              onChange={e => setAdditionalDetails(e.target.value)}
              placeholder="Describe additional technical details, use cases, advantages, or any other aspects of your invention..."
              size="md"
              minH="200px"
              resize="vertical"
            />
          </FormControl>
          <Box mt={4} p={3} bg={infoBg} borderRadius="md">
            <Text fontSize="sm" fontWeight="normal" color={infoColor}>
              <Icon as={FiInfo} mr={2} />
              Details will be automatically categorized and merged with your
              existing information.
            </Text>
          </Box>
        </ModalBody>

        <ModalFooter {...modalStyles.footer} borderColor={borderColor}>
          <Button
            {...modalButtonStyles.primary}
            mr={3}
            onClick={handleAddDetails}
            isLoading={isProcessing}
            isDisabled={!additionalDetails.trim()}
          >
            {isProcessing
              ? `Processing... ${processingProgress}%`
              : 'Process Details'}
          </Button>
          <Button onClick={onClose} {...modalButtonStyles.secondary}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddDetailsModal;
