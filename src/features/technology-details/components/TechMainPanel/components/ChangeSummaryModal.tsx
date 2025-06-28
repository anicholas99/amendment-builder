import React from 'react';
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
  Box,
  Icon,
  VStack,
  Flex,
  HStack,
  Divider,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiZap, FiEdit2 } from 'react-icons/fi';
import {
  modalStyles,
  modalButtonStyles,
} from '@/components/common/ModalStyles';

// Define the UpdatedSection type locally since it was removed from useUpdateDetails
export type UpdatedSection = {
  section: string;
  type: 'added' | 'modified' | 'unchanged';
  count?: number;
};

interface ChangeSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  updatedSections?: UpdatedSection[];
  getFontSize: (baseSize: string) => string;
}

/**
 * Modal for displaying a summary of changes after adding additional details
 */
export const ChangeSummaryModal: React.FC<ChangeSummaryModalProps> = ({
  isOpen,
  onClose,
  updatedSections = [], // Provide default empty array
  getFontSize,
}) => {
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const modalBg = useColorModeValue('bg.secondary', 'bg.secondary');
  const cardBg = useColorModeValue('bg.card', 'bg.card');
  const badgeBg = useColorModeValue('blue.50', 'blue.900');
  const summaryBadgeBg = useColorModeValue('green.100', 'green.700');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
  const emptyTextColor = useColorModeValue('gray.500', 'gray.400');
  const badgeTextColor = useColorModeValue('blue.600', 'blue.200');
  const summaryBadgeTextColor = useColorModeValue('green.700', 'green.200');

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalOverlay {...modalStyles.overlay} />
      <ModalContent>
        <ModalHeader {...modalStyles.header} borderColor={borderColor}>
          <Flex align="center">
            <Icon as={FiZap} mr={2} color="green.500" />
            <Text>Review Updated Sections</Text>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody {...modalStyles.body}>
          <Text mb={4} color={mutedTextColor}>
            The following sections have been updated based on the details you
            provided. Please review the changes.
          </Text>

          <Box
            borderWidth={1}
            borderRadius="md"
            bg={modalBg}
            borderColor={borderColor}
            maxHeight="350px"
            overflowY="auto"
          >
            {updatedSections.length > 0 ? (
              <VStack
                align="stretch"
                spacing={0}
                divider={<Divider borderColor={borderColor} />}
              >
                {updatedSections.map((section, idx) => (
                  <Flex
                    key={idx}
                    p={3}
                    bg={cardBg}
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <HStack>
                      <Icon as={FiEdit2} color="blue.500" boxSize="18px" />
                      <Text fontWeight="normal" fontSize={getFontSize('sm')}>
                        {section.section}
                      </Text>
                    </HStack>
                    {section.count !== undefined && section.count > 0 && (
                      <Badge
                        bg={badgeBg}
                        color={badgeTextColor}
                        fontSize={getFontSize('xs')}
                        px={2}
                        py={1}
                        borderRadius="sm"
                      >
                        +{section.count}{' '}
                        {section.count === 1 ? 'ITEM' : 'ITEMS'}
                      </Badge>
                    )}
                  </Flex>
                ))}
              </VStack>
            ) : (
              <Box p={4} textAlign="center">
                <Text color={emptyTextColor}>No sections were updated</Text>
              </Box>
            )}
          </Box>

          <Box mt={5} pt={2} display="flex" justifyContent="center">
            <Badge
              py={1}
              px={3}
              borderRadius="full"
              bg={summaryBadgeBg}
              color={summaryBadgeTextColor}
              fontSize={getFontSize('sm')}
            >
              {updatedSections.length} SECTIONS UPDATED
            </Badge>
          </Box>
        </ModalBody>

        <ModalFooter {...modalStyles.footer} borderColor={borderColor}>
          <Button {...modalButtonStyles.primary} onClick={onClose}>
            Accept Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ChangeSummaryModal;
