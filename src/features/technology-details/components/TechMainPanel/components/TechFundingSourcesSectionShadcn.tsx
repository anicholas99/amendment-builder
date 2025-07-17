import React from 'react';
import { DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TechSectionProps } from '../types';
import { hasSectionData, hasFundingKeywords } from '../../../../../utils/sectionUtils';
import ContentEditableList from '../../../../../components/common/ContentEditableList';

interface TechFundingSourcesSectionShadcnProps extends TechSectionProps {
  onUpdateFundingSources: (items: string[]) => void;
}

/**
 * Component for displaying and editing the invention funding sources - shadcn/ui version
 * Maintains exact visual consistency with other shadcn/ui tech sections
 */
export const TechFundingSourcesSectionShadcn: React.FC<TechFundingSourcesSectionShadcnProps> =
  React.memo(({ analyzedInvention, getFontSize, onUpdateFundingSources }) => {
    // Extract funding sources data from analyzedInvention
    const fundingSources = analyzedInvention?.fundingSources || [];
    
    // Only show if there's funding content or funding sources already exist
    if (!hasSectionData(fundingSources) && !hasFundingKeywords(analyzedInvention)) {
      return null;
    }

    // Check if there are meaningful items (filter out empty strings that ContentEditableList adds)
    const hasMeaningfulItems = fundingSources.filter(item => item.trim()).length > 0;

    return (
      <div className="px-4 py-3">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <DollarSign className="w-4 h-4 text-text-secondary" />
          <span
            className={cn(
              'font-bold text-text-primary',
              getFontSize('md') === '1rem' && 'text-base',
              getFontSize('md') === '1.125rem' && 'text-lg',
              getFontSize('md') === '1.25rem' && 'text-xl'
            )}
          >
            Funding Sources
          </span>
        </div>

        {/* Content */}
        <div>
          {!hasMeaningfulItems && (
            <p className="text-sm text-green-600 mb-2 italic">
              💰 Document funding sources for government compliance requirements
            </p>
          )}
          <ContentEditableList
            items={Array.isArray(fundingSources) ? fundingSources : []}
            onChange={onUpdateFundingSources}
            placeholder="Add a funding source..."
            fontSize="md"
            lineHeight={1.6}
          />
        </div>
      </div>
    );
  });

TechFundingSourcesSectionShadcn.displayName = 'TechFundingSourcesSectionShadcn';

export default TechFundingSourcesSectionShadcn; 