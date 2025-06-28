import React from 'react';
import { Box, Text, Icon, Flex } from '@chakra-ui/react';
import { useColorModeValue } from '@/hooks/useColorModeValue';
import { FiTarget } from 'react-icons/fi';
import ContentEditableList from '../../../../../components/common/ContentEditableList';
import { TechSectionProps } from '../types';
import { hasSectionData } from '../../../../../utils/sectionUtils';

interface TechUseCasesSectionProps extends TechSectionProps {
  onUpdateUseCases: (items: string[]) => void;
}

/**
 * Component for displaying and editing the invention's use cases
 */
export const TechUseCasesSection: React.FC<TechUseCasesSectionProps> = ({
  analyzedInvention,
  getFontSize,
  onUpdateUseCases,
}) => {
  const iconColor = useColorModeValue('gray.600', 'gray.400');
  const titleColor = useColorModeValue('gray.700', 'gray.300');

  // Only show the section if there is data
  if (!hasSectionData(analyzedInvention?.useCases)) {
    return null;
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Flex align="center" gap={3} mb={4}>
        <Icon as={FiTarget} boxSize={5} color={iconColor} />
        <Text fontSize={getFontSize('lg')} fontWeight="bold" color={titleColor}>
          Use Cases
        </Text>
      </Flex>

      {/* Content */}
      <Box>
        <ContentEditableList
          items={(analyzedInvention?.useCases || []) as string[]}
          onChange={onUpdateUseCases}
          placeholder="Add a use case for your invention..."
          fontSize={getFontSize('md')}
          lineHeight={1.6}
        />
      </Box>
    </Box>
  );
};

export default TechUseCasesSection;
