/**
 * Professional Rejection Analysis Panel
 * 
 * Clean, attorney-focused design with minimal visual distractions
 * Prioritizes content readability and professional appearance
 */

import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Target,
  Loader2,
  TrendingUp,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SimpleMainPanel } from '@/components/common/SimpleMainPanel';
import { cn } from '@/lib/utils';
import type {
  RejectionAnalysisResult,
  StrategyRecommendation,
  RejectionStrength,
} from '@/types/domain/rejection-analysis';
import type { DetailedAnalysis } from '@/types/amendment';

interface RejectionAnalysisPanelProps {
  analyses: RejectionAnalysisResult[] | null;
  overallStrategy: StrategyRecommendation | null;
  detailedAnalysis?: DetailedAnalysis | null;
  officeActionMetadata?: {
    applicationNumber?: string;
    mailingDate?: string;
    examinerName?: string;
    artUnit?: string;
    documentType?: string;
  };
  examinerRemarks?: string;
  isLoading?: boolean;
  onSelectRejection?: (rejectionId: string) => void;
  selectedRejectionId?: string | null;
  onGenerateAmendment?: () => void;
  isGeneratingAmendment?: boolean;
  className?: string;
}

// Minimal, professional styling
const STRENGTH_CONFIG: Record<RejectionStrength, {
  label: string;
  priority: number;
  borderColor: string;
}> = {
  STRONG: {
    label: 'Strong',
    priority: 1,
    borderColor: 'border-l-red-300',
  },
  MODERATE: {
    label: 'Moderate', 
    priority: 2,
    borderColor: 'border-l-amber-300',
  },
  WEAK: {
    label: 'Weak',
    priority: 3,
    borderColor: 'border-l-blue-300',
  },
  FLAWED: {
    label: 'Flawed',
    priority: 4,
    borderColor: 'border-l-green-300',
  },
};

const STRATEGY_LABELS = {
  ARGUE: 'Argue Only',
  AMEND: 'Amend Claims', 
  COMBINATION: 'Argue + Amend',
};

export const RejectionAnalysisPanel: React.FC<RejectionAnalysisPanelProps> = ({
  analyses,
  overallStrategy,
  detailedAnalysis,
  officeActionMetadata,
  examinerRemarks,
  isLoading = false,
  onSelectRejection,
  selectedRejectionId,
  onGenerateAmendment,
  isGeneratingAmendment = false,
  className,
}) => {
  if (isLoading) {
    return (
      <div className={className}>
        <SimpleMainPanel
          header={
            <div className="p-6 border-b bg-white">
              <h2 className="text-xl font-semibold text-gray-900">Rejection Analysis</h2>
              <p className="text-sm text-gray-600 mt-1">Strategic assessment and recommendations</p>
            </div>
          }
          contentPadding={true}
        >
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600">Analyzing rejections...</p>
            </div>
          </div>
        </SimpleMainPanel>
      </div>
    );
  }

  if (!analyses || analyses.length === 0) {
    return (
      <div className={className}>
        <SimpleMainPanel
          header={
            <div className="p-6 border-b bg-white">
              <h2 className="text-xl font-semibold text-gray-900">Rejection Analysis</h2>
              <p className="text-sm text-gray-600 mt-1">Strategic assessment and recommendations</p>
            </div>
          }
          contentPadding={true}
        >
          <div className="text-center py-12">
            <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2 text-gray-700">No Analysis Available</h3>
            <p className="text-gray-500">
              Run rejection analysis to get strategic recommendations and strength assessments.
            </p>
          </div>
        </SimpleMainPanel>
      </div>
    );
  }

  // Sort by priority (strongest first)
  const sortedAnalyses = [...analyses].sort((a, b) => 
    STRENGTH_CONFIG[a.strength].priority - STRENGTH_CONFIG[b.strength].priority
  );

  return (
    <div className={className}>
      <SimpleMainPanel
        header={
          <div className="p-6 border-b bg-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Rejection Analysis</h2>
                <p className="text-sm text-gray-600 mt-1">Strategic assessment and recommendations</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">{analyses.length} rejections</span>
                <Badge variant="outline" className="bg-gray-50">
                  {analyses.filter(a => a.strength === 'STRONG').length} Strong • {' '}
                  {analyses.filter(a => ['WEAK', 'FLAWED'].includes(a.strength)).length} Arguable
                </Badge>
              </div>
            </div>

            {/* Clean Strategy Section */}
            {overallStrategy && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Recommended Strategy</h3>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="bg-white border">
                        {STRATEGY_LABELS[overallStrategy.primaryStrategy]}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {Math.round(overallStrategy.confidence * 100)}% confidence
                      </span>
                    </div>
                  </div>
                  <Button 
                    onClick={onGenerateAmendment} 
                    disabled={isGeneratingAmendment}
                    className="bg-gray-900 hover:bg-gray-800 text-white"
                  >
                    {isGeneratingAmendment ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Generate Response
                      </>
                    )}
                  </Button>
                </div>
                {overallStrategy.reasoning && (
                  <p className="text-gray-700 text-sm mt-3 pt-3 border-t border-gray-200">
                    {overallStrategy.reasoning}
                  </p>
                )}
              </div>
            )}
          </div>
        }
        contentPadding={false}
      >
        <div className="overflow-y-auto" style={{ height: 'calc(100vh - 400px)' }}>
          <div className="p-6 space-y-4">
            {sortedAnalyses.map((analysis, index) => {
              const strengthInfo = STRENGTH_CONFIG[analysis.strength];
              const isSelected = selectedRejectionId === analysis.rejectionId;

              return (
                <Card
                  key={analysis.rejectionId}
                  className={cn(
                    'transition-all duration-200 cursor-pointer hover:shadow-sm border-l-4',
                    strengthInfo.borderColor,
                    'bg-white',
                    isSelected && 'ring-1 ring-gray-300'
                  )}
                  onClick={() => onSelectRejection?.(analysis.rejectionId)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base font-medium text-gray-900">
                          Rejection {index + 1}
                        </CardTitle>
                        <div className="flex items-center gap-3 mt-1">
                          <Badge variant="outline" className="text-xs bg-gray-50">
                            {strengthInfo.label} Rejection
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {STRATEGY_LABELS[analysis.recommendedStrategy]}
                          </Badge>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {Math.round(analysis.confidenceScore * 100)}% confidence
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 space-y-4">
                    {/* Strategy Rationale */}
                    {analysis.strategyRationale && (
                      <div className="bg-gray-50 rounded p-3">
                        <h4 className="text-sm font-medium text-gray-900 mb-1">Assessment</h4>
                        <p className="text-sm text-gray-700">{analysis.strategyRationale}</p>
                      </div>
                    )}

                    {/* Examiner Issues */}
                    {analysis.examinerReasoningGaps && analysis.examinerReasoningGaps.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Examiner Reasoning Issues</h4>
                        <ul className="space-y-1">
                          {analysis.examinerReasoningGaps.map((gap, i) => (
                            <li key={i} className="text-sm text-gray-700 pl-3 border-l-2 border-gray-200">
                              {gap}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Arguments and Amendments in two columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Arguments */}
                      {analysis.argumentPoints && analysis.argumentPoints.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Key Arguments</h4>
                          <ul className="space-y-1">
                            {analysis.argumentPoints.map((point, i) => (
                              <li key={i} className="text-sm text-gray-700">
                                • {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Amendments */}
                      {analysis.amendmentSuggestions && analysis.amendmentSuggestions.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Amendment Options</h4>
                          <ul className="space-y-1">
                            {analysis.amendmentSuggestions.map((suggestion, i) => (
                              <li key={i} className="text-sm text-gray-700">
                                • {suggestion}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Office Action Summary */}
            {(detailedAnalysis?.overview || examinerRemarks) && (
              <Card className="bg-gray-50 border-gray-200">
                <CardHeader>
                  <CardTitle className="text-base font-medium text-gray-900">Office Action Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {examinerRemarks && (
                    <p className="text-gray-700 text-sm">{examinerRemarks}</p>
                  )}
                  
                  {officeActionMetadata && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm pt-3 border-t border-gray-200">
                      {officeActionMetadata.examinerName && (
                        <div>
                          <span className="text-gray-500">Examiner</span>
                          <div className="font-medium text-gray-900">{officeActionMetadata.examinerName}</div>
                        </div>
                      )}
                      {officeActionMetadata.mailingDate && (
                        <div>
                          <span className="text-gray-500">Date</span>
                          <div className="font-medium text-gray-900">
                            {new Date(officeActionMetadata.mailingDate).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                      {officeActionMetadata.artUnit && (
                        <div>
                          <span className="text-gray-500">Art Unit</span>
                          <div className="font-medium text-gray-900">{officeActionMetadata.artUnit}</div>
                        </div>
                      )}
                      {officeActionMetadata.applicationNumber && (
                        <div>
                          <span className="text-gray-500">Application</span>
                          <div className="font-medium text-gray-900">{officeActionMetadata.applicationNumber}</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Withdrawn/Allowed items */}
                  {detailedAnalysis?.withdrawn && detailedAnalysis.withdrawn.length > 0 && (
                    <div className="pt-3 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Good News</h4>
                      {detailedAnalysis.withdrawn.map((item, index) => (
                        <div key={index} className="text-sm text-gray-700 bg-white rounded p-2 border">
                          {item.type} withdrawn for claims {item.claims.join(', ')} - {item.reason}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </SimpleMainPanel>
    </div>
  );
}; 