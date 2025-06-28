import React, { useState, useCallback } from 'react';
import {
  Box,
  Text,
  Button,
  Icon,
  VStack,
  Center,
  useDisclosure,
} from '@chakra-ui/react';
import { FiUpload, FiImage, FiFolder } from 'react-icons/fi';
import { FigureUploadAreaProps } from './types';
import { useThemeContext } from '../../../../../contexts/ThemeContext';
import { UnassignedFiguresModal } from '../UnassignedFiguresModal';

/**
 * Custom hook to get colors based on theme mode
 */
const useColorModeValue = (lightValue: string, darkValue: string): string => {
  const { isDarkMode } = useThemeContext();
  return isDarkMode ? darkValue : lightValue;
};

/**
 * Component for when no figure image is available, showing upload options
 */
const FigureUploadArea: React.FC<FigureUploadAreaProps> = React.memo(
  ({
    figureKey,
    onUpload,
    fullView = false,
    onDropUpload,
    readOnly = false,
    projectId,
    onFigureAssigned,
  }) => {
    const [isDragging, setIsDragging] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const bgColor = useColorModeValue('#ebf8ff', '#1e3a8a'); // blue.50, blue.900
    const bgColorHover = useColorModeValue('#bee3f8', '#1e40af'); // blue.100, blue.800
    const borderColor = useColorModeValue('#90cdf4', '#2563eb'); // blue.200, blue.600
    const borderColorActive = useColorModeValue('#3182ce', '#60a5fa'); // blue.500, blue.400
    const textColor = useColorModeValue('#2c5282', '#93c5fd'); // blue.600, blue.200

    // Drag and drop handlers
    const handleDragOver = useCallback(
      (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (readOnly) return;

        setIsDragging(true);
      },
      [readOnly]
    );

    const handleDragLeave = useCallback(
      (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (readOnly) return;

        setIsDragging(false);
      },
      [readOnly]
    );

    const handleDrop = useCallback(
      (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (readOnly) return;

        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (file && onDropUpload) {
          onDropUpload(file);
        }
      },
      [onDropUpload, readOnly]
    );

    // In fullView mode (modal), we show a different UI
    if (fullView) {
      return (
        <Center
          style={{
            height: '70vh',
            width: '100%',
            padding: '40px',
            backgroundColor: '#f7fafc',
          }}
        >
          <VStack spacing={5}>
            <Icon as={FiImage} className="w-12 h-12 text-gray-500" />
            <Text fontSize="lg" fontWeight="medium" color="#718096">
              No image available for {figureKey}
            </Text>
            {!readOnly && (
              <>
                <Button
                  colorScheme="blue"
                  size="md"
                  leftIcon={<Icon as={FiUpload} />}
                  onClick={onUpload}
                >
                  Upload Image
                </Button>
                {projectId && (
                  <Button
                    colorScheme="blue"
                    size="md"
                    variant="outline"
                    leftIcon={<Icon as={FiFolder} />}
                    onClick={onOpen}
                  >
                    Browse Unassigned
                  </Button>
                )}
              </>
            )}
          </VStack>

          {/* Unassigned Figures Modal */}
          {projectId && (
            <UnassignedFiguresModal
              isOpen={isOpen}
              onClose={onClose}
              projectId={projectId}
              targetFigureKey={figureKey}
              onFigureAssigned={onFigureAssigned}
            />
          )}
        </Center>
      );
    }

    return (
      <>
        <Box
          position="relative"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          borderWidth="2px"
          borderRadius="md"
          style={{
            borderStyle: 'dashed',
            borderColor: isDragging ? borderColorActive : borderColor,
            backgroundColor: isDragging ? bgColorHover : bgColor,
            transition:
              'border-color 0.15s ease-out, background-color 0.15s ease-out',
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <VStack spacing={3} align="center" justify="center">
            <Icon as={FiImage} className="w-9 h-9" color={textColor} />
            <Text
              fontWeight="medium"
              fontSize="sm"
              color={textColor}
              className="text-center"
            >
              Drag & Drop or Click to Upload
            </Text>

            {!readOnly && (
              <VStack spacing={2} align="center">
                <Button
                  leftIcon={<Icon as={FiUpload} />}
                  colorScheme="blue"
                  size="sm"
                  variant="solid"
                  onClick={onUpload}
                >
                  Upload Figure
                </Button>

                {projectId && (
                  <Button
                    leftIcon={<Icon as={FiFolder} />}
                    colorScheme="blue"
                    size="sm"
                    variant="outline"
                    onClick={onOpen}
                  >
                    Browse Unassigned
                  </Button>
                )}
              </VStack>
            )}
          </VStack>
        </Box>

        {/* Unassigned Figures Modal */}
        {projectId && (
          <UnassignedFiguresModal
            isOpen={isOpen}
            onClose={onClose}
            projectId={projectId}
            targetFigureKey={figureKey}
            onFigureAssigned={onFigureAssigned}
          />
        )}
      </>
    );
  }
);

FigureUploadArea.displayName = 'FigureUploadArea';

export default FigureUploadArea;
