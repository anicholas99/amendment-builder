import React from 'react';
import { Box, Text, Icon, Flex, useColorModeValue } from '@chakra-ui/react';
import { FiTool } from 'react-icons/fi';
import ContentEditableList from '../../../../../components/common/ContentEditableList';
import { TechSectionProps } from '../types';
import { hasSectionData } from '../../../../../utils/sectionUtils';

interface TechManufacturingMethodsSectionProps extends TechSectionProps {
  onUpdateManufacturingMethods: (items: string[]) => void;
}

/**
 * Component for displaying and editing manufacturing methods
 */
export const TechManufacturingMethodsSection: React.FC<
  TechManufacturingMethodsSectionProps
> = ({ analyzedInvention, getFontSize, onUpdateManufacturingMethods }) => {
  const iconColor = useColorModeValue('gray.600', 'gray.400');
  const titleColor = useColorModeValue('gray.700', 'gray.300');

  const manufacturingMethods =
    analyzedInvention?.technicalImplementation?.manufacturingMethods;

  if (!hasSectionData(manufacturingMethods)) {
    return null;
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Flex align="center" gap={3} mb={4}>
        <Icon as={FiTool} boxSize={5} color={iconColor} />
        <Text fontSize={getFontSize('lg')} fontWeight="bold" color={titleColor}>
          Manufacturing Methods
        </Text>
      </Flex>

      {/* Content */}
      <Box>
        <ContentEditableList
          items={
            Array.isArray(manufacturingMethods) ? manufacturingMethods : []
          }
          onChange={onUpdateManufacturingMethods}
          placeholder="Add a manufacturing method..."
          fontSize={getFontSize('md')}
          lineHeight={1.6}
        />
      </Box>
    </Box>
  );
};

export default TechManufacturingMethodsSection;
