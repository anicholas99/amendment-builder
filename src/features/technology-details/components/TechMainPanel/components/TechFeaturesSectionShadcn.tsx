import React from 'react';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TechSectionProps } from '../types';
import { hasSectionData } from '../../../../../utils/sectionUtils';
import ContentEditableList from '../../../../../components/common/ContentEditableList';

interface TechFeaturesSectionShadcnProps extends TechSectionProps {
  onUpdateFeatures: (items: string[]) => void;
}

/**
 * Component for displaying and editing the invention features - shadcn/ui version
 * Maintains exact visual consistency with other shadcn/ui tech sections
 */
export const TechFeaturesSectionShadcn: React.FC<TechFeaturesSectionShadcnProps> =
  React.memo(({ analyzedInvention, getFontSize, onUpdateFeatures }) => {
    // Extract features data from analyzedInvention
    const features = analyzedInvention?.features || [];

    if (!hasSectionData(features)) {
      return null;
    }

    return (
      <div className="px-4 py-3">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <Zap className="w-4 h-4 text-text-secondary" />
          <span
            className={cn(
              'font-bold text-text-primary',
              getFontSize('md') === '1rem' && 'text-base',
              getFontSize('md') === '1.125rem' && 'text-lg',
              getFontSize('md') === '1.25rem' && 'text-xl'
            )}
          >
            Key Features
          </span>
        </div>

        {/* Content */}
        <div>
          <ContentEditableList
            items={Array.isArray(features) ? features : []}
            onChange={onUpdateFeatures}
            placeholder="Add a key feature..."
            fontSize="md"
            lineHeight={1.6}
          />
        </div>
      </div>
    );
  });

TechFeaturesSectionShadcn.displayName = 'TechFeaturesSectionShadcn';

export default TechFeaturesSectionShadcn;
