import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, InfoIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeContext } from '@/contexts/ThemeContext';
import DeepAnalysisPanel from './DeepAnalysisPanel';
import ExaminerAnalysisPanel from './ExaminerAnalysisPanel';
import { ApplicationError } from '@/lib/error';
import {
  ParsedDeepAnalysis,
  StructuredDeepAnalysis,
} from '../types/deepAnalysis';
import { ProcessedCitationMatch } from '@/types/domain/citation';

interface CitationAnalysisPanelProps {
  type: 'deep' | 'examiner';
  selectedReference: string;
  onClose: () => void;
  isLoading: boolean;
  analysisData?: ParsedDeepAnalysis | StructuredDeepAnalysis | null;
  examinerAnalysis?: {
    examinerName?: string;
    citationCategories?: Array<{ category: string; citations: Array<string> }>;
  } | null;
  onRunAnalysis: () => void;
  onApplyAmendmentToClaim1?: (original: string, revised: string) => void;
  error?: ApplicationError | Error | null;
  isExaminerAnalysisEnabled?: boolean;
  isRunningAnalysis?: boolean; // New prop to specifically track if analysis is being run
  onMatchClick?: (match: ProcessedCitationMatch) => void;
  activeMatch?: ProcessedCitationMatch | null;
  citationType?: string;
  referenceStatuses?: Array<{
    referenceNumber: string;
    status?: string;
    isOptimistic?: boolean;
    showAsOptimistic?: boolean;
  }>;
}

/**
 * CitationAnalysisPanel - A unified component for displaying either deep analysis or examiner analysis
 * This reduces duplication and provides a consistent UI for both analysis types
 */
export const CitationAnalysisPanel: React.FC<CitationAnalysisPanelProps> = ({
  type,
  selectedReference,
  onClose: _onClose,
  isLoading,
  analysisData,
  examinerAnalysis,
  onRunAnalysis,
  onApplyAmendmentToClaim1,
  error,
  isExaminerAnalysisEnabled = true,
  isRunningAnalysis = false,
  onMatchClick: _onMatchClick,
  activeMatch: _activeMatch,
  citationType: _citationType = 'patent',
  referenceStatuses,
}) => {
  const { isDarkMode } = useThemeContext();
  const data = type === 'deep' ? analysisData : examinerAnalysis;

  // Check if the selected reference is in optimistic/processing state
  const isSelectedReferenceProcessing = useMemo(() => {
    if (!selectedReference || !referenceStatuses) return false;
    
    const referenceStatus = referenceStatuses.find(
      ref => ref.referenceNumber === selectedReference
    );
    
    return referenceStatus?.showAsOptimistic === true;
  }, [selectedReference, referenceStatuses]);

  // Check if the selected reference has failed
  const isSelectedReferenceFailed = useMemo(() => {
    if (!selectedReference || !referenceStatuses) return false;
    
    const referenceStatus = referenceStatuses.find(
      ref => ref.referenceNumber === selectedReference
    );
    
    return referenceStatus?.status === 'FAILED' || referenceStatus?.status === 'ERROR';
  }, [selectedReference, referenceStatuses]);

  // Determine if we're actively running a new analysis (not just loading existing data)
  // Only show running animation when explicitly running a new analysis
  const isActivelyRunning = isRunningAnalysis;

  return (
    <div
      className={cn(
        'h-full flex flex-col',
        isDarkMode ? 'bg-gray-900' : 'bg-white'
      )}
    >
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto pt-4 pr-4 pl-4 pb-0 custom-scrollbar">
        {/* Only show running state when actively running analysis */}
        {isActivelyRunning && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="flex items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span
                className={cn(
                  'text-lg font-medium',
                  isDarkMode ? 'text-gray-100' : 'text-gray-900'
                )}
              >
                Running Deep Analysis...
              </span>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-[400px]">
              <Progress className="h-2" />
              <p
                className={cn(
                  'text-sm text-center',
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                )}
              >
                This may take up to a minute as we analyze the citation
                relevance for each claim element.
              </p>
            </div>
            <Alert className="max-w-[400px]">
              <InfoIcon className="h-4 w-4" />
              <AlertDescription>
                <strong>Tip:</strong> The analysis examines how this prior art
                reference relates to your claim elements and provides USPTO
                examiner-style feedback.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Analysis Failed</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        {/* Show loading state when fetching existing data */}
        {!isActivelyRunning && !data && !error && isLoading && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="flex items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span
                className={cn(
                  'text-lg font-medium',
                  isDarkMode ? 'text-gray-100' : 'text-gray-900'
                )}
              >
                Loading Analysis Data...
              </span>
            </div>
          </div>
        )}

        {/* Only show empty state when not loading */}
        {!isActivelyRunning && !data && !error && !isLoading && (
          <>
            {/* Show error state for failed extractions */}
            {isSelectedReferenceFailed ? (
              <div className="flex flex-col items-center justify-center min-h-[200px] p-6">
                <AlertCircle className="h-8 w-8 text-destructive mb-3" />
                <h3 className="text-lg font-medium text-destructive mb-2">
                  Extraction Failed
                </h3>
                <p className="text-sm text-muted-foreground text-center leading-relaxed">
                  Citation extraction failed for {selectedReference ? `Reference ${selectedReference.replace(/-/g, '')}` : 'this reference'}.
                  <br />
                  Please try running the extraction again.
                </p>
              </div>
            ) : /* Show citation extraction message if extraction is in progress */
            isSelectedReferenceProcessing ? (
              <div className="flex flex-col items-center justify-center min-h-[200px] p-6">
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Extracting Citations
                </h3>
                <p className="text-sm text-muted-foreground text-center leading-relaxed">
                  Analyzing {selectedReference ? `Reference ${selectedReference.replace(/-/g, '')}` : 'this reference'} for relevant citations.
                  <br />
                  This may take a few moments...
                </p>
              </div>
            ) : (
              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex flex-col items-start gap-2">
                    <span>No analysis data available for this reference.</span>
                    <Button size="sm" onClick={onRunAnalysis} disabled={isLoading}>
                      Run Analysis
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </>
        )}

        {analysisData && type === 'deep' && !isActivelyRunning && (
          <DeepAnalysisPanel
            analysisData={analysisData}
            onApplyAmendment={onApplyAmendmentToClaim1}
            referenceNumber={selectedReference}
            isLoading={false}
          />
        )}

        {examinerAnalysis &&
          type === 'examiner' &&
          isExaminerAnalysisEnabled &&
          !isActivelyRunning && (
            <ExaminerAnalysisPanel analysisResult={examinerAnalysis} />
          )}
      </div>
    </div>
  );
};
