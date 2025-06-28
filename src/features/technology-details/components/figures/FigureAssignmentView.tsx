/**
 * @deprecated This component is part of the legacy "pending figures" system and is no longer used.
 * The new system uses the UnassignedFiguresModal component for managing unassigned figures.
 * This file is kept for reference only and will be removed in a future version.
 */
import React, { useState, useCallback } from 'react';
import { FiX, FiTrash2, FiEye } from 'react-icons/fi';
import { useTimeout } from '@/hooks/useTimeout';

// Chakra UI components
import {
  Box,
  Text,
  Button,
  Image,
  Center,
  IconButton,
  Flex,
  Grid,
  Heading,
  Icon,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
} from '@chakra-ui/react';

import { UploadedFigure } from '../../hooks/useTechnologyInputFileHandler';

export interface FigureAssignmentViewProps {
  uploadedFigures: UploadedFigure[];
  onAssign: (uploadedFigure: UploadedFigure) => void;
  onClose: () => void;
  onRemove?: (figureId: string) => void;
}

/**
 * Component for selecting from uploaded figures to assign to the current figure slot
 */
export const FigureAssignmentView: React.FC<FigureAssignmentViewProps> =
  React.memo(
    ({ uploadedFigures, onAssign, onClose: closeAssignmentView, onRemove }) => {
      const [isPreviewOpen, setIsPreviewOpen] = useState(false);
      const [figureToPreview, setFigureToPreview] =
        useState<UploadedFigure | null>(null);
      const isMountedRef = React.useRef(true);

      // State for timeout management
      const [shouldOpenPreview, setShouldOpenPreview] = useState(false);
      const [shouldClosePreview, setShouldClosePreview] = useState(false);
      const [pendingFigure, setPendingFigure] = useState<UploadedFigure | null>(
        null
      );

      React.useEffect(() => {
        isMountedRef.current = true;
        return () => {
          isMountedRef.current = false;
        };
      }, []);

      // Auto-open preview using useTimeout
      useTimeout(
        () => {
          if (!isMountedRef.current) return;
          if (pendingFigure) {
            handleOpenPreview(pendingFigure);
            setPendingFigure(null);
          }
          setShouldOpenPreview(false);
        },
        shouldOpenPreview ? 500 : null
      );

      // Auto-close preview using useTimeout
      useTimeout(
        () => {
          if (!isMountedRef.current) return;
          handleClosePreview();
          setShouldClosePreview(false);
        },
        shouldClosePreview ? 100 : null
      );

      // Prompt to confirm removal if needed
      const handleRemoveFigure = (figureId: string) => {
        if (onRemove) {
          onRemove(figureId);
        }
      };

      const handleOpenPreview = (figure: UploadedFigure) => {
        if (!isMountedRef.current) return;
        setFigureToPreview(figure);
        setIsPreviewOpen(true);
      };

      const handleClosePreview = () => {
        if (!isMountedRef.current) return;
        setFigureToPreview(null);
        setIsPreviewOpen(false);
      };

      const handleIconMouseEnter = (figure: UploadedFigure) => {
        if (!isMountedRef.current) return;
        // Cancel any pending close
        setShouldClosePreview(false);

        // Schedule opening
        setPendingFigure(figure);
        setShouldOpenPreview(true);
      };

      const handleIconMouseLeave = () => {
        if (!isMountedRef.current) return;
        // Cancel any pending open
        setShouldOpenPreview(false);
        setPendingFigure(null);

        // Schedule closing
        setShouldClosePreview(true);
      };

      const handleModalMouseEnter = () => {
        if (!isMountedRef.current) return;
        // Cancel any pending close when mouse enters modal
        setShouldClosePreview(false);
      };

      const handleModalMouseLeave = () => {
        if (!isMountedRef.current) return;
        // Close immediately when leaving modal
        handleClosePreview();
      };

      return (
        <>
          <Box
            width="100%"
            height="100%"
            bg="white"
            p={2}
            position="relative"
            borderRadius="md"
            overflow="hidden"
            display="flex"
            flexDirection="column"
          >
            <Flex justify="space-between" align="center" mb={2}>
              <Heading size="sm">Select an Uploaded Image</Heading>
              <IconButton
                aria-label="Close selection view"
                icon={<Icon as={FiX} />}
                size="sm"
                variant="ghost"
                onClick={closeAssignmentView}
              />
            </Flex>

            {uploadedFigures.length === 0 ? (
              <Center height="100%" flexDirection="column">
                <Text mb={2} textAlign="center" fontSize="sm">
                  No images available in your upload gallery.
                </Text>
                <Button
                  onClick={closeAssignmentView}
                  size="sm"
                  variant="secondary"
                >
                  Return to Canvas
                </Button>
              </Center>
            ) : (
              <Box flex={1} overflow="auto">
                <Grid templateColumns="repeat(3, 1fr)" gap={2} p={0}>
                  {uploadedFigures.map(figure => (
                    <Box
                      key={figure.id}
                      onClick={() => onAssign(figure)}
                      position="relative"
                      aspectRatio={1}
                      borderWidth="2px"
                      borderColor="border.primary"
                      borderRadius="md"
                      bg="bg.card"
                      cursor="pointer"
                      overflow="hidden"
                      transition="background-color 0.15s ease-out, transform 0.15s ease-out, box-shadow 0.15s ease-out"
                      _hover={{
                        bg: 'gray.50',
                        transform: 'scale(1.02)',
                        boxShadow: 'lg',
                      }}
                    >
                      {/* Image Container */}
                      <Center
                        position="relative"
                        height="100%"
                        width="100%"
                        p={1}
                      >
                        <Image
                          src={figure.url}
                          alt={figure.fileName || 'Uploaded figure'}
                          maxW="100%"
                          maxH="100%"
                          objectFit="contain"
                        />

                        {/* Action buttons */}
                        <Flex
                          position="absolute"
                          top="4px"
                          right="4px"
                          gap="2px"
                        >
                          {/* Preview button */}
                          <Box
                            onMouseEnter={() => handleIconMouseEnter(figure)}
                            onMouseLeave={handleIconMouseLeave}
                            onClick={e => {
                              e.stopPropagation();
                              handleOpenPreview(figure);
                            }}
                          >
                            <IconButton
                              aria-label="Preview Figure"
                              icon={<Icon as={FiEye} />}
                              size="sm"
                              variant="solid"
                              bg="rgba(0, 0, 0, 0.6)"
                              color="white"
                              minW="24px"
                              h="24px"
                              p={0}
                              _hover={{ bg: 'rgba(0, 0, 0, 0.8)' }}
                            />
                          </Box>

                          {/* Remove button */}
                          {onRemove && (
                            <Box
                              onClick={e => {
                                e.stopPropagation();
                                handleRemoveFigure(figure.id);
                              }}
                            >
                              <IconButton
                                aria-label="Remove Figure"
                                icon={<Icon as={FiTrash2} />}
                                size="sm"
                                variant="solid"
                                bg="rgba(0, 0, 0, 0.6)"
                                color="white"
                                minW="24px"
                                h="24px"
                                p={0}
                                _hover={{ bg: 'rgba(0, 0, 0, 0.8)' }}
                              />
                            </Box>
                          )}
                        </Flex>
                      </Center>

                      {/* Figure Name */}
                      <Flex
                        position="absolute"
                        bottom={0}
                        left={0}
                        right={0}
                        bg="rgba(0,0,0,0.6)"
                        p={1}
                        justify="space-between"
                        align="center"
                      >
                        <Text fontSize="xs" color="white" isTruncated>
                          {figure.fileName}
                        </Text>
                        <Badge
                          colorScheme={
                            figure.type?.startsWith('image') ? 'green' : 'blue'
                          }
                          fontSize="2xs"
                        >
                          {figure.type?.split('/')[1] || 'file'}
                        </Badge>
                      </Flex>
                    </Box>
                  ))}
                </Grid>
              </Box>
            )}
          </Box>

          {/* Preview Modal */}
          {isPreviewOpen && figureToPreview && (
            <Modal
              isOpen={isPreviewOpen}
              onClose={handleClosePreview}
              size="xl"
              isCentered
              preserveScrollBarGap
              blockScrollOnMount
              returnFocusOnClose
            >
              <ModalOverlay
                bg="rgba(0, 0, 0, 0.4)"
                onMouseEnter={handleModalMouseEnter}
                onMouseLeave={handleModalMouseLeave}
              />
              <ModalContent
                onMouseEnter={handleModalMouseEnter}
                onMouseLeave={handleModalMouseLeave}
                bg="transparent"
                boxShadow="none"
                maxW="80vw"
                maxH="80vh"
              >
                <ModalBody p={0} position="relative">
                  <IconButton
                    aria-label="Close Preview"
                    icon={<Icon as={FiX} boxSize={6} />}
                    onClick={handleClosePreview}
                    position="absolute"
                    top={-10}
                    right={-10}
                    bg="white"
                    borderRadius="full"
                    size="sm"
                    boxShadow="lg"
                    _hover={{ transform: 'scale(1.1)' }}
                  />
                  <Image
                    src={figureToPreview.url}
                    alt={`Preview of ${figureToPreview.fileName}`}
                    maxW="100%"
                    maxH="100%"
                    objectFit="contain"
                    boxShadow="2xl"
                    borderRadius="md"
                  />
                </ModalBody>
              </ModalContent>
            </Modal>
          )}
        </>
      );
    }
  );

FigureAssignmentView.displayName = 'FigureAssignmentView';

export default FigureAssignmentView;
