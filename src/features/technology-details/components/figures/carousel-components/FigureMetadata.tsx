import React, { useState } from 'react';
import { useToast } from '@/hooks/useToastWrapper';
import { FiEdit, FiPlus, FiGrid } from 'react-icons/fi';
import CustomEditable from '../../../../../components/common/CustomEditable';
import { FigureMetadataProps } from './types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StandardTooltip } from '@/components/common/StandardTooltip';
import { cn } from '@/lib/utils';

const FigureMetadata: React.FC<
  FigureMetadataProps & {
    onUpdateDescription: (newDescription: string) => void;
  }
> = React.memo(
  ({
    figure,
    figureNum,
    onAddNewFigure,
    onRenameFigure,
    onUpdateDescription,
    onManageAllFigures,
  }) => {
    const toast = useToast();
    const [isEditingFigure, setIsEditingFigure] = useState(false);
    const [figureDraft, setFigureDraft] = useState('');

    const startEditingFigure = () => {
      if (!onRenameFigure) return;
      setFigureDraft(figureNum.replace(/FIG\.\s*/i, ''));
      setIsEditingFigure(true);
    };

    const cancelEditingFigure = () => {
      setIsEditingFigure(false);
      setFigureDraft('');
    };

    const saveFigureNumber = () => {
      if (!onRenameFigure) return;

      const trimmedDraft = figureDraft.trim();
      const originalNumber = figureNum.replace(/FIG\.\s*/i, '');

      // Check if the figure number has actually changed
      if (trimmedDraft === originalNumber) {
        // No change, just exit edit mode
        setIsEditingFigure(false);
        return;
      }

      if (!trimmedDraft || !/^\d+[A-Za-z]*$/i.test(trimmedDraft)) {
        toast({
          title: 'Invalid format',
          description: 'Figure number must be in format "1", "1A", etc.',
          status: 'error',
          duration: 3000,
        });
        return;
      }

      onRenameFigure(trimmedDraft);
      setIsEditingFigure(false);
    };

    return (
      <div className="w-full">
        <div className="flex items-center w-full gap-2">
          <div className="w-25 relative">
            {isEditingFigure ? (
              <div className="flex items-center bg-muted rounded-md p-1 px-2">
                <span className="text-sm mr-1 text-muted-foreground">FIG.</span>
                <Input
                  value={figureDraft}
                  onChange={e => setFigureDraft(e.target.value)}
                  className="h-6 text-sm bg-transparent border-none p-1 pl-1 w-8"
                  autoFocus
                  onKeyDown={e => {
                    if (e.key === 'Enter') saveFigureNumber();
                    if (e.key === 'Escape') cancelEditingFigure();
                  }}
                  onBlur={saveFigureNumber}
                />
              </div>
            ) : (
              <div
                className={cn(
                  'flex items-center rounded-md p-1 px-2 transition-all duration-150 ease-out',
                  'bg-muted',
                  onRenameFigure
                    ? 'cursor-pointer hover:bg-accent'
                    : 'cursor-default'
                )}
                onClick={onRenameFigure ? startEditingFigure : undefined}
              >
                <span className="text-sm text-foreground truncate">
                  {figureNum}
                </span>
                {onRenameFigure && (
                  <FiEdit className="ml-auto w-3 h-3 text-gray-400 dark:text-gray-500" />
                )}
              </div>
            )}
          </div>

          <StandardTooltip label="Add new figure">
            <Button
              variant="ghost"
              size="sm"
              aria-label="Add new figure"
              onClick={onAddNewFigure}
              className="min-w-5 p-1 h-6"
            >
              <FiPlus className="w-3 h-3" />
            </Button>
          </StandardTooltip>

          {onManageAllFigures && (
            <StandardTooltip label="Manage all figures">
              <Button
                variant="ghost"
                size="sm"
                aria-label="Manage all figures"
                onClick={onManageAllFigures}
                className="min-w-5 p-1 h-6"
              >
                <FiGrid className="w-3 h-3" />
              </Button>
            </StandardTooltip>
          )}

          <div className="flex-1 relative">
            <CustomEditable
              value={figure?.title || ''}
              onChange={onUpdateDescription}
              placeholder="Describe this figure..."
              fontSize="xs"
              padding="4px 8px"
              staticBorder
            />
          </div>
        </div>
      </div>
    );
  }
);

FigureMetadata.displayName = 'FigureMetadata';

export default FigureMetadata;
