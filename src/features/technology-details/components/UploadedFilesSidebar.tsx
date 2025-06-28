import React from 'react';
import { Box, Text, Icon, Flex, IconButton, Center } from '@chakra-ui/react';
import {
  VStack,
  SimpleGrid,
  AspectRatio,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiFile, FiTrash2 } from 'react-icons/fi';

interface UploadedFilesSidebarProps {
  uploadedFiles: string[];
  clearUploadedFile: (fileName: string) => void;
  isProcessing: boolean;
  isUploading: boolean;
}

/**
 * Sidebar component that displays uploaded files categorized as documents and figures
 */
export const UploadedFilesSidebar: React.FC<UploadedFilesSidebarProps> =
  React.memo(
    ({ uploadedFiles, clearUploadedFile, isProcessing, isUploading }) => {
      // Move all color mode values outside of callbacks
      const bgSecondary = useColorModeValue('bg.secondary', 'bg.secondary');
      const borderPrimary = useColorModeValue(
        'border.primary',
        'border.primary'
      );
      const borderSecondary = useColorModeValue(
        'border.secondary',
        'border.secondary'
      );
      const bgCard = useColorModeValue('bg.card', 'bg.card');
      const bgHover = useColorModeValue('bg.hover', 'bg.hoverDark');
      const borderHover = useColorModeValue('blue.200', 'blue.700');
      const bgTertiary = useColorModeValue('bg.tertiary', 'bg.tertiary');

      // Helper function to determine if a file is an image
      const isImageFile = (fileName: string) => {
        return !!fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i);
      };

      // Filter files into documents and figures
      const documentFiles = uploadedFiles.filter(
        fileName => !isImageFile(fileName)
      );
      const figureFiles = uploadedFiles.filter(isImageFile);

      return (
        <Box
          width="300px"
          bg={bgSecondary}
          borderLeft="1px solid"
          borderColor={borderPrimary}
          overflowY="auto"
          display="flex"
          flexDirection="column"
          className="thin-scrollbar"
        >
          <Box p={6}>
            <Text fontSize="lg" fontWeight="semibold" color="gray.700" mb={4}>
              Uploaded Files
            </Text>

            {uploadedFiles.length === 0 ? (
              <Center py={8}>
                <VStack spacing={3}>
                  <Icon as={FiFile} boxSize={8} color="gray.400" />
                  <Text color="gray.500" fontSize="sm" textAlign="center">
                    No files uploaded yet
                  </Text>
                </VStack>
              </Center>
            ) : (
              <VStack spacing={6} align="stretch">
                {/* Documents Section */}
                {documentFiles.length > 0 && (
                  <Box>
                    <Text
                      fontWeight="semibold"
                      color="gray.600"
                      mb={3}
                      fontSize="sm"
                    >
                      Documents
                    </Text>
                    <VStack spacing={2} align="stretch">
                      {documentFiles.map((fileName, index) => (
                        <Flex
                          key={`${fileName}-${index}`}
                          p={3}
                          bg={bgCard}
                          borderRadius="md"
                          borderColor={borderPrimary}
                          align="center"
                          transition="border-color 0.15s ease-out, background-color 0.15s ease-out, transform 0.15s ease-out, box-shadow 0.15s ease-out"
                          style={{
                            borderWidth: '1px',
                            borderStyle: 'solid',
                          }}
                          _hover={{
                            borderColor: borderHover,
                            bg: bgHover,
                            transform: 'translateY(-1px)',
                            boxShadow: 'sm',
                          }}
                        >
                          <Icon
                            as={FiFile}
                            color="blue.500"
                            boxSize={4}
                            className="mr-2"
                          />
                          <Text
                            fontSize="sm"
                            color="gray.700"
                            noOfLines={1}
                            flex="1"
                          >
                            {fileName}
                          </Text>
                          <IconButton
                            aria-label="Remove file"
                            icon={<FiTrash2 size="14px" />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => clearUploadedFile(fileName)}
                            disabled={isUploading || isProcessing}
                          />
                        </Flex>
                      ))}
                    </VStack>
                  </Box>
                )}

                {/* Figures Section */}
                {figureFiles.length > 0 && (
                  <Box>
                    <Text
                      fontWeight="semibold"
                      color="gray.600"
                      mb={3}
                      fontSize="sm"
                    >
                      Figures
                    </Text>
                    <SimpleGrid columns={2} spacing={2}>
                      {figureFiles.map((fileName, index) => (
                        <Box
                          key={`${fileName}-${index}`}
                          position="relative"
                          borderRadius="md"
                          overflow="hidden"
                          borderWidth="1px"
                          borderColor={borderPrimary}
                          bg={bgCard}
                          _hover={{
                            borderColor: borderHover,
                            transform: 'translateY(-1px)',
                            boxShadow: 'sm',
                          }}
                          transition="border-color 0.15s ease-out, transform 0.15s ease-out, box-shadow 0.15s ease-out"
                        >
                          <AspectRatio ratio={1}>
                            <Box bg={bgTertiary} p={2}>
                              <Text
                                fontSize="sm"
                                color="gray.600"
                                noOfLines={2}
                                textAlign="center"
                              >
                                {fileName}
                              </Text>
                            </Box>
                          </AspectRatio>
                          <IconButton
                            aria-label="Remove figure"
                            icon={<FiTrash2 size="12px" />}
                            size="sm"
                            variant="solid"
                            colorScheme="red"
                            onClick={() => clearUploadedFile(fileName)}
                            disabled={isUploading || isProcessing}
                            className="absolute top-1 right-1 opacity-80"
                          />
                        </Box>
                      ))}
                    </SimpleGrid>
                  </Box>
                )}
              </VStack>
            )}
          </Box>
        </Box>
      );
    }
  );

UploadedFilesSidebar.displayName = 'UploadedFilesSidebar';
