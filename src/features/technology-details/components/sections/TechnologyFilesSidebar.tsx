import React from 'react';
import {
  Box,
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Badge,
  Icon,
  useColorModeValue,
  Fade,
} from '@chakra-ui/react';
import { FiUpload, FiUploadCloud, FiFile } from 'react-icons/fi';
import { TechnologyUploadedFilesList } from '../TechnologyUploadedFilesList';
import { UploadedFigure } from '../../hooks/useTechnologyInputFileHandler';

interface TechnologyFilesSidebarProps {
  uploadedFiles: string[];
  uploadedFigures: UploadedFigure[];
  uploadingFiles: string[];
  isDragging: boolean;
  onRemoveTextFile?: (fileName: string) => void;
  onRemoveFigure?: (figureId: string) => void;
  onFileInputClick: () => void;
  onDrop: (e: React.DragEvent<HTMLElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLElement>) => void;
}

export const TechnologyFilesSidebar: React.FC<TechnologyFilesSidebarProps> = ({
  uploadedFiles,
  uploadedFigures,
  uploadingFiles,
  isDragging,
  onRemoveTextFile,
  onRemoveFigure,
  onFileInputClick,
  onDrop,
  onDragOver,
  onDragLeave,
}) => {
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const contentBg = useColorModeValue('white', 'gray.800');
  const mutedTextColor = useColorModeValue('gray.500', 'gray.400');
  const iconColor = useColorModeValue('blue.500', 'blue.300');
  const dashedBorderColor = useColorModeValue('gray.300', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const dropzoneBg = useColorModeValue('gray.50', 'gray.900');
  const insetShadow = useColorModeValue(
    'inset 0 1px 2px rgba(0,0,0,0.05)',
    'inset 0 1px 2px rgba(0,0,0,0.2)'
  );

  const totalFiles = uploadedFiles.length + uploadedFigures.length;
  const hasFiles = totalFiles > 0 || uploadingFiles.length > 0;

  return (
    <Box
      height="100%"
      borderWidth="2px"
      borderColor={borderColor}
      bg={contentBg}
      borderRadius="lg"
      overflow="hidden"
      transition="border-color 0.2s, box-shadow 0.2s"
      boxShadow={insetShadow}
      _hover={{
        borderColor: useColorModeValue('blue.400', 'blue.500'),
      }}
    >
      <Box p={4} height="100%" display="flex" flexDirection="column">
        <VStack spacing={3} align="stretch" height="100%">
          {/* Header */}
          <HStack justify="space-between" pb={1}>
            <HStack spacing={2}>
              <Icon as={FiFile} color={iconColor} boxSize={4} />
              <Text fontWeight="medium" color="text.primary" fontSize="sm">
                Uploaded Files
              </Text>
            </HStack>
            {totalFiles > 0 && (
              <Badge
                colorScheme="blue"
                fontSize="xs"
                px={2}
                borderRadius="full"
              >
                {totalFiles}
              </Badge>
            )}
          </HStack>

          {/* Files Area */}
          <Box
            flex="1"
            position="relative"
            borderRadius="md"
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            overflow="hidden"
          >
            {!hasFiles ? (
              <Box
                height="100%"
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderWidth="2px"
                className="border-dashed"
                borderColor={isDragging ? iconColor : dashedBorderColor}
                borderRadius="md"
                bg={dropzoneBg}
                p={4}
                transition="all 0.2s"
                cursor="pointer"
                onClick={onFileInputClick}
                _hover={{
                  borderColor: iconColor,
                  bg: hoverBg,
                }}
              >
                <VStack spacing={2}>
                  <Icon as={FiUpload} boxSize={6} color={iconColor} />
                  <VStack spacing={0}>
                    <Text
                      fontSize="sm"
                      color="text.primary"
                      fontWeight="medium"
                    >
                      Drop files here
                    </Text>
                    <Text fontSize="xs" color={mutedTextColor}>
                      or click to browse
                    </Text>
                  </VStack>
                </VStack>
              </Box>
            ) : (
              <Box height="100%" overflowY="auto" className="thin-scrollbar">
                <TechnologyUploadedFilesList
                  uploadedTextFiles={uploadedFiles}
                  uploadedFigures={uploadedFigures}
                  onRemoveTextFile={onRemoveTextFile}
                  onRemoveFigure={onRemoveFigure}
                  uploadingFiles={uploadingFiles}
                />

                {/* Add more files button */}
                <Box
                  mt={3}
                  p={2}
                  borderWidth="1px"
                  className="border-dashed"
                  borderColor={dashedBorderColor}
                  borderRadius="md"
                  cursor="pointer"
                  onClick={onFileInputClick}
                  transition="all 0.2s"
                  _hover={{
                    borderColor: iconColor,
                    bg: hoverBg,
                  }}
                >
                  <HStack justify="center" spacing={2}>
                    <Icon as={FiUpload} color={iconColor} boxSize={3} />
                    <Text fontSize="xs" color={iconColor} fontWeight="medium">
                      Add more files
                    </Text>
                  </HStack>
                </Box>

                {/* Drag overlay when files exist */}
                <Fade in={isDragging}>
                  {isDragging && (
                    <Box
                      position="absolute"
                      top={0}
                      left={0}
                      right={0}
                      bottom={0}
                      bg="blackAlpha.700"
                      borderRadius="md"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      zIndex={10}
                    >
                      <VStack spacing={3}>
                        <Box
                          bg={useColorModeValue('white', 'gray.700')}
                          p={3}
                          borderRadius="full"
                          boxShadow="md"
                        >
                          <Icon
                            as={FiUploadCloud}
                            boxSize={10}
                            color={iconColor}
                          />
                        </Box>
                        <VStack spacing={0}>
                          <Text
                            fontWeight="semibold"
                            color={useColorModeValue('blue.700', 'blue.100')}
                            fontSize="md"
                          >
                            Drop to add more files
                          </Text>
                          <Text
                            fontSize="sm"
                            color={useColorModeValue('blue.600', 'blue.200')}
                            opacity={0.8}
                          >
                            Release to upload
                          </Text>
                        </VStack>
                      </VStack>
                    </Box>
                  )}
                </Fade>
              </Box>
            )}
          </Box>
        </VStack>
      </Box>
    </Box>
  );
};
