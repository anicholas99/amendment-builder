import React from 'react';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TechSectionProps } from '../types';
import { hasSectionData } from '../../../../../utils/sectionUtils';
import ContentEditableList from '../../../../../components/common/ContentEditableList';

interface TechAdvantagesSectionShadcnProps extends TechSectionProps {
  onUpdateAdvantages: (items: string[]) => void;
}

// This component displays the advantages section of the technology details, using shadcn/ui components.
// It is designed to be visually consistent with previous versions.
export const TechAdvantagesSectionShadcn: React.FC<TechAdvantagesSectionShadcnProps> =
  React.memo(({ analyzedInvention, getFontSize, onUpdateAdvantages }) => {
    // Extract advantages data from analyzedInvention
    const advantages = analyzedInvention?.advantages || [];

    if (!hasSectionData(advantages)) {
      return null;
    }

    return (
      <div className="px-4 py-3">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <CheckCircle className="w-4 h-4 text-text-secondary" />
          <span
            className={cn(
              'font-bold text-text-primary',
              getFontSize('md') === '1rem' && 'text-base',
              getFontSize('md') === '1.125rem' && 'text-lg',
              getFontSize('md') === '1.25rem' && 'text-xl'
            )}
          >
            Advantages
          </span>
        </div>

        {/* Content */}
        <div>
          <ContentEditableList
            items={Array.isArray(advantages) ? advantages : []}
            onChange={onUpdateAdvantages}
            placeholder="Add an advantage..."
            fontSize="md"
            lineHeight={1.6}
          />
        </div>
      </div>
    );
  });

TechAdvantagesSectionShadcn.displayName = 'TechAdvantagesSectionShadcn';

export default TechAdvantagesSectionShadcn;
