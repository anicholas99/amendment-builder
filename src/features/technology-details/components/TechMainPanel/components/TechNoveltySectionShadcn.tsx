import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TechSectionProps } from '../types';
import CustomEditable from '../../../../../components/common/CustomEditable';

interface TechNoveltySectionShadcnProps extends TechSectionProps {
  onUpdateNovelty: (value: string) => void;
}

// This component displays the novelty statement section of the technology details, using shadcn/ui components.
// It is designed to be visually consistent with previous versions.
export const TechNoveltySectionShadcn: React.FC<
  TechNoveltySectionShadcnProps
> = ({ analyzedInvention, getFontSize, onUpdateNovelty }) => {
  const noveltyValue =
    typeof analyzedInvention?.novelty === 'string'
      ? analyzedInvention.novelty
      : '';

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <Star className="w-5 h-5 text-text-secondary" />
        <span
          className={cn(
            'font-bold text-text-primary',
            getFontSize('lg') === '1.125rem' && 'text-lg',
            getFontSize('lg') === '1.25rem' && 'text-xl',
            getFontSize('lg') === '1.5rem' && 'text-2xl'
          )}
        >
          Novelty
        </span>
      </div>

      {/* Content */}
      <div>
        {noveltyValue ? (
          <CustomEditable
            value={noveltyValue}
            onChange={onUpdateNovelty}
            placeholder="Describe what makes this invention novel..."
            fontSize="md"
            padding="0.5rem"
          />
        ) : (
          <CustomEditable
            value=""
            onChange={onUpdateNovelty}
            placeholder="Describe what makes this invention novel... This will be automatically extracted during invention analysis."
            fontSize="md"
            padding="0.5rem"
          />
        )}
      </div>
    </div>
  );
};

export default TechNoveltySectionShadcn;
