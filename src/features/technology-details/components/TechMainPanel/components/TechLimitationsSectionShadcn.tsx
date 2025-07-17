import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TechSectionProps } from '../types';
import { hasSectionData } from '../../../../../utils/sectionUtils';
import ContentEditableList from '../../../../../components/common/ContentEditableList';

interface TechLimitationsSectionShadcnProps extends TechSectionProps {
  onUpdateLimitations: (items: string[]) => void;
}

/**
 * Component for displaying and editing the invention limitations - shadcn/ui version
 * Maintains exact visual consistency with other shadcn/ui tech sections
 */
export const TechLimitationsSectionShadcn: React.FC<TechLimitationsSectionShadcnProps> =
  React.memo(({ analyzedInvention, getFontSize, onUpdateLimitations }) => {
    // Extract limitations data from analyzedInvention - EXACT SAME AS ADVANTAGES
    const externalLimitations = analyzedInvention?.limitations || [];

    const [limitations, setLimitations] = useState<string[]>(externalLimitations);

    useEffect(() => {
      setLimitations(externalLimitations);
    }, [externalLimitations]);

    // Always show limitations section - encourages defensive patent strategy
    // if (!hasSectionData(limitations)) {
    //   return null;
    // }

    return (
      <div className="px-4 py-3">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <AlertTriangle className="w-4 h-4 text-text-secondary" />
          <span
            className={cn(
              'font-bold text-text-primary',
              getFontSize('md') === '1rem' && 'text-base',
              getFontSize('md') === '1.125rem' && 'text-lg',
              getFontSize('md') === '1.25rem' && 'text-xl'
            )}
          >
            Known Limitations
          </span>
        </div>

        {/* Content */}
        <div>
          <ContentEditableList
            items={limitations}
            onChange={newItems => {
              setLimitations(newItems);
              const meaningful = newItems.filter(item => item.trim());
              if (meaningful.length > 0) {
                onUpdateLimitations(meaningful);
              }
            }}
            placeholder="Add a known limitation..."
            fontSize="md"
            lineHeight={1.6}
          />
        </div>
      </div>
    );
  });

TechLimitationsSectionShadcn.displayName = 'TechLimitationsSectionShadcn';

export default TechLimitationsSectionShadcn; 