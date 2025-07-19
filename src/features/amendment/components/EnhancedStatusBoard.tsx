/**
 * Enhanced Status Board - Response status tracking and current OA overview
 * 
 * Displays:
 * - Response status cards with counts (Draft, In Review, Ready to File, Filed)
 * - Large current Office Action overview card with AI strategy and risk
 * - Quick actions and next steps
 */

import React from 'react';
import { format } from 'date-fns';
import { 
  FileText, 
  Eye, 
  FileCheck, 
  Send,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowRight,
  Zap,
  Brain,
  Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useProsecutionOverview, useOfficeActionUrgency } from '@/hooks/api/useProsecutionOverview';

interface EnhancedStatusBoardProps {
  projectId: string;
  onStatusClick?: (status: string) => void;
  onCurrentOAClick?: () => void;
  onNextActionClick?: (action: string) => void;
  className?: string;
}

const STATUS_CONFIG = {
  draft: {
    icon: FileText,
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    label: 'Draft',
    description: 'In progress',
  },
  inReview: {
    icon: Eye,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    label: 'In Review',
    description: 'Needs validation',
  },
  readyToFile: {
    icon: FileCheck,
    color: 'bg-green-100 text-green-700 border-green-200',
    label: 'Ready to File',
    description: 'Validated',
  },
  filed: {
    icon: Send,
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    label: 'Filed',
    description: 'Submitted',
  },
} as const;

const RISK_CONFIG = {
  LOW: {
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: CheckCircle2,
    label: 'Low Risk',
  },
  MEDIUM: {
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: AlertTriangle,
    label: 'Medium Risk',
  },
  HIGH: {
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: AlertTriangle,
    label: 'High Risk',
  },
} as const;

const STRATEGY_CONFIG = {
  ARGUE: {
    icon: Target,
    color: 'text-blue-600',
    label: 'Argue Rejections',
    description: 'Challenge examiner position',
  },
  AMEND: {
    icon: FileText,
    color: 'text-orange-600',
    label: 'Amend Claims',
    description: 'Modify claim language',
  },
  COMBINATION: {
    icon: Brain,
    color: 'text-purple-600',
    label: 'Argue + Amend',
    description: 'Combined approach',
  },
} as const;

export const EnhancedStatusBoard: React.FC<EnhancedStatusBoardProps> = ({
  projectId,
  onStatusClick,
  onCurrentOAClick,
  onNextActionClick,
  className,
}) => {
  const { data: overview, isLoading } = useProsecutionOverview(projectId);
  const { urgencyLevel, daysToRespond, isOverdue } = useOfficeActionUrgency(projectId);

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="text-center text-gray-500 py-8">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
          <p>Unable to load prosecution status</p>
        </div>
      </div>
    );
  }

  const { responseStatus, currentOfficeAction } = overview;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Response Status Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries({
          draft: responseStatus.draft,
          inReview: responseStatus.inReview,
          readyToFile: responseStatus.readyToFile,
          filed: responseStatus.filed,
        }).map(([key, count]) => {
          const config = STATUS_CONFIG[key as keyof typeof STATUS_CONFIG];
          const Icon = config.icon;

          return (
            <Card 
              key={key}
              className={cn(
                'cursor-pointer transition-all hover:shadow-md border-l-4',
                count > 0 ? 'hover:scale-105' : 'opacity-75'
              )}
              onClick={() => onStatusClick?.(key)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {count}
                    </div>
                    <div className="text-sm font-medium text-gray-700">
                      {config.label}
                    </div>
                    <div className="text-xs text-gray-500">
                      {config.description}
                    </div>
                  </div>
                  <Icon className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Current Office Action Overview */}
      {currentOfficeAction && (
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <span>Current Office Action</span>
                  <Badge className="bg-orange-100 text-orange-700">
                    {currentOfficeAction.type === 'NON_FINAL' ? 'Non-Final' :
                     currentOfficeAction.type === 'FINAL' ? 'Final Rejection' :
                     currentOfficeAction.type}
                  </Badge>
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Issued {format(currentOfficeAction.dateIssued, 'MMMM d, yyyy')} • 
                  Response due {format(currentOfficeAction.responseDeadline, 'MMMM d, yyyy')}
                </p>
              </div>
              
              {/* Urgency Indicator */}
              <div className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-1',
                urgencyLevel === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                urgencyLevel === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                urgencyLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              )}>
                <Clock className="h-4 w-4" />
                <span>
                  {isOverdue ? 'OVERDUE' : 
                   daysToRespond === 1 ? '1 day left' :
                   daysToRespond === 0 ? 'Due today' :
                   `${daysToRespond} days left`}
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Rejection Summary */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Rejections</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total</span>
                    <span className="font-medium">{currentOfficeAction.rejectionSummary.total}</span>
                  </div>
                  {Object.entries(currentOfficeAction.rejectionSummary.byType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {type}
                      </Badge>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  ))}
                  {currentOfficeAction.rejectionSummary.claimsAffected.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs text-gray-500">
                        Claims affected: {currentOfficeAction.rejectionSummary.claimsAffected.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Strategy */}
              {currentOfficeAction.aiStrategy && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center space-x-1">
                    <Brain className="h-4 w-4 text-blue-500" />
                    <span>AI Strategy</span>
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className={cn(
                        'p-2 rounded-lg',
                        STRATEGY_CONFIG[currentOfficeAction.aiStrategy.primaryApproach].color.replace('text-', 'bg-').replace('600', '100')
                      )}>
                        {React.createElement(
                          STRATEGY_CONFIG[currentOfficeAction.aiStrategy.primaryApproach].icon,
                          { className: `h-4 w-4 ${STRATEGY_CONFIG[currentOfficeAction.aiStrategy.primaryApproach].color}` }
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          {STRATEGY_CONFIG[currentOfficeAction.aiStrategy.primaryApproach].label}
                        </div>
                        <div className="text-xs text-gray-500">
                          {STRATEGY_CONFIG[currentOfficeAction.aiStrategy.primaryApproach].description}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-xs text-gray-500">Confidence</div>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${currentOfficeAction.aiStrategy.confidence}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium">{currentOfficeAction.aiStrategy.confidence}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Risk & Next Actions */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Risk & Actions</h4>
                <div className="space-y-3">
                  {/* Risk Level */}
                  <div className="flex items-center space-x-2">
                    <Badge className={RISK_CONFIG[currentOfficeAction.rejectionSummary.riskLevel].color}>
                      {RISK_CONFIG[currentOfficeAction.rejectionSummary.riskLevel].label}
                    </Badge>
                  </div>

                  {/* Next Actions */}
                  <div className="space-y-2">
                    <Button
                      onClick={() => onNextActionClick?.('analyze')}
                      className="w-full justify-start text-sm"
                      variant="outline"
                      size="sm"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Run Analysis
                    </Button>
                    <Button
                      onClick={onCurrentOAClick}
                      className="w-full justify-start text-sm"
                      variant="outline"
                      size="sm"
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Start Response
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Current OA State */}
      {!currentOfficeAction && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Office Action</h3>
            <p className="text-gray-600 mb-4">
              Upload an Office Action to begin your amendment response
            </p>
            <Button onClick={() => onNextActionClick?.('upload')}>
              Upload Office Action
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 