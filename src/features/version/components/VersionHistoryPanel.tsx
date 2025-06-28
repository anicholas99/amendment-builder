import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/monitoring/logger';
import {
  Box,
  Text,
  IconButton,
  VStack,
  Flex,
  Icon,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiX } from 'react-icons/fi';
// Update import path for InventionData
import { InventionData } from '../../../types/invention';
import { formatDistanceToNow } from 'date-fns';

interface VersionHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  versionHistory: InventionData[];
  currentVersionIndex: number;
  onRestoreVersion: (index: number) => void;
}

const getVersionChanges = (
  prev: InventionData | null,
  current: InventionData
): string => {
  if (!prev) return 'Initial version';

  const changes = [];

  // Check for changes in various fields
  if (prev.title !== current.title) changes.push('title');
  if (prev.summary !== current.summary) changes.push('summary');
  if (JSON.stringify(prev.claims) !== JSON.stringify(current.claims))
    changes.push('claims');
  if (JSON.stringify(prev.features) !== JSON.stringify(current.features))
    changes.push('features');
  if (JSON.stringify(prev.figures) !== JSON.stringify(current.figures))
    changes.push('figures');
  if (
    JSON.stringify(prev.technical_implementation) !==
    JSON.stringify(current.technical_implementation)
  )
    changes.push('technical implementation');
  if (JSON.stringify(prev.background) !== JSON.stringify(current.background))
    changes.push('background');
  if (JSON.stringify(prev.prior_art) !== JSON.stringify(current.prior_art))
    changes.push('prior art');
  if (JSON.stringify(prev.use_cases) !== JSON.stringify(current.use_cases))
    changes.push('use cases');

  if (changes.length === 0) return 'No changes';

  return `Changed: ${changes.join(', ')}`;
};

const VersionHistoryPanel: React.FC<VersionHistoryPanelProps> = ({
  isOpen,
  onClose,
  versionHistory,
  currentVersionIndex,
  onRestoreVersion,
}) => {
  // Move color values outside event handlers
  const cardBg = useColorModeValue('bg.card', 'bg.card');
  const hoverBg = useColorModeValue('bg.hover', 'bg.hoverDark');

  if (!isOpen) return null;

  return (
    <Box
      position="absolute" // Or adjust based on final layout needs
      top="60px" // May need adjustment
      right="20px" // May need adjustment
      width="350px"
      maxHeight="60vh"
      overflowY="auto"
      bg="bg.card"
      borderRadius="md"
      boxShadow="lg"
      zIndex={1000}
      borderWidth="1px" // Added border for better visibility
      borderColor="border.primary"
    >
      <Box
        p={3}
        bg="bg.secondary"
        borderBottomWidth={1}
        borderColor="border.primary"
      >
        <Flex justify="space-between" align="center">
          <Text fontWeight="bold">Version History</Text>
          <IconButton
            aria-label="Close panel"
            icon={<Icon as={FiX} />}
            size="sm"
            variant="ghost"
            onClick={onClose}
          />
        </Flex>
      </Box>

      {versionHistory.length === 0 ? (
        <Box p={4} className="text-center">
          <Text color="gray.500">No version history available</Text>
        </Box>
      ) : (
        <VStack spacing={0} align="stretch" divider={<Divider />}>
          {versionHistory.map((version, index) => {
            const prevVersion = index > 0 ? versionHistory[index - 1] : null;
            const changes = getVersionChanges(prevVersion, version);

            return (
              <Box
                key={index}
                p={3}
                bg={currentVersionIndex === index ? 'blue.50' : cardBg}
                className="cursor-pointer transition-bg"
                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                  if (currentVersionIndex !== index) {
                    e.currentTarget.style.backgroundColor = hoverBg;
                  }
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                  if (currentVersionIndex !== index) {
                    e.currentTarget.style.backgroundColor = cardBg;
                  }
                }}
                onClick={() => onRestoreVersion(index)}
              >
                <Flex justify="space-between" className="mb-1">
                  <Text fontWeight="medium">Version {index + 1}</Text>
                  <Text fontSize="sm" color="gray.500">
                    {index === versionHistory.length - 1 ? 'Current' : ''}
                  </Text>
                </Flex>
                <Text fontSize="sm" color="gray.600" noOfLines={1}>
                  {changes}
                </Text>
              </Box>
            );
          })}
        </VStack>
      )}
    </Box>
  );
};

export default VersionHistoryPanel;
