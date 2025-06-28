import React from 'react';
import { Box, Text, Icon, Flex, useColorModeValue } from '@chakra-ui/react';
import { FiZap } from 'react-icons/fi';
import ContentEditableList from '../../../../../components/common/ContentEditableList';
import { TechSectionProps } from '../types';
import { hasSectionData } from '../../../../../utils/sectionUtils';

interface TechFeaturesSectionProps extends TechSectionProps {
  onUpdateFeatures: (items: string[]) => void;
}

/**
 * Component for displaying and editing the technology features
 */
export const TechFeaturesSection: React.FC<TechFeaturesSectionProps> = ({
  analyzedInvention,
  getFontSize,
  onUpdateFeatures,
}) => {
  const iconColor = useColorModeValue('gray.600', 'gray.400');
  const titleColor = useColorModeValue('gray.700', 'gray.300');

  if (!hasSectionData(analyzedInvention?.features)) {
    return null;
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Flex align="center" gap={3} mb={4}>
        <Icon as={FiZap} boxSize={5} color={iconColor} />
        <Text fontSize={getFontSize('lg')} fontWeight="bold" color={titleColor}>
          Features
        </Text>
      </Flex>

      {/* Content */}
      <Box>
        <ContentEditableList
          items={analyzedInvention?.features || []}
          onChange={onUpdateFeatures}
          placeholder="Add a key feature..."
          fontSize={getFontSize('md')}
          lineHeight={1.6}
        />
      </Box>
    </Box>
  );
};

export default TechFeaturesSection;
