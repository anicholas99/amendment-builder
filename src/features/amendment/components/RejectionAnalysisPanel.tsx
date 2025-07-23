/**
 * Professional Rejection Analysis Panel
 * 
 * Clean, attorney-focused design with consistent styling
 * Focuses on content readability and professional appearance
 */

import React from 'react';
import { 
  Target,
  Loader2,
  TrendingUp
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

// Clean, consistent styling
const STRENGTH_CONFIG: Record<RejectionStrength, {
  label: string;
  priority: number;
}> = {
  STRONG: {
    label: 'Strong',
    priority: 1,
  },
  MODERATE: {
    label: 'Moderate', 
    priority: 2,
  },
  WEAK: {
    label: 'Weak',
    priority: 3,
  },
  FLAWED: {
    label: 'Flawed',
    priority: 4,
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
              <p className="text-sm text-gray-600 mt-1">Analyzing Office Action content and generating strategic recommendations</p>
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
      <div className="flex flex-col bg-card" style={{ height: 'calc(100vh - 200px)' }}>
        {/* Fixed header */}
        <div className="flex-shrink-0 bg-card border-b border-border">
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

            {/* Strategy Section */}
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
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-auto p-6 space-y-8">
          
          {/* Office Action Summary */}
          {(detailedAnalysis?.overview || examinerRemarks) && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Office Action Summary</h3>
              <Card>
                <CardContent className="pt-6">
                  {detailedAnalysis?.overview && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Document Overview</h4>
                      <p className="text-gray-700 leading-relaxed">{detailedAnalysis.overview}</p>
                    </div>
                  )}
                  
                  {examinerRemarks && examinerRemarks !== detailedAnalysis?.overview && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Examiner's Key Points</h4>
                      <p className="text-gray-700 leading-relaxed">{examinerRemarks}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Rejection Details */}
          {detailedAnalysis?.rejectionBreakdown && detailedAnalysis.rejectionBreakdown.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Rejection Details</h3>
              <Card>
                <CardContent className="pt-6 space-y-6">
                  {detailedAnalysis.rejectionBreakdown.map((rejection, index) => (
                    <div key={index} className="pb-6 border-b border-gray-100 last:border-b-0 last:pb-0">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-medium text-gray-900">
                          {rejection.type}: {rejection.title}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          Claims: {rejection.claims.join(', ')}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {rejection.issues.map((issue, issueIndex) => (
                          <div key={issueIndex} className="text-gray-700 pl-4 border-l-2 border-gray-200">
                            {issue}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Formal Objections */}
          {detailedAnalysis?.objections && detailedAnalysis.objections.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Formal Objections</h3>
              <Card>
                <CardContent className="pt-6 space-y-4">
                  {detailedAnalysis.objections.map((objection, index) => (
                    <div key={index} className="pb-4 border-b border-gray-100 last:border-b-0 last:pb-0">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{objection.type}</h4>
                        <Badge variant="outline" className="text-xs">
                          Claims: {objection.claims.join(', ')}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        {objection.issues.map((issue, issueIndex) => (
                          <div key={issueIndex} className="text-gray-700 pl-4 border-l-2 border-gray-200">
                            {issue}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Good News */}
          {detailedAnalysis?.withdrawn && detailedAnalysis.withdrawn.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Withdrawn/Allowed Items</h3>
              <Card>
                <CardContent className="pt-6 space-y-3">
                  {detailedAnalysis.withdrawn.map((item, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded border">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{item.type} Withdrawn</h4>
                        <Badge variant="outline" className="text-xs">
                          Claims: {item.claims.join(', ')}
                        </Badge>
                      </div>
                      <p className="text-gray-700">{item.reason}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Strategic Analysis */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Strategic Analysis by Rejection</h3>
            <div className="space-y-4">
              {sortedAnalyses.map((analysis, index) => {
                const strengthInfo = STRENGTH_CONFIG[analysis.strength];
                const isSelected = selectedRejectionId === analysis.rejectionId;

                return (
                  <Card
                    key={analysis.rejectionId}
                    className={cn(
                      'cursor-pointer transition-all duration-200 hover:shadow-md',
                      isSelected && 'ring-1 ring-gray-400'
                    )}
                    onClick={() => onSelectRejection?.(analysis.rejectionId)}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base font-medium text-gray-900">
                            Rejection {index + 1} - {strengthInfo.label}
                          </CardTitle>
                          <div className="flex items-center gap-3 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {STRATEGY_LABELS[analysis.recommendedStrategy]}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {Math.round(analysis.confidenceScore * 100)}% confidence
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0 space-y-4">
                      {/* AI Assessment */}
                      {analysis.rawStrengthAssessment && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Assessment</h4>
                          <p className="text-gray-700">{analysis.rawStrengthAssessment}</p>
                        </div>
                      )}

                      {/* Strategy */}
                      {analysis.strategyRationale && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Strategy</h4>
                          <p className="text-gray-700">{analysis.strategyRationale}</p>
                        </div>
                      )}

                      {/* Specific Recommendation */}
                      {analysis.rawRecommendedStrategy && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Recommendation</h4>
                          <p className="text-gray-700">{analysis.rawRecommendedStrategy}</p>
                        </div>
                      )}

                      {/* Examiner Issues */}
                      {analysis.examinerReasoningGaps && analysis.examinerReasoningGaps.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Examiner Issues</h4>
                          <ul className="space-y-1">
                            {analysis.examinerReasoningGaps.map((gap, i) => (
                              <li key={i} className="text-gray-700 pl-4 border-l-2 border-gray-200">
                                {gap}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Arguments and Amendments */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {analysis.argumentPoints && analysis.argumentPoints.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Key Arguments</h4>
                            <ul className="space-y-1">
                              {analysis.argumentPoints.map((point, i) => (
                                <li key={i} className="text-gray-700">
                                  • {point}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {analysis.amendmentSuggestions && analysis.amendmentSuggestions.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Amendment Options</h4>
                            <ul className="space-y-1">
                              {analysis.amendmentSuggestions.map((suggestion, i) => (
                                <li key={i} className="text-gray-700">
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
            </div>
          </div>

          {/* Strategic Implications */}
          {detailedAnalysis?.strategicImplications && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Strategic Implications</h3>
              <Card>
                <CardContent className="pt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div>
                      <div className="text-sm text-gray-600 mb-2">Difficulty</div>
                      <div className="font-medium text-gray-900">
                        {detailedAnalysis.strategicImplications.difficulty} Response
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-2">Response Time</div>
                      <div className="font-medium text-gray-900">
                        {detailedAnalysis.strategicImplications.timeToRespond}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-2">Approach</div>
                      <div className="font-medium text-gray-900">
                        {detailedAnalysis.strategicImplications.recommendedApproach}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Positive Aspects</h4>
                      <ul className="space-y-2">
                        {detailedAnalysis.strategicImplications.positives.map((positive, index) => (
                          <li key={index} className="text-gray-700">
                            • {positive}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Main Concerns</h4>
                      <ul className="space-y-2">
                        {detailedAnalysis.strategicImplications.concerns.map((concern, index) => (
                          <li key={index} className="text-gray-700">
                            • {concern}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 