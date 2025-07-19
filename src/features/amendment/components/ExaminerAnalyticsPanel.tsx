/**
 * Examiner Analytics Panel - Examiner performance insights
 * 
 * Displays examiner statistics and patterns:
 * - Allowance rate, average OAs to allowance, appeal success rate
 * - Common rejection types and preferences
 * - Strategic insights for working with this examiner
 */

import React from 'react';
import { 
  User, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  Target,
  AlertTriangle,
  CheckCircle2,
  Building,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useExaminerAnalytics, useProsecutionOverview } from '@/hooks/api/useProsecutionOverview';

interface ExaminerAnalyticsPanelProps {
  projectId: string;
  className?: string;
}

const REJECTION_TYPE_CONFIG = {
  '§102': {
    color: 'bg-red-100 text-red-700',
    label: 'Anticipation',
    description: 'Prior art discloses invention'
  },
  '§103': {
    color: 'bg-orange-100 text-orange-700',
    label: 'Obviousness',
    description: 'Obvious over prior art'
  },
  '§101': {
    color: 'bg-purple-100 text-purple-700',
    label: 'Subject Matter',
    description: 'Not patentable subject matter'
  },
  '§112': {
    color: 'bg-blue-100 text-blue-700',
    label: 'Enablement',
    description: 'Insufficient disclosure'
  },
  'OTHER': {
    color: 'bg-gray-100 text-gray-700',
    label: 'Other',
    description: 'Other rejections'
  },
} as const;

const getPerformanceColor = (value: number, type: 'rate' | 'count' | 'time') => {
  if (type === 'rate') {
    if (value >= 70) return 'text-green-600';
    if (value >= 50) return 'text-yellow-600';
    return 'text-red-600';
  }
  if (type === 'count') {
    if (value <= 2) return 'text-green-600';
    if (value <= 3) return 'text-yellow-600';
    return 'text-red-600';
  }
  if (type === 'time') {
    if (value <= 90) return 'text-green-600';
    if (value <= 120) return 'text-yellow-600';
    return 'text-red-600';
  }
  return 'text-gray-600';
};

const getPerformanceIcon = (value: number, type: 'rate' | 'count' | 'time') => {
  const color = getPerformanceColor(value, type);
  if (color.includes('green')) return CheckCircle2;
  if (color.includes('yellow')) return AlertTriangle;
  return TrendingDown;
};

export const ExaminerAnalyticsPanel: React.FC<ExaminerAnalyticsPanelProps> = ({
  projectId,
  className,
}) => {
  const { data: overview } = useProsecutionOverview(projectId);
  const examinerId = overview?.examinerAnalytics?.examiner?.id;
  const { data: examinerAnalytics, isLoading } = useExaminerAnalytics(examinerId);

  if (isLoading) {
    return (
      <Card className={cn('', className)}>
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!examinerAnalytics || !overview?.examinerAnalytics) {
    return (
      <Card className={cn('', className)}>
        <CardHeader>
          <CardTitle className="text-sm flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Examiner Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-6">
            <Info className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">No examiner data available</p>
            <p className="text-xs text-gray-400 mt-1">
              Analytics will appear after examiner information is parsed
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { examiner, statistics, patterns } = examinerAnalytics;

  return (
    <TooltipProvider>
      <Card className={cn('', className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Examiner Insights</span>
          </CardTitle>
          <div className="text-xs text-gray-600">
            <div className="flex items-center space-x-4">
              <span>{examiner.name || 'Unknown Examiner'}</span>
              {examiner.artUnit && (
                <div className="flex items-center space-x-1">
                  <Building className="h-3 w-3" />
                  <span>AU {examiner.artUnit}</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-4">
          {/* Key Statistics */}
          <div className="grid grid-cols-2 gap-4">
            {/* Allowance Rate */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center p-3 bg-gray-50 rounded-lg cursor-help">
                  <div className={cn(
                    'text-2xl font-bold',
                    getPerformanceColor(statistics.allowanceRate, 'rate')
                  )}>
                    {statistics.allowanceRate}%
                  </div>
                  <div className="text-xs text-gray-600">Allowance Rate</div>
                  <div className="flex justify-center mt-1">
                    {React.createElement(
                      getPerformanceIcon(statistics.allowanceRate, 'rate'),
                      { className: `h-3 w-3 ${getPerformanceColor(statistics.allowanceRate, 'rate')}` }
                    )}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Percentage of applications that receive Notice of Allowance</p>
                <p className="text-xs text-gray-400">Higher is better for applicants</p>
              </TooltipContent>
            </Tooltip>

            {/* Average OAs */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center p-3 bg-gray-50 rounded-lg cursor-help">
                  <div className={cn(
                    'text-2xl font-bold',
                    getPerformanceColor(statistics.averageOAsToAllowance, 'count')
                  )}>
                    {statistics.averageOAsToAllowance.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-600">Avg OAs to Allow</div>
                  <div className="flex justify-center mt-1">
                    {React.createElement(
                      getPerformanceIcon(statistics.averageOAsToAllowance, 'count'),
                      { className: `h-3 w-3 ${getPerformanceColor(statistics.averageOAsToAllowance, 'count')}` }
                    )}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Average number of Office Actions before allowance</p>
                <p className="text-xs text-gray-400">Lower is better for applicants</p>
              </TooltipContent>
            </Tooltip>

            {/* Appeal Success */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center p-3 bg-gray-50 rounded-lg cursor-help">
                  <div className={cn(
                    'text-2xl font-bold',
                    getPerformanceColor(statistics.appealSuccessRate, 'rate')
                  )}>
                    {statistics.appealSuccessRate}%
                  </div>
                  <div className="text-xs text-gray-600">Appeal Success</div>
                  <div className="flex justify-center mt-1">
                    {React.createElement(
                      getPerformanceIcon(statistics.appealSuccessRate, 'rate'),
                      { className: `h-3 w-3 ${getPerformanceColor(statistics.appealSuccessRate, 'rate')}` }
                    )}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Success rate when appealing this examiner's rejections</p>
                <p className="text-xs text-gray-400">Indicates strength of rejections</p>
              </TooltipContent>
            </Tooltip>

            {/* Final Rejection Rate */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center p-3 bg-gray-50 rounded-lg cursor-help">
                  <div className={cn(
                    'text-2xl font-bold',
                    getPerformanceColor(100 - statistics.finalRejectionRate, 'rate')
                  )}>
                    {statistics.finalRejectionRate}%
                  </div>
                  <div className="text-xs text-gray-600">Final Rejection</div>
                  <div className="flex justify-center mt-1">
                    {React.createElement(
                      getPerformanceIcon(100 - statistics.finalRejectionRate, 'rate'),
                      { className: `h-3 w-3 ${getPerformanceColor(100 - statistics.finalRejectionRate, 'rate')}` }
                    )}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Percentage of cases that receive final rejections</p>
                <p className="text-xs text-gray-400">Lower is better for applicants</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Common Rejection Types */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center space-x-1">
              <BarChart3 className="h-4 w-4" />
              <span>Common Rejections</span>
            </h4>
            <div className="space-y-2">
              {patterns.commonRejectionTypes
                .sort((a, b) => b.frequency - a.frequency)
                .slice(0, 4)
                .map((rejection) => {
                  const config = REJECTION_TYPE_CONFIG[rejection.type as keyof typeof REJECTION_TYPE_CONFIG] || 
                                 REJECTION_TYPE_CONFIG.OTHER;
                  
                  return (
                    <div key={rejection.type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge className={cn(config.color, 'text-xs')}>
                          {rejection.type}
                        </Badge>
                        <span className="text-sm text-gray-600">{config.label}</span>
                      </div>
                      <div className="flex items-center space-x-2 min-w-0 flex-1 ml-2">
                        <Progress 
                          value={rejection.percentage} 
                          className="flex-1 h-2"
                        />
                        <span className="text-xs font-medium text-gray-700 min-w-0">
                          {rejection.percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Strategic Insights */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center space-x-1">
              <Target className="h-4 w-4" />
              <span>Strategic Insights</span>
            </h4>
            <div className="space-y-2">
              {/* Response Time Insight */}
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-blue-900">Response Strategy</div>
                    <div className="text-xs text-blue-700 mt-1">
                      {statistics.allowanceRate > 60 ? 
                        'This examiner has a high allowance rate. Focus on clear claim differentiation.' :
                        statistics.allowanceRate > 40 ?
                        'Moderate allowance rate. Prepare comprehensive amendments and arguments.' :
                        'Low allowance rate. Consider appeal strategy and detailed prior art analysis.'
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Rejection Strategy */}
              {patterns.commonRejectionTypes.length > 0 && (
                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-orange-900">Primary Focus</div>
                      <div className="text-xs text-orange-700 mt-1">
                        Most common rejection: {patterns.commonRejectionTypes[0]?.type}. 
                        Prepare detailed responses for this type of rejection.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}; 