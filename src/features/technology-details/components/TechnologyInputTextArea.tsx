import React from 'react';
import { Upload } from 'lucide-react';

interface TechnologyInputTextAreaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isProcessing: boolean;
  isUploading: boolean;
  isDragging: boolean;
  handleDrop: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  placeholder?: string;
}

/**
 * Text area component with drag-and-drop functionality for the technology details input
 */
export const TechnologyInputTextArea: React.FC<
  TechnologyInputTextAreaProps
> = ({
  value,
  onChange,
  isProcessing,
  isUploading,
  isDragging,
  handleDrop,
  handleDragOver,
  handleDragLeave,
  placeholder = 'Describe your invention in detail...',
}) => {
  const isDisabled = isProcessing || isUploading;

  return (
    <div className="relative h-full">
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={isDisabled}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          w-full h-full resize-none border-0 outline-none p-4 
          bg-transparent text-foreground placeholder:text-muted-foreground
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isDragging ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}
        `}
        style={{
          fontFamily: 'inherit',
          fontSize: '14px',
          lineHeight: '1.5',
        }}
      />

      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-50/80 dark:bg-blue-950/40 rounded-lg border-2 border-dashed border-blue-400 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-2 text-blue-600 dark:text-blue-400">
            <Upload className="h-8 w-8" />
            <p className="text-sm font-medium">Drop files to upload</p>
          </div>
        </div>
      )}

      {/* Processing overlay */}
      {isProcessing && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Processing...</p>
          </div>
        </div>
      )}

      {/* Character count */}
      {value.length > 0 && (
        <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
          {value.length} characters
        </div>
      )}
    </div>
  );
};

TechnologyInputTextArea.displayName = 'TechnologyInputTextArea';
