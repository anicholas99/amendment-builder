import React, { useState, useEffect } from 'react';
import {
  useColorModeValue,
  Button,
  Text,
  FormControl,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Textarea,
} from '@chakra-ui/react';
import {
  modalStyles,
  modalButtonStyles,
} from '@/components/common/ModalStyles';

interface DependentClaimEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialText: string;
  onSave: (editedText: string) => void;
}

/**
 * Modal for editing a dependent claim suggestion before inserting it into the claim set
 */
const DependentClaimEditModal: React.FC<DependentClaimEditModalProps> = ({
  isOpen,
  onClose,
  initialText,
  onSave,
}) => {
  const [editedText, setEditedText] = useState(initialText);
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');

  // Reset edited text when modal opens with new initialText
  useEffect(() => {
    setEditedText(initialText);
  }, [initialText, isOpen]);

  const handleSave = () => {
    onSave(editedText);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay {...modalStyles.overlay} />
      <ModalContent>
        <ModalHeader {...modalStyles.header} borderColor={borderColor}>
          Edit Dependent Claim
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody {...modalStyles.body}>
          <Text mb={4} fontSize="sm" color={mutedTextColor}>
            Edit the dependent claim text below before adding it to your claim
            set:
          </Text>

          <FormControl isRequired>
            <FormLabel>Claim Text</FormLabel>
            <Textarea
              value={editedText}
              onChange={e => setEditedText(e.target.value)}
              placeholder="Enter claim text..."
              rows={8}
              fontFamily="mono"
              resize="vertical"
              fontSize="14px"
              lineHeight="1.5"
            />
          </FormControl>
        </ModalBody>

        <ModalFooter {...modalStyles.footer} borderColor={borderColor}>
          <Button
            {...modalButtonStyles.primary}
            mr={3}
            onClick={handleSave}
            isDisabled={!editedText.trim()}
          >
            Save & Insert
          </Button>
          <Button {...modalButtonStyles.secondary} onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DependentClaimEditModal;
