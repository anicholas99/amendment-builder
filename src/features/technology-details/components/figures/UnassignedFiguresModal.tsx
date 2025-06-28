import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Button,
  Image,
  Box,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
  Badge,
  IconButton,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiDownload, FiCheck } from 'react-icons/fi';
import { useUnassignedFigures } from '@/hooks/api/useUnassignedFigures';
import { useUpdateFigure } from '@/hooks/api/useUpdateFigure';
import { useQueryClient } from '@tanstack/react-query';
import { inventionQueryKeys } from '@/lib/queryKeys/inventionKeys';
import { logger } from '@/lib/monitoring/logger';
import { queryKeys } from '@/config/reactQueryConfig';
import { Figures } from './carousel-components/types';
import {
  modalStyles,
  modalButtonStyles,
} from '@/components/common/ModalStyles';

// Simple file size formatter
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

interface UnassignedFiguresModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  targetFigureKey: string;
  onFigureAssigned?: (figureId: string, figureKey: string) => void;
}

export const UnassignedFiguresModal: React.FC<UnassignedFiguresModalProps> =
  React.memo(
    ({ isOpen, onClose, projectId, targetFigureKey, onFigureAssigned }) => {
      const toast = useToast();
      const queryClient = useQueryClient();
      const updateFigureMutation = useUpdateFigure();

      // Theme colors
      const borderColor = useColorModeValue('gray.200', 'gray.700');
      const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
      const emptyTextColor = useColorModeValue('gray.500', 'gray.400');
      const cardBorderColor = useColorModeValue('gray.200', 'gray.600');
      const cardHoverBg = useColorModeValue('gray.50', 'gray.800');
      const cardHoverBorder = useColorModeValue('blue.400', 'blue.300');
      const imageBg = useColorModeValue('gray.100', 'gray.700');

      const {
        data: unassignedFigures,
        isLoading,
        error,
        refetch,
      } = useUnassignedFigures(projectId);

      const handleAssignFigure = (figureId: string) => {
        logger.info('[UnassignedFiguresModal] Assigning figure', {
          figureId,
          targetFigureKey,
          projectId,
        });

        updateFigureMutation.mutate(
          {
            projectId,
            figureId,
            updates: { figureKey: targetFigureKey },
          },
          {
            onSuccess: async (assignedFigureResponse: any) => {
              // Invalidate the unassigned figures query to ensure consistency
              const unassignedQueryKey = [
                ...queryKeys.projects.figures(projectId),
                'unassigned',
              ];

              queryClient.invalidateQueries({
                queryKey: unassignedQueryKey,
                exact: true,
              });

              toast({
                title: 'Figure assigned',
                description: `Figure has been assigned to ${targetFigureKey}`,
                status: 'success',
                duration: 3000,
                isClosable: true,
              });
              onFigureAssigned?.(assignedFigureResponse.id, targetFigureKey);
              onClose();
            },
            onError: (error: Error) => {
              toast({
                title: 'Failed to assign figure',
                description: error.message || 'Unknown error occurred',
                status: 'error',
                duration: 5000,
                isClosable: true,
              });
            },
          }
        );
      };

      return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay {...modalStyles.overlay} />
          <ModalContent maxW="800px">
            <ModalHeader {...modalStyles.header} borderColor={borderColor}>
              <VStack align="start" spacing={1}>
                <Text>Unassigned Figures</Text>
                <Text fontSize="sm" color={mutedTextColor} fontWeight="normal">
                  Select a figure to assign to {targetFigureKey}
                </Text>
              </VStack>
            </ModalHeader>
            <ModalCloseButton />

            <ModalBody {...modalStyles.body}>
              {isLoading ? (
                <Box textAlign="center" py={8}>
                  <Spinner size="lg" />
                  <Text mt={4} color={mutedTextColor}>
                    Loading unassigned figures...
                  </Text>
                </Box>
              ) : error ? (
                <Alert status="error">
                  <AlertIcon />
                  Failed to load unassigned figures
                </Alert>
              ) : !unassignedFigures || unassignedFigures.length === 0 ? (
                <Alert status="info">
                  <AlertIcon />
                  No unassigned figures available. Upload a figure first without
                  assigning it to a specific figure key.
                </Alert>
              ) : (
                <VStack spacing={4} align="stretch">
                  {unassignedFigures.map(figure => (
                    <Box
                      key={figure.id}
                      p={4}
                      borderWidth={1}
                      borderRadius="md"
                      borderColor={cardBorderColor}
                      _hover={{ borderColor: cardHoverBorder, bg: cardHoverBg }}
                      transition="border-color 0.15s ease-out, background-color 0.15s ease-out"
                    >
                      <HStack spacing={4} align="start">
                        {/* Figure preview */}
                        <Box flexShrink={0}>
                          <Image
                            src={figure.url}
                            alt={figure.fileName}
                            maxW="150px"
                            maxH="150px"
                            objectFit="contain"
                            borderRadius="md"
                            bg={imageBg}
                            p={2}
                          />
                        </Box>

                        {/* Figure details */}
                        <VStack align="start" flex={1} spacing={2}>
                          <Text fontWeight="medium">{figure.fileName}</Text>
                          {figure.description && (
                            <Text fontSize="sm" color={mutedTextColor}>
                              {figure.description}
                            </Text>
                          )}
                          <HStack
                            spacing={4}
                            fontSize="sm"
                            color={emptyTextColor}
                          >
                            <Text>{formatFileSize(figure.sizeBytes)}</Text>
                            <Text>
                              Uploaded{' '}
                              {new Date(figure.uploadedAt).toLocaleDateString()}
                            </Text>
                          </HStack>
                        </VStack>

                        {/* Actions */}
                        <VStack spacing={2}>
                          <Button
                            type="button"
                            {...modalButtonStyles.primary}
                            leftIcon={<FiCheck />}
                            onClick={() => handleAssignFigure(figure.id)}
                            isLoading={updateFigureMutation.isPending}
                          >
                            Assign
                          </Button>
                          <Tooltip label="Download figure">
                            <IconButton
                              size="sm"
                              variant="ghost"
                              icon={<FiDownload />}
                              aria-label="Download figure"
                              as="a"
                              href={figure.url}
                              download={figure.fileName}
                            />
                          </Tooltip>
                        </VStack>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      );
    }
  );

UnassignedFiguresModal.displayName = 'UnassignedFiguresModal';
