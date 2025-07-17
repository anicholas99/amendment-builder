import React from 'react';
import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TechSectionProps } from '../types';
import { hasSectionData } from '../../../../../utils/sectionUtils';
import CustomEditable from '../../../../../components/common/CustomEditable';

interface TechBackgroundSectionShadcnProps extends TechSectionProps {
  onUpdateBackgroundTechnicalField: (value: string) => void;
  onUpdateProblemsSolved: (items: string[]) => void;
  onUpdateExistingSolutions: (items: string[]) => void;
}

/**
 * Component for displaying and editing the technology background - shadcn/ui version
 * Maintains exact visual consistency with other shadcn/ui tech sections
 */
export const TechBackgroundSectionShadcn: React.FC<TechBackgroundSectionShadcnProps> =
  React.memo(
    ({
      analyzedInvention,
      getFontSize,
      onUpdateBackgroundTechnicalField,
      onUpdateProblemsSolved,
      onUpdateExistingSolutions,
    }) => {
      // Helper functions to get array data
      const getProblemsArray = () => {
        const background = analyzedInvention?.background;
        if (typeof background === 'object' && background?.problemsSolved) {
          return Array.isArray(background.problemsSolved)
            ? background.problemsSolved
            : [String(background.problemsSolved)];
        }
        return [];
      };

      const getExistingSolutionsArray = () => {
        const background = analyzedInvention?.background;
        if (typeof background === 'object' && background?.existingSolutions) {
          return Array.isArray(background.existingSolutions)
            ? background.existingSolutions
            : [String(background.existingSolutions)];
        }
        return [];
      };

      // Get technical field from background object or top-level
      const getTechnicalField = () => {
        const background = analyzedInvention?.background;
        if (typeof background === 'object' && background?.technicalField) {
          return String(background.technicalField);
        }
        return String(analyzedInvention?.technicalField || '');
      };

      if (
        !hasSectionData(getTechnicalField()) &&
        !hasSectionData(getProblemsArray()) &&
        !hasSectionData(getExistingSolutionsArray())
      ) {
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
              Background
            </span>
          </div>

          {/* Content */}
          <div>
            <CustomEditable
              value={getTechnicalField()}
              onChange={onUpdateBackgroundTechnicalField}
              placeholder="Describe the technical field and existing solutions your invention improves upon..."
              fontSize="md"
              lineHeight={1.6}
              padding="0.5rem"
            />
          </div>
        </div>
      );
    }
  );

TechBackgroundSectionShadcn.displayName = 'TechBackgroundSectionShadcn';

export default TechBackgroundSectionShadcn;
