import React from 'react';
import {
  Box,
  Text,
  Button,
  IconButton,
  Flex,
  VStack,
  Badge,
  HStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Grid,
} from '@chakra-ui/react';
import { FiX } from 'react-icons/fi';
import { ClaimVersion } from '../../../types/claimTypes';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  versions: ClaimVersion[];
  onRestore: (version: ClaimVersion) => void;
}

const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  isOpen,
  onClose,
  versions,
  onRestore,
}) => {
  if (!isOpen) return null;

  const formatDate = (dateString: string | number) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

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
        bg="bg.card"
        borderRadius="md"
        width="600px"
        maxHeight="80vh"
        p={4}
        onClick={e => e.stopPropagation()}
        overflowY="auto"
      >
        <Flex justify="space-between" align="center" mb={4}>
          <Text fontSize="xl" fontWeight="semibold">
            Claim Version History
          </Text>
          <IconButton
            aria-label="Close"
            icon={<FiX />}
            size="sm"
            onClick={onClose}
          />
        </Flex>

        {versions.length === 0 ? (
          <Box p={4} textAlign="center" color="gray.500">
            No version history available yet.
          </Box>
        ) : (
          <VStack spacing={3} align="stretch">
            {versions.map((version, index) => (
              <Box
                key={index}
                p={3}
                borderWidth="1px"
                borderRadius="md"
                borderColor="gray.200"
              >
                <Flex justify="space-between" align="center" mb={2}>
                  <HStack>
                    <Badge colorScheme={index === 0 ? 'green' : 'blue'}>
                      {index === 0
                        ? 'Latest'
                        : `Version ${versions.length - index}`}
                    </Badge>
                    <Text fontSize="sm" color="gray.600">
                      {formatDate(version.timestamp)}
                    </Text>
                  </HStack>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    variant={index === 0 ? 'outline' : 'solid'}
                    isDisabled={index === 0}
                    onClick={() => onRestore(version)}
                  >
                    Revert to this version
                  </Button>
                </Flex>

                <Text fontWeight="normal" mb={1}>
                  {version.description}
                </Text>

                <Accordion allowToggle>
                  <AccordionItem border="none">
                    <AccordionButton px={0} py={1}>
                      <Box flex="1" textAlign="left">
                        <Text color="blue.500" fontSize="sm">
                          View Claims ({Object.keys(version.claims).length})
                        </Text>
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel p={0}>
                      <Box borderRadius="md" overflow="hidden">
                        <VStack spacing={2} align="stretch">
                          {Object.entries(version.claims).map(([num, text]) => (
                            <Box
                              key={num}
                              p={2}
                              bg="bg.secondary"
                              borderRadius="md"
                              fontSize="sm"
                            >
                              <Text fontWeight="normal" mb={1}>
                                Claim {num}
                              </Text>
                              <Text>{text}</Text>
                            </Box>
                          ))}
                        </VStack>
                      </Box>
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>
              </Box>
            ))}
          </VStack>
        )}
      </Box>
    </Box>
  );
};

export default VersionHistoryModal;
