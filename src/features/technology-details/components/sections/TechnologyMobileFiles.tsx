import React from 'react';
import {
  Box,
  Card,
  CardBody,
  HStack,
  Text,
  Badge,
  Icon,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiUploadCloud } from 'react-icons/fi';
import { TechnologyUploadedFilesList } from '../TechnologyUploadedFilesList';
import { UploadedFigure } from '../../hooks/useTechnologyInputFileHandler';

interface TechnologyMobileFilesProps {
  uploadedFiles: string[];
  uploadedFigures: UploadedFigure[];
  uploadingFiles: string[];
  isDragging: boolean;
  onRemoveTextFile?: (fileName: string) => void;
  onRemoveFigure?: (figureId: string) => void;
  onDrop: (e: React.DragEvent<HTMLElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLElement>) => void;
}

export const TechnologyMobileFiles: React.FC<TechnologyMobileFilesProps> = ({
  uploadedFiles,
  uploadedFigures,
  uploadingFiles,
  isDragging,
  onRemoveTextFile,
  onRemoveFigure,
  onDrop,
  onDragOver,
  onDragLeave,
}) => {
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const contentBg = useColorModeValue('white', 'gray.800');
  const iconColor = useColorModeValue('blue.500', 'blue.300');

  const totalFiles = uploadedFiles.length + uploadedFigures.length;

  if (totalFiles === 0) return null;

  return (
    <Box display={{ base: 'block', lg: 'none' }} mt={4}>
      <Card
        variant="outline"
        borderColor={borderColor}
        bg={contentBg}
        boxShadow="sm"
      >
        <CardBody>
          <HStack justify="space-between" mb={3}>
            <Text fontWeight="semibold" color="text.primary">
              Uploaded Files
            </Text>
            <Badge colorScheme="blue" fontSize="xs">
              {totalFiles}
            </Badge>
          </HStack>
          <Box
            maxH="200px"
            overflowY="auto"
            position="relative"
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            borderRadius="md"
            style={{
              borderWidth: '2px',
              borderStyle: isDragging ? 'dashed' : 'solid',
              borderColor: isDragging ? iconColor : 'transparent',
            }}
          >
            <TechnologyUploadedFilesList
              uploadedTextFiles={uploadedFiles}
              uploadedFigures={uploadedFigures}
              onRemoveTextFile={onRemoveTextFile}
              onRemoveFigure={onRemoveFigure}
              uploadingFiles={uploadingFiles}
            />

            {/* Mobile drag overlay */}
            {isDragging && (
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bg={useColorModeValue(
                  'rgba(237, 247, 255, 0.9)',
                  'rgba(26, 32, 44, 0.8)'
                )}
                borderRadius="md"
                display="flex"
                alignItems="center"
                justifyContent="center"
                zIndex={10}
                className="pointer-events-none"
              >
                <VStack spacing={3}>
                  <Icon
                    as={FiUploadCloud}
                    boxSize={10}
                    color={useColorModeValue('blue.500', 'blue.200')}
                  />
                  <Text
                    fontWeight="semibold"
                    color={useColorModeValue('blue.700', 'blue.100')}
                    fontSize="md"
                  >
                    Drop files anywhere to upload
                  </Text>
                </VStack>
              </Box>
            )}
          </Box>
        </CardBody>
      </Card>
    </Box>
  );
};
