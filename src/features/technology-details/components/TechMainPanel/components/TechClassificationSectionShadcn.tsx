import React from 'react';
import { Grid3x3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import CustomEditable from '../../../../../components/common/CustomEditable';
import { TechSectionProps } from '../types';
import {
  mapAiFieldToDisplayValue,
  mapDisplayValueToAiField,
  getTechnicalFieldOptions,
} from '../../../utils/technicalFieldMapping';
import { hasSectionData } from '../../../../../utils/sectionUtils';

interface TechClassificationSectionShadcnProps extends TechSectionProps {
  onUpdatePatentCategory: (value: string) => void;
  onUpdateTechnicalField: (value: string) => void;
}

// This component displays the classification section of the technology details, using shadcn/ui components.
// It is designed to be visually consistent with previous versions.
export const TechClassificationSectionShadcn: React.FC<
  TechClassificationSectionShadcnProps
> = ({
  analyzedInvention,
  getFontSize,
  onUpdatePatentCategory,
  onUpdateTechnicalField,
}) => {
  // Get the mapped technical field value for the dropdown
  const mappedTechnicalField =
    analyzedInvention?.technicalField &&
    typeof analyzedInvention.technicalField === 'string'
      ? mapAiFieldToDisplayValue(analyzedInvention.technicalField)
      : '';

  // Get all available dropdown options
  const technicalFieldOptions = getTechnicalFieldOptions();

  const handleTechnicalFieldChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const displayValue = e.target.value;
    // Convert display value back to AI format for consistency
    const aiFieldValue = mapDisplayValueToAiField(displayValue);
    onUpdateTechnicalField(aiFieldValue);
  };

  return (
    <div className="px-4 py-3">
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center gap-3">
          <Grid3x3 className="w-4 h-4 text-text-secondary" />
          <span
            className={cn(
              'font-bold text-text-primary',
              getFontSize('md') === '1rem' && 'text-base',
              getFontSize('md') === '1.125rem' && 'text-lg',
              getFontSize('md') === '1.25rem' && 'text-xl'
            )}
          >
            Technology Classification
          </span>
        </div>
      </div>

      {/* Content */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {/* Patent Category */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Grid3x3 className="w-3 h-3 text-text-secondary" />
              <span
                className={cn(
                  'font-semibold text-text-primary',
                  getFontSize('sm') === '0.875rem' && 'text-sm',
                  getFontSize('sm') === '1rem' && 'text-base',
                  getFontSize('sm') === '1.125rem' && 'text-lg'
                )}
              >
                Patent Category
              </span>
            </div>
            <CustomEditable
              value={analyzedInvention?.patentCategory || ''}
              onChange={onUpdatePatentCategory}
              placeholder="e.g., Software, Hardware, etc."
              fontSize="md"
            />
          </div>

          {/* Technical Field */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Grid3x3 className="w-3 h-3 text-text-secondary" />
              <span
                className={cn(
                  'font-semibold text-text-primary',
                  getFontSize('sm') === '0.875rem' && 'text-sm',
                  getFontSize('sm') === '1rem' && 'text-base',
                  getFontSize('sm') === '1.125rem' && 'text-lg'
                )}
              >
                Technical Field
              </span>
            </div>
            <select
              value={mappedTechnicalField}
              onChange={handleTechnicalFieldChange}
              className={cn(
                'w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 hover:border-ring/50 transition-colors',
                getFontSize('md') === '1rem' && 'text-base',
                getFontSize('md') === '1.125rem' && 'text-lg',
                getFontSize('md') === '1.25rem' && 'text-xl'
              )}
            >
              <option value="">Select technical field</option>
              {technicalFieldOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechClassificationSectionShadcn;
