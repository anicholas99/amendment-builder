import React, { useRef } from 'react';
import {
  Box,
  VStack,
  Button,
  Text,
  Alert,
  AlertIcon,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';

interface OutOfSyncConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  hasQueries: boolean;
  onProceedWithOldData: () => void;
  onSyncBeforeSearch: () => void;
}

export const OutOfSyncConfirmationDialog: React.FC<
  OutOfSyncConfirmationDialogProps
> = ({
  isOpen,
  onClose,
  hasQueries,
  onProceedWithOldData,
  onSyncBeforeSearch,
}) => {
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      isCentered
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Claim 1 Has Changed
          </AlertDialogHeader>

          <AlertDialogBody>
            <VStack spacing={4} align="start">
              <Text>
                Your Claim 1 has been modified since the last search analysis.
              </Text>
              <Text>You have two options:</Text>
              <Box pl={4}>
                <Text>
                  <strong>1. Re-sync Claim 1</strong> - Analyze the updated
                  claim text to generate new search queries (recommended)
                </Text>
                <Text mt={2}>
                  <strong>2. Search with Previous Data</strong> - Use the search
                  queries from the last sync
                  {hasQueries
                    ? ' (queries available)'
                    : ' (no queries available)'}
                </Text>
              </Box>
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Text fontSize="sm">
                  Re-syncing ensures your search results match your current
                  claim language.
                </Text>
              </Alert>
              {!hasQueries && (
                <Alert status="warning" borderRadius="md">
                  <AlertIcon />
                  <Text fontSize="sm">
                    No search queries are available from the previous sync. You
                    may need to re-sync first.
                  </Text>
                </Alert>
              )}
            </VStack>
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="gray"
              onClick={onProceedWithOldData}
              ml={3}
              isDisabled={!hasQueries}
              title={
                !hasQueries
                  ? 'No search queries available from previous sync'
                  : undefined
              }
            >
              Use Old Queries
            </Button>
            <Button colorScheme="blue" onClick={onSyncBeforeSearch} ml={3}>
              Re-sync & Search
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};
