import React, { useState } from 'react';
import {
  Box,
  Input,
  Textarea,
  Button,
  HStack,
  VStack,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useUpdateFigureMetadata } from '@/hooks/api/useFiguresNormalized';

interface FigureDescriptionEditorProps {
  projectId: string;
  figureId: string;
  figureKey: string;
  currentTitle?: string;
  currentDescription?: string;
  onCancel?: () => void;
  onSuccess?: () => void;
}

/**
 * A simple component demonstrating how to edit figure metadata
 * using the new normalized API endpoints
 */
export const FigureDescriptionEditor: React.FC<
  FigureDescriptionEditorProps
> = ({
  projectId,
  figureId,
  figureKey,
  currentTitle = '',
  currentDescription = '',
  onCancel,
  onSuccess,
}) => {
  const [title, setTitle] = useState(currentTitle);
  const [description, setDescription] = useState(currentDescription);
  const updateMetadata = useUpdateFigureMetadata();
  const toast = useToast();

  const handleSave = async () => {
    try {
      await updateMetadata.mutateAsync({
        projectId,
        figureId,
        updates: {
          title: title.trim(),
          description: description.trim(),
        },
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Error handling is done in the hook, no need to log here
    }
  };

  const hasChanges =
    title.trim() !== currentTitle.trim() ||
    description.trim() !== currentDescription.trim();

  return (
    <VStack spacing={4} align="stretch">
      <Box>
        <Text fontWeight="medium" mb={1}>
          Figure {figureKey} Title
        </Text>
        <Input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Enter figure title..."
          size="sm"
        />
      </Box>

      <Box>
        <Text fontWeight="medium" mb={1}>
          Description
        </Text>
        <Textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Enter figure description..."
          rows={4}
          size="sm"
        />
      </Box>

      <HStack justify="flex-end" spacing={2}>
        {onCancel && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onCancel}
            isDisabled={updateMetadata.isPending}
          >
            Cancel
          </Button>
        )}
        <Button
          size="sm"
          colorScheme="blue"
          onClick={handleSave}
          isLoading={updateMetadata.isPending}
          isDisabled={!hasChanges || updateMetadata.isPending}
        >
          Save Changes
        </Button>
      </HStack>
    </VStack>
  );
};
