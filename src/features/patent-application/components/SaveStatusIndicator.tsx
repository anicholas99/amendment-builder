import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { FiCheck, FiLoader } from 'react-icons/fi';

interface SaveStatusIndicatorProps {
  isSaving: boolean;
  showSaved: boolean;
  hasUnsavedChanges: boolean;
}

export const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({
  isSaving,
  showSaved,
  hasUnsavedChanges,
}) => {
  if (isSaving) {
    return (
      <Box display="flex" alignItems="center" gap={2}>
        <FiLoader className="animate-spin" />
        <Text fontSize="sm" color="text.secondary">
          Saving...
        </Text>
      </Box>
    );
  }

  if (showSaved && !hasUnsavedChanges) {
    const timestamp = new Date().toLocaleTimeString();
    return (
      <Box display="flex" alignItems="center" gap={2}>
        <FiCheck color="green.500" />
        <Text fontSize="sm" color="green.500">
          Saved at {timestamp}
        </Text>
      </Box>
    );
  }

  if (hasUnsavedChanges) {
    return (
      <Text fontSize="sm" color="text.tertiary">
        Unsaved changes
      </Text>
    );
  }

  return null;
};
