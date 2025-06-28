import React from 'react';
import { Box, Text, Icon, Flex } from '@chakra-ui/react';
import { FiStar } from 'react-icons/fi';
import { useColorModeValue } from '@/hooks/useColorModeValue';
import { TechSectionProps } from '../types';
import { hasSectionData } from '../../../../../utils/sectionUtils';
import CustomEditable from '../../../../../components/common/CustomEditable';

interface TechNoveltySectionProps extends TechSectionProps {
  onUpdateNovelty: (value: string) => void;
}

/**
 * Component for displaying and editing the technology novelty
 */
export const TechNoveltySection: React.FC<TechNoveltySectionProps> = ({
  analyzedInvention,
  getFontSize,
  onUpdateNovelty,
}) => {
  if (!hasSectionData(analyzedInvention?.novelty)) {
    return null;
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Flex align="center" gap={3} mb={4}>
        <Icon as={FiStar} boxSize={5} color="text.secondary" />
        <Text
          fontSize={getFontSize('lg')}
          fontWeight="bold"
          color="text.primary"
        >
          Novelty
        </Text>
      </Flex>

      {/* Content */}
      <Box>
        <CustomEditable
          value={
            typeof analyzedInvention?.novelty === 'string'
              ? analyzedInvention.novelty
              : ''
          }
          onChange={onUpdateNovelty}
          placeholder="Describe what makes this invention novel..."
          fontSize={getFontSize('md')}
        />
      </Box>
    </Box>
  );
};

export default TechNoveltySection;
