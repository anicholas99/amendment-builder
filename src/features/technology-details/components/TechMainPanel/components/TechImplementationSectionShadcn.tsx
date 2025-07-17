import React from 'react';
import { Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TechSectionProps } from '../types';
import { hasSectionData } from '../../../../../utils/sectionUtils';
import CustomEditable from '../../../../../components/common/CustomEditable';

interface TechImplementationSectionShadcnProps extends TechSectionProps {
  onUpdateImplementation: (value: string) => void;
}

// This component displays the implementation details section of the technology details, using shadcn/ui components.
// It is designed to be visually consistent with previous versions.
export const TechImplementationSectionShadcn: React.FC<
  TechImplementationSectionShadcnProps
> = ({ analyzedInvention, getFontSize, onUpdateImplementation }) => {
  const preferredEmbodiment =
    analyzedInvention?.technicalImplementation?.preferredEmbodiment;

  if (!hasSectionData(preferredEmbodiment)) {
    return null;
  }

  return (
    // Compact padding
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <Settings className="w-5 h-5 text-text-secondary" />
        <span
          className={cn(
            'font-bold text-text-primary',
            getFontSize('lg') === '1.125rem' && 'text-lg',
            getFontSize('lg') === '1.25rem' && 'text-xl',
            getFontSize('lg') === '1.5rem' && 'text-2xl'
          )}
        >
          Preferred Embodiment
        </span>
      </div>

      {/* Content */}
      <div>
        <CustomEditable
          value={String(preferredEmbodiment || '')}
          onChange={onUpdateImplementation}
          placeholder="Describe the preferred embodiment of this technology..."
          fontSize="md"
          padding="0.5rem"
        />
      </div>
    </div>
  );
};

export default TechImplementationSectionShadcn;
