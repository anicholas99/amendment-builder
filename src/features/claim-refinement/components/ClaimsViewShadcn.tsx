import React, {
  Dispatch,
  SetStateAction,
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import { cn } from '@/lib/utils';
import {
  FiPlus,
  FiEdit2,
  FiPrinter,
  FiSearch,
  FiClock,
  FiDownload,
  FiSettings,
  FiTrash2,
  FiCopy,
  FiMoreVertical,
  FiCheck,
  FiArrowUp,
  FiArrowDown,
  FiRefreshCw,
} from 'react-icons/fi';
import { useRouter } from 'next/router';
import ViewHeader from '../../../components/common/ViewHeader';
import { InventionData } from '@/types';
import { buttonStyles } from '../../../styles/buttonStyles';
import { sortClaimNumbers } from '../utils/validation';
import { useTimeout } from '@/hooks/useTimeout';
import { logger } from '@/utils/clientLogger';
import { useDebouncedCallback } from 'use-debounce';
import { LoadingMinimal } from '@/components/common/LoadingState';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/useToastWrapper';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Loader } from 'lucide-react';
import EditableClaimShadcn from './EditableClaimShadcn';
import { EditableClaimNumberShadcn } from './EditableClaimNumberShadcn';

interface ClaimsViewShadcnProps {
  claims: Array<{ id: string; claimNumber: number; text: string }> | undefined;
  claimViewMode: 'box' | 'compact';
  onClaimChange: (claimId: string, text: string) => void;
  onDeleteClaim: (claimId: string, renumber: boolean) => void;
  onInsertClaim: (afterClaimId: string) => void;
  onReorderClaim: (claimId: string, direction: 'up' | 'down') => void;
  lastAddedClaimNumber?: string;
  zoomLevel?: number;
  getFontSize?: (baseSize: string) => string;
  newlyAddedClaimNumbers?: number[];
}

interface CompactClaimItemProps {
  claimId: string;
  claimNumber: string;
  claimText: string;
  isDependentClaim: boolean;
  onClaimChange: (claimId: string, text: string) => void;
  onDeleteClaim: (claimId: string, renumber: boolean) => void;
  onInsertClaim: (claimId: string) => void;
  onReorderClaim: (claimId: string, direction: 'up' | 'down') => void;
  getFontSize?: (baseSize: string) => string;
  maxClaimNumber: number;
  zoomLevel?: number;
}

// Separate component for editable list item to properly use hooks
const EditableListItemShadcn = React.memo(
  ({
    claimId,
    claimNumber,
    claimText,
    isDependentClaim,
    onClaimChange,
    onDeleteClaim,
    onInsertClaim,
    getFontSize,
  }: {
    claimId: string;
    claimNumber: string;
    claimText: string;
    isDependentClaim: boolean;
    onClaimChange: (claimId: string, text: string) => void;
    onDeleteClaim: (claimId: string, renumber: boolean) => void;
    onInsertClaim: (claimId: string) => void;
    getFontSize?: (baseSize: string) => string;
  }) => {
    const { isDarkMode } = useThemeContext();
    const [currentText, setCurrentText] = useState(claimText);
    const [hasPendingChanges, setHasPendingChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const toast = useToast();

    // Function to adjust textarea height
    const adjustTextareaHeight = useCallback(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        // Use requestAnimationFrame to batch height changes
        requestAnimationFrame(() => {
          if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
          }
        });
      }
    }, []);

    useEffect(() => {
      if (!hasPendingChanges && !isSaving) {
        setCurrentText(claimText);
        adjustTextareaHeight();
      }
    }, [claimText, adjustTextareaHeight, hasPendingChanges, isSaving]);

    useEffect(() => {
      if ((hasPendingChanges || isSaving) && claimText === currentText) {
        setHasPendingChanges(false);
        setIsSaving(false);
      }
    }, [claimText, currentText, hasPendingChanges, isSaving]);

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newText = e.target.value;
      setCurrentText(newText);
      setHasPendingChanges(true);
    };

    const handleBlur = () => {
      if (currentText !== claimText) {
        // Check if this is a temporary claim ID
        if (claimId.startsWith('temp-')) {
          logger.debug(
            '[EditableListItemShadcn] Skipping update for temporary claim ID',
            { claimId }
          );
          // Revert to original text for temporary claims
          setCurrentText(claimText);
          setHasPendingChanges(false);
          toast({
            title: 'Saving...',
            description: "Your claim will be saved once it's fully created.",
            status: 'info',
            duration: 2000,
          });
          return;
        }

        setIsSaving(true);
        onClaimChange(claimId, currentText);
      } else {
        setHasPendingChanges(false);
      }
    };

    // Effect for initial height adjustment and subsequent text changes
    useEffect(() => {
      adjustTextareaHeight();
    }, [currentText, adjustTextareaHeight]);

    // Effect for handling resize events
    useEffect(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      // Adjust height initially
      adjustTextareaHeight();

      // Disabled ResizeObserver to prevent scroll jiggling
      // Height adjustments now only happen on text changes
    }, [adjustTextareaHeight]); // Depend on the stable adjustTextareaHeight callback

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
        className={cn(
          'mb-6 rounded-md transition-shadow duration-150 relative group overflow-hidden border',
          !isDependentClaim
            ? 'bg-accent dark:bg-blue-950/30 border-accent-foreground/10 dark:border-blue-500/30'
            : 'bg-card dark:bg-slate-800/40 border-border dark:border-slate-600/30',
          'hover:shadow-sm dark:hover:shadow-md'
        )}
        id={`claim-${claimNumber}`}
      >
        <div className="p-4 bg-transparent">
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
                onBlur={handleBlur}
                className={cn(
                  'border-none bg-transparent p-1 pt-[1px] leading-[1.8] resize-none min-h-0 h-auto w-full block overflow-hidden',
                  getFontSize ? `text-${getFontSize('sm')}` : 'text-sm',
                  'focus:shadow-none focus:ring-0 focus:border-b-2 focus:border-blue-500 focus:mb-[-2px] dark:focus:border-blue-400',
                  'overflow-y-hidden overflow-x-hidden break-words',
                  'text-foreground dark:text-slate-100'
                )}
                style={{
                  overflowY: 'hidden',
                  overflowX: 'hidden',
                }}
              />
            </div>
          </div>

          <div className="absolute top-1 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <DropdownMenu>
              <DropdownMenuTrigger
                className="inline-flex items-center justify-center h-8 w-8 p-0 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground dark:hover:bg-slate-700/60 dark:hover:text-slate-100"
                onClick={e => e.stopPropagation()}
              >
                <FiMoreVertical className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className={cn(
                  'min-w-[150px]',
                  getFontSize ? `text-${getFontSize('sm')}` : 'text-sm'
                )}
              >
                <DropdownMenuItem
                  onClick={handleCopyClaim}
                  className={
                    getFontSize ? `text-${getFontSize('sm')}` : 'text-sm'
                  }
                >
                  <FiCopy className="mr-2 h-4 w-4" />
                  Copy claim
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onInsertClaim(claimId)}
                  className={
                    getFontSize ? `text-${getFontSize('sm')}` : 'text-sm'
                  }
                >
                  <FiPlus className="mr-2 h-4 w-4" />
                  Add claim after
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDeleteClaim(claimId, false)}
                  className={
                    getFontSize ? `text-${getFontSize('sm')}` : 'text-sm'
                  }
                >
                  <FiTrash2 className="mr-2 h-4 w-4" />
                  Delete claim only
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDeleteClaim(claimId, true)}
                  className={cn(
                    'text-red-500 dark:text-red-400',
                    getFontSize ? `text-${getFontSize('sm')}` : 'text-sm'
                  )}
                >
                  <FiRefreshCw className="mr-2 h-4 w-4" />
                  Delete & renumber
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    );
  },
  (prev, next) =>
    prev.claimId === next.claimId &&
    prev.claimText === next.claimText &&
    prev.isDependentClaim === next.isDependentClaim &&
    prev.claimNumber === next.claimNumber &&
    prev.getFontSize === next.getFontSize
);

// Compact view item component
const CompactClaimItemShadcn: React.FC<CompactClaimItemProps> = React.memo(
  ({
    claimId,
    claimNumber,
    claimText,
    isDependentClaim,
    onClaimChange,
    onDeleteClaim,
    onInsertClaim,
    onReorderClaim,
    getFontSize,
    maxClaimNumber,
    zoomLevel,
  }) => {
    const { isDarkMode } = useThemeContext();
    const [currentText, setCurrentText] = useState(claimText);
    const [saveStatus, setSaveStatus] = useState<
      'idle' | 'saving' | 'saved' | 'error'
    >('idle');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const toast = useToast();
    const saveTimeoutRef = useRef<NodeJS.Timeout>();

    // Function to adjust textarea height
    const adjustTextareaHeight = useCallback(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        // Use requestAnimationFrame to batch height changes
        requestAnimationFrame(() => {
          if (textarea) {
            textarea.style.height = 'auto';
            // Force a reflow to ensure scrollHeight is calculated correctly
            textarea.scrollHeight;
            textarea.style.height = `${textarea.scrollHeight}px`;
          }
        });
      }
    }, []);

    useEffect(() => {
      if (claimText !== currentText && saveStatus !== 'saving') {
        setCurrentText(claimText);
        setSaveStatus('idle');
        adjustTextareaHeight();
      }
    }, [claimText, adjustTextareaHeight]);

    // Debounced save function
    const debouncedSave = useDebouncedCallback(
      (text: string) => {
        if (claimId.startsWith('temp-')) {
          logger.debug(
            '[CompactClaimItemShadcn] Skipping save for temporary claim ID',
            { claimId }
          );
          setSaveStatus('idle');
          return;
        }

        setSaveStatus('saving');
        onClaimChange(claimId, text);

        // Set saved status after a short delay
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
          setSaveStatus('saved');
          // Clear saved status after 2 seconds
          setTimeout(() => setSaveStatus('idle'), 2000);
        }, 500);
      },
      800 // 800ms debounce
    );

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newText = e.target.value;
      setCurrentText(newText);

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

    useEffect(() => {
      adjustTextareaHeight();
    }, [currentText, adjustTextareaHeight]);

    // Effect for handling resize events
    useEffect(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      // Adjust height initially
      adjustTextareaHeight();

      // Disabled ResizeObserver to prevent scroll jiggling
      // Height adjustments now only happen on text changes
    }, [adjustTextareaHeight]); // Depend on the stable adjustTextareaHeight callback

    useEffect(() => {
      adjustTextareaHeight();
    }, [zoomLevel, adjustTextareaHeight]);

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

    // Subtle save status indicator for compact view
    const SaveStatusIndicator = () => {
      if (saveStatus === 'saving') {
        return (
          <div className="absolute top-1 right-1 text-xs text-blue-500 font-medium opacity-80 pointer-events-none animate-pulse">
            ...
          </div>
        );
      }
      return null;
    };

    return (
      <div className="mb-1 relative w-full" role="group">
        <SaveStatusIndicator />
        <div
          className={cn(
            'border-l-4 transition-colors duration-150 relative border border-l-4 rounded-md',
            !isDependentClaim
              ? 'border-l-ring bg-accent dark:bg-blue-950/20 dark:border-blue-500/30 dark:border-l-blue-400'
              : 'border-l-muted bg-card dark:bg-slate-800/30 dark:border-slate-600/30 dark:border-l-slate-400',
            'hover:shadow-sm pl-2 pr-2 py-1'
          )}
          id={`claim-${claimNumber}`}
        >
          <div className="flex items-baseline w-full">
            <div
              className={cn(
                'text-xs font-bold flex-shrink-0 mr-1',
                getFontSize ? `text-${getFontSize('xs')}` : 'text-xs',
                'dark:text-slate-100'
              )}
            >
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
                  'border-none bg-transparent p-0 leading-tight resize-none min-h-0 h-auto w-full break-words',
                  getFontSize ? `text-${getFontSize('sm')}` : 'text-sm',
                  'focus:ring-0 focus:border-0 focus:outline-none focus:shadow-none overflow-hidden',
                  'text-foreground dark:text-slate-100'
                )}
                style={{
                  overflowY: 'hidden',
                  overflowX: 'hidden',
                  minHeight: 'auto',
                  border: 'none',
                  outline: 'none',
                  boxShadow: 'none',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
);

const ClaimsViewShadcn: React.FC<ClaimsViewShadcnProps> = ({
  claims,
  claimViewMode,
  onClaimChange,
  onDeleteClaim,
  onInsertClaim,
  onReorderClaim,
  lastAddedClaimNumber,
  zoomLevel = 100,
  getFontSize,
  newlyAddedClaimNumbers,
}) => {
  const { isDarkMode } = useThemeContext();

  // Add container ref for scrolling to claims (matching original)
  const claimsContainerRef = useRef<HTMLDivElement>(null);
  const highlightElementRef = useRef<Element | null>(null);
  const [shouldRemoveHighlight, setShouldRemoveHighlight] = useState(false);

  // Sort claims by claim number for consistent display order
  const sortedClaims = useMemo(() => {
    if (!claims) return [];
    return [...claims].sort((a, b) => a.claimNumber - b.claimNumber);
  }, [claims]);

  const maxClaimNumber = useMemo(() => {
    return Math.max(...(claims?.map(c => c.claimNumber) || [0]));
  }, [claims]);

  const handleInsertClaim = (claimId: string) => {
    onInsertClaim(claimId);
  };

  if (!claims || claims.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 rounded-lg bg-muted">
        <div className="text-center">
          <p className="text-lg font-medium mb-2 text-foreground">
            No claims found
          </p>
          <p className="text-sm text-muted-foreground">
            Start by generating your first claim
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={claimsContainerRef}
      className="overflow-x-hidden"
      style={
        {
          '--zoom-scale': zoomLevel / 100,
          transform: `scale(var(--zoom-scale))`,
          transformOrigin: 'top left',
          width: `${100 / (zoomLevel / 100)}%`,
          transition: 'transform 0.2s ease',
          willChange: zoomLevel !== 100 ? 'transform' : 'auto',
        } as React.CSSProperties
      }
    >
      {claimViewMode === 'box' ? (
        <div className="flex flex-col gap-4 items-stretch w-full">
          {sortedClaims.map(claim => {
            const isDependentClaim = claim.text.toLowerCase().includes('claim');

            return (
              <div
                key={claim.id}
                data-claim-number={claim.claimNumber}
                className={cn(
                  'w-full rounded-md border overflow-hidden transition-colors duration-150',
                  'will-change-[background-color]',
                  // Background colors
                  !isDependentClaim ? 'bg-accent' : 'bg-card',
                  // Border colors
                  !isDependentClaim ? 'border-border' : 'border-border',
                  // Hover effects
                  !isDependentClaim
                    ? 'hover:border-ring/50 hover:shadow-sm'
                    : 'hover:border-ring/30 hover:shadow-sm',
                  // New claim styling
                  claim.claimNumber.toString() === lastAddedClaimNumber && [
                    isDarkMode ? 'border-green-400' : 'border-green-300',
                    'shadow-[0_0_0_2px_rgba(72,187,120,0.3)]',
                  ],
                  // Highlight new claim animation
                  'data-[highlight=true]:transition-colors data-[highlight=true]:duration-500 data-[highlight=true]:ease-in-out',
                  'data-[highlight=true]:bg-green-50 data-[highlight=true]:dark:bg-green-900/20'
                )}
                style={{
                  willChange: 'background-color',
                }}
              >
                <EditableClaimShadcn
                  claimId={claim.id}
                  claimNumber={claim.claimNumber.toString()}
                  claimText={claim.text}
                  isIndependent={!isDependentClaim}
                  onChange={onClaimChange}
                  onDelete={onDeleteClaim}
                  onInsertAfter={handleInsertClaim}
                  onReorder={onReorderClaim}
                  getFontSize={getFontSize}
                  totalClaims={maxClaimNumber}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-1">
          {sortedClaims.map(claim => (
            <CompactClaimItemShadcn
              key={claim.id}
              claimId={claim.id}
              claimNumber={String(claim.claimNumber)}
              claimText={claim.text}
              isDependentClaim={claim.claimNumber > 1}
              onClaimChange={onClaimChange}
              onDeleteClaim={onDeleteClaim}
              onInsertClaim={handleInsertClaim}
              onReorderClaim={onReorderClaim}
              getFontSize={getFontSize}
              maxClaimNumber={maxClaimNumber}
              zoomLevel={zoomLevel}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ClaimsViewShadcn;
