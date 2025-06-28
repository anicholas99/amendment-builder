import React from 'react';
import { Flex, IconButton, Icon, Tooltip } from '@chakra-ui/react';
import { FiUpload } from 'react-icons/fi';
import { useThemeContext } from '../../../contexts/ThemeContext';

/**
 * Custom hook to get colors based on theme mode
 */
const useColorModeValue = (lightValue: string, darkValue: string): string => {
  const { isDarkMode } = useThemeContext();
  return isDarkMode ? darkValue : lightValue;
};

interface TechnologyInputHeaderProps {
  isUploading: boolean;
  isProcessing: boolean;
  onUploadClick: () => void;
}

/**
 * Minimal header component with just an upload button
 */
export const TechnologyInputHeader: React.FC<TechnologyInputHeaderProps> = ({
  isUploading,
  isProcessing,
  onUploadClick,
}) => {
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Flex
      justify="flex-end"
      align="center"
      py={1}
      mb={1}
      borderBottom="1px solid"
      borderColor={borderColor}
    >
      {!isUploading ? (
        <Tooltip label="Upload Files" placement="top" hasArrow>
          <IconButton
            aria-label="Upload Files"
            icon={<Icon as={FiUpload} />}
            colorScheme="blue"
            variant="ghost"
            onClick={onUploadClick}
            disabled={isProcessing}
            size="sm"
            borderRadius="sm"
            data-testid="upload-document-button"
          />
        </Tooltip>
      ) : (
        <IconButton
          aria-label="Uploading..."
          icon={<Icon as={FiUpload} />}
          colorScheme="blue"
          variant="ghost"
          isLoading={true}
          size="sm"
          disabled
        />
      )}
    </Flex>
  );
};
