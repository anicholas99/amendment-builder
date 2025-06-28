import React from 'react';
import { Box, Text, Icon, Flex, useColorModeValue } from '@chakra-ui/react';
import { FiSettings } from 'react-icons/fi';
import { TechSectionProps } from '../types';
import { hasSectionData } from '../../../../../utils/sectionUtils';
import CustomEditable from '../../../../../components/common/CustomEditable';

interface TechImplementationSectionProps extends TechSectionProps {
  onUpdateImplementation: (value: string) => void;
}

/**
 * Component for displaying and editing the preferred embodiment
 */
export const TechImplementationSection: React.FC<
  TechImplementationSectionProps
> = ({ analyzedInvention, getFontSize, onUpdateImplementation }) => {
  const iconColor = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const titleColor = useColorModeValue('gray.700', 'gray.300');

  const preferredEmbodiment =
    analyzedInvention?.technicalImplementation?.preferredEmbodiment;

  if (!hasSectionData(preferredEmbodiment)) {
    return null;
  }

  return (
    // Compact padding
    <Box p={3}>
      {/* Header */}
      <Flex align="center" gap={3} mb={4}>
        <Icon as={FiSettings} boxSize={5} color={iconColor} />
        <Text fontSize={getFontSize('lg')} fontWeight="bold" color={titleColor}>
          Preferred Embodiment
        </Text>
      </Flex>

      {/* Content */}
      <Box>
        <CustomEditable
          value={String(preferredEmbodiment || '')}
          onChange={onUpdateImplementation}
          placeholder="Describe the preferred embodiment of this technology..."
          fontSize={getFontSize('md')}
        />
      </Box>
    </Box>
  );
};

export default TechImplementationSection;
