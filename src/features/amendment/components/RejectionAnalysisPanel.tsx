/**
 * Rejection Analysis Panel
 * 
 * Displays rejection analysis results with strength assessments,
 * claim charts, and strategic recommendations
 */

import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  TrendingUp,
  Target,
  FileText,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
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

// Strength configurations
const STRENGTH_CONFIG: Record<RejectionStrength, {
  label: string;
  color: string;
  icon: React.ElementType;
  bgColor: string;
  borderColor: string;
}> = {
  STRONG: {
    label: 'Strong',
    color: 'text-red-600',
    icon: XCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  MODERATE: {
    label: 'Moderate',
    color: 'text-yellow-600',
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
  WEAK: {
    label: 'Weak',
    color: 'text-green-600',
    icon: CheckCircle2,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  FLAWED: {
    label: 'Flawed',
    color: 'text-green-700',
    icon: CheckCircle2,
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
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
  if (isLoading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardHeader>
          <CardTitle>Analyzing Rejections...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-20 bg-gray-100 rounded" />
            <div className="h-32 bg-gray-100 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analyses || analyses.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center text-muted-foreground">
          No rejection analysis available. Upload and parse an Office Action first.
        </CardContent>
      </Card>
    );
  }

  // Calculate summary statistics
  const strengthCounts = analyses.reduce((acc, analysis) => {
    acc[analysis.strength] = (acc[analysis.strength] || 0) + 1;
    return acc;
  }, {} as Record<RejectionStrength, number>);

  const strongCount = strengthCounts.STRONG || 0;
  const weakCount = (strengthCounts.WEAK || 0) + (strengthCounts.FLAWED || 0);
  const overallRisk = strongCount > weakCount ? 'HIGH' : weakCount > strongCount ? 'LOW' : 'MEDIUM';

  return (
    <div className={cn('space-y-6', className)}>
      {/* Overall Strategy Card */}
      {overallStrategy && (
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Strategic Recommendation
              </CardTitle>
              <Badge 
                variant={overallRisk === 'LOW' ? 'outline' : overallRisk === 'HIGH' ? 'destructive' : 'secondary'}
              >
                {overallRisk} Risk
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertTitle>Primary Strategy: {overallStrategy.primaryStrategy}</AlertTitle>
              <AlertDescription>{overallStrategy.reasoning}</AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{weakCount}</div>
                <div className="text-sm text-muted-foreground">Weak Rejections</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{strengthCounts.MODERATE || 0}</div>
                <div className="text-sm text-muted-foreground">Moderate</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{strongCount}</div>
                <div className="text-sm text-muted-foreground">Strong</div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={onGenerateAmendment} className="flex-1">
                Generate Amendment Response
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Individual Rejection Analyses */}
      <Card>
        <CardHeader>
          <CardTitle>Rejection Analysis Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={analyses[0]?.rejectionId} value={selectedRejectionId || undefined}>
            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${analyses.length}, 1fr)` }}>
              {analyses.map((analysis, index) => {
                const config = STRENGTH_CONFIG[analysis.strength];
                return (
                  <TabsTrigger
                    key={analysis.rejectionId}
                    value={analysis.rejectionId}
                    className="flex items-center gap-2"
                    onClick={() => onSelectRejection?.(analysis.rejectionId)}
                  >
                    <config.icon className={cn('h-4 w-4', config.color)} />
                    <span>Rejection {index + 1}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {analyses.map((analysis) => {
              const config = STRENGTH_CONFIG[analysis.strength];
              return (
                <TabsContent key={analysis.rejectionId} value={analysis.rejectionId} className="mt-4">
                  <div className="space-y-4">
                    {/* Strength Assessment */}
                    <div className={cn('p-4 rounded-lg border', config.bgColor, config.borderColor)}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <config.icon className={cn('h-5 w-5', config.color)} />
                          <span className={cn('font-semibold', config.color)}>
                            {config.label} Rejection
                          </span>
                        </div>
                        <Badge variant="outline">
                          Confidence: {Math.round(analysis.confidenceScore * 100)}%
                        </Badge>
                      </div>
                      <p className="text-sm">{analysis.strategyRationale}</p>
                    </div>

                    {/* Examiner Reasoning Gaps */}
                    {analysis.examinerReasoningGaps.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Examiner Reasoning Gaps</h4>
                        <ul className="space-y-1">
                          {analysis.examinerReasoningGaps.map((gap, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <ChevronRight className="h-4 w-4 mt-0.5 text-muted-foreground" />
                              <span>{gap}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommended Actions */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {analysis.argumentPoints.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Argument Points
                          </h4>
                          <ul className="space-y-1 text-sm">
                            {analysis.argumentPoints.map((point, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-green-600">•</span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {analysis.amendmentSuggestions.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Amendment Suggestions
                          </h4>
                          <ul className="space-y-1 text-sm">
                            {analysis.amendmentSuggestions.map((suggestion, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-blue-600">•</span>
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}; 