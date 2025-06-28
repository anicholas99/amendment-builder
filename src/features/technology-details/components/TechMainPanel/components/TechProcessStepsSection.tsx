import React from 'react';
import { Box, Text, Icon, Flex } from '@chakra-ui/react';
import { useColorModeValue } from '@/hooks/useColorModeValue';
import { FiList } from 'react-icons/fi';
import ContentEditableList from '../../../../../components/common/ContentEditableList';
import { TechSectionProps } from '../types';
import { hasSectionData } from '../../../../../utils/sectionUtils';

interface TechProcessStepsSectionProps extends TechSectionProps {
  onUpdateProcessSteps: (items: string[]) => void;
}

/**
 * Component for displaying and editing the invention's process steps
 */
export const TechProcessStepsSection: React.FC<
  TechProcessStepsSectionProps
> = ({ analyzedInvention, getFontSize, onUpdateProcessSteps }) => {
  const iconColor = useColorModeValue('gray.600', 'gray.400');
  const titleColor = useColorModeValue('gray.700', 'gray.300');

  // Only show the section if there is data
  if (!hasSectionData(analyzedInvention?.processSteps)) {
    return null;
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box mb={4}>
        <Flex align="center" gap={3}>
          <Icon as={FiList} boxSize={5} color={iconColor} />
          <Text
            fontSize={getFontSize('lg')}
            fontWeight="bold"
            color={titleColor}
          >
            Process Steps
          </Text>
        </Flex>
      </Box>

      {/* Content */}
      <Box>
        <ContentEditableList
          items={(analyzedInvention?.processSteps || []) as string[]}
          onChange={onUpdateProcessSteps}
          placeholder="Add a process step..."
          fontSize={getFontSize('md')}
          lineHeight={1.6}
        />
      </Box>
    </Box>
  );
};

export default TechProcessStepsSection;
