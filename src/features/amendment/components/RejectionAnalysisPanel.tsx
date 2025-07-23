/**
 * Enhanced Rejection Analysis Panel
 * 
 * Now displays GPT's detailed legal insights including:
 * - Raw strength assessments alongside standardized classifications
 * - Specific strategic recommendations from GPT
 * - Examiner reasoning gaps and argument points
 * - Enhanced contextual insights
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
  Target,
  Loader2,
  Info,
  Lightbulb,
  MessageSquare,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SimpleMainPanel } from '@/components/common/SimpleMainPanel';
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
  isGeneratingAmendment?: boolean;
  className?: string;
}

// Enhanced strength indicators with more detail
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
    color: 'text-blue-700 bg-blue-50 border-blue-200'
  },
  AMEND: { 
    label: 'Amend Claims', 
    icon: <FileText className="h-4 w-4" />,
    color: 'text-orange-700 bg-orange-50 border-orange-200'
  },
  COMBINATION: { 
    label: 'Argue & Amend', 
    icon: <Scale className="h-4 w-4" />,
    color: 'text-purple-700 bg-purple-50 border-purple-200'
  },
};

export const RejectionAnalysisPanel: React.FC<RejectionAnalysisPanelProps> = ({
  analyses,
  overallStrategy,
  isLoading = false,
  onSelectRejection,
  selectedRejectionId,
  onGenerateAmendment,
  isGeneratingAmendment = false,
  className,
}) => {
  const [expandedAnalyses, setExpandedAnalyses] = useState<Record<string, boolean>>({});

  // Toggle expanded analysis for a rejection
  const toggleAnalysis = React.useCallback((rejectionId: string) => {
    setExpandedAnalyses(prev => ({
      ...prev,
      [rejectionId]: !prev[rejectionId]
    }));
  }, []);

  if (isLoading) {
    return (
      <SimpleMainPanel
        header={
          <div className="p-6">
            <h2 className="text-xl font-semibold">Rejection Analysis</h2>
          </div>
        }
        contentPadding={true}
        className={className}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Analyzing rejections...</p>
          </div>
        </div>
      </SimpleMainPanel>
    );
  }

  if (!analyses || analyses.length === 0) {
    return (
      <SimpleMainPanel
        header={
          <div className="p-6">
            <h2 className="text-xl font-semibold">Rejection Analysis</h2>
          </div>
        }
        contentPadding={true}
        className={className}
      >
        <div className="text-center p-8">
          <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No Analysis Available</h3>
          <p className="text-muted-foreground">
            Run rejection analysis to get strategic recommendations and strength assessments.
          </p>
        </div>
      </SimpleMainPanel>
    );
  }

  // Calculate summary stats
  const strongCount = analyses.filter(a => a.strength === 'STRONG').length;
  const weakCount = analyses.filter(a => ['WEAK', 'FLAWED'].includes(a.strength)).length;

  return (
    <TooltipProvider>
      <SimpleMainPanel
        header={
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Rejection Analysis</h2>
              <Badge variant="outline">
                {analyses.length} rejection{analyses.length !== 1 ? 's' : ''} analyzed
              </Badge>
            </div>
            
            {/* Enhanced Strategy Recommendation */}
            {overallStrategy && (
              <Alert className="mb-4">
                <Target className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <strong>Recommended Strategy:</strong>
                      <Badge className={STRATEGY_LABELS[overallStrategy.primaryStrategy]?.color}>
                        {STRATEGY_LABELS[overallStrategy.primaryStrategy]?.icon}
                        {STRATEGY_LABELS[overallStrategy.primaryStrategy]?.label}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(overallStrategy.confidence * 100)}% confidence
                      </Badge>
                    </div>
                    <p className="text-sm">{overallStrategy.reasoning}</p>
                    {overallStrategy.keyConsiderations && overallStrategy.keyConsiderations.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        <strong>Key Considerations:</strong> {overallStrategy.keyConsiderations.join(', ')}
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Enhanced Summary Stats */}
            <div className="grid grid-cols-3 gap-4 text-center py-4 border rounded-lg bg-gray-50 mb-4">
              <div>
                <div className="text-lg font-semibold text-green-600">{weakCount}</div>
                <div className="text-sm text-gray-600">Weak/Flawed</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-orange-600">
                  {analyses.filter(a => a.strength === 'MODERATE').length}
                </div>
                <div className="text-sm text-gray-600">Moderate</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-red-600">{strongCount}</div>
                <div className="text-sm text-gray-600">Strong</div>
              </div>
            </div>

            <Button onClick={onGenerateAmendment} className="w-full" disabled={isGeneratingAmendment}>
              {isGeneratingAmendment ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Amendment Response'
              )}
            </Button>
          </div>
        }
        contentPadding={true}
        className={className}
      >
        <div className="space-y-4">
          {analyses.map((analysis) => {
            const strengthInfo = STRENGTH_LABELS[analysis.strength];
            const StrengthIcon = strengthInfo.icon;
            const strategyInfo = STRATEGY_LABELS[analysis.recommendedStrategy];
            const isExpanded = expandedAnalyses[analysis.rejectionId];
            const isSelected = selectedRejectionId === analysis.rejectionId;

            return (
              <Card
                key={analysis.rejectionId}
                className={cn(
                  'transition-all duration-200 cursor-pointer hover:shadow-md',
                  strengthInfo.bgColor,
                  isSelected && 'ring-2 ring-blue-500 ring-offset-2'
                )}
                onClick={() => onSelectRejection?.(analysis.rejectionId)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <StrengthIcon className={cn('h-5 w-5 mt-0.5', strengthInfo.color)} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-base font-semibold">
                            Rejection Analysis
                          </h3>
                          <Badge variant="outline" className={strengthInfo.bgColor}>
                            {strengthInfo.label}
                          </Badge>
                          <Badge variant="outline" className={cn('text-xs', strategyInfo.color)}>
                            {strategyInfo.icon}
                            {strategyInfo.label}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          {strengthInfo.description}
                        </p>

                        {/* Enhanced Analysis Display */}
                        {analysis.rawStrengthAssessment && analysis.rawStrengthAssessment !== strengthInfo.label && (
                          <div className="bg-white/70 rounded-md p-3 mb-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Lightbulb className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium">GPT's Detailed Assessment:</span>
                            </div>
                            <p className="text-sm text-gray-700">{analysis.rawStrengthAssessment}</p>
                          </div>
                        )}

                        {analysis.rawRecommendedStrategy && (
                          <div className="bg-white/70 rounded-md p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Target className="h-4 w-4 text-purple-600" />
                              <span className="text-sm font-medium">Specific Strategy:</span>
                            </div>
                            <p className="text-sm text-gray-700">{analysis.rawRecommendedStrategy}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant="outline" className="text-xs">
                            {Math.round(analysis.confidenceScore * 100)}%
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Analysis confidence score</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleAnalysis(analysis.rejectionId);
                        }}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <Collapsible open={isExpanded} onOpenChange={() => toggleAnalysis(analysis.rejectionId)}>
                  <CollapsibleContent>
                    <CardContent className="pt-0 space-y-4">
                      {/* Strategy Rationale */}
                      {analysis.strategyRationale && (
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <Scale className="h-4 w-4 text-purple-600" />
                            Strategy Rationale
                          </h4>
                          <p className="text-sm text-muted-foreground bg-purple-50 p-3 rounded-md">
                            {analysis.strategyRationale}
                          </p>
                        </div>
                      )}

                      {/* Examiner Reasoning Gaps */}
                      {analysis.examinerReasoningGaps && analysis.examinerReasoningGaps.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                            Examiner Reasoning Gaps
                          </h4>
                          <ul className="space-y-1">
                            {analysis.examinerReasoningGaps.map((gap, index) => (
                              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-orange-500 mt-1">•</span>
                                <span>{gap}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Argument Points */}
                      {analysis.argumentPoints && analysis.argumentPoints.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-blue-600" />
                            Key Argument Points
                          </h4>
                          <ul className="space-y-1">
                            {analysis.argumentPoints.map((point, index) => (
                              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-blue-500 mt-1">•</span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Amendment Suggestions */}
                      {analysis.amendmentSuggestions && analysis.amendmentSuggestions.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-green-600" />
                            Amendment Suggestions
                          </h4>
                          <ul className="space-y-1">
                            {analysis.amendmentSuggestions.map((suggestion, index) => (
                              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-green-500 mt-1">•</span>
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Contextual Insights */}
                      {analysis.contextualInsights && analysis.contextualInsights.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <Info className="h-4 w-4 text-gray-600" />
                            Additional Insights
                          </h4>
                          <div className="space-y-2">
                            {analysis.contextualInsights.map((insight, index) => (
                              <div key={index} className="bg-gray-50 p-3 rounded-md">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="text-xs">
                                    {insight.type}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
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
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      </SimpleMainPanel>
    </TooltipProvider>
  );
}; 