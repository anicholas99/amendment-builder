import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface AnalysisControlsPanelProps {
  isAnalyzing: boolean;
  analysisProgress: number;
  claim1Text: string;
  selectedSearchId: string | null;
  selectedReferenceNumbers: string[];
  hasAnalysisData: boolean;
  onAnalyze: () => void;
  onReAnalyze: () => void;
}

/**
 * Component for analysis controls and progress display
 */
export const AnalysisControlsPanel: React.FC<AnalysisControlsPanelProps> = ({
  isAnalyzing,
  analysisProgress,
  claim1Text,
  selectedSearchId,
  selectedReferenceNumbers,
  hasAnalysisData,
  onAnalyze,
  onReAnalyze,
}) => {
  const isDisabled =
    !selectedSearchId ||
    !claim1Text ||
    isAnalyzing ||
    selectedReferenceNumbers.length === 0;

  return (
    <div>
      <Button
        size="lg"
        onClick={onAnalyze}
        disabled={isDisabled}
        className="mb-2"
      >
        {isAnalyzing
          ? 'Analyzing...'
          : `Analyze Selected References (${selectedReferenceNumbers.length})`}
      </Button>

      {hasAnalysisData && (
        <Button
          variant="outline"
          size="default"
          onClick={onReAnalyze}
          disabled={isDisabled}
          className="ml-3"
        >
          {isAnalyzing ? 'Analyzing...' : 'Re-run Analysis'}
        </Button>
      )}

      {isAnalyzing ? (
        <div>
          <h3 className="text-base font-medium mb-2">Analyzing...</h3>
          <Progress value={analysisProgress} className="mb-3" />
          <p className="text-sm text-muted-foreground">
            This may take up to 30 seconds to complete analysis.
          </p>
          <div className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              The analysis includes:
            </p>
            <p className="text-sm text-muted-foreground">
              • Novelty assessment against each reference
            </p>
            <p className="text-sm text-muted-foreground">
              • Non-obviousness evaluation (§103)
            </p>
            <p className="text-sm text-muted-foreground">
              • Risk profiling and mitigation strategies
            </p>
          </div>
        </div>
      ) : (
        (!claim1Text || selectedReferenceNumbers.length === 0) &&
        selectedSearchId && (
          <p className="text-sm text-muted-foreground mt-2">
            {!claim1Text
              ? 'Please ensure Claim 1 is written before analysis'
              : 'Please select at least one reference to analyze'}
          </p>
        )
      )}
    </div>
  );
};
