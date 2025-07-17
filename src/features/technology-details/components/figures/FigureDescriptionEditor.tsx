import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/useToastWrapper';
import { useUpdateFigureMetadata } from '@/hooks/api/useFiguresNormalized';

interface FigureDescriptionEditorProps {
  projectId: string;
  figureId: string;
  figureKey: string;
  currentTitle?: string;
  currentDescription?: string;
  onCancel?: () => void;
  onSuccess?: () => void;
}

/**
 * A simple component demonstrating how to edit figure metadata
 * using the new normalized API endpoints
 */
export const FigureDescriptionEditor: React.FC<
  FigureDescriptionEditorProps
> = ({
  projectId,
  figureId,
  figureKey,
  currentTitle = '',
  currentDescription = '',
  onCancel,
  onSuccess,
}) => {
  const [title, setTitle] = useState(currentTitle);
  const [description, setDescription] = useState(currentDescription);
  const updateMetadata = useUpdateFigureMetadata();
  const toast = useToast();

  const handleSave = async () => {
    try {
      await updateMetadata.mutateAsync({
        projectId,
        figureId,
        updates: {
          title: title.trim(),
          description: description.trim(),
        },
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Error handling is done in the hook, no need to log here
    }
  };

  const hasChanges =
    title.trim() !== currentTitle.trim() ||
    description.trim() !== currentDescription.trim();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`figure-title-${figureId}`} className="font-medium">
          Figure {figureKey} Title
        </Label>
        <Input
          id={`figure-title-${figureId}`}
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Enter figure title..."
          className="text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label
          htmlFor={`figure-description-${figureId}`}
          className="font-medium"
        >
          Description
        </Label>
        <Textarea
          id={`figure-description-${figureId}`}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Enter figure description..."
          rows={4}
          className="text-sm"
        />
      </div>

      <div className="flex justify-end space-x-2">
        {onCancel && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onCancel}
            disabled={updateMetadata.isPending}
          >
            Cancel
          </Button>
        )}
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!hasChanges || updateMetadata.isPending}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {updateMetadata.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};
