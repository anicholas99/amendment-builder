import React from 'react';
import { Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TechSectionProps } from '../types';
import { hasSectionData } from '../../../../../utils/sectionUtils';
import ContentEditableList from '../../../../../components/common/ContentEditableList';

interface TechManufacturingMethodsSectionShadcnProps extends TechSectionProps {
  onUpdateManufacturingMethods: (items: string[]) => void;
}

/**
 * Component for displaying and editing the invention manufacturing methods - shadcn/ui version
 * Maintains exact visual consistency with other shadcn/ui tech sections
 */
export const TechManufacturingMethodsSectionShadcn: React.FC<TechManufacturingMethodsSectionShadcnProps> =
  React.memo(
    ({ analyzedInvention, getFontSize, onUpdateManufacturingMethods }) => {
      // Extract manufacturing methods data from technicalImplementation
      const technicalImplementation =
        analyzedInvention?.technicalImplementation || {};
      const manufacturingMethods =
        technicalImplementation?.manufacturing_methods || [];

      if (!hasSectionData(manufacturingMethods)) {
        return null;
      }

      return (
        <div className="px-4 py-3">
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <Settings className="w-4 h-4 text-text-secondary" />
            <span
              className={cn(
                'font-bold text-text-primary',
                getFontSize('md') === '1rem' && 'text-base',
                getFontSize('md') === '1.125rem' && 'text-lg',
                getFontSize('md') === '1.25rem' && 'text-xl'
              )}
            >
              Manufacturing Methods
            </span>
          </div>

          {/* Content */}
          <div>
            <ContentEditableList
              items={
                Array.isArray(manufacturingMethods) ? manufacturingMethods : []
              }
              onChange={onUpdateManufacturingMethods}
              placeholder="Add a manufacturing method..."
              fontSize="md"
              lineHeight={1.6}
            />
          </div>
        </div>
      );
    }
  );

TechManufacturingMethodsSectionShadcn.displayName =
  'TechManufacturingMethodsSectionShadcn';

export default TechManufacturingMethodsSectionShadcn;
