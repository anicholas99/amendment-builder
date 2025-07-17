import React, {
  useState,
  useRef,
  useEffect,
  ChangeEvent,
  KeyboardEvent,
  useCallback,
} from 'react';
import { logger } from '@/utils/clientLogger';
import { cn } from '@/lib/utils';
import {
  FiTrash2,
  FiPlus,
  FiMoreVertical,
  FiArrowUp,
  FiArrowDown,
  FiCopy,
  FiCheck,
  FiRefreshCw,
} from 'react-icons/fi';
import {
  FaCheck,
  FaTimes,
  FaEdit,
  FaTrash,
  FaPlus,
  FaUndo,
  FaRedo,
} from 'react-icons/fa';
import { EditableClaimProps } from '../../../types/claimTypes';
import { InventionData } from '@/types/invention';
import { validateClaimText } from '../utils/validation';
import { apiFetch } from '@/lib/api/apiClient';
import { useGenerateDependentClaims } from '../hooks/usePriorArtOperations';
import { useClaimUndoRedo } from '../hooks/useClaimUndoRedo';
import { EditableClaimNumberShadcn } from './EditableClaimNumberShadcn';
import { useDebouncedCallback } from 'use-debounce';
import { LoadingMinimal } from '@/components/common/LoadingState';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/useToastWrapper';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Loader } from 'lucide-react';

// Redefine props for the new normalized structure
export interface NormalizedEditableClaimShadcnProps {
  claimId: string;
  claimNumber: string;
  claimText: string;
  isIndependent: boolean;
  onChange: (claimId: string, text: string) => void;
  onDelete: (claimId: string, renumber: boolean) => void;
  onInsertAfter: (claimId: string) => void;
  onReorder: (claimId: string, direction: 'up' | 'down') => void;
  getFontSize?: (baseSize: string) => string;
  totalClaims?: number;
  // analyzedInvention and setAnalyzedInvention are removed as they are no longer needed
  // for claim-specific operations. Generation logic will be handled by a separate hook/service.
}

// Save status indicator component
const SaveStatusIndicatorShadcn = ({
  status,
}: {
  status: 'idle' | 'saving' | 'saved' | 'error';
}) => {
  const { isDarkMode } = useThemeContext();

  if (status === 'idle') return null;

  return (
    <div className="relative inline-flex items-center">
      {status === 'saving' ? (
        <Loader
          className={cn(
            'w-3 h-3 animate-spin',
            isDarkMode ? 'text-blue-400' : 'text-blue-500'
          )}
        />
      ) : status === 'saved' ? (
        <FiCheck
          className={cn(
            'w-3 h-3',
            isDarkMode ? 'text-green-400' : 'text-green-500'
          )}
        />
      ) : null}
    </div>
  );
};

// Simple inline menu component instead of lazy loading
const SimpleActionsMenuShadcn = ({
  onGenerate,
  isLoading,
}: {
  onGenerate: () => void;
  isLoading: boolean;
}) => {
  const { isDarkMode } = useThemeContext();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'inline-flex items-center justify-center h-6 w-6 p-0 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground',
          isDarkMode
            ? 'text-gray-400 hover:bg-gray-700'
            : 'text-gray-600 hover:bg-gray-100'
        )}
      >
        <FiMoreVertical className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={cn(
          'text-sm',
          isDarkMode
            ? 'bg-gray-800 border-gray-600'
            : 'bg-white border-gray-200'
        )}
      >
        <DropdownMenuItem
          onClick={isLoading ? undefined : onGenerate}
          className={cn(
            'cursor-pointer',
            isLoading && 'opacity-50 cursor-not-allowed'
          )}
        >
          <FiPlus className="mr-2 h-4 w-4" />
          {isLoading ? 'Generating...' : 'Generate Dependent Claims'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const EditableClaimShadcn: React.FC<NormalizedEditableClaimShadcnProps> = ({
  claimId,
  claimNumber,
  claimText,
  isIndependent,
  onChange,
  onDelete,
  onInsertAfter,
  onReorder,
  getFontSize,
  totalClaims,
}: NormalizedEditableClaimShadcnProps) => {
  const { isDarkMode } = useThemeContext();
  const [currentText, setCurrentText] = useState<string>(claimText || '');
  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle');
  const [isGeneratingDependents, setIsGeneratingDependents] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const toast = useToast();
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // React Query hook for dependent claims generation
  const generateClaimsMutation = useGenerateDependentClaims(
    data => {
      toast({
        title: 'Dependent claims generated!',
        status: 'success',
        position: 'bottom-right',
      });
    },
    error => {
      toast({
        title: 'Error generating claims',
        description: error.message,
        status: 'error',
        position: 'bottom-right',
      });
    }
  );

  // Undo/Redo functionality
  const { canUndo, canRedo, undo, redo } = useClaimUndoRedo({
    claimId,
    currentText,
    onTextChange: text => {
      setCurrentText(text);
      setSaveStatus('idle');
    },
  });

  // Function to adjust textarea height
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, []);

  // Update currentText when claimText prop changes (external updates)
  useEffect(() => {
    // Only update if the text is actually different and we're not currently saving
    if (claimText !== currentText && saveStatus !== 'saving') {
      setCurrentText(claimText || '');
      setSaveStatus('idle');
      adjustTextareaHeight();
    }
  }, [claimText, adjustTextareaHeight]);

  // Debounced save function
  const debouncedSave = useDebouncedCallback(
    (text: string) => {
      // Skip updates for temporary claim IDs
      if (claimId.startsWith('temp-')) {
        logger.debug(
          '[EditableClaimShadcn] Skipping save for temporary claim ID',
          {
            claimId,
          }
        );
        setSaveStatus('idle');
        return;
      }

      const validation = validateClaimText(text);
      if (!validation.valid) {
        toast({
          title: 'Validation Error',
          description: validation.issues[0] || 'Invalid claim text',
          status: 'error',
          duration: 3000,
        });
        setSaveStatus('error');
        return;
      }

      setSaveStatus('saving');
      onChange(claimId, text);

      // Set saved status after a short delay
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        setSaveStatus('saved');
        // Clear saved status after 2 seconds
        setTimeout(() => setSaveStatus('idle'), 2000);
      }, 500);
    },
    800 // 800ms debounce for better UX balance
  );

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setCurrentText(newText);

    // Show saving status immediately for user feedback
    if (newText !== claimText && newText.trim() !== '') {
      setSaveStatus('saving');
      debouncedSave(newText);
    }
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  // Effect for height adjustment when text content changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [currentText, adjustTextareaHeight]);

  // Effect for handling resize events
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Adjust height initially
    adjustTextareaHeight();

    const resizeObserver = new ResizeObserver(() => {
      // Recalculate height when the element size changes
      adjustTextareaHeight();
    });

    resizeObserver.observe(textarea);

    // Cleanup observer on component unmount
    return () => {
      resizeObserver.disconnect();
    };
  }, [adjustTextareaHeight]); // Depend on the stable adjustTextareaHeight callback

  const handleGenerateDependentClaims = async () => {
    // This function needs to be refactored as it depends on the old
    // analyzedInvention structure. For now, we'll disable it to unblock the main
    // editing flow. A new hook `useGenerateDependentClaims` will need to be
    // created that works with the new normalized data structure.
    toast({
      title: 'Feature Temporarily Disabled',
      description:
        'Dependent claim generation is being updated to work with the new data model.',
      status: 'info',
      duration: 5000,
    });
  };

  const handleCopyClaim = async () => {
    try {
      const fullClaimText = `${claimNumber}. ${currentText}`;
      await navigator.clipboard.writeText(fullClaimText);
      toast({
        title: 'Claim copied!',
        description: `Claim ${claimNumber} has been copied to clipboard`,
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Failed to copy claim to clipboard',
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <div
      className="p-4 w-full bg-transparent overflow-hidden relative group"
      data-claim-id={claimId}
    >
      <div className="flex justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Badge
            variant={isIndependent ? 'default' : 'secondary'}
            className={cn(
              'text-xs border',
              isIndependent
                ? isDarkMode
                  ? 'bg-blue-950/20 text-blue-400/80 border-blue-900/20 hover:bg-blue-950/30 hover:text-blue-400/90'
                  : 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100 hover:text-blue-800'
                : isDarkMode
                  ? 'bg-muted/30 text-muted-foreground/70 border-border/30 hover:bg-muted/40'
                  : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-100 hover:text-gray-700'
            )}
          >
            CLAIM {claimNumber} {isIndependent ? '(INDEPENDENT)' : ''}
          </Badge>
          <SaveStatusIndicatorShadcn status={saveStatus} />
        </div>

        <div className="flex items-center space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-6 w-6 p-0',
                    isDarkMode
                      ? 'text-gray-400 hover:bg-gray-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                  disabled={!canUndo || claimId.startsWith('temp-')}
                  onClick={e => {
                    e.stopPropagation();
                    undo();
                  }}
                >
                  <FaUndo className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Undo (
                  {window.navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl'}
                  +Z)
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-6 w-6 p-0',
                    isDarkMode
                      ? 'text-gray-400 hover:bg-gray-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                  disabled={!canRedo || claimId.startsWith('temp-')}
                  onClick={e => {
                    e.stopPropagation();
                    redo();
                  }}
                >
                  <FaRedo className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Redo (
                  {window.navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl'}
                  +Y)
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Separator orientation="vertical" className="h-5 mx-1" />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-6 w-6 p-0',
                    isDarkMode
                      ? 'text-gray-400 hover:bg-gray-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                  onClick={e => {
                    e.stopPropagation();
                    onReorder(claimId, 'up');
                  }}
                >
                  <FiArrowUp className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Move claim up</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-6 w-6 p-0',
                    isDarkMode
                      ? 'text-gray-400 hover:bg-gray-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                  onClick={e => {
                    e.stopPropagation();
                    onReorder(claimId, 'down');
                  }}
                >
                  <FiArrowDown className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Move claim down</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-6 w-6 p-0',
                    isDarkMode
                      ? 'text-gray-400 hover:bg-gray-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                  onClick={e => {
                    e.stopPropagation();
                    handleCopyClaim();
                  }}
                >
                  <FiCopy className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy claim to clipboard</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger
                    className={cn(
                      'inline-flex items-center justify-center h-6 w-6 p-0 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground',
                      isDarkMode
                        ? 'text-red-400 hover:bg-red-900/20'
                        : 'text-red-600 hover:bg-red-50'
                    )}
                  >
                    <FiTrash2 className="h-3 w-3" />
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {totalClaims && parseInt(claimNumber) === totalClaims
                      ? 'Delete claim'
                      : 'Delete options'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <DropdownMenuContent className="text-sm min-w-[180px]">
              {totalClaims && parseInt(claimNumber) === totalClaims ? (
                // Last claim - just delete without renumbering
                <DropdownMenuItem
                  onClick={() => onDelete(claimId, false)}
                  className="text-red-500 cursor-pointer"
                >
                  <FiTrash2 className="mr-2 h-4 w-4" />
                  Delete claim
                </DropdownMenuItem>
              ) : (
                // Not the last claim - show both options
                <>
                  <DropdownMenuItem
                    onClick={() => onDelete(claimId, false)}
                    className="cursor-pointer"
                  >
                    <FiTrash2 className="mr-2 h-4 w-4" />
                    Delete claim only
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(claimId, true)}
                    className="text-red-500 cursor-pointer"
                  >
                    <FiRefreshCw className="mr-2 h-4 w-4" />
                    Delete & renumber
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main claim text area with editable claim number */}
      <div className="w-full">
        <div className="flex items-baseline w-full">
          <div className="mr-2 flex-shrink-0">
            <EditableClaimNumberShadcn
              claimId={claimId}
              claimNumber={parseInt(claimNumber)}
              getFontSize={getFontSize}
            />
          </div>
          <div className="flex-1 relative min-w-0">
            <Textarea
              ref={textareaRef}
              value={currentText}
              onChange={handleTextChange}
              className={cn(
                'border-none bg-transparent p-1 pt-[1px] leading-[1.8] resize-none min-h-0 h-auto w-full block overflow-hidden',
                getFontSize ? `text-${getFontSize('sm')}` : 'text-sm',
                'focus:outline-none focus:ring-0 focus:border-0 focus:shadow-none',
                'overflow-y-hidden overflow-x-hidden break-words'
              )}
              placeholder="Enter claim text..."
              style={{
                overflowY: 'hidden',
                overflowX: 'hidden',
                border: 'none',
                outline: 'none',
                boxShadow: 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* Add claim after button - positioned in bottom right */}
      <div className="absolute bottom-2 right-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={e => {
                  e.stopPropagation();
                  onInsertAfter(claimId);
                }}
                className={cn(
                  'h-8 w-8 p-0 rounded-full',
                  isDarkMode
                    ? 'text-blue-400 hover:bg-blue-900/20'
                    : 'text-blue-600 hover:bg-blue-50'
                )}
              >
                <FiPlus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add claim after</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default EditableClaimShadcn;
