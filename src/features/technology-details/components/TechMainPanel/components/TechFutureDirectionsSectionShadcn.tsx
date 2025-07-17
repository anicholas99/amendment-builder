import React from 'react';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TechSectionProps } from '../types';
import { hasSectionData } from '../../../../../utils/sectionUtils';
import ContentEditableList from '../../../../../components/common/ContentEditableList';

interface TechFutureDirectionsSectionShadcnProps extends TechSectionProps {
  onUpdateFutureDirections: (items: string[]) => void;
}

/**
 * Component for displaying and editing the invention future directions - shadcn/ui version
 * Maintains exact visual consistency with other shadcn/ui tech sections
 */
export const TechFutureDirectionsSectionShadcn: React.FC<TechFutureDirectionsSectionShadcnProps> =
  React.memo(({ analyzedInvention, getFontSize, onUpdateFutureDirections }) => {
    // Extract future directions data from analyzedInvention
    const futureDirections = analyzedInvention?.futureDirections || [];

    if (!hasSectionData(futureDirections)) {
      return null;
    }

    return (
      <div className="px-4 py-3">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <TrendingUp className="w-4 h-4 text-text-secondary" />
          <span
            className={cn(
              'font-bold text-text-primary',
              getFontSize('md') === '1rem' && 'text-base',
              getFontSize('md') === '1.125rem' && 'text-lg',
              getFontSize('md') === '1.25rem' && 'text-xl'
            )}
          >
            Future Directions
          </span>
        </div>

        {/* Content */}
        <div>
          <ContentEditableList
            items={Array.isArray(futureDirections) ? futureDirections : []}
            onChange={onUpdateFutureDirections}
            placeholder="Add a future direction..."
            fontSize="md"
            lineHeight={1.6}
          />
        </div>
      </div>
    );
  });

TechFutureDirectionsSectionShadcn.displayName =
  'TechFutureDirectionsSectionShadcn';

export default TechFutureDirectionsSectionShadcn;
