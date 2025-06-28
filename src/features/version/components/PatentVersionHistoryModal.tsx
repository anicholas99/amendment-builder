import React from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Flex,
  Text,
  VStack,
} from '@chakra-ui/react';

// Define the PatentVersion interface
export interface PatentVersion {
  timestamp: string;
  content: string;
  description: string;
}

interface PatentVersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  versions: PatentVersion[];
  onRevertToVersion: (version: PatentVersion) => void;
}

const PatentVersionHistoryModal: React.FC<PatentVersionHistoryModalProps> = ({
  isOpen,
  onClose,
  versions,
  onRevertToVersion,
}) => {
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  return (
    <AlertDialog
      isOpen={isOpen}
      onClose={onClose}
      leastDestructiveRef={cancelRef}
      size="xl"
    >
      <AlertDialogOverlay>
        <AlertDialogContent maxW="800px">
          <AlertDialogHeader fontSize="lg" fontWeight="semibold">
            Version History
          </AlertDialogHeader>

          <AlertDialogBody>
            <VStack spacing={4} align="stretch" maxH="60vh" overflowY="auto">
              {versions.length === 0 ? (
                <Text color="gray.500" textAlign="center" py={4}>
                  No versions saved yet
                </Text>
              ) : (
                versions.map(version => (
                  <Box
                    key={version.timestamp}
                    p={4}
                    borderWidth={1}
                    borderRadius="md"
                    borderColor="gray.200"
                  >
                    <Flex justify="space-between" align="center" mb={2}>
                      <Text fontWeight="semibold">{version.description}</Text>
                      <Text color="gray.500" fontSize="sm">
                        {new Date(version.timestamp).toLocaleString()}
                      </Text>
                    </Flex>
                    <Text noOfLines={2} color="gray.600" mb={3}>
                      {version.content.substring(0, 150)}...
                    </Text>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={() => onRevertToVersion(version)}
                    >
                      Restore This Version
                    </Button>
                  </Box>
                ))
              )}
            </VStack>
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button onClick={onClose}>Close</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default PatentVersionHistoryModal;
