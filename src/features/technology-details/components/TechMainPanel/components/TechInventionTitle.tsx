import React from 'react';
import { Box } from '@chakra-ui/react';
import { useColorModeValue } from '@/hooks/useColorModeValue';
import { TechSectionProps } from '../types';
import CustomEditable from '../../../../../components/common/CustomEditable';

interface TechInventionTitleProps extends TechSectionProps {
  onUpdateTitle: (value: string) => void;
  onUpdateAbstract: (value: string) => void;
}

/**
 * Component for displaying and editing the invention title and abstract
 */
export const TechInventionTitle: React.FC<TechInventionTitleProps> = ({
  analyzedInvention,
  getFontSize,
  onUpdateTitle,
  onUpdateAbstract,
}) => {
  return (
    <Box>
      {/* Title Section */}
      <Box pt={2} px={6} pb={3}>
        <CustomEditable
          value={analyzedInvention?.title || ''}
          onChange={value => onUpdateTitle(value)}
          placeholder="Enter invention title..."
          fontSize={getFontSize('xl')}
          fontWeight="bold"
        />
      </Box>

      {/* Abstract Section */}
      <Box px={6} pb={6}>
        <CustomEditable
          value={analyzedInvention?.abstract || ''}
          onChange={value => onUpdateAbstract(value)}
          placeholder="Enter abstract..."
          fontSize={getFontSize('md')}
        />
      </Box>
    </Box>
  );
};

export default TechInventionTitle;
