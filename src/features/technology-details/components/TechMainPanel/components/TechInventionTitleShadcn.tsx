import React from 'react';
import { cn } from '@/lib/utils';
import { TechSectionProps } from '../types';
import CustomEditable from '../../../../../components/common/CustomEditable';

interface TechInventionTitleShadcnProps extends TechSectionProps {
  onUpdateTitle: (value: string) => void;
  onUpdateAbstract: (value: string) => void;
}

// This component displays the invention title section of the technology details, using shadcn/ui components.
// It is designed to be visually consistent with previous versions.
export const TechInventionTitleShadcn: React.FC<
  TechInventionTitleShadcnProps
> = ({ analyzedInvention, getFontSize, onUpdateTitle, onUpdateAbstract }) => {
  return (
    <div>
      {/* Title Section */}
      <div className="pt-2 px-5 pb-3">
        <CustomEditable
          value={analyzedInvention?.title || ''}
          onChange={value => onUpdateTitle(value)}
          placeholder="Enter invention title..."
          fontSize="xl"
          fontWeight="bold"
          padding="0.5rem"
        />
      </div>

      {/* Abstract Section */}
      <div className="px-5 pb-5">
        <CustomEditable
          value={analyzedInvention?.abstract || ''}
          onChange={value => onUpdateAbstract(value)}
          placeholder="Enter abstract..."
          fontSize="md"
          lineHeight={1.6}
          padding="0.5rem"
        />
      </div>
    </div>
  );
};

export default TechInventionTitleShadcn;
