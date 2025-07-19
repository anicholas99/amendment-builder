/**
 * Claim Validation Display
 * 
 * Shows validation status badges for claims with non-blocking UI.
 * Integrates with ClaimChangesSummary to provide validation feedback.
 */

import React from 'react';
import { 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon,
  XCircle,
  Clock
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useValidationSummary } from '@/hooks/api/useClaimValidation';
import { 
  VALIDATION_BADGE_CONFIG, 
  ValidationState 
} from '@/features/amendment/types/validation';

interface ClaimValidationDisplayProps {
  projectId: string;
  compact?: boolean;
  showDetails?: boolean;
  className?: string;
}

const ValidationIcon: React.FC<{ state: ValidationState; className?: string }> = ({ 
  state, 
  className 
}) => {
  const iconClass = cn('h-4 w-4', className);
  
  switch (state) {
    case ValidationState.PENDING:
      return <Loader2 className={cn(iconClass, 'animate-spin')} />;
    case ValidationState.PASSED_LOW:
      return <CheckCircle2 className={iconClass} />;
    case ValidationState.PASSED_MED:
      return <AlertTriangle className={iconClass} />;
    case ValidationState.PASSED_HIGH:
      return <AlertOctagon className={iconClass} />;
    case ValidationState.FAILED:
      return <XCircle className={iconClass} />;
    case ValidationState.NOT_STARTED:
    default:
      return <Clock className={iconClass} />;
  }
};

export const ClaimValidationDisplay: React.FC<ClaimValidationDisplayProps> = ({
  projectId,
  compact = false,
  showDetails = true,
  className,
}) => {
  const { data: validationSummary, isLoading } = useValidationSummary(projectId);

  if (isLoading || !validationSummary) {
    return null;
  }

  const hasValidation = validationSummary.validatedClaims > 0 || 
                       validationSummary.pendingValidations > 0;

  if (!hasValidation && compact) {
    return null;
  }

  // Determine overall validation state
  let overallState: ValidationState = ValidationState.NOT_STARTED;
  let statusText = 'Not validated';
  
  if (validationSummary.pendingValidations > 0) {
    overallState = ValidationState.PENDING;
    statusText = 'Validation pending (autorunning)';
  } else if (validationSummary.failedValidations > 0) {
    overallState = ValidationState.FAILED;
    statusText = 'Validation failed';
  } else if (validationSummary.highRiskClaims > 0) {
    overallState = ValidationState.PASSED_HIGH;
    statusText = `${validationSummary.highRiskClaims} high risk`;
  } else if (validationSummary.mediumRiskClaims > 0) {
    overallState = ValidationState.PASSED_MED;
    statusText = `${validationSummary.mediumRiskClaims} medium risk`;
  } else if (validationSummary.lowRiskClaims > 0) {
    overallState = ValidationState.PASSED_LOW;
    statusText = 'Low risk';
  }

  const config = VALIDATION_BADGE_CONFIG[overallState];

  if (compact) {
    return (
      <Badge 
        className={cn(config.color, 'flex items-center space-x-1', className)}
        variant="secondary"
      >
        <ValidationIcon state={overallState} className="h-3 w-3" />
        <span className="text-xs">{statusText}</span>
      </Badge>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Overall Status Badge */}
      <div className="flex items-center justify-between">
        <Badge 
          className={cn(config.color, 'flex items-center space-x-1')}
          variant="secondary"
        >
          <ValidationIcon state={overallState} />
          <span>{config.label}</span>
        </Badge>
        
        {overallState === ValidationState.PENDING && (
          <span className="text-xs text-gray-500">
            {validationSummary.pendingValidations} of {validationSummary.totalClaims} validating...
          </span>
        )}
      </div>

      {/* Detailed Breakdown */}
      {showDetails && validationSummary.validatedClaims > 0 && (
        <div className="text-xs space-y-1 text-gray-600">
          {validationSummary.lowRiskClaims > 0 && (
            <div className="flex items-center justify-between">
              <span>Low risk:</span>
              <span className="font-medium text-green-700">
                {validationSummary.lowRiskClaims} claims
              </span>
            </div>
          )}
          {validationSummary.mediumRiskClaims > 0 && (
            <div className="flex items-center justify-between">
              <span>Medium risk:</span>
              <span className="font-medium text-amber-700">
                {validationSummary.mediumRiskClaims} claims
              </span>
            </div>
          )}
          {validationSummary.highRiskClaims > 0 && (
            <div className="flex items-center justify-between">
              <span>High risk:</span>
              <span className="font-medium text-red-700">
                {validationSummary.highRiskClaims} claims
              </span>
            </div>
          )}
        </div>
      )}

      {/* Help Text */}
      <p className="text-xs text-gray-500 italic">
        Validation is optional but recommended.{' '}
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0 text-xs text-blue-600 hover:text-blue-700"
        >
          Learn why →
        </Button>
      </p>
    </div>
  );
};