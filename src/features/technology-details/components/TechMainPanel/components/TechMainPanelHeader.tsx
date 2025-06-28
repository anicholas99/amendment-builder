import React from 'react';
import {
  HStack,
  Badge,
  Button,
  IconButton,
  Icon,
  Box,
  Tooltip,
} from '@chakra-ui/react';
import { FiZoomOut, FiZoomIn, FiUpload } from 'react-icons/fi';
import { InventionData } from '@/types/invention';
import { mapAiFieldToDisplayValue } from '../../../utils/technicalFieldMapping';

interface TechMainPanelHeaderProps {
  analyzedInvention: InventionData | null;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onAddDetails: () => void;
}

/**
 * Header component for the Technology Main Panel
 */
export const TechMainPanelHeader: React.FC<TechMainPanelHeaderProps> = ({
  analyzedInvention,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onAddDetails,
}) => {
  return (
    <Box
      p={2}
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      gap={2}
    >
      {/* Left side - Technical field badge */}
      <HStack>
        {analyzedInvention?.technicalField &&
        typeof analyzedInvention.technicalField === 'string' ? (
          <Badge colorScheme="blue" fontSize="sm">
            {mapAiFieldToDisplayValue(analyzedInvention.technicalField)}
          </Badge>
        ) : null}
      </HStack>

      {/* Right side - Controls */}
      <HStack spacing={2}>
        <HStack spacing={0}>
          <Tooltip label="Zoom out (show more content)">
            <IconButton
              aria-label="Zoom out"
              icon={<Icon as={FiZoomOut} />}
              onClick={onZoomOut}
              disabled={zoomLevel <= 70}
              size="sm"
              variant="outline"
            />
          </Tooltip>
          <Button size="sm" onClick={onResetZoom} variant="outline">
            {zoomLevel}%
          </Button>
          <Tooltip label="Zoom in (larger text)">
            <IconButton
              aria-label="Zoom in"
              icon={<Icon as={FiZoomIn} />}
              onClick={onZoomIn}
              disabled={zoomLevel >= 120}
              size="sm"
              variant="outline"
            />
          </Tooltip>
        </HStack>

        <Button
          leftIcon={<Icon as={FiUpload} />}
          colorScheme="blue"
          size="sm"
          variant="outline"
          onClick={onAddDetails}
        >
          Add Details
        </Button>
      </HStack>
    </Box>
  );
};

export default TechMainPanelHeader;
