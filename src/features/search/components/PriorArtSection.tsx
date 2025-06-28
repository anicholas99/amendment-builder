import React from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Button,
  Icon,
  Flex,
  Badge,
  Link,
  Divider,
  Tooltip,
} from '@chakra-ui/react';
import { FiExternalLink, FiTrash2, FiInfo } from 'react-icons/fi';

interface PriorArtReference {
  id: string;
  title: string;
  url: string;
  description: string;
  relevance?: string[];
}

interface PriorArtSectionProps {
  priorArtReferences: PriorArtReference[];
  selectedPriorArt: string | null;
  onSelectPriorArt: (id: string | null) => void;
  onDeletePriorArt: (id: string) => void;
  onOpenPriorArtModal: () => void;
}

/**
 * Component for displaying and managing prior art references
 */
const PriorArtSection: React.FC<PriorArtSectionProps> = ({
  priorArtReferences,
  selectedPriorArt,
  onSelectPriorArt,
  onDeletePriorArt,
  onOpenPriorArtModal,
}) => {
  return (
    <Box w="100%" p={4}>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Text fontSize="xl" fontWeight="bold">
          Prior Art References
        </Text>
        <Button
          colorScheme="blue"
          variant="outline"
          onClick={onOpenPriorArtModal}
        >
          Add Reference
        </Button>
      </Flex>

      {priorArtReferences.length === 0 ? (
        <Box p={4} borderWidth="1px" borderRadius="md" bg="gray.50">
          <Text color="gray.500" textAlign="center">
            No prior art references added yet. Click "Add Reference" to add one.
          </Text>
        </Box>
      ) : (
        <VStack spacing={3} align="stretch">
          {priorArtReferences.map(reference => (
            <Box
              key={reference.id}
              p={3}
              borderWidth="1px"
              borderRadius="md"
              boxShadow="sm"
              bg={selectedPriorArt === reference.id ? 'blue.50' : 'white'}
              onClick={() =>
                onSelectPriorArt(
                  selectedPriorArt === reference.id ? null : reference.id
                )
              }
              cursor="pointer"
              _hover={{ borderColor: 'blue.300' }}
            >
              <Flex justifyContent="space-between" alignItems="flex-start">
                <VStack align="start" spacing={1}>
                  <Text fontWeight="bold">{reference.title}</Text>

                  {reference.url && (
                    <HStack spacing={1}>
                      <Link
                        href={reference.url}
                        isExternal
                        color="blue.500"
                        fontSize="sm"
                      >
                        {reference.url.substring(0, 50)}
                        {reference.url.length > 50 ? '...' : ''}
                      </Link>
                      <Icon
                        as={FiExternalLink}
                        color="blue.500"
                        boxSize="14px"
                      />
                    </HStack>
                  )}

                  <Text fontSize="sm" color="gray.600" noOfLines={2}>
                    {reference.description}
                  </Text>

                  {reference.relevance && reference.relevance.length > 0 && (
                    <HStack mt={1} wrap="wrap">
                      <Tooltip label="Relevance to the invention">
                        <Icon as={FiInfo} color="gray.500" />
                      </Tooltip>
                      {reference.relevance.map((item, index) => (
                        <Badge
                          key={index}
                          colorScheme="purple"
                          variant="subtle"
                        >
                          {item}
                        </Badge>
                      ))}
                    </HStack>
                  )}
                </VStack>

                <Button
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  onClick={e => {
                    e.stopPropagation();
                    onDeletePriorArt(reference.id);
                  }}
                >
                  <Icon as={FiTrash2} />
                </Button>
              </Flex>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default PriorArtSection;
