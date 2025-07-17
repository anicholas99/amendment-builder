import React from 'react';
import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TechSectionProps } from '../types';
import { hasSectionData } from '../../../../../utils/sectionUtils';
import ContentEditableList from '../../../../../components/common/ContentEditableList';

interface TechAttorneyNotesSectionShadcnProps extends TechSectionProps {
  onUpdateAttorneyNotes: (items: string[]) => void;
}

/**
 * Component for displaying and editing the attorney notes - shadcn/ui version
 * Maintains exact visual consistency with other shadcn/ui tech sections
 */
export const TechAttorneyNotesSectionShadcn: React.FC<TechAttorneyNotesSectionShadcnProps> =
  React.memo(({ analyzedInvention, getFontSize, onUpdateAttorneyNotes }) => {
    // Extract attorney notes data from analyzedInvention
    const attorneyNotes = analyzedInvention?.attorneyNotes || [];

    if (!hasSectionData(attorneyNotes)) {
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
            Attorney Notes
          </span>
        </div>

        {/* Content */}
        <div>
          <ContentEditableList
            items={Array.isArray(attorneyNotes) ? attorneyNotes : []}
            onChange={onUpdateAttorneyNotes}
            placeholder="Add a confidential attorney note..."
            fontSize="md"
            lineHeight={1.6}
          />
        </div>
      </div>
    );
  });

TechAttorneyNotesSectionShadcn.displayName = 'TechAttorneyNotesSectionShadcn';

export default TechAttorneyNotesSectionShadcn; 