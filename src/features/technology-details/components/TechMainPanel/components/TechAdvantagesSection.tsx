import React from 'react';
import { Box, Text, Icon, Flex } from '@chakra-ui/react';
import { useColorModeValue } from '@/hooks/useColorModeValue';
import { FiTrendingUp } from 'react-icons/fi';
import ContentEditableList from '../../../../../components/common/ContentEditableList';
import { TechSectionProps } from '../types';
import { hasSectionData } from '../../../../../utils/sectionUtils';

interface TechAdvantagesSectionProps extends TechSectionProps {
  onUpdateAdvantages: (items: string[]) => void;
}

/**
 * Component for displaying and editing the invention's advantages
 */
export const TechAdvantagesSection: React.FC<TechAdvantagesSectionProps> = ({
  analyzedInvention,
  getFontSize,
  onUpdateAdvantages,
}) => {
  const iconColor = useColorModeValue('gray.600', 'gray.400');
  const titleColor = useColorModeValue('gray.700', 'gray.300');

  // Only show the section if there is data
  if (!hasSectionData(analyzedInvention?.advantages)) {
    return null;
  }

  // Transform advantages to handle both string[] and object[] formats
  const getAdvantageStrings = () => {
    const advantages = analyzedInvention?.advantages || [];

    // If advantages are already strings, return as is
    if (advantages.length > 0 && typeof advantages[0] === 'string') {
      return advantages as string[];
    }

    // If advantages are objects, extract the title field
    return advantages.map((adv: any) => {
      if (typeof adv === 'object' && adv !== null) {
        return adv.title || adv.description || '';
      }
      return String(adv);
    });
  };

  return (
    <Box p={3}>
      {/* Header */}
      <Flex align="center" gap={3} mb={4}>
        <Icon as={FiTrendingUp} boxSize={5} color={iconColor} />
        <Text fontSize={getFontSize('lg')} fontWeight="bold" color={titleColor}>
          Advantages
        </Text>
      </Flex>

      {/* Content */}
      <Box>
        <ContentEditableList
          items={getAdvantageStrings()}
          onChange={onUpdateAdvantages}
          placeholder="Add an advantage..."
          fontSize={getFontSize('md')}
          lineHeight={1.6}
        />
      </Box>
    </Box>
  );
};

export default TechAdvantagesSection;
