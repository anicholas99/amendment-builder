/**
 * Clean Rejection Analysis Panel
 * 
 * Professional, attorney-focused interface showing:
 * - Clear strength assessment
 * - Actionable recommendations  
 * - Key reasoning gaps
 * - Strategic guidance
 */

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  FileText,
  ChevronDown,
  ChevronRight,
  Scale,
  Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import type {
  RejectionAnalysisResult,
  StrategyRecommendation,
  RejectionStrength,
} from '@/types/domain/rejection-analysis';

interface RejectionAnalysisPanelProps {
  analyses: RejectionAnalysisResult[] | null;
  overallStrategy: StrategyRecommendation | null;
  isLoading?: boolean;
  onSelectRejection?: (rejectionId: string) => void;
  selectedRejectionId?: string | null;
  onGenerateAmendment?: () => void;
  className?: string;
}

// Simple strength indicators
const STRENGTH_LABELS: Record<RejectionStrength, {
  label: string;
  icon: React.ElementType;
  description: string;
}> = {
  STRONG: {
    label: 'Strong',
    icon: XCircle,
    description: 'Well-founded rejection requiring amendment',
  },
  MODERATE: {
    label: 'Moderate',
    icon: AlertTriangle,
    description: 'Partially valid with potential arguments',
  },
  WEAK: {
    label: 'Weak',
    icon: CheckCircle2,
    description: 'Flawed reasoning - good argument potential',
  },
  FLAWED: {
    label: 'Flawed',
    icon: CheckCircle2,
    description: 'Clear examiner error - argue only',
  },
};

export const RejectionAnalysisPanel: React.FC<RejectionAnalysisPanelProps> = ({
  analyses,
  overallStrategy,
  isLoading = false,
  onSelectRejection,
  selectedRejectionId,
  onGenerateAmendment,
  className,
}) => {
  const [expandedRejections, setExpandedRejections] = useState<Set<string>>(new Set());

  const toggleExpanded = (rejectionId: string) => {
    const newExpanded = new Set(expandedRejections);
    if (newExpanded.has(rejectionId)) {
      newExpanded.delete(rejectionId);
    } else {
      newExpanded.add(rejectionId);
    }
    setExpandedRejections(newExpanded);
    onSelectRejection?.(rejectionId);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
            <div className="h-20 bg-gray-200 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analyses || analyses.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-12 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="font-medium text-gray-900 mb-2">No Analysis Available</h3>
          <p className="text-gray-500">
            Analyze the Office Action rejections to get strategic recommendations.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate summary
  const weakCount = analyses.filter(a => ['WEAK', 'FLAWED'].includes(a.strength)).length;
  const strongCount = analyses.filter(a => a.strength === 'STRONG').length;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Clean Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Analysis Summary</CardTitle>
            <Badge variant="outline">
              {analyses.length} rejection{analyses.length !== 1 ? 's' : ''} analyzed
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Strategy Recommendation */}
          {overallStrategy && (
            <Alert>
              <Target className="h-4 w-4" />
              <AlertDescription>
                <strong>Recommended Strategy:</strong> {overallStrategy.primaryStrategy}
                <br />
                {overallStrategy.reasoning}
              </AlertDescription>
            </Alert>
          )}

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 text-center py-4 border rounded-lg bg-gray-50">
            <div>
              <div className="text-lg font-semibold">{weakCount}</div>
              <div className="text-sm text-gray-600">Weak/Flawed</div>
            </div>
            <div>
              <div className="text-lg font-semibold">{analyses.filter(a => a.strength === 'MODERATE').length}</div>
              <div className="text-sm text-gray-600">Moderate</div>
            </div>
            <div>
              <div className="text-lg font-semibold">{strongCount}</div>
              <div className="text-sm text-gray-600">Strong</div>
            </div>
          </div>

          <Button onClick={onGenerateAmendment} className="w-full">
            Generate Amendment Response
          </Button>
        </CardContent>
      </Card>

      {/* Individual Rejections */}
      <Card>
        <CardHeader>
          <CardTitle>Rejection Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {analyses.map((analysis, index) => {
            const strengthConfig = STRENGTH_LABELS[analysis.strength];
            const isExpanded = expandedRejections.has(analysis.rejectionId);

            return (
              <div key={analysis.rejectionId} className="border rounded-lg">
                {/* Rejection Header */}
                <button
                  onClick={() => toggleExpanded(analysis.rejectionId)}
                  className="w-full p-4 text-left hover:bg-gray-50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <strengthConfig.icon className="h-5 w-5 text-gray-600" />
                    <div>
                      <div className="font-medium">
                        Rejection {index + 1}: {strengthConfig.label}
                      </div>
                      <div className="text-sm text-gray-600">
                        {strengthConfig.description}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {analysis.recommendedStrategy}
                    </Badge>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t bg-gray-50 space-y-4">
                    {/* Strategy Rationale */}
                    <div>
                      <h4 className="font-medium mb-2">Analysis</h4>
                      <p className="text-sm text-gray-700">{analysis.strategyRationale}</p>
                    </div>

                    {/* Examiner Reasoning Gaps */}
                    {analysis.examinerReasoningGaps.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Examiner Reasoning Issues</h4>
                        <ul className="space-y-1 text-sm">
                          {analysis.examinerReasoningGaps.map((gap, gapIndex) => (
                            <li key={gapIndex} className="flex items-start gap-2">
                              <span className="text-orange-600 mt-1">•</span>
                              <span className="text-gray-700">{gap}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Action Items */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Arguments */}
                      {analysis.argumentPoints.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Scale className="h-4 w-4" />
                            Argument Points
                          </h4>
                          <ul className="space-y-1 text-sm">
                            {analysis.argumentPoints.map((point, pointIndex) => (
                              <li key={pointIndex} className="flex items-start gap-2">
                                <span className="text-green-600 mt-1">•</span>
                                <span className="text-gray-700">{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Amendments */}
                      {analysis.amendmentSuggestions.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Amendment Options
                          </h4>
                          <ul className="space-y-1 text-sm">
                            {analysis.amendmentSuggestions.map((suggestion, suggestionIndex) => (
                              <li key={suggestionIndex} className="flex items-start gap-2">
                                <span className="text-blue-600 mt-1">•</span>
                                <span className="text-gray-700">{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Analysis Metadata */}
                    <div className="pt-2 border-t text-xs text-gray-500">
                      Analyzed {new Date(analysis.analyzedAt).toLocaleDateString()} 
                      {analysis.modelVersion && ` • ${analysis.modelVersion}`}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Key Considerations */}
      {overallStrategy?.keyConsiderations && overallStrategy.keyConsiderations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Key Considerations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {overallStrategy.keyConsiderations.map((consideration, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-blue-600 mt-1">•</span>
                  <span className="text-gray-700">{consideration}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 