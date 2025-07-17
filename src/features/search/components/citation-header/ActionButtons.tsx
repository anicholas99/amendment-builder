import React from 'react';
import { cn } from '@/lib/utils';
import {
  FiFileText,
  FiRefreshCw,
  FiClock,
  FiChevronDown,
} from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useThemeContext } from '@/contexts/ThemeContext';

interface ActionButtonsProps {
  selectedReference: string | null;
  isReferenceSaved?: boolean;
  isReferenceExcluded?: boolean;
  isLoading?: boolean;
  onSaveReference?: (referenceNumber: string) => void;
  onExcludeReference?: (referenceNumber: string) => void;

  // Examiner analysis props
  isExaminerAnalysisAvailable?: boolean;
  showExaminerAnalysis?: boolean;
  hasExaminerAnalysisData?: boolean;
  hasHighImportanceFindings?: boolean;
  isRunningExaminerAnalysis?: boolean;
  onToggleExaminerAnalysis?: (isEnabled: boolean) => void;

  // Rerun extraction props
  onRerunExtraction?: () => void;
  isRerunningExtraction?: boolean;

  // Citation history props
  citationHistory?: Array<{
    id: string;
    createdAt: Date;
    status: string;
    isCurrent: boolean;
  }>;
  onViewHistoricalRun?: (jobId: string) => void;
}

export function ActionButtons({
  selectedReference,
  isReferenceSaved = false,
  isReferenceExcluded = false,
  isLoading = false,
  onSaveReference,
  onExcludeReference,
  isExaminerAnalysisAvailable,
  showExaminerAnalysis = false,
  hasExaminerAnalysisData = false,
  hasHighImportanceFindings = false,
  isRunningExaminerAnalysis = false,
  onToggleExaminerAnalysis,
  onRerunExtraction,
  isRerunningExtraction = false,
  citationHistory = [],
  onViewHistoricalRun,
}: ActionButtonsProps) {
  const { isDarkMode } = useThemeContext();
  const [showRerunConfirm, setShowRerunConfirm] = React.useState(false);

  // Auto-hide confirmation after 5 seconds
  React.useEffect(() => {
    if (showRerunConfirm) {
      const timer = setTimeout(() => {
        setShowRerunConfirm(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showRerunConfirm]);

  if (!selectedReference) {
    return null;
  }

  const handleExaminerAnalysisClick = () => {
    if (isRunningExaminerAnalysis) return;
    onToggleExaminerAnalysis && onToggleExaminerAnalysis(!showExaminerAnalysis);
  };

  const handleRerunClick = () => {
    if (showRerunConfirm) {
      // User confirmed, execute the rerun
      onRerunExtraction && onRerunExtraction();
      setShowRerunConfirm(false);
    } else {
      // Show confirmation
      setShowRerunConfirm(true);
    }
  };

  return (
    <div className="flex items-center gap-0.5">
      {/* Combined Rerun & History Dropdown */}
      {(onRerunExtraction ||
        (citationHistory.length > 0 && onViewHistoricalRun)) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="w-7 h-7 p-0"
              title="Extraction options"
            >
              <FiRefreshCw
                className={cn(
                  'w-3.5 h-3.5',
                  isRerunningExtraction && 'animate-spin'
                )}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="z-[1500] min-w-[200px]">
            {/* Rerun Option */}
            {onRerunExtraction && (
              <div
                onClick={() => {
                  if (!isRerunningExtraction) {
                    handleRerunClick();
                  }
                }}
                className={cn(
                  'flex items-center gap-3 py-2.5 px-3 hover:bg-accent rounded-sm',
                  isRerunningExtraction
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer',
                  showRerunConfirm && 'text-destructive'
                )}
              >
                <FiRefreshCw
                  className={cn(
                    'w-4 h-4',
                    isRerunningExtraction && 'animate-spin'
                  )}
                />
                <div className="flex flex-col">
                  <span className="font-medium">
                    {showRerunConfirm ? 'Confirm Rerun?' : 'Rerun Extraction'}
                  </span>
                  {showRerunConfirm && (
                    <span className="text-xs text-muted-foreground">
                      Click to confirm extraction rerun
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Separator if both options exist */}
            {onRerunExtraction &&
              citationHistory.length > 0 &&
              onViewHistoricalRun && <DropdownMenuSeparator className="my-2" />}

            {/* History Section */}
            {citationHistory.length > 0 && onViewHistoricalRun && (
              <>
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  EXTRACTION HISTORY
                </div>
                {citationHistory.map((run, index) => {
                  const runDate = new Date(run.createdAt);
                  const isLatest = index === 0;

                  return (
                    <DropdownMenuItem
                      key={run.id}
                      onClick={() => onViewHistoricalRun(run.id)}
                      className="flex flex-col items-start gap-1.5 py-2.5 px-3 cursor-pointer hover:bg-accent"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <FiClock className="w-3 h-3 text-muted-foreground" />
                        <span className="font-medium">
                          Run #{citationHistory.length - index}
                        </span>
                        {run.isCurrent && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          >
                            Current
                          </Badge>
                        )}
                        {isLatest && !run.isCurrent && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                          >
                            Latest
                          </Badge>
                        )}
                      </div>
                      <span
                        className={cn(
                          'text-xs ml-6 text-muted-foreground',
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        )}
                      >
                        {runDate.toLocaleDateString()}{' '}
                        {runDate.toLocaleTimeString()}
                      </span>
                    </DropdownMenuItem>
                  );
                })}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Examiner Analysis Toggle Button */}
      {isExaminerAnalysisAvailable && (
        <div className="relative">
          <Button
            size="sm"
            variant={showExaminerAnalysis ? 'default' : 'outline'}
            onClick={handleExaminerAnalysisClick}
            disabled={isRunningExaminerAnalysis}
            className={cn(
              'h-7 px-2 hidden sm:flex items-center gap-1',
              showExaminerAnalysis
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'border-green-600 text-green-600 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-900/20'
            )}
          >
            <FiFileText className="w-3 h-3" />
            <span className="text-xs">
              {showExaminerAnalysis ? 'Hide' : 'Examiner'}
            </span>
          </Button>

          {/* Mobile version - icon only */}
          <Button
            size="sm"
            variant={showExaminerAnalysis ? 'default' : 'outline'}
            onClick={handleExaminerAnalysisClick}
            disabled={isRunningExaminerAnalysis}
            className={cn(
              'w-7 h-7 p-0 sm:hidden',
              showExaminerAnalysis
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'border-green-600 text-green-600 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-900/20'
            )}
            title={
              showExaminerAnalysis ? 'Hide Examiner View' : 'Examiner View'
            }
          >
            <FiFileText className="w-3.5 h-3.5" />
          </Button>

          {/* Notification dot for important findings */}
          {!showExaminerAnalysis &&
            !isRunningExaminerAnalysis &&
            hasExaminerAnalysisData && (
              <div
                className={cn(
                  'absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border',
                  hasHighImportanceFindings ? 'bg-red-500' : 'bg-green-400',
                  isDarkMode ? 'border-gray-900' : 'border-white'
                )}
              />
            )}
        </div>
      )}
    </div>
  );
}
