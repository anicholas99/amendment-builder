import React from 'react';
import {
  Stack,
  IconButton,
  Icon,
  Tooltip,
  Box,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiTrash2, FiMaximize, FiX } from 'react-icons/fi';
import { FigureControlsProps } from './types';

/**
 * Component for the control buttons (delete, expand) that appear on a figure
 */
const FigureControls: React.FC<FigureControlsProps> = ({
  figureKeys,
  onDelete,
  onFullView,
  onUnassign,
  hasImage = false,
}) => {
  // Theme-aware colors for the container
  const containerBg = useColorModeValue(
    'rgba(255, 255, 255, 0.9)',
    'rgba(26, 32, 44, 0.9)'
  );
  const buttonColor = useColorModeValue('gray.600', 'gray.300');

  return (
    <Box
      position="absolute"
      top="8px"
      right="8px"
      bg={containerBg}
      borderRadius="md"
      p={1}
      boxShadow="sm"
      backdropFilter="blur(4px)"
    >
      <Stack direction="row" spacing={1} justify="end">
        {/* Unassign figure button - only show when image exists */}
        {hasImage && onUnassign && (
          <Tooltip label="Unassign figure" placement="top" hasArrow>
            <IconButton
              aria-label="Unassign figure"
              icon={<Icon as={FiX} />}
              size="xs"
              variant="ghost"
              colorScheme="orange"
              onClick={onUnassign}
              color={buttonColor}
              _hover={{
                bg: 'orange.100',
                color: 'orange.600',
                transform: 'scale(1.1)',
              }}
              _active={{
                transform: 'scale(0.95)',
              }}
              transition="all 0.2s"
            />
          </Tooltip>
        )}

        {/* Delete figure slot button - minimal style */}
        <Tooltip label="Delete figure slot" placement="top" hasArrow>
          <IconButton
            aria-label="Delete figure slot"
            icon={<Icon as={FiTrash2} />}
            size="xs"
            variant="ghost"
            colorScheme="red"
            onClick={() => {
              if (figureKeys.length > 0) {
                onDelete();
              }
            }}
            isDisabled={figureKeys.length === 0}
            color={buttonColor}
            _hover={{
              bg: 'red.100',
              color: 'red.600',
              transform: 'scale(1.1)',
            }}
            _active={{
              transform: 'scale(0.95)',
            }}
            transition="all 0.2s"
          />
        </Tooltip>

        {/* View full size button */}
        <Tooltip label="View full size" placement="top" hasArrow>
          <IconButton
            aria-label="Expand figure"
            icon={<Icon as={FiMaximize} />}
            size="xs"
            variant="ghost"
            colorScheme="gray"
            onClick={() => {
              onFullView();
            }}
            color={buttonColor}
            _hover={{
              bg: 'gray.100',
              color: 'gray.700',
              transform: 'scale(1.1)',
            }}
            _active={{
              transform: 'scale(0.95)',
            }}
            transition="all 0.2s"
          />
        </Tooltip>
      </Stack>
    </Box>
  );
};

export default FigureControls;
