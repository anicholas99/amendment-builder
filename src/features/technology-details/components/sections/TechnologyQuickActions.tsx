import React from 'react';
import {
  HStack,
  Button,
  Icon,
  useColorModeValue,
  Box,
  ButtonGroup,
} from '@chakra-ui/react';
import { FiFileText, FiImage, FiLayers } from 'react-icons/fi';

interface TechnologyQuickActionsProps {
  onUploadClick: () => void;
}

export const TechnologyQuickActions: React.FC<TechnologyQuickActionsProps> = ({
  onUploadClick,
}) => {
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const iconColor = useColorModeValue('gray.600', 'gray.400');
  const textColor = useColorModeValue('gray.700', 'gray.300');

  const actionButton = {
    size: 'sm',
    variant: 'ghost',
    color: textColor,
    fontWeight: 'medium',
    fontSize: 'sm',
    px: 3,
    _hover: {
      bg: hoverBg,
    },
    transition: 'all 0.2s ease',
  };

  return (
    <Box
      width="100%"
      display={{ base: 'none', md: 'flex' }}
      justifyContent="center"
      py={1}
    >
      <ButtonGroup spacing={2} size="sm">
        <Button
          {...actionButton}
          leftIcon={<Icon as={FiFileText} color={iconColor} boxSize={4} />}
          onClick={onUploadClick}
        >
          Upload Document
        </Button>

        <Button
          {...actionButton}
          leftIcon={<Icon as={FiImage} color={iconColor} boxSize={4} />}
          onClick={onUploadClick}
        >
          Add Figures
        </Button>

        <Button
          {...actionButton}
          leftIcon={<Icon as={FiLayers} color={iconColor} boxSize={4} />}
          isDisabled
          opacity={0.5}
          cursor="not-allowed"
          _hover={{
            bg: 'transparent',
          }}
        >
          Use Template
        </Button>
      </ButtonGroup>
    </Box>
  );
};
