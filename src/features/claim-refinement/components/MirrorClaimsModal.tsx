import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  RadioGroup,
  Radio,
  Text,
  Badge,
  HStack,
  Box,
  useColorModeValue,
} from '@chakra-ui/react';
import { ClaimType } from '@/hooks/api/useClaimMirroring';
import { FiCopy } from 'react-icons/fi';

interface MirrorClaimsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (targetType: ClaimType) => void;
  claimCount: number;
  isLoading?: boolean;
}

const CLAIM_TYPE_OPTIONS: Array<{ value: ClaimType; label: string; description: string }> = [
  {
    value: 'system',
    label: 'System',
    description: 'A system comprising... (structural components)',
  },
  {
    value: 'method',
    label: 'Method',
    description: 'A method comprising... (steps/actions)',
  },
  {
    value: 'apparatus',
    label: 'Apparatus',
    description: 'An apparatus comprising... (physical components)',
  },
  {
    value: 'process',
    label: 'Process',
    description: 'A process for... (sequence of operations)',
  },
  {
    value: 'crm',
    label: 'Computer-Readable Medium',
    description: 'A non-transitory computer-readable medium storing instructions...',
  },
];

const MirrorClaimsModal: React.FC<MirrorClaimsModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  claimCount,
  isLoading = false,
}) => {
  const [selectedType, setSelectedType] = useState<ClaimType>('method');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const selectedBg = useColorModeValue('blue.50', 'blue.900');

  const handleConfirm = () => {
    onConfirm(selectedType);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <FiCopy />
            <Text>Mirror Claims</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Box>
              <Text mb={2}>
                Select the target claim type to mirror your{' '}
                <Badge colorScheme="blue">{claimCount}</Badge> claims:
              </Text>
            </Box>

            <RadioGroup value={selectedType} onChange={(value) => setSelectedType(value as ClaimType)}>
              <VStack spacing={3} align="stretch">
                {CLAIM_TYPE_OPTIONS.map((option) => (
                  <Box
                    key={option.value}
                    p={3}
                    borderWidth="1px"
                    borderRadius="md"
                    borderColor={selectedType === option.value ? 'blue.500' : borderColor}
                    bg={selectedType === option.value ? selectedBg : 'transparent'}
                    cursor="pointer"
                    onClick={() => setSelectedType(option.value)}
                    transition="all 0.2s"
                    _hover={{ borderColor: 'blue.400' }}
                  >
                    <Radio value={option.value} size="lg">
                      <VStack align="start" spacing={1} ml={2}>
                        <Text fontWeight="semibold">{option.label}</Text>
                        <Text fontSize="sm" color="gray.600">
                          {option.description}
                        </Text>
                      </VStack>
                    </Radio>
                  </Box>
                ))}
              </VStack>
            </RadioGroup>

            <Box mt={2}>
              <Text fontSize="sm" color="gray.600">
                The AI will transform your claims while preserving all technical elements
                and maintaining proper claim dependencies.
              </Text>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} isDisabled={isLoading}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleConfirm}
            isLoading={isLoading}
            loadingText="Mirroring Claims..."
          >
            Mirror Claims
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default MirrorClaimsModal; 