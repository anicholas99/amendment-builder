import React from 'react';
import { Box, Text, Icon, Flex } from '@chakra-ui/react';
import { useColorModeValue } from '@/hooks/useColorModeValue';
import { FiBook } from 'react-icons/fi';
import ContentEditableList from '../../../../../components/common/ContentEditableList';
import { TechSectionProps } from '../types';
import { hasSectionData } from '../../../../../utils/sectionUtils';

interface TechDefinitionsSectionProps extends TechSectionProps {
  onUpdateDefinitions: (items: string[]) => void;
}

/**
 * Component for displaying and editing the invention's definitions
 */
export const TechDefinitionsSection: React.FC<TechDefinitionsSectionProps> = ({
  analyzedInvention,
  getFontSize,
  onUpdateDefinitions,
}) => {
  const iconColor = useColorModeValue('gray.600', 'gray.400');
  const titleColor = useColorModeValue('gray.700', 'gray.300');

  // Only show the section if there is data
  if (!hasSectionData(analyzedInvention?.definitions)) {
    return null;
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Flex align="center" gap={3} mb={4}>
        <Icon as={FiBook} boxSize={5} color={iconColor} />
        <Text fontSize={getFontSize('lg')} fontWeight="bold" color={titleColor}>
          Definitions
        </Text>
      </Flex>

      {/* Content */}
      <Box>
        <ContentEditableList
          items={(analyzedInvention?.definitions || []) as string[]}
          onChange={onUpdateDefinitions}
          placeholder="Add a definition..."
          fontSize={getFontSize('md')}
          lineHeight={1.6}
        />
      </Box>
    </Box>
  );
};

export default TechDefinitionsSection;
