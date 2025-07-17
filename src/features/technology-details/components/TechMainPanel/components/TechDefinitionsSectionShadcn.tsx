import React from 'react';
import { Book } from 'lucide-react';
import { cn } from '@/lib/utils';
import CustomEditable from '../../../../../components/common/CustomEditable';
import { TechSectionProps } from '../types';

interface TechDefinitionsSectionShadcnProps extends TechSectionProps {
  onUpdateDefinitions: (definitions: Record<string, string>) => void;
}

// This component displays the definitions section of the technology details, using shadcn/ui components.
// It is designed to be visually consistent with previous versions.
const TechDefinitionsSectionShadcn: React.FC<
  TechDefinitionsSectionShadcnProps
> = ({ analyzedInvention, getFontSize, onUpdateDefinitions }) => {
  // Handle definitions as object (from GPT) or convert to object format
  const definitions = analyzedInvention?.definitions || {};
  const definitionsObj =
    typeof definitions === 'object' && !Array.isArray(definitions)
      ? definitions
      : {};

  const definitionEntries = Object.entries(definitionsObj);

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <Book className="w-5 h-5 text-text-secondary" />
        <span
          className={cn(
            'font-bold text-text-primary',
            getFontSize('lg') === '1.125rem' && 'text-lg',
            getFontSize('lg') === '1.25rem' && 'text-xl',
            getFontSize('lg') === '1.5rem' && 'text-2xl'
          )}
        >
          Definitions
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3">
        {definitionEntries.length > 0 ? (
          definitionEntries.map(([term, definition], index) => (
            <div key={index}>
              <div
                className={cn(
                  'leading-relaxed',
                  getFontSize('md') === '1rem' && 'text-base',
                  getFontSize('md') === '1.125rem' && 'text-lg',
                  getFontSize('md') === '1.25rem' && 'text-xl'
                )}
              >
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {term}:
                </span>{' '}
                <CustomEditable
                  value={definition}
                  onChange={(newDefinition: string) => {
                    const updatedDefinitions = { ...definitionsObj };
                    updatedDefinitions[term] = newDefinition;
                    onUpdateDefinitions(updatedDefinitions);
                  }}
                  placeholder="Enter definition..."
                  fontSize="md"
                  lineHeight="1.6"
                  className="inline"
                  padding="0.125rem"
                />
              </div>
            </div>
          ))
        ) : (
          <p
            className={cn(
              'text-muted-foreground italic',
              getFontSize('md') === '1rem' && 'text-base',
              getFontSize('md') === '1.125rem' && 'text-lg',
              getFontSize('md') === '1.25rem' && 'text-xl'
            )}
          >
            No technical definitions defined yet. Definitions will be
            automatically extracted during invention analysis.
          </p>
        )}
      </div>
    </div>
  );
};

export default TechDefinitionsSectionShadcn;
