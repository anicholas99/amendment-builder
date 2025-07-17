import React from 'react';
import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TechSectionProps } from '../types';
import { hasSectionData } from '../../../../../utils/sectionUtils';
import CustomEditable from '../../../../../components/common/CustomEditable';

interface TechSummarySectionShadcnProps extends TechSectionProps {
  onUpdateSummary: (value: string) => void;
}

// This component displays the summary section of the technology details, using shadcn/ui components.
// It is designed to be visually consistent with previous versions.
export const TechSummarySectionShadcn: React.FC<TechSummarySectionShadcnProps> =
  React.memo(({ analyzedInvention, getFontSize, onUpdateSummary }) => {
    if (!hasSectionData(analyzedInvention?.summary)) {
      return null;
    }

    return (
      <div className="px-4 py-3">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <FileText className="w-4 h-4 text-text-secondary" />
          <span
            className={cn(
              'font-bold text-text-primary',
              getFontSize('md') === '1rem' && 'text-base',
              getFontSize('md') === '1.125rem' && 'text-lg',
              getFontSize('md') === '1.25rem' && 'text-xl'
            )}
          >
            Summary
          </span>
        </div>

        {/* Content */}
        <div>
          <CustomEditable
            value={analyzedInvention?.summary || ''}
            onChange={onUpdateSummary}
            placeholder="Enter a summary of the invention..."
            fontSize="md"
            lineHeight={1.6}
            padding="0.5rem"
          />
        </div>
      </div>
    );
  });

TechSummarySectionShadcn.displayName = 'TechSummarySectionShadcn';

export default TechSummarySectionShadcn;
