/**
 * Claim Changes Summary - Claim amendment overview widget
 * 
 * Displays:
 * - Counts of amended, new, and cancelled claims
 * - Quick link to claim diff view
 * - Amendment validation status
 */

import React from 'react';
import { format } from 'date-fns';
import { 
  FileText, 
  Plus, 
  Minus, 
  Edit,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useClaimChangesSummary } from '@/hooks/api/useProsecutionOverview';

interface ClaimChangesSummaryProps {
  projectId: string;
  onViewDiff?: () => void;
  onValidateClaims?: () => void;
  emphasized?: boolean;
  className?: string;
}

const CHANGE_TYPE_CONFIG = {
  amended: {
    icon: Edit,
    color: 'bg-blue-100 text-blue-700',
    label: 'Amended',
    description: 'Modified claims',
  },
  new: {
    icon: Plus,
    color: 'bg-green-100 text-green-700',
    label: 'New',
    description: 'Added claims',
  },
  cancelled: {
    icon: Minus,
    color: 'bg-red-100 text-red-700',
    label: 'Cancelled',
    description: 'Withdrawn claims',
  },
} as const;

export const ClaimChangesSummary: React.FC<ClaimChangesSummaryProps> = ({
  projectId,
  onViewDiff,
  onValidateClaims,
  emphasized = false,
  className,
}) => {
  const {
    totalAmended,
    newClaims,
    cancelledClaims,
    highRiskCount,
    pendingValidation,
    lastAmendmentDate,
    hasChanges,
  } = useClaimChangesSummary(projectId);

  const totalChanges = totalAmended + newClaims + cancelledClaims;

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Claim Changes</span>
          </CardTitle>
          {hasChanges && (
            <Badge 
              className={cn(
                totalChanges > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
              )}
            >
              Δ{totalChanges}
            </Badge>
          )}
        </div>
        {lastAmendmentDate && (
          <p className="text-xs text-gray-500">
            Last updated {format(lastAmendmentDate, 'MMM d, yyyy')}
          </p>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {emphasized && (pendingValidation || highRiskCount > 0) && (
          <div className="space-y-2 mb-3">
            {pendingValidation && (
              <div className="flex items-center space-x-2 p-2 bg-yellow-100 border border-yellow-300 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-yellow-700" />
                <span className="text-sm font-medium text-yellow-900">
                  Validation Pending
                </span>
              </div>
            )}
            {highRiskCount > 0 && (
              <div className="flex items-center space-x-2 p-2 bg-red-100 border border-red-300 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-700" />
                <span className="text-sm font-medium text-red-900">
                  {highRiskCount} High-Risk Amendment{highRiskCount !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        )}

        {!hasChanges ? (
          <div className="text-center py-4">
            <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No claim changes yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Changes will appear when claims are amended
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Change Counts */}
            <div className="grid grid-cols-3 gap-3">
              {/* Amended Claims */}
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <Edit className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-lg font-bold text-gray-900">{totalAmended}</div>
                <div className="text-xs text-gray-600">Amended</div>
              </div>

              {/* New Claims */}
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <Plus className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-lg font-bold text-gray-900">{newClaims}</div>
                <div className="text-xs text-gray-600">New</div>
              </div>

              {/* Cancelled Claims */}
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <Minus className="h-4 w-4 text-red-600" />
                </div>
                <div className="text-lg font-bold text-gray-900">{cancelledClaims}</div>
                <div className="text-xs text-gray-600">Cancelled</div>
              </div>
            </div>

            {/* Validation Status & Actions - only if not emphasized */}
            {!emphasized && (
              <div className="space-y-3">
                {/* Validation Status */}
                {pendingValidation && (
                  <div className="flex items-center space-x-2 p-2 bg-yellow-50 rounded-lg">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-yellow-900">
                        Validation Pending
                      </div>
                      <div className="text-xs text-yellow-700">
                        Claims need validation before filing
                      </div>
                    </div>
                  </div>
                )}

                {/* High Risk Warning */}
                {highRiskCount > 0 && (
                  <div className="flex items-center space-x-2 p-2 bg-red-50 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-red-900">
                        High Risk Amendments ({highRiskCount})
                      </div>
                      <div className="text-xs text-red-700">
                        These changes may introduce new issues
                      </div>
                    </div>
                  </div>
                )}

                {/* Validated Status */}
                {!pendingValidation && highRiskCount === 0 && totalChanges > 0 && (
                  <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-green-900">
                        Changes Validated
                      </div>
                      <div className="text-xs text-green-700">
                        All amendments have been reviewed
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Button
                    onClick={onViewDiff}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View Diff
                  </Button>
                  {pendingValidation && (
                    <Button
                      onClick={onValidateClaims}
                      size="sm"
                      className="flex-1 text-xs"
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Validate
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};