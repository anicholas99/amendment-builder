import React from 'react';
import {
  Box,
  Text,
  Icon,
  Center,
  VStack,
  Textarea,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiUpload, FiUploadCloud } from 'react-icons/fi';

interface TechnologyInputTextAreaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isProcessing: boolean;
  isUploading: boolean;
  isDragging: boolean;
  handleDrop: (e: React.DragEvent<HTMLTextAreaElement>) => void;
  handleDragOver: (e: React.DragEvent<HTMLTextAreaElement>) => void;
  handleDragLeave: (e: React.DragEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
}

/**
 * Text area component with drag-and-drop functionality for the technology details input
 */
export const TechnologyInputTextArea: React.FC<TechnologyInputTextAreaProps> =
  React.memo(
    ({
      value,
      onChange,
      isProcessing,
      isUploading,
      isDragging,
      handleDrop,
      handleDragOver,
      handleDragLeave,
      placeholder = 'Start describing your invention description here, or drag & drop files...',
    }) => {
      // Define colors based on theme
      const focusBorderColor = useColorModeValue('blue.400', 'blue.300');
      const draggingBg = useColorModeValue(
        'rgba(237, 247, 255, 0.95)',
        'rgba(26, 32, 44, 0.9)'
      );
      const draggingIconColor = useColorModeValue('blue.500', 'blue.200');
      const draggingTextColor = useColorModeValue('blue.700', 'blue.100');
      const textAreaBg = useColorModeValue('white', 'gray.800');
      const placeholderColor = useColorModeValue('gray.400', 'gray.500');

      return (
        <Box position="relative" width="100%" height="100%" overflow="hidden">
          <Textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            w="100%"
            h="100%"
            style={{
              padding: '20px',
              border: 'none',
              backgroundColor: textAreaBg,
              fontSize: '16px',
              lineHeight: '1.7',
              resize: 'none',
              transition: 'background-color 0.2s ease',
              zIndex: 1,
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
            isDisabled={isProcessing || isUploading}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            _focus={{
              outline: 'none',
              boxShadow: 'none',
            }}
            _placeholder={{
              color: placeholderColor,
              opacity: 1,
            }}
          />

          {/* Drag & Drop Overlay - Simplified */}
          {isDragging && (
            <Box
              position="absolute"
              style={{
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: draggingBg,
                zIndex: 2,
                pointerEvents: 'none',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                // backdropFilter: 'blur(8px)', // Removed for performance
              }}
            >
              <VStack spacing={4}>
                <Box
                  bg={useColorModeValue('white', 'gray.700')}
                  p={4}
                  borderRadius="full"
                  boxShadow="lg"
                >
                  <Icon
                    as={FiUploadCloud}
                    style={{
                      width: '48px',
                      height: '48px',
                      color: draggingIconColor,
                    }}
                  />
                </Box>
                <VStack spacing={1}>
                  <Text
                    fontWeight="bold"
                    color={draggingTextColor}
                    fontSize="lg"
                  >
                    Drop files anywhere to upload
                  </Text>
                  <Text fontSize="sm" color={draggingTextColor} opacity={0.8}>
                    PDF, DOCX, TXT, or Images
                  </Text>
                </VStack>
              </VStack>
            </Box>
          )}
        </Box>
      );
    }
  );

TechnologyInputTextArea.displayName = 'TechnologyInputTextArea';
