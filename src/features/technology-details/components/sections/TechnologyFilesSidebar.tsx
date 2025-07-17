import React from 'react';
import {
  Upload,
  File,
  X,
  Check,
  BookOpen,
  GripVertical,
  Edit2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UploadedFigure } from '../../hooks/useTechnologyInputFileHandler';

interface TechnologyFilesSidebarProps {
  uploadedFiles: Array<{
    id: string;
    name: string;
    includeInProcessing: boolean;
  }>;
  uploadedFigures?: UploadedFigure[];
  uploadingFiles: string[];
  isDragging: boolean;
  onRemoveTextFile?: (fileName: string) => Promise<void>;
  onToggleFileInProcessing?: (fileName: string) => void;
  onRemoveFigure?: (figureId: string) => void;
  onReorderFigures?: (fromIndex: number, toIndex: number) => void;
  onUpdateFigureNumber?: (figureId: string, newNumber: string) => void;
  onFileInputClick: () => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
}

export const TechnologyFilesSidebar: React.FC<TechnologyFilesSidebarProps> = ({
  uploadedFiles,
  uploadedFigures = [],
  uploadingFiles,
  isDragging,
  onRemoveTextFile,
  onToggleFileInProcessing,
  onRemoveFigure,
  onReorderFigures,
  onUpdateFigureNumber,
  onFileInputClick,
  onDrop,
  onDragOver,
  onDragLeave,
}) => {
  const totalFiles = uploadedFiles.length + uploadedFigures.length;
  const hasUploading = uploadingFiles.length > 0;
  const hasDocuments = uploadedFiles.length > 0;

  // Drag state for figure reordering
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);

  // Edit state for figure numbers
  const [editingFigureId, setEditingFigureId] = React.useState<string | null>(
    null
  );
  const [editingValue, setEditingValue] = React.useState<string>('');

  const handleFigureDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Add a class to the dragged element for styling
    e.currentTarget.classList.add('opacity-50');
  };

  const handleFigureDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-50');
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleFigureDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleFigureDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (
      draggedIndex !== null &&
      draggedIndex !== dropIndex &&
      onReorderFigures
    ) {
      const sortedFigures = [...uploadedFigures].sort((a, b) => {
        // Extract numeric part for primary sorting
        const aNum = parseInt(a.assignedNumber.match(/^\d+/)?.[0] || '0');
        const bNum = parseInt(b.assignedNumber.match(/^\d+/)?.[0] || '0');
        if (aNum !== bNum) return aNum - bNum;
        // If numeric parts are equal, use locale compare for alphanumeric sorting
        return a.assignedNumber.localeCompare(b.assignedNumber);
      });
      const fromIndex = draggedIndex;
      const toIndex = dropIndex;
      onReorderFigures(fromIndex, toIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Figure number editing handlers
  const handleEditFigureNumber = (figure: UploadedFigure) => {
    setEditingFigureId(figure.id);
    setEditingValue(figure.assignedNumber.toString());
  };

  const handleSaveFigureNumber = () => {
    if (editingFigureId && onUpdateFigureNumber) {
      const trimmedValue = editingValue.trim().toUpperCase();
      // Validate format: should be number optionally followed by letters (1, 1A, 2B, etc.)
      const isValid =
        /^\d+[A-Z]*$/.test(trimmedValue) && trimmedValue.length <= 4;

      if (isValid) {
        // Pass the full alphanumeric value
        onUpdateFigureNumber(editingFigureId, trimmedValue);
      }
    }
    setEditingFigureId(null);
    setEditingValue('');
  };

  const handleCancelEdit = () => {
    setEditingFigureId(null);
    setEditingValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveFigureNumber();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <div
      className={`h-full border-2 rounded-lg transition-all duration-200 bg-card/50 ${
        isDragging
          ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-950/20'
          : 'border-dashed border-muted-foreground/30'
      }`}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">
              Files ({totalFiles})
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={onFileInputClick}
              className="h-8 px-3"
            >
              <Upload className="h-3 w-3 mr-1" />
              Add
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col overflow-hidden min-h-0">
          <div className="flex flex-col space-y-3 h-full min-h-0">
            {/* Uploading Files */}
            {hasUploading && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Uploading
                </h4>
                {uploadingFiles.map((fileName, index) => (
                  <div
                    key={`uploading-${index}`}
                    className="flex items-center gap-2 p-2 rounded border border-border bg-muted/30"
                  >
                    <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs text-muted-foreground truncate flex-1">
                      {fileName}
                    </span>
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}

            {/* Uploaded Text Files */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Documents
                  </h4>
                  {hasDocuments && (
                    <div className="flex items-center gap-1">
                      <Check className="h-3 w-3 text-green-600" />
                      <span className="text-xs text-muted-foreground">
                        Include in AI
                      </span>
                      <span className="text-xs text-muted-foreground mx-1">
                        •
                      </span>
                      <BookOpen className="h-3 w-3 text-blue-600" />
                      <span className="text-xs text-muted-foreground">
                        Reference only
                      </span>
                    </div>
                  )}
                </div>
                {uploadedFiles.map((file, index) => (
                  <div
                    key={`text-${file.id}`}
                    className="flex items-center gap-2 p-2 rounded border border-border bg-background hover:bg-muted/50 transition-colors"
                  >
                    <File className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <span className="text-xs text-foreground truncate flex-1">
                      {file.name}
                    </span>

                    {/* Status indicator */}
                    {!file.includeInProcessing && (
                      <span className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                        Reference
                      </span>
                    )}

                    {/* Toggle for include in processing */}
                    {onToggleFileInProcessing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleFileInProcessing(file.name)}
                        className={`h-6 w-6 p-0 transition-colors ${
                          file.includeInProcessing
                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                            : 'hover:bg-muted'
                        }`}
                        title={
                          file.includeInProcessing
                            ? 'Included in AI processing - click to make reference-only'
                            : 'Reference-only document - click to include in AI processing'
                        }
                      >
                        {file.includeInProcessing ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <BookOpen className="h-3 w-3" />
                        )}
                      </Button>
                    )}

                    {onRemoveTextFile && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveTextFile?.(file.name)}
                        className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}

                {/* Explanatory text */}
                {hasDocuments && (
                  <div className="px-2 py-1 bg-muted/20 rounded-sm">
                    <p className="text-xs text-muted-foreground">
                      <Check className="h-3 w-3 inline mr-1" />
                      Files are sent to AI for analysis •{' '}
                      <BookOpen className="h-3 w-3 inline mr-1" />
                      Files are saved as project references only
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Uploaded Figures */}
            {uploadedFigures.length > 0 && (
              <div className="flex flex-col flex-1 space-y-2 overflow-hidden min-h-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Figures ({uploadedFigures.length})
                  </h4>
                </div>
                {/* Scrollable figures container */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
                  {uploadedFigures
                    .sort((a, b) => {
                      // Extract numeric part for sorting
                      const aNum = parseInt(
                        a.assignedNumber.match(/^\d+/)?.[0] || '0'
                      );
                      const bNum = parseInt(
                        b.assignedNumber.match(/^\d+/)?.[0] || '0'
                      );

                      // If numeric parts are the same, sort by the full string
                      if (aNum === bNum) {
                        return a.assignedNumber.localeCompare(b.assignedNumber);
                      }
                      return aNum - bNum;
                    })
                    .map((figure, index) => (
                      <div
                        key={`figure-${figure.id}`}
                        className={`flex items-center gap-2 p-2 rounded border bg-background transition-all cursor-move
                        ${dragOverIndex === index ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/20' : 'border-border hover:bg-muted/50'}
                        ${draggedIndex === index ? 'opacity-50' : ''}
                      `}
                        draggable={!!onReorderFigures}
                        onDragStart={e => handleFigureDragStart(e, index)}
                        onDragEnd={handleFigureDragEnd}
                        onDragOver={e => handleFigureDragOver(e, index)}
                        onDrop={e => handleFigureDrop(e, index)}
                      >
                        {/* Drag handle */}
                        {onReorderFigures && (
                          <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        )}

                        {/* Figure number badge */}
                        {editingFigureId === figure.id ? (
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Input
                              value={editingValue}
                              onChange={e => setEditingValue(e.target.value)}
                              onKeyDown={handleKeyDown}
                              onBlur={handleSaveFigureNumber}
                              className="h-8 w-12 text-xs text-center p-1 border-0 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold"
                              type="text"
                              placeholder="1A"
                              autoFocus
                            />
                          </div>
                        ) : (
                          <div
                            className="flex items-center justify-center h-8 w-8 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-semibold flex-shrink-0 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors group"
                            onClick={() =>
                              onUpdateFigureNumber &&
                              handleEditFigureNumber(figure)
                            }
                            title="Click to edit figure number"
                          >
                            {figure.assignedNumber}
                            {onUpdateFigureNumber && (
                              <Edit2 className="h-2.5 w-2.5 ml-1 opacity-0 group-hover:opacity-60 transition-opacity" />
                            )}
                          </div>
                        )}

                        {/* Small thumbnail preview */}
                        <div className="relative h-10 w-10 bg-muted/20 rounded flex-shrink-0">
                          <img
                            src={figure.url}
                            alt={figure.fileName}
                            className="h-full w-full object-contain rounded"
                          />
                        </div>

                        {/* Figure info */}
                        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                          <span className="text-xs font-medium text-foreground">
                            Figure {figure.assignedNumber}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">
                            {figure.fileName}
                            {figure.detectedNumber !== null &&
                              figure.detectedNumber !==
                                figure.assignedNumber && (
                                <span className="ml-1 text-amber-600 dark:text-amber-400">
                                  (detected: {figure.detectedNumber})
                                </span>
                              )}
                          </span>
                        </div>

                        {/* Remove button */}
                        {onRemoveFigure && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemoveFigure(figure.id)}
                            className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {totalFiles === 0 && !hasUploading && (
              <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center">
                <Upload className="h-8 w-8 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drop files here
                </p>
                <p className="text-xs text-muted-foreground/70">
                  PDF, DOCX, TXT, Images
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
