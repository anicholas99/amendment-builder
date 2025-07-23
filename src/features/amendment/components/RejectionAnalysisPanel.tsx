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
      <div className="flex flex-col bg-card" style={{ height: 'calc(100vh - 180px)' }}>
        {/* Fixed header */}
        <div className="flex-shrink-0 bg-card border-b border-border">
          <div className="p-3 border-b bg-white">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Rejection Analysis</h2>
                <p className="text-xs text-gray-600 mt-0.5">Strategic assessment and recommendations</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{analyses.length} rejections</span>
                <Badge variant="outline" className="bg-gray-50 text-xs px-2 py-1">
                  {analyses.filter(a => a.strength === 'STRONG').length} Strong • {' '}
                  {analyses.filter(a => ['WEAK', 'FLAWED'].includes(a.strength)).length} Arguable
                </Badge>
              </div>
            </div>

            {/* Strategy Section - More Compact */}
            {overallStrategy && (
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Recommended Strategy</span>
                                         <Badge variant="outline" className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5">
                       {STRATEGY_LABELS[overallStrategy.primaryStrategy]}
                     </Badge>
                     <span className="text-xs text-blue-700">
                       {Math.round(overallStrategy.confidence * 100)}% confidence
                     </span>
                   </div>
                   <Button
                     onClick={onGenerateAmendment}
                     disabled={isGeneratingAmendment}
                     size="sm"
                     className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 h-7"
                   >
                     {isGeneratingAmendment ? (
                       <>
                         <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                         Generating...
                       </>
                     ) : (
                       'Generate Response'
                     )}
                   </Button>
                 </div>
                 {overallStrategy.reasoning && (
                   <p className="text-xs text-blue-800 mt-2 leading-relaxed">
                     {overallStrategy.reasoning}
                   </p>
                 )}
              </div>
            )}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-auto p-4 space-y-6">
          
          {/* Office Action Summary */}
          {(detailedAnalysis?.overview || examinerRemarks) && (
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-3">Office Action Summary</h3>
              <Card>
                <CardContent className="pt-4">
                  {detailedAnalysis?.overview && (
                    <div className="mb-3">
                      <h4 className="font-medium text-gray-900 mb-1.5">Document Overview</h4>
                      <p className="text-gray-700 leading-relaxed text-sm">{detailedAnalysis.overview}</p>
                    </div>
                  )}
                  
                  {examinerRemarks && examinerRemarks !== detailedAnalysis?.overview && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1.5">Examiner's Key Points</h4>
                      <p className="text-gray-700 leading-relaxed text-sm">{examinerRemarks}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Rejection Details */}
          {detailedAnalysis?.rejectionBreakdown && detailedAnalysis.rejectionBreakdown.length > 0 && (
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-3">Rejection Details</h3>
              <Card>
                <CardContent className="pt-4 space-y-4">
                  {detailedAnalysis.rejectionBreakdown.map((rejection, index) => (
                    <div key={index} className="pb-4 border-b border-gray-100 last:border-b-0 last:pb-0">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {rejection.type}: {rejection.title}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          Claims: {rejection.claims.join(', ')}
                        </Badge>
                      </div>
                      <div className="space-y-1.5">
                        {rejection.issues.map((issue, issueIndex) => (
                          <div key={issueIndex} className="text-gray-700 pl-3 border-l-2 border-gray-200 text-sm">
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
              <h3 className="text-base font-medium text-gray-900 mb-3">Formal Objections</h3>
              <Card>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    {detailedAnalysis.objections.map((objection, index) => (
                      <div key={index} className="pb-3 border-b border-gray-100 last:border-b-0 last:pb-0">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900 text-sm">{objection.type}</h4>
                          <Badge variant="outline" className="text-xs">
                            Claims: {objection.claims.join(', ')}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          {objection.issues.map((issue: string, issueIndex: number) => (
                            <div key={issueIndex} className="text-gray-700 pl-3 border-l-2 border-amber-200 text-sm">
                              {issue}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Strategic Implications */}
          {detailedAnalysis?.strategicImplications && (
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-3">Strategic Implications</h3>
              <Card>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 text-sm">Positive Aspects</h4>
                      <ul className="space-y-1.5">
                        {detailedAnalysis.strategicImplications.positives.map((positive, index) => (
                          <li key={index} className="text-gray-700 text-sm">
                            • {positive}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 text-sm">Main Concerns</h4>
                      <ul className="space-y-1.5">
                        {detailedAnalysis.strategicImplications.concerns.map((concern, index) => (
                          <li key={index} className="text-gray-700 text-sm">
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

          {/* Strategic Analysis by Rejection */}
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-3">Strategic Analysis by Rejection</h3>
            <div className="space-y-3">
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
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-sm font-medium text-gray-900">
                            Rejection {index + 1} - {strengthInfo.label}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
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

                    <CardContent className="pt-0 space-y-3">
                      {/* AI Assessment */}
                      {analysis.rawStrengthAssessment && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1.5 text-sm">Assessment</h4>
                          <p className="text-gray-700 text-sm">{analysis.rawStrengthAssessment}</p>
                        </div>
                      )}

                      {/* Strategy */}
                      {analysis.strategyRationale && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1.5 text-sm">Strategy</h4>
                          <p className="text-gray-700 text-sm">{analysis.strategyRationale}</p>
                        </div>
                      )}

                      {/* Specific Recommendation */}
                      {analysis.rawRecommendedStrategy && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1.5 text-sm">Recommendation</h4>
                          <p className="text-gray-700 text-sm">{analysis.rawRecommendedStrategy}</p>
                        </div>
                      )}

                      {/* Examiner Issues */}
                      {analysis.examinerReasoningGaps && analysis.examinerReasoningGaps.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1.5 text-sm">Examiner Issues</h4>
                          <ul className="space-y-1">
                            {analysis.examinerReasoningGaps.map((gap, i) => (
                              <li key={i} className="text-gray-700 pl-3 border-l-2 border-gray-200 text-sm">
                                {gap}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Arguments and Amendments */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {analysis.argumentPoints && analysis.argumentPoints.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-1.5 text-sm">Argument Points</h4>
                            <ul className="space-y-1">
                              {analysis.argumentPoints.slice(0, 3).map((point, i) => (
                                <li key={i} className="text-gray-700 text-sm">
                                  • {point}
                                </li>
                              ))}
                              {analysis.argumentPoints.length > 3 && (
                                <li className="text-gray-500 text-xs">
                                  +{analysis.argumentPoints.length - 3} more...
                                </li>
                              )}
                            </ul>
                          </div>
                        )}

                        {analysis.amendmentSuggestions && analysis.amendmentSuggestions.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-1.5 text-sm">Amendment Ideas</h4>
                            <ul className="space-y-1">
                              {analysis.amendmentSuggestions.slice(0, 3).map((suggestion, i) => (
                                <li key={i} className="text-gray-700 text-sm">
                                  • {suggestion}
                                </li>
                              ))}
                              {analysis.amendmentSuggestions.length > 3 && (
                                <li className="text-gray-500 text-xs">
                                  +{analysis.amendmentSuggestions.length - 3} more...
                                </li>
                              )}
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
        </div>
      </div>
    </div>
  );
}; 