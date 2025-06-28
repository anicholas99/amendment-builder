import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Box,
  Text,
  VStack,
  Code,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  modalStyles,
  modalButtonStyles,
} from '@/components/common/ModalStyles';

interface SuggestionApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  claim1Text: string; // The current full text of Claim 1
  elementText: string; // The specific text phrase identified for replacement
  newLanguage: string; // The suggested replacement language
  onConfirmApply: (newClaimText: string) => void; // Callback with the modified claim text
}

/**
 * Modal to preview and confirm applying an AI suggestion to Claim 1.
 */
const SuggestionApplyModal: React.FC<SuggestionApplyModalProps> = ({
  isOpen,
  onClose,
  claim1Text,
  elementText,
  newLanguage,
  onConfirmApply,
}) => {
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const originalBg = useColorModeValue('gray.50', 'gray.800');
  const changeBg = useColorModeValue('blue.50', 'blue.900');
  const changeTextColor = useColorModeValue('blue.700', 'blue.200');
  const resultBg = useColorModeValue('green.50', 'green.900');
  const resultTextColor = useColorModeValue('green.700', 'green.200');
  const highlightBg = useColorModeValue('yellow.100', 'yellow.800');

  // Simple highlighting function
  const renderHighlightedClaim = () => {
    if (!claim1Text || !elementText) {
      return <Text>{claim1Text || 'Claim text unavailable.'}</Text>;
    }

    const parts = claim1Text.split(elementText);

    return (
      <Text as="span">
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {part}
            {index < parts.length - 1 && (
              <Text
                as="span"
                bg={highlightBg}
                px="1"
                mx="0.5"
                borderRadius="sm"
              >
                {elementText}
              </Text>
            )}
          </React.Fragment>
        ))}
      </Text>
    );
  };

  const handleConfirm = () => {
    // Basic replacement - assumes first occurrence. Could be made more robust.
    const newClaimText = claim1Text.replace(elementText, newLanguage);
    onConfirmApply(newClaimText);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay {...modalStyles.overlay} />
      <ModalContent>
        <ModalHeader {...modalStyles.header} borderColor={borderColor}>
          Apply Suggestion to Claim 1
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody {...modalStyles.body}>
          <VStack align="stretch" spacing={4}>
            <Box>
              <Text fontWeight="bold" mb={1}>
                Original Claim 1:
              </Text>
              <Box
                p={3}
                borderWidth="1px"
                borderRadius="md"
                bg={originalBg}
                borderColor={borderColor}
              >
                {renderHighlightedClaim()}
              </Box>
            </Box>
            <Box>
              <Text fontWeight="bold" mb={1}>
                Suggested Change:
              </Text>
              <Text mb={1}>
                Replace highlighted text (
                <Code fontSize="sm">{elementText}</Code>) with:
              </Text>
              <Box
                p={3}
                borderWidth="1px"
                borderRadius="md"
                bg={changeBg}
                borderColor={borderColor}
              >
                <Text color={changeTextColor}>{newLanguage}</Text>
              </Box>
            </Box>
            <Box>
              <Text fontWeight="bold" mb={1}>
                Resulting Claim 1:
              </Text>
              <Box
                p={3}
                borderWidth="1px"
                borderRadius="md"
                bg={resultBg}
                borderColor={borderColor}
                opacity={0.8}
              >
                {/* Show preview of the result */}
                <Text as="span">
                  {claim1Text.split(elementText).map((part, index) => (
                    <React.Fragment key={index}>
                      {part}
                      {index < claim1Text.split(elementText).length - 1 && (
                        <Text
                          as="span"
                          color={resultTextColor}
                          fontWeight="bold"
                        >
                          {newLanguage}
                        </Text>
                      )}
                    </React.Fragment>
                  ))}
                </Text>
              </Box>
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter {...modalStyles.footer} borderColor={borderColor}>
          <Button {...modalButtonStyles.primary} mr={3} onClick={handleConfirm}>
            Confirm Apply
          </Button>
          <Button {...modalButtonStyles.secondary} onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SuggestionApplyModal;
