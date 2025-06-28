import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/monitoring/logger';
import {
  Button,
  Text,
  Box,
  Spinner,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Badge,
  HStack,
  useDisclosure,
  Tooltip,
  useToast,
  VStack,
  Divider,
} from '@chakra-ui/react';
import { FaHistory, FaTrash } from 'react-icons/fa';
import { format } from 'date-fns';
import {
  useProjectVersionsQuery,
  useDeleteVersionMutation,
} from '@/hooks/api/useProjectVersions';
import type { ProjectVersionsResponse } from '@/types/api/responses';
import { RestoreVersionDialog } from './RestoreVersionDialog';
import { Icon } from '@chakra-ui/react';

// Version is an element of the ProjectVersionsResponse array
export type Version = ProjectVersionsResponse[number];

interface VersionsHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onLoadVersion: (versionId: string) => void;
  hasUnsavedChanges?: boolean;
  onSaveCurrentVersion?: (versionName: string) => Promise<void>;
}

export const VersionsHistoryModal: React.FC<VersionsHistoryModalProps> = ({
  isOpen,
  onClose,
  projectId,
  onLoadVersion,
  hasUnsavedChanges = false,
  onSaveCurrentVersion,
}) => {
  const [versionToDelete, setVersionToDelete] = useState<Version | null>(null);
  const [versionToRestore, setVersionToRestore] = useState<Version | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isSavingBeforeRestore, setIsSavingBeforeRestore] = useState(false);
  const toast = useToast();

  // React Query hooks
  const {
    data: versions = [],
    isLoading,
    error,
    refetch,
  } = useProjectVersionsQuery(projectId);
  const deleteVersionMutation = useDeleteVersionMutation();

  // Alert dialog for delete confirmation
  const {
    isOpen: isAlertOpen,
    onOpen: onAlertOpen,
    onClose: onAlertClose,
  } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  // Restore version dialog
  const {
    isOpen: isRestoreDialogOpen,
    onOpen: onRestoreDialogOpen,
    onClose: onRestoreDialogClose,
  } = useDisclosure();

  // Handle error states with toast
  useEffect(() => {
    if (error && isOpen) {
      const errorMessage =
        (error as any)?.message || 'Could not load version history.';
      if (
        errorMessage.includes('Project not found') ||
        (error as any)?.response?.status === 404
      ) {
        toast({
          title: 'No Versions',
          description: 'Project not found or has no saved versions.',
          status: 'info',
          duration: 3000,
        });
      } else {
        toast({
          title: 'Error',
          description: errorMessage,
          status: 'error',
          duration: 5000,
        });
      }
    }
  }, [error, isOpen, toast]);

  const handleLoad = (version: Version) => {
    if (hasUnsavedChanges) {
      setVersionToRestore(version);
      onRestoreDialogOpen();
    } else {
      performRestore(version.id);
    }
  };

  const performRestore = async (versionId: string) => {
    setIsRestoring(true);
    try {
      await onLoadVersion(versionId);
      onClose();
    } catch (error) {
      logger.error('Failed to restore version:', error);
      toast({
        title: 'Restoration Failed',
        description: 'Unable to restore the selected version. Please try again.',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const handleSaveAndRestore = async () => {
    if (!versionToRestore || !onSaveCurrentVersion) return;
    
    setIsSavingBeforeRestore(true);
    try {
      // Generate a timestamp-based version name
      const timestamp = new Date().toLocaleString();
      await onSaveCurrentVersion(`Auto-saved before restore - ${timestamp}`);
      
      // After saving, perform the restore
      onRestoreDialogClose();
      await performRestore(versionToRestore.id);
    } catch (error) {
      logger.error('Failed to save before restore:', error);
      toast({
        title: 'Save Failed',
        description: 'Unable to save current changes. Please try again.',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsSavingBeforeRestore(false);
    }
  };

  const handleDiscardAndRestore = async () => {
    if (!versionToRestore) return;
    
    onRestoreDialogClose();
    await performRestore(versionToRestore.id);
  };

  const handleDelete = async (versionId: string) => {
    setVersionToDelete(versions.find(v => v.id === versionId) || null);
    onAlertOpen();
  };

  const confirmDeleteVersion = async () => {
    if (!versionToDelete) return;

    onAlertClose(); // Close confirmation dialog

    deleteVersionMutation.mutate(
      { projectId, versionId: versionToDelete.id },
      {
        onSuccess: () => {
          toast({
            title: 'Version Deleted',
            description: `Successfully deleted version: ${versionToDelete.name}`,
            status: 'info',
            duration: 3000,
          });
          setVersionToDelete(null);
        },
        onError: error => {
          logger.error(`Error deleting version ${versionToDelete.id}:`, error);
          toast({
            title: 'Error Deleting Version',
            description:
              (error as any)?.message ||
              'Failed to delete the selected version.',
            status: 'error',
            duration: 5000,
          });
          setVersionToDelete(null);
        },
      }
    );
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent bg="white" _dark={{ bg: 'gray.800' }}>
          <ModalHeader 
            color="gray.800" 
            borderBottomWidth="1px"
            borderColor="gray.200"
            _dark={{ 
              color: 'gray.200',
              borderColor: 'gray.700' 
            }}
          >
            Version Management
          </ModalHeader>
          <ModalCloseButton 
            color="gray.500"
            _dark={{ color: 'gray.400' }}
          />
          <ModalBody>
            {/* Working Draft Indicator */}
            <Box
              p={4}
              mb={4}
              borderWidth="1px"
              borderRadius="lg"
              borderColor="blue.200"
              bg="blue.50"
              _dark={{ bg: 'blue.900', borderColor: 'blue.700' }}
            >
              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <HStack>
                    <Badge colorScheme="blue" fontSize="sm">
                      Working Draft
                    </Badge>
                    <Text 
                      fontWeight="semibold"
                      color="gray.800"
                      _dark={{ color: 'gray.200' }}
                    >
                      Live Editor
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                    Your active document - always editable and separate from saved versions
                  </Text>
                </VStack>
                {hasUnsavedChanges && (
                  <Badge colorScheme="orange" fontSize="xs">
                    Unsaved Changes
                  </Badge>
                )}
              </HStack>
            </Box>

            <Divider 
              mb={4} 
              borderColor="gray.200"
              _dark={{ borderColor: 'gray.600' }}
            />

            {/* Version History List */}
            {isLoading ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="200px"
              >
                <Spinner 
                  size="xl" 
                  color="blue.500"
                  _dark={{ color: 'blue.400' }}
                />
              </Box>
            ) : versions.length === 0 ? (
              <Box p={4}>
                <Text 
                  textAlign="center" 
                  color="gray.500"
                  _dark={{ color: 'gray.400' }}
                >
                  No saved versions yet. Save your first version to create a snapshot.
                </Text>
              </Box>
            ) : (
              <VStack spacing={3} align="stretch">
                <VStack align="start" spacing={1} mb={2}>
                  <Text 
                    fontSize="sm" 
                    fontWeight="semibold" 
                    color="gray.700"
                    _dark={{ color: 'gray.300' }}
                  >
                    Saved Versions
                  </Text>
                  <Text 
                    fontSize="xs" 
                    color="gray.500"
                    _dark={{ color: 'gray.400' }}
                  >
                    Restore any version to continue editing from that point
                  </Text>
                </VStack>
                
                {versions.map(version => (
                  <HStack
                    key={version.id}
                    justify="space-between"
                    p={3}
                    borderWidth="1px"
                    borderRadius="lg"
                    borderColor="gray.200"
                    bg="white"
                    _dark={{ 
                      bg: 'gray.700', 
                      borderColor: 'gray.600',
                      _hover: { bg: 'gray.600' }
                    }}
                    _hover={{ 
                      bg: 'gray.50'
                    }}
                    transition="all 0.2s"
                  >
                    <VStack align="start" spacing={1}>
                      <Text 
                        fontWeight="medium"
                        color="gray.800"
                        _dark={{ color: 'gray.200' }}
                      >
                        {version.name}
                      </Text>
                      <Text 
                        fontSize="sm" 
                        color="gray.500"
                        _dark={{ color: 'gray.400' }}
                      >
                        {format(
                          new Date(version.createdAt),
                          'MMM d, yyyy h:mm a'
                        )}
                      </Text>
                    </VStack>
                    <HStack spacing={2}>
                      <Tooltip label="Restore this version" placement="top">
                        <IconButton
                          aria-label="Restore version"
                          icon={<Icon as={FaHistory} color="blue.500" _dark={{ color: 'blue.400' }} />}
                          onClick={() => handleLoad(version)}
                          size="sm"
                          variant="ghost"
                          _hover={{
                            bg: 'blue.50',
                            _dark: { bg: 'blue.900' }
                          }}
                        />
                      </Tooltip>
                      <Tooltip label="Delete this version" placement="top">
                        <IconButton
                          aria-label="Delete version"
                          icon={<Icon as={FaTrash} color="red.500" _dark={{ color: 'red.400' }} />}
                          onClick={() => handleDelete(version.id)}
                          size="sm"
                          variant="ghost"
                          isDisabled={deleteVersionMutation.isPending}
                          _hover={{
                            bg: 'red.50',
                            _dark: { bg: 'red.900' }
                          }}
                        />
                      </Tooltip>
                    </HStack>
                  </HStack>
                ))}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter
            borderTopWidth="1px"
            borderColor="gray.200"
            _dark={{ borderColor: 'gray.700' }}
          >
            <Button 
              variant="outline" 
              onClick={onClose}
              borderColor="gray.300"
              color="gray.700"
              _dark={{ 
                borderColor: 'gray.600',
                color: 'gray.300',
                _hover: { bg: 'gray.700' }
              }}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={onAlertClose}
      >
        <AlertDialogOverlay />
        <AlertDialogContent
          bg="white"
          _dark={{ bg: 'gray.800' }}
        >
          <AlertDialogHeader 
            fontSize="lg" 
            fontWeight="bold"
            color="gray.800"
            _dark={{ color: 'gray.200' }}
          >
            Delete Version
          </AlertDialogHeader>

          <AlertDialogBody
            color="gray.700"
            _dark={{ color: 'gray.300' }}
          >
            Are you sure you want to delete version{' '}
            <Text as="span" fontWeight="bold">
              "{versionToDelete?.name || 'Unnamed Version'}"
            </Text>
            ? This action cannot be undone.
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button 
              ref={cancelRef} 
              onClick={onAlertClose}
              variant="ghost"
              _dark={{
                _hover: { bg: 'gray.700' }
              }}
            >
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={confirmDeleteVersion}
              ml={3}
              isLoading={deleteVersionMutation.isPending}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore Version Dialog */}
      {versionToRestore && (
        <RestoreVersionDialog
          isOpen={isRestoreDialogOpen}
          onClose={onRestoreDialogClose}
          onSaveAndRestore={handleSaveAndRestore}
          onDiscardAndRestore={handleDiscardAndRestore}
          versionName={versionToRestore.name || 'Unnamed Version'}
          isSaving={isSavingBeforeRestore}
          isRestoring={isRestoring}
        />
      )}
    </>
  );
};

export default VersionsHistoryModal;
