import React from 'react';
import { Box, Text, Icon, Flex } from '@chakra-ui/react';
import { useColorModeValue } from '@/hooks/useColorModeValue';
import { FiLayers } from 'react-icons/fi';
import ContentEditableList from '../../../../../components/common/ContentEditableList';
import { TechSectionProps } from '../types';
import { hasSectionData } from '../../../../../utils/sectionUtils';

interface TechAlternativeEmbodimentsSectionProps extends TechSectionProps {
  onUpdateAlternativeEmbodiments: (items: string[]) => void;
}

/**
 * Component for displaying and editing alternative embodiments
 */
export const TechAlternativeEmbodimentsSection: React.FC<
  TechAlternativeEmbodimentsSectionProps
> = ({ analyzedInvention, getFontSize, onUpdateAlternativeEmbodiments }) => {
  const iconColor = useColorModeValue('gray.600', 'gray.400');
  const titleColor = useColorModeValue('gray.700', 'gray.300');

  const getAlternativeEmbodimentsArray = () => {
    const alternatives =
      analyzedInvention?.technicalImplementation?.alternativeEmbodiments;
    if (Array.isArray(alternatives)) {
      return alternatives.filter(alt => alt && alt.trim());
    }
    return [];
  };

  const alternativeEmbodiments = getAlternativeEmbodimentsArray();

  if (!hasSectionData(alternativeEmbodiments)) {
    return null;
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Flex align="center" gap={3} mb={4}>
        <Icon as={FiLayers} boxSize={5} color={iconColor} />
        <Text fontSize={getFontSize('lg')} fontWeight="bold" color={titleColor}>
          Alternative Embodiments
        </Text>
      </Flex>

      {/* Content */}
      <Box>
        <ContentEditableList
          items={alternativeEmbodiments || []}
          onChange={onUpdateAlternativeEmbodiments}
          placeholder="Add an alternative embodiment..."
          fontSize={getFontSize('md')}
          lineHeight={1.6}
        />
      </Box>
    </Box>
  );
};

export default TechAlternativeEmbodimentsSection;
