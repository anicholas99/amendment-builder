import React from 'react';
import {
  Box,
  Flex,
  Text,
  Icon,
  Heading,
  Center,
  IconButton,
  Badge,
  VStack,
  HStack,
  Tag,
  TagLabel,
  Image as ChakraImage,
  useColorModeValue,
  Spinner,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { FiFileText, FiImage, FiX, FiInbox } from 'react-icons/fi';
import { UploadedFigure } from '../hooks/useTechnologyInputFileHandler';

interface TechnologyUploadedFilesListProps {
  uploadedTextFiles: string[];
  uploadedFigures: UploadedFigure[];
  onRemoveTextFile?: (fileName: string) => void;
  onRemoveFigure?: (figureId: string) => void;
  uploadingFiles?: string[]; // New prop for files currently being uploaded
}

/**
 * Component to display a list of uploaded files with counts and types
 */
export const TechnologyUploadedFilesList: React.FC<
  TechnologyUploadedFilesListProps
> = ({
  uploadedTextFiles = [],
  uploadedFigures = [],
  onRemoveTextFile,
  onRemoveFigure,
  uploadingFiles = [],
}) => {
  const totalFiles =
    uploadedTextFiles.length + uploadedFigures.length + uploadingFiles.length;
  const itemBg = useColorModeValue('white', 'gray.800');
  const itemHoverBg = useColorModeValue('gray.100', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const subtleTextColor = useColorModeValue('gray.500', 'gray.400');
  const iconColor = useColorModeValue('gray.400', 'gray.500');
  const removeIconHoverColor = useColorModeValue('red.500', 'red.300');
  const placeholderColor = useColorModeValue('gray.400', 'gray.500');
  const imageBorderColor = useColorModeValue('gray.200', 'gray.600');
  const imageFallbackBg = useColorModeValue('gray.100', 'gray.700');
  const spinnerColor = useColorModeValue('blue.500', 'blue.300');

  // State to track failed image loads
  const [failedImages, setFailedImages] = React.useState<Set<string>>(
    new Set()
  );

  const handleImageError = (figureId: string) => {
    setFailedImages(prev => new Set(prev).add(figureId));
  };

  return (
    <VStack spacing={2} align="stretch" w="100%" h="100%">
      {totalFiles > 0 ? (
        <VStack spacing={2} align="stretch" flex="1" overflowY="auto" pr={1}>
          {/* Files being uploaded */}
          {uploadingFiles.length > 0 && (
            <VStack align="stretch" spacing={2}>
              {uploadingFiles.map((fileName, index) => (
                <Flex
                  key={`uploading-${fileName}-${index}`}
                  p={3}
                  borderRadius="md"
                  bg={itemBg}
                  align="center"
                  transition="background-color 0.2s"
                  boxShadow="xs"
                  opacity={0.8}
                >
                  <Spinner size="sm" color={spinnerColor} mr={3} />
                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                    color={textColor}
                    noOfLines={1}
                    flex="1"
                    title={fileName}
                  >
                    {fileName}
                  </Text>
                  <Badge colorScheme="blue" variant="subtle" ml={2}>
                    Uploading...
                  </Badge>
                </Flex>
              ))}
            </VStack>
          )}

          {/* Uploaded text files */}
          {uploadedTextFiles.length > 0 && (
            <VStack align="stretch" spacing={2}>
              {uploadedTextFiles.map(fileName => (
                <Flex
                  key={fileName}
                  p={3}
                  borderRadius="md"
                  bg={itemBg}
                  align="center"
                  transition="background-color 0.2s"
                  boxShadow="xs"
                  _hover={{ bg: itemHoverBg, boxShadow: 'sm' }}
                >
                  <Box as={FiFileText} color={iconColor} boxSize={5} mr={3} />
                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                    color={textColor}
                    noOfLines={1}
                    flex="1"
                    title={fileName}
                  >
                    {fileName}
                  </Text>
                  <Tag
                    size="sm"
                    colorScheme="blue"
                    variant="subtle"
                    ml={2}
                    flexShrink={0}
                  >
                    Text
                  </Tag>
                  {onRemoveTextFile && (
                    <IconButton
                      aria-label={`Remove ${fileName}`}
                      icon={<Icon as={FiX} />}
                      size="sm"
                      variant="ghost"
                      color={subtleTextColor}
                      marginLeft={2}
                      _hover={{
                        color: removeIconHoverColor,
                        bg: 'transparent',
                      }}
                      onClick={() => onRemoveTextFile(fileName)}
                    />
                  )}
                </Flex>
              ))}
            </VStack>
          )}

          {uploadedFigures.length > 0 && (
            <VStack
              align="stretch"
              spacing={2}
              mt={uploadedTextFiles.length > 0 ? 4 : 0}
            >
              {uploadedFigures.map(figure => (
                <Flex
                  key={figure.id}
                  p={3}
                  borderRadius="md"
                  bg={itemBg}
                  align="center"
                  transition="background-color 0.2s"
                  boxShadow="xs"
                  _hover={{ bg: itemHoverBg, boxShadow: 'sm' }}
                >
                  {/* Image preview with fallback */}
                  {!failedImages.has(figure.id) ? (
                    <ChakraImage
                      src={figure.url}
                      alt={`Preview of ${figure.fileName}`}
                      boxSize="40px"
                      objectFit="cover"
                      borderRadius="sm"
                      borderWidth="1px"
                      borderColor={imageBorderColor}
                      mr={3}
                      onError={() => handleImageError(figure.id)}
                      fallback={
                        <Box
                          width="40px"
                          height="40px"
                          borderRadius="sm"
                          borderWidth="1px"
                          borderColor={imageBorderColor}
                          mr={3}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          bg={imageFallbackBg}
                        >
                          <Icon as={FiImage} color={iconColor} boxSize={5} />
                        </Box>
                      }
                    />
                  ) : (
                    <Box
                      width="40px"
                      height="40px"
                      borderRadius="sm"
                      borderWidth="1px"
                      borderColor={imageBorderColor}
                      mr={3}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      bg={imageFallbackBg}
                    >
                      <Icon as={FiImage} color={iconColor} boxSize={5} />
                    </Box>
                  )}
                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                    color={textColor}
                    noOfLines={1}
                    flex="1"
                    title={figure.fileName}
                  >
                    {figure.fileName}
                  </Text>
                  <Tag
                    size="sm"
                    colorScheme="purple"
                    variant="subtle"
                    ml={2}
                    flexShrink={0}
                  >
                    Image
                  </Tag>
                  {onRemoveFigure && (
                    <IconButton
                      aria-label={`Remove ${figure.fileName}`}
                      icon={<Icon as={FiX} />}
                      size="sm"
                      variant="ghost"
                      color={subtleTextColor}
                      marginLeft={2}
                      _hover={{
                        color: removeIconHoverColor,
                        bg: 'transparent',
                      }}
                      onClick={() => onRemoveFigure(figure.id)}
                    />
                  )}
                </Flex>
              ))}
            </VStack>
          )}
        </VStack>
      ) : (
        <Box as={Center} flex="1" h="100%">
          <VStack spacing={2} color={placeholderColor}>
            <Icon as={FiInbox} boxSize={8} />
            <Text fontSize="sm">No files uploaded yet.</Text>
          </VStack>
        </Box>
      )}
    </VStack>
  );
};
