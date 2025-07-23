/**
 * Enhanced Rejection Analysis Panel
 * 
 * PROFESSIONAL COMPREHENSIVE ANALYSIS - Clean, streamlined interface
 * 
 * Displays ALL analysis information in a professional, non-accordion format:
 * - GPT's detailed legal insights and strength assessments
 * - Strategic recommendations and argument points
 * - Comprehensive Office Action overview and breakdown
 * - Rejections, objections, and strategic implications
 * - Enhanced contextual insights
 */

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  FileText,
  Scale,
  Target,
  Loader2,
  Info,
  Lightbulb,
  MessageSquare,
  ClipboardList,
  AlertOctagon,
  AlertCircle,
  Check,
  Minus,
  TrendingUp,
  Clock,
  Award
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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

// Professional strength indicators
const STRENGTH_LABELS: Record<RejectionStrength, {
  label: string;
  icon: React.ElementType;
  description: string;
  color: string;
  bgColor: string;
}> = {
  STRONG: {
    label: 'Strong',
    icon: XCircle,
    description: 'Well-founded rejection requiring amendment',
    color: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200',
  },
  MODERATE: {
    label: 'Moderate',
    icon: AlertTriangle,
    description: 'Partially valid with potential arguments',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50 border-orange-200',
  },
  WEAK: {
    label: 'Weak',
    icon: CheckCircle2,
    description: 'Flawed reasoning - good argument potential',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50 border-yellow-200',
  },
  FLAWED: {
    label: 'Flawed',
    icon: CheckCircle2,
    description: 'Clear examiner error - argue only',
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200',
  },
};

const STRATEGY_LABELS = {
  ARGUE: { 
    label: 'Argue Only', 
    icon: <MessageSquare className="h-4 w-4" />,
    color: 'bg-blue-600 text-white'
  },
  AMEND: { 
    label: 'Amend Claims', 
    icon: <FileText className="h-4 w-4" />,
    color: 'bg-orange-600 text-white'
  },
  COMBINATION: { 
    label: 'Argue & Amend', 
    icon: <Scale className="h-4 w-4" />,
    color: 'bg-purple-600 text-white'
  },
};

// Helper function for difficulty color styling
const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Easy': return 'bg-green-100 text-green-800 border-green-200';
    case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Hard': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
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
            <div className="p-6">
              <h2 className="text-xl font-semibold">Rejection Analysis</h2>
            </div>
          }
          contentPadding={true}
        >
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Analyzing rejections...</p>
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
            <div className="p-6">
              <h2 className="text-xl font-semibold">Rejection Analysis</h2>
            </div>
          }
          contentPadding={true}
        >
          <div className="text-center p-8">
            <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Analysis Available</h3>
            <p className="text-muted-foreground">
              Run rejection analysis to get strategic recommendations and strength assessments.
            </p>
          </div>
        </SimpleMainPanel>
      </div>
    );
  }

  // Calculate summary stats
  const strongCount = analyses.filter(a => a.strength === 'STRONG').length;
  const moderateCount = analyses.filter(a => a.strength === 'MODERATE').length;
  const weakCount = analyses.filter(a => ['WEAK', 'FLAWED'].includes(a.strength)).length;

  return (
    <div className={className}>
      <TooltipProvider>
        <SimpleMainPanel
          header={
            <div className="p-6 border-b bg-gradient-to-r from-slate-50 to-blue-50">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Rejection Analysis</h2>
                  <p className="text-gray-600 mt-1">Comprehensive analysis and strategic recommendations</p>
                </div>
                <Badge variant="outline" className="bg-white">
                  {analyses.length} rejection{analyses.length !== 1 ? 's' : ''} analyzed
                </Badge>
              </div>
              
              {/* Professional Strategy Overview */}
              {overallStrategy && (
                <div className="bg-white rounded-lg p-4 shadow-sm border mb-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Target className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">Recommended Strategy</h3>
                      <div className="flex items-center gap-3 mb-3">
                        <Badge className={STRATEGY_LABELS[overallStrategy.primaryStrategy]?.color}>
                          {STRATEGY_LABELS[overallStrategy.primaryStrategy]?.icon}
                          {STRATEGY_LABELS[overallStrategy.primaryStrategy]?.label}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Award className="h-4 w-4 text-amber-500" />
                          <span className="text-sm text-gray-600">
                            {Math.round(overallStrategy.confidence * 100)}% confidence
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm">{overallStrategy.reasoning}</p>
                      {overallStrategy.keyConsiderations && overallStrategy.keyConsiderations.length > 0 && (
                        <div className="mt-2 text-xs text-gray-600">
                          <strong>Key considerations:</strong> {overallStrategy.keyConsiderations.join(' • ')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Professional Summary Stats */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 text-center shadow-sm border">
                  <div className="text-2xl font-bold text-gray-900">{analyses.length}</div>
                  <div className="text-sm text-gray-600">Total Rejections</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center shadow-sm border">
                  <div className="text-2xl font-bold text-red-600">{strongCount}</div>
                  <div className="text-sm text-gray-600">Strong</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center shadow-sm border">
                  <div className="text-2xl font-bold text-orange-600">{moderateCount}</div>
                  <div className="text-sm text-gray-600">Moderate</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center shadow-sm border">
                  <div className="text-2xl font-bold text-green-600">{weakCount}</div>
                  <div className="text-sm text-gray-600">Weak/Flawed</div>
                </div>
              </div>

              <Button 
                onClick={onGenerateAmendment} 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                disabled={isGeneratingAmendment}
                size="lg"
              >
                {isGeneratingAmendment ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Amendment Response...
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Generate Amendment Response
                  </>
                )}
              </Button>
            </div>
          }
          contentPadding={true}
        >
          <div className="space-y-8">
            {/* Professional Rejection Analysis Cards */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Scale className="h-5 w-5 text-blue-600" />
                Individual Rejection Analysis
              </h3>
              
              {analyses.map((analysis, index) => {
                const strengthInfo = STRENGTH_LABELS[analysis.strength];
                const StrengthIcon = strengthInfo.icon;
                const strategyInfo = STRATEGY_LABELS[analysis.recommendedStrategy];
                const isSelected = selectedRejectionId === analysis.rejectionId;

                return (
                  <Card
                    key={analysis.rejectionId}
                    className={cn(
                      'transition-all duration-200 cursor-pointer hover:shadow-lg border-l-4',
                      strengthInfo.bgColor,
                      isSelected && 'ring-2 ring-blue-500 ring-offset-2 shadow-lg'
                    )}
                    onClick={() => onSelectRejection?.(analysis.rejectionId)}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn('p-2 rounded-lg', strengthInfo.bgColor)}>
                            <StrengthIcon className={cn('h-5 w-5', strengthInfo.color)} />
                          </div>
                          <div>
                            <CardTitle className="text-lg">Rejection #{index + 1}</CardTitle>
                            <div className="flex items-center gap-3 mt-1">
                              <Badge variant="outline" className={strengthInfo.bgColor}>
                                {strengthInfo.label} Rejection
                              </Badge>
                              <Badge className={strategyInfo.color}>
                                {strategyInfo.icon}
                                {strategyInfo.label}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge variant="outline" className="bg-white">
                              {Math.round(analysis.confidenceScore * 100)}% confidence
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Analysis confidence score</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      <p className="text-gray-700">{strengthInfo.description}</p>

                      {/* Enhanced Analysis Display */}
                      {analysis.rawStrengthAssessment && (
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-blue-900">AI Assessment</span>
                          </div>
                          <p className="text-blue-800 text-sm">{analysis.rawStrengthAssessment}</p>
                        </div>
                      )}

                      {analysis.rawRecommendedStrategy && (
                        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="h-4 w-4 text-purple-600" />
                            <span className="font-medium text-purple-900">Specific Strategy</span>
                          </div>
                          <p className="text-purple-800 text-sm">{analysis.rawRecommendedStrategy}</p>
                        </div>
                      )}

                      {/* Strategy Rationale */}
                      {analysis.strategyRationale && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                            <Scale className="h-4 w-4 text-gray-600" />
                            Strategy Rationale
                          </h4>
                          <p className="text-gray-700 text-sm">{analysis.strategyRationale}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Examiner Reasoning Gaps */}
                        {analysis.examinerReasoningGaps && analysis.examinerReasoningGaps.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-orange-600" />
                              Examiner Reasoning Gaps
                            </h4>
                            <ul className="space-y-2">
                              {analysis.examinerReasoningGaps.map((gap, index) => (
                                <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                  <span className="text-orange-500 mt-1 font-bold">•</span>
                                  <span>{gap}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Argument Points */}
                        {analysis.argumentPoints && analysis.argumentPoints.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                              <MessageSquare className="h-4 w-4 text-blue-600" />
                              Key Argument Points
                            </h4>
                            <ul className="space-y-2">
                              {analysis.argumentPoints.map((point, index) => (
                                <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                  <span className="text-blue-500 mt-1 font-bold">•</span>
                                  <span>{point}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Amendment Suggestions */}
                      {analysis.amendmentSuggestions && analysis.amendmentSuggestions.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-green-600" />
                            Amendment Suggestions
                          </h4>
                          <ul className="space-y-2">
                            {analysis.amendmentSuggestions.map((suggestion, index) => (
                              <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                <span className="text-green-500 mt-1 font-bold">•</span>
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Contextual Insights */}
                      {analysis.contextualInsights && analysis.contextualInsights.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                            <Info className="h-4 w-4 text-gray-600" />
                            Additional Insights
                          </h4>
                          <div className="space-y-3">
                            {analysis.contextualInsights.map((insight, index) => (
                              <div key={index} className="bg-gray-50 rounded-lg p-3 border">
                                <div className="flex items-center justify-between mb-2">
                                  <Badge variant="outline" className="text-xs">
                                    {insight.type}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    {Math.round(insight.confidence * 100)}% confidence
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700">{insight.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* COMPREHENSIVE OFFICE ACTION ANALYSIS */}
            {detailedAnalysis && (
              <div className="space-y-6 border-t pt-8">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-blue-600" />
                  Comprehensive Office Action Analysis
                </h3>

                {/* Overview */}
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-blue-600" />
                      Document Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">{detailedAnalysis.overview}</p>
                    {officeActionMetadata && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {officeActionMetadata.examinerName && (
                          <div>
                            <span className="text-gray-500">Examiner:</span>
                            <div className="font-medium">{officeActionMetadata.examinerName}</div>
                          </div>
                        )}
                        {officeActionMetadata.mailingDate && (
                          <div>
                            <span className="text-gray-500">Date:</span>
                            <div className="font-medium">{new Date(officeActionMetadata.mailingDate).toLocaleDateString()}</div>
                          </div>
                        )}
                        {officeActionMetadata.artUnit && (
                          <div>
                            <span className="text-gray-500">Art Unit:</span>
                            <div className="font-medium">{officeActionMetadata.artUnit}</div>
                          </div>
                        )}
                        {officeActionMetadata.documentType && (
                          <div>
                            <span className="text-gray-500">Type:</span>
                            <Badge variant="outline">{officeActionMetadata.documentType}</Badge>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Detailed Rejections Breakdown */}
                {detailedAnalysis.rejectionBreakdown && detailedAnalysis.rejectionBreakdown.length > 0 && (
                  <Card className="border-l-4 border-l-red-500">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <AlertOctagon className="h-4 w-4 text-red-600" />
                        Detailed Rejection Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {detailedAnalysis.rejectionBreakdown.map((rejection, index) => (
                        <div key={index} className="bg-red-50 rounded-lg p-4 border border-red-200">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-semibold text-red-900">
                              {rejection.type}: {rejection.title}
                            </h4>
                            <Badge variant="destructive" className="text-xs">
                              Claims: {rejection.claims.join(', ')}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            {rejection.issues.map((issue, issueIndex) => (
                              <div key={issueIndex} className="flex items-start gap-2">
                                <Minus className="h-3 w-3 text-red-600 mt-1 flex-shrink-0" />
                                <span className="text-red-800 text-sm">{issue}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Objections and Withdrawn Items in Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Objections */}
                  {detailedAnalysis.objections && detailedAnalysis.objections.length > 0 && (
                    <Card className="border-l-4 border-l-yellow-500">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                          Formal Objections
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {detailedAnalysis.objections.map((objection, index) => (
                          <div key={index} className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-yellow-900">{objection.type}</h4>
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                                Claims: {objection.claims.join(', ')}
                              </Badge>
                            </div>
                            <div className="space-y-1">
                              {objection.issues.map((issue, issueIndex) => (
                                <div key={issueIndex} className="flex items-start gap-2">
                                  <Minus className="h-3 w-3 text-yellow-600 mt-1 flex-shrink-0" />
                                  <span className="text-yellow-800 text-sm">{issue}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Withdrawn Items */}
                  {detailedAnalysis.withdrawn && detailedAnalysis.withdrawn.length > 0 && (
                    <Card className="border-l-4 border-l-green-500">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-600" />
                          Withdrawn/Allowed Items
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {detailedAnalysis.withdrawn.map((item, index) => (
                          <div key={index} className="bg-green-50 rounded-lg p-3 border border-green-200">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-green-900">{item.type} Withdrawn</h4>
                              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                                Claims: {item.claims.join(', ')}
                              </Badge>
                            </div>
                            <p className="text-green-800 text-sm">{item.reason}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Strategic Implications */}
                {detailedAnalysis.strategicImplications && (
                  <Card className="border-l-4 border-l-purple-500">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Target className="h-4 w-4 text-purple-600" />
                        Strategic Implications
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className={`px-4 py-2 rounded-full text-sm font-medium border ${getDifficultyColor(detailedAnalysis.strategicImplications.difficulty)}`}>
                            {detailedAnalysis.strategicImplications.difficulty} Response
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-600 mb-1">Time to Respond</div>
                          <div className="font-semibold flex items-center justify-center gap-1">
                            <Clock className="h-4 w-4 text-gray-500" />
                            {detailedAnalysis.strategicImplications.timeToRespond}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-600 mb-1">Recommended Approach</div>
                          <div className="font-semibold text-sm">{detailedAnalysis.strategicImplications.recommendedApproach}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                          <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            Positive Aspects
                          </h4>
                          <ul className="space-y-2">
                            {detailedAnalysis.strategicImplications.positives.map((positive, index) => (
                              <li key={index} className="text-sm text-green-700 flex items-start gap-2">
                                <span className="text-green-500 mt-1 font-bold">•</span>
                                {positive}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                          <h4 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Main Concerns
                          </h4>
                          <ul className="space-y-2">
                            {detailedAnalysis.strategicImplications.concerns.map((concern, index) => (
                              <li key={index} className="text-sm text-red-700 flex items-start gap-2">
                                <span className="text-red-500 mt-1 font-bold">•</span>
                                {concern}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Quick Reference Summary */}
            {examinerRemarks && (
              <Card className="border-l-4 border-l-gray-500">
                <CardHeader>
                  <CardTitle className="text-base text-gray-600">Quick Reference Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{examinerRemarks}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </SimpleMainPanel>
      </TooltipProvider>
    </div>
  );
}; 