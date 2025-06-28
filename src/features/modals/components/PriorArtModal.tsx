import React from 'react';
import { Box, Text, Button, Flex } from '@chakra-ui/react';
import { IconButton, Badge } from '@chakra-ui/react';
import { FiX, FiEye } from 'react-icons/fi';
import { PriorArtReference } from '../../../types/claimTypes';

interface PriorArtModalProps {
  isOpen: boolean;
  onClose: () => void;
  priorArt: PriorArtReference | null;
}

const PriorArtModal: React.FC<PriorArtModalProps> = ({
  isOpen,
  onClose,
  priorArt,
}) => {
  if (!isOpen || !priorArt) return null;

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="blackAlpha.600"
      zIndex={1000}
      display="flex"
      alignItems="center"
      justifyContent="center"
      onClick={onClose}
    >
      <Box
        bg="white"
        borderRadius="md"
        boxShadow="xl"
        width="90%"
        maxWidth="800px"
        maxHeight="90vh"
        overflow="hidden"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <Flex
          p={4}
          borderBottomWidth="1px"
          justify="space-between"
          align="center"
        >
          <Text fontSize="lg" fontWeight="bold">
            Prior Art Details
          </Text>
          <IconButton
            aria-label="Close"
            icon={<FiX />}
            size="sm"
            onClick={onClose}
          />
        </Flex>

        <Box p={4} maxHeight="calc(90vh - 120px)" overflowY="auto">
          <Flex justify="space-between" align="center" mb={4}>
            <Box>
              <Text fontSize="xl" fontWeight="bold">
                {priorArt.number.replace(/-/g, '')}
              </Text>
              <Text fontSize="md" color="gray.600">
                {priorArt.title}
              </Text>
            </Box>
            <Badge colorScheme="red" fontSize="md">
              {priorArt.relevance}% Match
            </Badge>
          </Flex>

          <Box p={4} bg="red.50" borderRadius="md" mb={4}>
            <Text fontWeight="medium" mb={2}>
              Relevant Text:
            </Text>
            <Text>"{priorArt.relevantText}"</Text>
          </Box>

          <Box p={4} bg="gray.50" borderRadius="md" mb={4}>
            <Text fontWeight="medium" mb={2}>
              Publication Year:
            </Text>
            <Text>{priorArt.year}</Text>
          </Box>

          <Flex justify="space-between" mt={4}>
            <Button
              leftIcon={<FiEye />}
              colorScheme="blue"
              onClick={() =>
                window.open(
                  `https://patents.google.com/patent/${priorArt.number.replace(/-/g, '')}`,
                  '_blank'
                )
              }
            >
              View Full Patent
            </Button>
            <Button onClick={onClose}>Close</Button>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
};

export default PriorArtModal;
