import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useThemeContext } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingState } from '@/components/common/LoadingState';
import { FiLoader } from 'react-icons/fi';

interface ReferenceOption {
  referenceNumber: string;
  title?: string;
  applicant?: string;
}

interface ReferenceSelectionFormProps {
  selectableReferences: ReferenceOption[];
  selectedReferences: string[];
  onToggle: (refNum: string) => void;
  onRun: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const ReferenceSelectionForm: React.FC<ReferenceSelectionFormProps> = ({
  selectableReferences,
  selectedReferences,
  onToggle,
  onRun,
  onCancel,
  isLoading,
}) => {
  const { isDarkMode } = useThemeContext();
  const [isStartingAnalysis, setIsStartingAnalysis] = useState(false);

  // Helper function to format reference numbers
  const formatReferenceNumber = (referenceNumber: string) => {
    return referenceNumber.replace(/-/g, '');
  };

  const handleRunAnalysis = () => {
    // Set immediate loading state for instant feedback
    setIsStartingAnalysis(true);

    // Call the parent handler
    onRun();
  };

  // Reset local loading state when parent loading changes
  React.useEffect(() => {
    if (!isLoading) {
      setIsStartingAnalysis(false);
    }
  }, [isLoading]);

  // If loading, show the loading overlay with animation
  if (isLoading || isStartingAnalysis) {
    return (
      <div className="relative h-full">
        <div className="absolute inset-0 bg-white dark:bg-gray-800 z-10 animate-in fade-in duration-300">
          <LoadingState
            variant="spinner"
            message="Starting combined analysis..."
            submessage="Analyzing selected references and generating comprehensive examiner-style review."
            minHeight="400px"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-200">
      <div className="mb-6">
        <h3
          className={cn(
            'text-lg font-semibold mb-2',
            isDarkMode ? 'text-gray-100' : 'text-gray-900'
          )}
        >
          Select References for Combined Analysis
        </h3>
        <p
          className={cn(
            'text-sm',
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          )}
        >
          Choose 2 or more references with deep analysis to create a
          comprehensive examiner-style combined analysis.
        </p>
      </div>

      <div className="space-y-3 mb-6">
        {selectableReferences.length === 0 ? (
          <div className="text-center py-8">
            <p
              className={cn(
                'text-lg',
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              )}
            >
              No references with deep analysis available
            </p>
            <p
              className={cn(
                'text-sm mt-2',
                isDarkMode ? 'text-gray-500' : 'text-gray-500'
              )}
            >
              Run deep analysis on individual references first to enable
              combined analysis.
            </p>
          </div>
        ) : (
          selectableReferences.map(ref => (
            <div
              key={ref.referenceNumber}
              className={cn(
                'p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm',
                selectedReferences.includes(ref.referenceNumber)
                  ? isDarkMode
                    ? 'bg-blue-900/30 border-blue-700'
                    : 'bg-blue-50 border-blue-200'
                  : isDarkMode
                    ? 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
              )}
              onClick={() => onToggle(ref.referenceNumber)}
            >
              <div className="flex items-start space-x-3">
                <Checkbox
                  id={ref.referenceNumber}
                  checked={selectedReferences.includes(ref.referenceNumber)}
                  onChange={() => onToggle(ref.referenceNumber)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <label
                    htmlFor={ref.referenceNumber}
                    className={cn(
                      'block font-medium leading-tight cursor-pointer',
                      isDarkMode ? 'text-gray-200' : 'text-gray-900'
                    )}
                  >
                    {formatReferenceNumber(ref.referenceNumber)}
                  </label>
                  {ref.title && (
                    <p
                      className={cn(
                        'text-sm mt-1 leading-relaxed',
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      )}
                    >
                      {ref.title}
                    </p>
                  )}
                  {ref.applicant && (
                    <p
                      className={cn(
                        'text-xs mt-1 font-medium',
                        isDarkMode ? 'text-gray-500' : 'text-gray-500'
                      )}
                    >
                      Applicant: {ref.applicant}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {selectedReferences.length} reference
          {selectedReferences.length !== 1 ? 's' : ''} selected
          {selectedReferences.length >= 2 && (
            <span className="ml-2 text-green-600 dark:text-green-400">
              ✓ Ready for analysis
            </span>
          )}
        </div>
        <div className="flex space-x-3">
          <Button onClick={onCancel} variant="outline">
            Cancel
          </Button>
          <Button
            onClick={handleRunAnalysis}
            disabled={selectedReferences.length < 2 || isStartingAnalysis}
            className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200"
          >
            {isStartingAnalysis ? (
              <>
                <FiLoader className="w-4 h-4 mr-2 animate-spin" />
                Starting Analysis...
              </>
            ) : (
              'Run Combined Analysis'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
