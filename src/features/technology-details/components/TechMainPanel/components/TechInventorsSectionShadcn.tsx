import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TechSectionProps } from '../types';
import { hasSectionData } from '../../../../../utils/sectionUtils';
import ContentEditableList from '../../../../../components/common/ContentEditableList';

interface TechInventorsSectionShadcnProps extends TechSectionProps {
  onUpdateInventors: (items: string[]) => void;
}

/**
 * Component for displaying and editing the invention inventors - shadcn/ui version
 * Maintains exact visual consistency with other shadcn/ui tech sections
 */
export const TechInventorsSectionShadcn: React.FC<TechInventorsSectionShadcnProps> =
  React.memo(({ analyzedInvention, getFontSize, onUpdateInventors }) => {
    // Extract inventors data from analyzedInvention - EXACT SAME AS ADVANTAGES
    const externalInventors = analyzedInvention?.inventors || [];

    const [inventors, setInventors] = useState<string[]>(externalInventors);

    // Sync local state when external value changes (e.g., after save)
    useEffect(() => {
      setInventors(externalInventors);
    }, [externalInventors]);

    // Always show inventors section - critical for patent filing
    // if (!hasSectionData(inventors)) {
    //   return null;
    // }

    return (
      <div className="px-4 py-3">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <Users className="w-4 h-4 text-text-secondary" />
          <span
            className={cn(
              'font-bold text-text-primary',
              getFontSize('md') === '1rem' && 'text-base',
              getFontSize('md') === '1.125rem' && 'text-lg',
              getFontSize('md') === '1.25rem' && 'text-xl'
            )}
          >
            Inventors
          </span>
        </div>

        {/* Content */}
        <div>
          <ContentEditableList
            items={inventors}
            onChange={newItems => {
              setInventors(newItems);
              const meaningful = newItems.filter(item => item.trim());
              if (meaningful.length > 0) {
                onUpdateInventors(meaningful);
              }
            }}
            placeholder="Add an inventor..."
            fontSize="md"
            lineHeight={1.6}
          />
        </div>
      </div>
    );
  });

TechInventorsSectionShadcn.displayName = 'TechInventorsSectionShadcn';

export default TechInventorsSectionShadcn; 