/**
 * Current OA Card - Primary focus card for current Office Action
 * 
 * Combines OA details, risk assessment, and next actions in one place
 */

import React from 'react';
import { 
  FileText, 
  AlertTriangle, 
  Target,
  Clock,
  ChevronRight,
  Edit3,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { abbreviateClaimRanges } from '@/utils/claims';
import { format } from 'date-fns';

interface CurrentOACardProps {
  officeAction?: {
    id: string;
    type: 'NON_FINAL' | 'FINAL' | 'NOTICE_OF_ALLOWANCE' | 'OTHER';
    dateIssued: Date;
    daysToRespond: number;
    responseDeadline: Date;
    rejectionSummary: {
      total: number;
      byType: Record<string, number>;
      claimsAffected: string[];
      riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    };
    aiStrategy?: {
      primaryApproach: 'ARGUE' | 'AMEND' | 'COMBINATION';
      confidence: number;
      reasoning: string;
    };
  };
  claimValidationNeeded?: number;
  onViewDraft?: () => void;
  onValidateClaims?: () => void;
  onRunAnalysis?: () => void;
  className?: string;
}

const RISK_CONFIG = {
  LOW: { color: 'bg-green-100 text-green-700', label: 'Low Risk' },
  MEDIUM: { color: 'bg-yellow-100 text-yellow-700', label: 'Medium Risk' },
  HIGH: { color: 'bg-red-100 text-red-700', label: 'High Risk' },
};

const OA_TYPE_LABELS = {
  NON_FINAL: 'Non-Final',
  FINAL: 'Final',
  NOTICE_OF_ALLOWANCE: 'Notice of Allowance',
  OTHER: 'Other',
};

export const CurrentOACard: React.FC<CurrentOACardProps> = ({
  officeAction,
  claimValidationNeeded = 0,
  onViewDraft,
  onValidateClaims,
  onRunAnalysis,
  className,
}) => {
  if (!officeAction) {
    return (
      <Card className={cn('bg-gray-50', className)}>
        <CardContent className="py-8 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No active Office Action</p>
        </CardContent>
      </Card>
    );
  }

  const riskConfig = RISK_CONFIG[officeAction.rejectionSummary.riskLevel];
  const rejectionTypes = Object.entries(officeAction.rejectionSummary.byType)
    .map(([type, count]) => `${type}:${count}`)
    .join(' | ');

  // Determine next action
  let nextAction = { label: '', icon: FileText, onClick: onViewDraft };
  if (claimValidationNeeded > 0) {
    nextAction = {
      label: `Validate ${claimValidationNeeded} claims`,
      icon: AlertTriangle,
      onClick: onValidateClaims,
    };
  } else if (!officeAction.aiStrategy) {
    nextAction = {
      label: 'Run Analysis',
      icon: Target,
      onClick: onRunAnalysis,
    };
  }

  return (
    <Card className={cn('border-2', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold">Current Office Action</h3>
              <Badge variant="outline" className="text-xs">
                {OA_TYPE_LABELS[officeAction.type]}
              </Badge>
              <span className="text-sm text-gray-600">
                ({format(officeAction.dateIssued, 'MMM d, yyyy')})
              </span>
            </div>
            
            {/* Rejection Summary */}
            <div className="flex items-center space-x-4 text-sm">
              <span className="font-medium">{rejectionTypes}</span>
              <span className="text-gray-600">
                Claims {abbreviateClaimRanges(officeAction.rejectionSummary.claimsAffected)}
              </span>
            </div>
          </div>

          {/* Days Remaining */}
          <div className="text-right">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className={cn(
                'text-2xl font-bold',
                officeAction.daysToRespond < 10 ? 'text-red-600' : 
                officeAction.daysToRespond < 30 ? 'text-yellow-600' : 
                'text-gray-700'
              )}>
                {officeAction.daysToRespond}d
              </span>
            </div>
            <p className="text-xs text-gray-500">to respond</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Strategy & Risk Row */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-6">
            {officeAction.aiStrategy && (
              <div>
                <p className="text-xs text-gray-600 mb-1">Strategy</p>
                <Badge variant="secondary" className="font-medium">
                  {officeAction.aiStrategy.primaryApproach}
                </Badge>
              </div>
            )}
            
            <div>
              <p className="text-xs text-gray-600 mb-1">Risk Level</p>
              <Badge className={cn(riskConfig.color, 'font-medium')}>
                {riskConfig.label}
              </Badge>
            </div>
          </div>

          {/* Next Action */}
          <div className="flex items-center space-x-3">
            <div className="text-right mr-3">
              <p className="text-xs text-gray-600">Next step</p>
              <p className="text-sm font-medium">{nextAction.label}</p>
            </div>
            <Button
              onClick={nextAction.onClick}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {React.createElement(nextAction.icon, { className: 'h-4 w-4 mr-2' })}
              {nextAction.label.includes('Validate') ? 'Validate' : 
               nextAction.label.includes('Analysis') ? 'Analyze' : 'View Draft'}
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-between text-sm">
          <Button variant="link" size="sm" className="text-gray-600 p-0">
            <FileText className="h-4 w-4 mr-1" />
            View Full OA
          </Button>
          <Button variant="link" size="sm" className="text-gray-600 p-0">
            <Edit3 className="h-4 w-4 mr-1" />
            Edit Response
          </Button>
          <Button variant="link" size="sm" className="text-gray-600 p-0">
            <CheckCircle2 className="h-4 w-4 mr-1" />
            Mark Complete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};