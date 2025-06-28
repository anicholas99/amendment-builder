import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/monitoring/logger';
import { Flex } from '@chakra-ui/react';
import {
  IconButton,
  Tooltip,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiExternalLink, FiBookmark, FiX, FiList } from 'react-icons/fi';
import { useApiMutation } from '@/lib/api/queryClient';
import { useQueryClient } from '@tanstack/react-query';
import { Icon } from '@chakra-ui/react';

interface PatentActionButtonsProps {
  patentNumber: string;
  projectId?: string;
  isSaved?: boolean;
  onSave?: () => void;
  onExtractCitations?: (patentNumber: string) => void;
}

/**
 * Action buttons for patent references in the search history table
 */
const PatentActionButtons: React.FC<PatentActionButtonsProps> = ({
  patentNumber,
  projectId,
  isSaved = false,
  onSave,
  onExtractCitations,
}) => {
  const [isActuallySaved, setIsActuallySaved] = useState(isSaved);
  const toast = useToast();
  const queryClient = useQueryClient();

  // Add color mode value for unsaved bookmark
  const unsavedBookmarkColor = useColorModeValue('gray.600', 'text.secondary');

  // React Query mutation for excluding patents
  const excludePatentMutation = useApiMutation<
    { success: boolean },
    { patentNumbers: string[] }
  >({
    url: `/api/projects/${projectId}/exclusions`,
    method: 'POST',
    onSuccess: () => {
      toast({
        title: 'Patent excluded',
        description: `${patentNumber} will be excluded from future searches.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Invalidate related queries instead of page refresh
      queryClient.invalidateQueries({
        queryKey: ['projectExclusions', projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ['projectExclusionsList', projectId],
      });
      queryClient.invalidateQueries({ queryKey: ['searchHistory'] });
    },
  });

  // Update internal state when prop changes
  useEffect(() => {
    setIsActuallySaved(isSaved);
  }, [isSaved]);

  // Normalize patent number (remove hyphens)
  const normalizedPatentNumber = patentNumber.replace(/-/g, '');

  // Open the patent in Google Patents
  const handleViewPatent = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row expansion
    window.open(
      `https://patents.google.com/patent/${normalizedPatentNumber}`,
      '_blank'
    );
  };

  // Save the patent to the saved prior art list
  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSave && !isActuallySaved) {
      onSave();
      setIsActuallySaved(true); // Optimistically update UI
    }
  };

  // Extract citations for this patent
  const handleExtractCitations = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onExtractCitations) {
      onExtractCitations(patentNumber);
    }
  };

  // Exclude the patent from future search results
  const handleExclude = async (e: React.MouseEvent) => {
    e.stopPropagation();

    logger.log('Exclude button clicked for patent:', { patentNumber });
    logger.log('Project ID:', { projectId });

    if (!projectId) {
      toast({
        title: 'Cannot exclude patent',
        description: 'No project context available for exclusion.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    excludePatentMutation.mutate({ patentNumbers: [patentNumber] });
  };

  return (
    <Flex direction="row" gap={1}>
      {/* View in Google Patents */}
      <Tooltip label="View in Google Patents">
        <IconButton
          aria-label="View in Google Patents"
          icon={<Icon as={FiExternalLink} color="text.secondary" />}
          size="sm"
          variant="ghost"
          onClick={handleViewPatent}
          _hover={{
            color: 'text.primary',
            bg: 'bg.hover',
          }}
        />
      </Tooltip>

      {/* Save to Prior Art (if save handler provided) */}
      {onSave && (
        <Tooltip
          label={isActuallySaved ? 'Already saved' : 'Save to Prior Art'}
        >
          <IconButton
            aria-label={isActuallySaved ? 'Already saved' : 'Save to Prior Art'}
            icon={<Icon as={FiBookmark} />}
            size="sm"
            variant="ghost"
            color={isActuallySaved ? 'green.500' : unsavedBookmarkColor}
            isDisabled={isActuallySaved}
            onClick={handleSave}
            _hover={{
              color: isActuallySaved ? 'green.600' : 'text.primary',
              bg: isActuallySaved ? 'green.50' : 'bg.hover',
            }}
          />
        </Tooltip>
      )}

      {/* Extract Citations button */}
      {onExtractCitations && (
        <Tooltip label="Extract Citations">
          <IconButton
            aria-label="Extract Citations"
            icon={<Icon as={FiList} color="text.secondary" />}
            size="sm"
            variant="ghost"
            onClick={handleExtractCitations}
            _hover={{
              color: 'text.primary',
              bg: 'bg.hover',
            }}
          />
        </Tooltip>
      )}

      {/* Exclude patent button */}
      {projectId && (
        <Tooltip label="Exclude from future searches">
          <IconButton
            aria-label="Exclude Patent"
            icon={<Icon as={FiX} color="red.500" />}
            size="sm"
            variant="ghost"
            colorScheme="red"
            onClick={handleExclude}
            isLoading={excludePatentMutation.isPending}
            _hover={{
              color: 'red.600',
              bg: 'red.50',
            }}
          />
        </Tooltip>
      )}
    </Flex>
  );
};

export default PatentActionButtons;
