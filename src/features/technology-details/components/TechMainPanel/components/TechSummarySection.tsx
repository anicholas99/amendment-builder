import React from 'react';
import { Box, Text, Icon, Flex } from '@chakra-ui/react';
import { FiFileText } from 'react-icons/fi';
import { useColorModeValue } from '@/hooks/useColorModeValue';
import { TechSectionProps } from '../types';
import { hasSectionData } from '../../../../../utils/sectionUtils';
import CustomEditable from '../../../../../components/common/CustomEditable';

interface TechSummarySectionProps extends TechSectionProps {
  onUpdateSummary: (value: string) => void;
}

/**
 * Component for displaying and editing the invention summary
 */
export const TechSummarySection: React.FC<TechSummarySectionProps> = React.memo(
  ({ analyzedInvention, getFontSize, onUpdateSummary }) => {
    const borderColor = useColorModeValue('gray.200', 'gray.600');

    if (!hasSectionData(analyzedInvention?.summary)) {
      return null;
    }

    return (
      <Box p={3}>
        {/* Header */}
        <Flex align="center" gap={3} mb={4}>
          <Icon as={FiFileText} boxSize={5} color="text.secondary" />
          <Text
            fontSize={getFontSize('lg')}
            fontWeight="bold"
            color="text.primary"
          >
            Summary
          </Text>
        </Flex>

        {/* Content */}
        <Box>
          <CustomEditable
            value={analyzedInvention?.summary || ''}
            onChange={onUpdateSummary}
            placeholder="Enter a summary of the invention..."
            fontSize={getFontSize('md')}
          />
        </Box>
      </Box>
    );
  }
);

TechSummarySection.displayName = 'TechSummarySection';

export default TechSummarySection;
