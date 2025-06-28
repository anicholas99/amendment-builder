import React, { useState } from 'react';
import {
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Checkbox,
  VStack,
  Text,
  HStack,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';

interface ReferenceOption {
  referenceNumber: string;
  title?: string;
}

interface CombinedAnalysisSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  references: ReferenceOption[];
  onRunAnalysis: (selected: string[]) => void;
}

const CombinedAnalysisSelectionModal: React.FC<
  CombinedAnalysisSelectionModalProps
> = ({ isOpen, onClose, references, onRunAnalysis }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const bgColor = useColorModeValue('bg.card', 'bg.card');

  const handleToggle = (refNum: string) => {
    setSelected(prev =>
      prev.includes(refNum) ? prev.filter(r => r !== refNum) : [...prev, refNum]
    );
  };

  const handleRun = () => {
    onRunAnalysis(selected);
  };

  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      zIndex={2000}
      display="flex"
      alignItems="center"
      justifyContent="center"
      backgroundColor="rgba(0,0,0,0.5)"
    >
      <Box
        bg={bgColor}
        p={6}
        borderRadius="md"
        boxShadow="xl"
        minWidth="350px"
        maxWidth="95vw"
        maxHeight="90vh"
        overflowY="auto"
      >
        <Text fontSize="lg" fontWeight="bold" mb={2}>
          Select References for Combined Analysis
        </Text>
        <Text fontSize="sm" color="gray.600" mb={4}>
          Select 2 or more references with deep analysis:
        </Text>
        <VStack
          align="start"
          spacing={2}
          mb={4}
          maxHeight="40vh"
          overflowY="auto"
        >
          {references.length === 0 && (
            <Text color="gray.500">No references available.</Text>
          )}
          {references.map(ref => (
            <Checkbox
              key={ref.referenceNumber}
              isChecked={selected.includes(ref.referenceNumber)}
              onChange={() => handleToggle(ref.referenceNumber)}
            >
              {ref.referenceNumber} {ref.title && `- ${ref.title}`}
            </Checkbox>
          ))}
        </VStack>
        <Flex justifyContent="flex-end" gap={2}>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleRun}
            isDisabled={selected.length < 2}
          >
            Run Analysis
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

export default CombinedAnalysisSelectionModal;
