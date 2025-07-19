/**
 * Export Validation Modal
 * 
 * Checks validation status before export and allows attorney override.
 * Non-blocking - attorneys maintain full control over their workflow.
 */

import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  FileText,
  Loader2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import type { AmendmentValidationSummary } from '@/features/amendment/types/validation';
import { VALIDATION_BADGE_CONFIG, RiskLevel } from '@/features/amendment/types/validation';

interface ExportValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
  onRunValidation: () => void;
  validationSummary: AmendmentValidationSummary;
  isValidating?: boolean;
  exportType?: 'EXPORT' | 'MARK_READY' | 'FILE';
}

export const ExportValidationModal: React.FC<ExportValidationModalProps> = ({
  isOpen,
  onClose,
  onProceed,
  onRunValidation,
  validationSummary,
  isValidating = false,
  exportType = 'EXPORT',
}) => {
  const hasIssues = validationSummary.hasUnvalidatedClaims || validationSummary.hasHighRiskClaims;
  
  const actionText = {
    EXPORT: 'Export',
    MARK_READY: 'Mark Ready',
    FILE: 'File',
  }[exportType];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {hasIssues ? (
              <>
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <span>Validation Incomplete</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span>Ready to {actionText}</span>
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Validation Summary */}
          <div className="space-y-3">
            <div className="text-sm text-gray-600">
              Validation Summary:
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Total Claims */}
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">Total Claims</span>
                <span className="font-medium">{validationSummary.totalClaims}</span>
              </div>

              {/* Validated Claims */}
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">Validated</span>
                <span className="font-medium text-green-700">
                  {validationSummary.validatedClaims}
                </span>
              </div>

              {/* Unvalidated */}
              {validationSummary.hasUnvalidatedClaims && (
                <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                  <span className="text-sm">Unvalidated</span>
                  <span className="font-medium text-yellow-700">
                    {validationSummary.totalClaims - validationSummary.validatedClaims}
                  </span>
                </div>
              )}

              {/* High Risk */}
              {validationSummary.highRiskClaims > 0 && (
                <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                  <span className="text-sm">High Risk</span>
                  <span className="font-medium text-red-700">
                    {validationSummary.highRiskClaims}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Warning Messages */}
          {hasIssues && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-sm">
                {validationSummary.hasUnvalidatedClaims && (
                  <div>
                    Some claims haven't been validated. This may increase the risk of new 102/103 rejections.
                  </div>
                )}
                {validationSummary.hasHighRiskClaims && (
                  <div className="mt-1">
                    {validationSummary.highRiskClaims} claim{validationSummary.highRiskClaims !== 1 ? 's have' : ' has'} high risk issues that should be reviewed.
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Educational Note */}
          <div className="text-xs text-gray-500 italic">
            Validation is optional but recommended. You maintain full control over your filing decisions.
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row space-y-2 sm:space-y-0">
          {hasIssues && (
            <Button
              variant="default"
              onClick={onRunValidation}
              disabled={isValidating}
              className="w-full sm:w-auto"
            >
              {isValidating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Run Validation
                </>
              )}
            </Button>
          )}
          
          <Button
            variant={hasIssues ? "outline" : "default"}
            onClick={onProceed}
            className={cn(
              "w-full sm:w-auto",
              hasIssues && "border-amber-300 hover:bg-amber-50"
            )}
          >
            <FileText className="h-4 w-4 mr-2" />
            {hasIssues ? 'Proceed Anyway' : `${actionText} Document`}
          </Button>

          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};