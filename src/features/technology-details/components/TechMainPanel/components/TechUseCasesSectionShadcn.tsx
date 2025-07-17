import React from 'react';
import { Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TechSectionProps } from '../types';
import { hasSectionData } from '../../../../../utils/sectionUtils';
import ContentEditableList from '../../../../../components/common/ContentEditableList';

interface TechUseCasesSectionShadcnProps extends TechSectionProps {
  onUpdateUseCases: (items: string[]) => void;
}

/**
 * Component for displaying and editing the invention use cases - shadcn/ui version
 * Maintains exact visual consistency with other shadcn/ui tech sections
 */
export const TechUseCasesSectionShadcn: React.FC<TechUseCasesSectionShadcnProps> =
  React.memo(({ analyzedInvention, getFontSize, onUpdateUseCases }) => {
    // Extract use cases data from analyzedInvention
    const useCases = analyzedInvention?.useCases || [];

    if (!hasSectionData(useCases)) {
      return null;
    }

    return (
      <div className="px-4 py-3">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <Target className="w-4 h-4 text-text-secondary" />
          <span
            className={cn(
              'font-bold text-text-primary',
              getFontSize('md') === '1rem' && 'text-base',
              getFontSize('md') === '1.125rem' && 'text-lg',
              getFontSize('md') === '1.25rem' && 'text-xl'
            )}
          >
            Use Cases
          </span>
        </div>

        {/* Content */}
        <div>
          <ContentEditableList
            items={Array.isArray(useCases) ? useCases : []}
            onChange={onUpdateUseCases}
            placeholder="Add a use case..."
            fontSize="md"
            lineHeight={1.6}
          />
        </div>
      </div>
    );
  });

TechUseCasesSectionShadcn.displayName = 'TechUseCasesSectionShadcn';

export default TechUseCasesSectionShadcn;
