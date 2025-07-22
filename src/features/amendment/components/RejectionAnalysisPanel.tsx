/**
 * Enhanced Rejection Analysis Panel
 * 
 * Displays comprehensive rejection analysis results with enhanced visual design:
 * - Strength assessments with contextual insights  
 * - Detailed claim charts and prior art mapping
 * - Strategic recommendations with priority rankings
 * - OCR document context utilization summary
 * - Clear action items and next steps
 */

import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  TrendingUp,
  Target,
  FileText,
  ChevronRight,
  Brain,
  Scale,
  BookOpen,
  Lightbulb,
  ArrowRight,
  Star,
  Eye,
  ChevronDown,
  ChevronUp,
  Info,
  Shield,
  Zap,
  Clock,
  Award
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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

// Enhanced strength configurations with detailed insights
const STRENGTH_CONFIG: Record<RejectionStrength, {
  label: string;
  color: string;
  icon: React.ElementType;
  bgColor: string;
  borderColor: string;
  description: string;
  recommendation: string;
  confidence: number;
}> = {
  STRONG: {
    label: 'Strong Rejection',
    color: 'text-red-600',
    icon: XCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    description: 'Well-founded rejection with solid prior art mapping and legal reasoning',
    recommendation: 'Consider amendment strategy to address examiner concerns',
    confidence: 0.85,
  },
  MODERATE: {
    label: 'Moderate Rejection',
    color: 'text-yellow-600',
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    description: 'Partially valid rejection with some reasoning gaps or unclear prior art mapping',
    recommendation: 'Hybrid approach: argue weak points while considering targeted amendments',
    confidence: 0.70,
  },
  WEAK: {
    label: 'Weak Rejection',
    color: 'text-green-600',
    icon: CheckCircle2,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    description: 'Flawed rejection with significant reasoning gaps or incomplete prior art analysis',
    recommendation: 'Strong argument strategy recommended - rejection can likely be overcome',
    confidence: 0.80,
  },
  FLAWED: {
    label: 'Flawed Rejection',
    color: 'text-green-700',
    icon: Shield,
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
    description: 'Clear examiner error with misreading of claims or improper prior art application',
    recommendation: 'Argument-only strategy recommended - rejection should be easily overcome',
    confidence: 0.95,
  },
};

// Strategy priority configurations
const STRATEGY_PRIORITY_CONFIG = {
  'ARGUE': { icon: Scale, color: 'text-blue-600', bg: 'bg-blue-50' },
  'AMEND': { icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
  'COMBINATION': { icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
};

// Enhanced Analysis Summary Component
const AnalysisSummaryCard: React.FC<{
  analyses: RejectionAnalysisResult[];
  overallStrategy: StrategyRecommendation | null;
  onGenerateAmendment?: () => void;
}> = ({ analyses, overallStrategy, onGenerateAmendment }) => {
  const strengthCounts = analyses.reduce((acc, analysis) => {
    acc[analysis.strength] = (acc[analysis.strength] || 0) + 1;
    return acc;
  }, {} as Record<RejectionStrength, number>);

  const strongCount = strengthCounts.STRONG || 0;
  const weakCount = (strengthCounts.WEAK || 0) + (strengthCounts.FLAWED || 0);
  const overallRisk = strongCount > weakCount ? 'HIGH' : weakCount > strongCount ? 'LOW' : 'MEDIUM';
  
  const avgConfidence = analyses.reduce((sum, a) => sum + a.confidenceScore, 0) / analyses.length;
  const successProbability = overallStrategy?.confidence || avgConfidence;

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-blue-600" />
            AI Analysis Complete
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant={overallRisk === 'LOW' ? 'default' : overallRisk === 'HIGH' ? 'destructive' : 'secondary'}
              className="font-medium"
            >
              {overallRisk} Risk
            </Badge>
            <Badge variant="outline" className="font-medium">
              {Math.round(avgConfidence * 100)}% Confidence
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Success Probability Indicator */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-blue-900">Success Probability</span>
            <span className="text-2xl font-bold text-blue-600">
              {Math.round(successProbability * 100)}%
            </span>
          </div>
          <Progress value={successProbability * 100} className="h-3 mb-2" />
          <p className="text-sm text-blue-700">
            Based on rejection strength analysis and strategic recommendations
          </p>
        </div>

        {/* Strategy Recommendation */}
        {overallStrategy && (
          <Alert className="border-green-200 bg-green-50">
            <Target className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">
              Recommended Strategy: {overallStrategy.primaryStrategy}
            </AlertTitle>
            <AlertDescription className="text-green-700 mt-2">
              {overallStrategy.reasoning}
            </AlertDescription>
          </Alert>
        )}

        {/* OCR Context Indicator */}
        <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <Eye className="h-4 w-4 text-indigo-600" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-indigo-900 text-sm">
                  Expert Analysis with Full Context
                </span>
                <Badge variant="outline" className="text-xs text-indigo-700">
                  OCR Enhanced
                </Badge>
              </div>
              <p className="text-xs text-indigo-700">
                Analysis leveraged comprehensive OCR context from complete prosecution file history
              </p>
            </div>
          </div>
        </div>
        
        {/* Rejection Strength Breakdown */}
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">{weakCount}</div>
            <div className="text-sm text-green-700">Weak/Flawed</div>
          </div>
          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-600">{strengthCounts.MODERATE || 0}</div>
            <div className="text-sm text-yellow-700">Moderate</div>
          </div>
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="text-2xl font-bold text-red-600">{strongCount}</div>
            <div className="text-sm text-red-700">Strong</div>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{analyses.length}</div>
            <div className="text-sm text-blue-700">Total</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button onClick={onGenerateAmendment} className="flex-1" size="lg">
            <Zap className="h-4 w-4 mr-2" />
            Generate Amendment Response
          </Button>
          <Button variant="outline" size="lg">
            <FileText className="h-4 w-4 mr-2" />
            Export Analysis
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Enhanced Individual Rejection Analysis Component  
const DetailedRejectionAnalysis: React.FC<{
  analysis: RejectionAnalysisResult;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ analysis, index, isSelected, onSelect }) => {
  const [showClaimChart, setShowClaimChart] = useState(false);
  const [showContextualInsights, setShowContextualInsights] = useState(false);
  
  const config = STRENGTH_CONFIG[analysis.strength];
  const hasClaimChart = analysis.claimChart && analysis.claimChart.length > 0;
  const hasContextualInsights = analysis.analyzedAt && analysis.strategyRationale;

  return (
    <Card className={cn(
      'transition-all duration-200 hover:shadow-md',
      isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-sm'
    )}>
      <CardHeader 
        className="cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onSelect}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-full', config.bgColor)}>
              <config.icon className={cn('h-5 w-5', config.color)} />
            </div>
            <div>
              <CardTitle className="text-base">
                Rejection {index + 1}: {config.label}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {config.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-medium">
              {Math.round(analysis.confidenceScore * 100)}% Confidence
            </Badge>
            <ChevronRight className={cn(
              'h-4 w-4 transition-transform',
              isSelected ? 'rotate-90' : ''
            )} />
          </div>
        </div>
      </CardHeader>

      {isSelected && (
        <CardContent className="pt-0 space-y-4">
          {/* Strategy Recommendation */}
          <div className={cn(
            'p-4 rounded-lg border-2',
            STRATEGY_PRIORITY_CONFIG[analysis.recommendedStrategy]?.bg || 'bg-gray-50'
          )}>
            <div className="flex items-center gap-2 mb-2">
              {React.createElement(
                STRATEGY_PRIORITY_CONFIG[analysis.recommendedStrategy]?.icon || Target,
                { 
                  className: cn(
                    'h-5 w-5',
                    STRATEGY_PRIORITY_CONFIG[analysis.recommendedStrategy]?.color || 'text-gray-600'
                  )
                }
              )}
              <span className="font-semibold">
                Recommended Strategy: {analysis.recommendedStrategy}
              </span>
            </div>
            <p className="text-sm text-gray-700">{analysis.strategyRationale}</p>
          </div>

          {/* Examiner Reasoning Gaps */}
          {analysis.examinerReasoningGaps.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Examiner Reasoning Gaps ({analysis.examinerReasoningGaps.length})
              </h4>
              <div className="space-y-2">
                {analysis.examinerReasoningGaps.map((gap, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-orange-600">{index + 1}</span>
                    </div>
                    <span className="text-sm text-orange-800">{gap}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Claim Chart Visualization */}
          {hasClaimChart && (
            <Collapsible open={showClaimChart} onOpenChange={setShowClaimChart}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Element-by-Element Claim Chart ({analysis.claimChart?.length || 0} elements)
                  </span>
                  {showClaimChart ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3">
                <div className="border rounded-lg overflow-hidden">
                  <div className="grid grid-cols-4 gap-0 bg-gray-50 border-b font-medium text-sm">
                    <div className="p-3 border-r">Claim Element</div>
                    <div className="p-3 border-r">Prior Art Disclosure</div>
                    <div className="p-3 border-r">Disclosed?</div>
                    <div className="p-3">Analysis Notes</div>
                  </div>
                  {analysis.claimChart?.map((row, index) => (
                    <div key={index} className="grid grid-cols-4 gap-0 border-b last:border-b-0 text-sm">
                      <div className="p-3 border-r font-medium">{row.claimElement}</div>
                      <div className="p-3 border-r text-gray-600">{row.priorArtDisclosure}</div>
                      <div className="p-3 border-r">
                        <Badge 
                          variant={row.isDisclosed ? "destructive" : "default"}
                          className="text-xs"
                        >
                          {row.isDisclosed ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div className="p-3 text-gray-600">{row.notes}</div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Action Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Argument Points */}
            {analysis.argumentPoints.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2 text-green-700">
                  <Scale className="h-4 w-4" />
                  Argument Points ({analysis.argumentPoints.length})
                </h4>
                <div className="space-y-2">
                  {analysis.argumentPoints.map((point, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Star className="h-3 w-3 text-green-600" />
                      </div>
                      <span className="text-sm text-green-800">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Amendment Suggestions */}
            {analysis.amendmentSuggestions.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2 text-blue-700">
                  <FileText className="h-4 w-4" />
                  Amendment Suggestions ({analysis.amendmentSuggestions.length})
                </h4>
                <div className="space-y-2">
                  {analysis.amendmentSuggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Lightbulb className="h-3 w-3 text-blue-600" />
                      </div>
                      <span className="text-sm text-blue-800">{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Contextual Insights from OCR */}
          {hasContextualInsights && (
            <Collapsible open={showContextualInsights} onOpenChange={setShowContextualInsights}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Contextual Insights from OCR Documents
                    {analysis.contextualInsights && (
                      <Badge variant="outline" className="ml-2">
                        {analysis.contextualInsights.length} sources
                      </Badge>
                    )}
                  </span>
                  {showContextualInsights ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3">
                <div className="space-y-3">
                  {analysis.contextualInsights?.map((insight, index) => (
                    <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {insight.type === 'OCR_UTILIZATION' && <FileText className="h-5 w-5 text-blue-600" />}
                          {insight.type === 'SPECIFICATION_REFERENCE' && <BookOpen className="h-5 w-5 text-green-600" />}
                          {insight.type === 'PROSECUTION_HISTORY' && <Clock className="h-5 w-5 text-purple-600" />}
                          {insight.type === 'PRIOR_ART_MAPPING' && <Target className="h-5 w-5 text-orange-600" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-blue-900 text-sm">
                              {insight.source}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {Math.round(insight.confidence * 100)}% confidence
                            </Badge>
                          </div>
                          <p className="text-sm text-blue-800">{insight.description}</p>
                        </div>
                      </div>
                    </div>
                  )) || (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-900">Analysis Utilizing Full File History</span>
                      </div>
                      <p className="text-sm text-blue-800 mb-3">
                        This analysis leveraged comprehensive OCR context including office action text, 
                        current claims, specification, and previous responses to provide expert-level insights.
                      </p>
                      <div className="text-xs text-blue-700">
                        <p>Analyzed: {new Date(analysis.analyzedAt).toLocaleString()}</p>
                        {analysis.modelVersion && <p>Model: {analysis.modelVersion}</p>}
                      </div>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Analysis Metadata */}
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(analysis.analyzedAt).toLocaleDateString()}
                </span>
                {analysis.modelVersion && (
                  <span className="flex items-center gap-1">
                    <Brain className="h-3 w-3" />
                    {analysis.modelVersion}
                  </span>
                )}
              </div>
              <Badge variant="outline" className="text-xs">
                ID: {analysis.rejectionId.slice(-8)}
              </Badge>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
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
  if (isLoading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 animate-pulse" />
            Analyzing Rejections with AI...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-24 bg-gray-200 rounded-lg" />
            <div className="h-40 bg-gray-200 rounded-lg" />
            <div className="h-32 bg-gray-200 rounded-lg" />
          </div>
          <div className="mt-4 text-center text-sm text-gray-500">
            Leveraging comprehensive OCR context for expert-level analysis...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analyses || analyses.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-12 text-center">
          <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No Analysis Available</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Upload and parse an Office Action, then run the AI analysis to get comprehensive 
            rejection assessments and strategic recommendations.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className={cn('space-y-6', className)}>
        {/* Enhanced Analysis Summary */}
        <AnalysisSummaryCard
          analyses={analyses}
          overallStrategy={overallStrategy}
          onGenerateAmendment={onGenerateAmendment}
        />

        {/* Individual Rejection Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Detailed Rejection Analysis ({analyses.length})
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Click on any rejection below to view detailed analysis, claim charts, and strategic recommendations
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {analyses.map((analysis, index) => (
              <DetailedRejectionAnalysis
                key={analysis.rejectionId}
                analysis={analysis}
                index={index}
                isSelected={selectedRejectionId === analysis.rejectionId}
                onSelect={() => onSelectRejection?.(analysis.rejectionId)}
              />
            ))}
          </CardContent>
        </Card>

        {/* Key Insights Summary */}
        {overallStrategy && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Award className="h-5 w-5" />
                Key Strategic Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {overallStrategy.keyConsiderations?.map((consideration, index) => (
                <div key={index} className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-blue-800">{consideration}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
}; 