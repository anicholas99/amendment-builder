import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Undo,
  Redo,
  Save,
  History,
  Download,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  AlignJustify,
  ChevronDown,
} from 'lucide-react';
import { useThemeContext } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { SavePatentVersionButton } from './SavePatentVersionButton';
import type { Editor } from '@tiptap/react';

interface ResponsiveToolbarButtons {
  showReset: boolean;
  showZoom: boolean;
  showExportDOCX: boolean;
  showVersionHistory: boolean;
  showSaveVersion: boolean;
  collapsedButtons: string[];
}

interface PatentEditorHeaderProps {
  editor: Editor | null;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onExportDocx: () => void;
  onResetApplication?: () => void;
  onOpenVersionHistory?: () => void;
  onSaveVersion?: (description?: string) => Promise<void>;
  canShowVersionUI?: boolean;
  visibleButtons: ResponsiveToolbarButtons;
  isSaving?: boolean;
  showSaved?: boolean;
  hasUnsavedChanges?: boolean;
  actualProjectId?: string;
}

interface SaveStatus {
  type: 'saved' | 'saving' | 'unsaved' | 'error';
  message: string;
  timestamp?: Date;
}

/**
 * Enhanced save status component with real-time feedback
 */
const SaveStatusIndicator: React.FC<{
  isSaving?: boolean;
  hasUnsavedChanges?: boolean;
  showSaved?: boolean;
}> = ({ isSaving, hasUnsavedChanges, showSaved }) => {
  const [saveStatus, setSaveStatus] = React.useState<SaveStatus>({
    type: 'saved',
    message: 'All changes saved',
  });
  const [lastSaveTime, setLastSaveTime] = React.useState<Date | null>(null);

  // Update save status based on props
  React.useEffect(() => {
    if (isSaving) {
      setSaveStatus({
        type: 'saving',
        message: 'Saving...',
        timestamp: new Date(),
      });
    } else if (hasUnsavedChanges) {
      setSaveStatus({
        type: 'unsaved',
        message: 'Unsaved changes',
        timestamp: new Date(),
      });
    } else if (showSaved) {
      const now = new Date();
      setSaveStatus({
        type: 'saved',
        message: 'All changes saved',
        timestamp: now,
      });
      setLastSaveTime(now);
    }
  }, [isSaving, hasUnsavedChanges, showSaved]);

  // Format relative time
  const getRelativeTime = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);

    if (diffSecs < 10) return 'just now';
    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffMins < 60) return `${diffMins}m ago`;
    return timestamp.toLocaleTimeString();
  };

  // Get subtle status styling
  const getStatusStyling = () => {
    switch (saveStatus.type) {
      case 'saving':
        return {
          dotColor: 'bg-blue-500/70 dark:bg-blue-400/70',
          textColor: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-50/80 dark:bg-blue-950/30',
          borderColor: 'border-blue-200/50 dark:border-blue-800/50',
          icon: '●',
          animate: true,
        };
      case 'unsaved':
        return {
          dotColor: 'bg-amber-500/70 dark:bg-amber-400/70',
          textColor: 'text-amber-600 dark:text-amber-400',
          bgColor: 'bg-amber-50/80 dark:bg-amber-950/30',
          borderColor: 'border-amber-200/50 dark:border-amber-800/50',
          icon: '●',
          animate: false,
        };
      case 'error':
        return {
          dotColor: 'bg-red-500/70 dark:bg-red-400/70',
          textColor: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-50/80 dark:bg-red-950/30',
          borderColor: 'border-red-200/50 dark:border-red-800/50',
          icon: '!',
          animate: false,
        };
      default: // saved
        return {
          dotColor: 'bg-green-500/70 dark:bg-green-400/70',
          textColor: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50/80 dark:bg-green-950/30',
          borderColor: 'border-green-200/50 dark:border-green-800/50',
          icon: '✓',
          animate: false,
        };
    }
  };

  const styling = getStatusStyling();

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-300',
        styling.bgColor,
        styling.borderColor
      )}
      title={
        lastSaveTime
          ? `Last saved: ${lastSaveTime.toLocaleTimeString()}`
          : saveStatus.message
      }
    >
      {/* Status indicator dot */}
      <div className="flex items-center gap-1.5">
        <div
          className={cn(
            'w-2 h-2 rounded-full transition-all duration-200',
            styling.dotColor,
            styling.animate && 'animate-pulse'
          )}
        />
        <span
          className={cn(
            'hidden sm:inline transition-colors',
            styling.textColor
          )}
        >
          {saveStatus.message}
        </span>
        {saveStatus.timestamp && saveStatus.type === 'saved' && (
          <span
            className={cn(
              'hidden md:inline text-xs opacity-60 transition-colors',
              styling.textColor
            )}
          >
            • {getRelativeTime(saveStatus.timestamp)}
          </span>
        )}
      </div>
    </div>
  );
};

export const PatentEditorHeader: React.FC<PatentEditorHeaderProps> = ({
  editor,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onExportDocx,
  onResetApplication,
  onOpenVersionHistory,
  onSaveVersion,
  canShowVersionUI = false,
  visibleButtons = {
    showReset: true,
    showZoom: true,
    showExportDOCX: true,
    showVersionHistory: true,
    showSaveVersion: true,
    collapsedButtons: [],
  },
  isSaving = false,
  showSaved = false,
  hasUnsavedChanges = false,
  actualProjectId,
}) => {
  // Helper function to check if paragraph numbers are actually visible in the document
  const areNumbersVisible = (editor: Editor | null): boolean => {
    if (!editor) return false;

    // Check if the document contains patent paragraph numbers like [0001], [0002], etc.
    const content = editor.state.doc.textContent;
    const paragraphNumberRegex = /\[\d{4}\]/;
    return paragraphNumberRegex.test(content);
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between px-3 py-2 border-b min-h-[44px]',
        'bg-bg-panel-header rounded-t-md'
      )}
    >
      {/* Left side - Save Status */}
      <div className="flex items-center gap-3">
        <SaveStatusIndicator
          isSaving={isSaving}
          hasUnsavedChanges={hasUnsavedChanges}
          showSaved={showSaved}
        />
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-1">
        {/* Zoom Controls */}
        <div className="flex items-center space-x-0 mr-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={onZoomOut}
                className="h-8 rounded-r-none"
                aria-label="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom Out</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={onResetZoom}
                className="h-8 rounded-none border-l-0 border-r-0 px-3"
                aria-label="Reset Zoom"
              >
                {zoomLevel}%
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset Zoom to 100%</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={onZoomIn}
                className="h-8 rounded-l-none"
                aria-label="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom In</TooltipContent>
          </Tooltip>
        </div>

        {/* Paragraph Numbering Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'h-8 w-8 p-0 mr-2',
                areNumbersVisible(editor) && 'bg-accent text-accent-foreground'
              )}
              onClick={() => {
                if (!editor) {
                  // logger.warn(
                  //   '[PatentEditorHeader] No editor available for paragraph numbering toggle'
                  // );
                  return;
                }

                const currentState =
                  editor.storage.contentBasedParagraphNumbering?.enabled;
                // logger.info(
                //   '[PatentEditorHeader] Toggling paragraph numbering',
                //   {
                //     currentState,
                //     extensionAvailable:
                //       !!editor.storage.contentBasedParagraphNumbering,
                //   }
                // );

                // Capture scroll position before toggle to prevent header shifting
                const editorDom = editor.view.dom as HTMLElement;
                const scrollContainer = editorDom.closest(
                  '.patent-editor-tiptap'
                ) as HTMLElement;
                const scrollTop = scrollContainer?.scrollTop || 0;

                // Perform the toggle
                const success = editor
                  .chain()
                  .focus()
                  .toggleParagraphNumbering()
                  .run();

                if (success) {
                  // logger.info('[PatentEditorHeader] Toggle command successful');

                  // Log the state change without forcing manual updates
                  requestAnimationFrame(() => {
                    const newState =
                      editor.storage.contentBasedParagraphNumbering?.enabled;
                    // logger.info('[PatentEditorHeader] State after toggle', {
                    //   previousState: currentState,
                    //   newState,
                    //   changed: currentState !== newState,
                    // });
                  });
                } else {
                  // logger.error('[PatentEditorHeader] Toggle command failed');
                }

                // Restore scroll position after toggle to prevent layout shifts
                requestAnimationFrame(() => {
                  if (
                    scrollContainer &&
                    scrollContainer.scrollTop !== scrollTop
                  ) {
                    scrollContainer.scrollTop = scrollTop;
                  }
                });
              }}
              aria-label="Toggle Patent Paragraph Numbering"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Toggle Patent Paragraph Numbering</TooltipContent>
        </Tooltip>

        {/* Double Spacing Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'h-8 w-8 p-0 mr-2',
                // Check if double spacing is enabled by looking for the CSS class
                (() => {
                  if (!editor) return false;
                  const editorDom = editor.view.dom as HTMLElement;
                  const container = editorDom.closest(
                    '.patent-editor-tiptap'
                  ) as HTMLElement;
                  return container?.classList.contains('uspto-double-spacing');
                })() && 'bg-accent text-accent-foreground'
              )}
              onClick={() => {
                if (!editor) {
                  // logger.warn(
                  //   '[PatentEditorHeader] No editor available for double spacing toggle'
                  // );
                  return;
                }

                const editorDom = editor.view.dom as HTMLElement;
                const container = editorDom.closest(
                  '.patent-editor-tiptap'
                ) as HTMLElement;

                if (!container) {
                  // logger.warn(
                  //   '[PatentEditorHeader] Could not find editor container'
                  // );
                  return;
                }

                const isCurrentlyDouble = container.classList.contains(
                  'uspto-double-spacing'
                );
                // logger.info('[PatentEditorHeader] Toggling double spacing', {
                //   isCurrentlyDouble,
                //   containerFound: !!container,
                // });

                // Capture scroll position before toggle to prevent header shifting
                const scrollTop = container.scrollTop || 0;

                // Toggle the CSS class
                if (isCurrentlyDouble) {
                  container.classList.remove('uspto-double-spacing');
                } else {
                  container.classList.add('uspto-double-spacing');
                }

                // logger.info('[PatentEditorHeader] Double spacing toggled', {
                //   newState: container.classList.contains(
                //     'uspto-double-spacing'
                //   ),
                // });

                // Restore scroll position after toggle to prevent layout shifts
                requestAnimationFrame(() => {
                  if (container.scrollTop !== scrollTop) {
                    container.scrollTop = scrollTop;
                  }
                });
              }}
              aria-label="Toggle Patent Double Spacing"
            >
              <AlignJustify className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Toggle Double Spacing (USPTO Compliance)
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6" />

        {/* Version Management */}
        {canShowVersionUI && onSaveVersion && (
          <SavePatentVersionButton 
            onSaveVersion={onSaveVersion}
            size="sm"
            variant="outline"
          />
        )}

        {canShowVersionUI && onOpenVersionHistory && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={onOpenVersionHistory}
                aria-label="Version History"
              >
                <History className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>View Version History</TooltipContent>
          </Tooltip>
        )}

        {/* Export */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={onExportDocx}
              aria-label="Export DOCX"
            >
              <Download className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Export to DOCX</TooltipContent>
        </Tooltip>

        {/* Reset */}
        {onResetApplication && visibleButtons.showReset && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={onResetApplication}
                aria-label="Reset Application"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset Application Content</TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
};
