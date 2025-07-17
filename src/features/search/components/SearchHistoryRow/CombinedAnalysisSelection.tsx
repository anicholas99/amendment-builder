import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FiZap, FiLoader } from 'react-icons/fi';
import { PriorArtReference } from '@/types/claimTypes';
import { useToast } from '@/hooks/useToastWrapper';
import { logger } from '@/utils/clientLogger';

interface CombinedAnalysisSelectionProps {
  searchHistoryId: string;
  selectedReferences: PriorArtReference[];
  onToggleReference: (reference: PriorArtReference) => void;
  onRunAnalysis: (
    searchHistoryId: string,
    references: PriorArtReference[]
  ) => void;
  maxSelections?: number;
  className?: string;
  isLoading?: boolean;
}

export const CombinedAnalysisSelection: React.FC<
  CombinedAnalysisSelectionProps
> = ({
  searchHistoryId,
  selectedReferences,
  onToggleReference,
  onRunAnalysis,
  maxSelections = 3,
  className,
  isLoading = false,
}) => {
  const toast = useToast();
  const [isStartingAnalysis, setIsStartingAnalysis] = useState(false);
  const selectedCount = selectedReferences.length;

  const handleRunAnalysis = useCallback(() => {
    if (selectedCount < 2) {
      toast({
        title: 'Select more references',
        description:
          'Please select at least 2 references for combined analysis.',
        status: 'warning',
      });
      return;
    }

    logger.info('[CombinedAnalysisSelection] Running analysis', {
      searchHistoryId,
      selectedCount,
      references: selectedReferences.map(r => r.number),
    });

    // Set local loading state immediately
    setIsStartingAnalysis(true);

    // Show toast notification
    toast({
      title: 'Starting combined analysis',
      description: `Analyzing ${selectedCount} references...`,
      status: 'info',
    });

    onRunAnalysis(searchHistoryId, selectedReferences);
  }, [
    selectedCount,
    selectedReferences,
    searchHistoryId,
    onRunAnalysis,
    toast,
  ]);

  // Reset local loading state when parent loading state changes
  React.useEffect(() => {
    if (!isLoading) {
      setIsStartingAnalysis(false);
    }
  }, [isLoading]);

  if (selectedCount === 0) return null;

  const showLoadingState = isLoading || isStartingAnalysis;

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-50',
        'bg-white dark:bg-gray-800 rounded-lg shadow-lg border',
        'p-4 space-y-3 min-w-[280px]',
        'animate-in slide-in-from-bottom-2 duration-200',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {showLoadingState ? 'Running Analysis' : 'Combined Analysis'}
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
            {showLoadingState
              ? 'Analysis in progress...'
              : `${selectedCount} of ${maxSelections} references selected`}
          </p>
        </div>
        {showLoadingState ? (
          <FiLoader className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin" />
        ) : (
          <FiZap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        )}
      </div>

      {!showLoadingState && (
        <div className="space-y-1">
          {selectedReferences.map(ref => (
            <div
              key={ref.number}
              className="text-xs text-gray-700 dark:text-gray-300 flex items-center gap-2"
            >
              <span className="font-medium">
                {ref.number.replace(/-/g, '')}
              </span>
              {ref.title && (
                <span className="text-gray-500 dark:text-gray-400 truncate flex-1">
                  {ref.title}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {showLoadingState && (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse w-full"></div>
          </div>
          <p className="text-xs text-center text-gray-600 dark:text-gray-400">
            Generating comprehensive analysis...
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            selectedReferences.forEach(ref => onToggleReference(ref))
          }
          disabled={showLoadingState}
          className="flex-1"
        >
          {showLoadingState ? 'Processing...' : 'Clear'}
        </Button>
        <Button
          size="sm"
          onClick={handleRunAnalysis}
          disabled={selectedCount < 2 || showLoadingState}
          className="flex-1"
        >
          {showLoadingState ? (
            <>
              <FiLoader className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Run Analysis'
          )}
        </Button>
      </div>
    </div>
  );
};
