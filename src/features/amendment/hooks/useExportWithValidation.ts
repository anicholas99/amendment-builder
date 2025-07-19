/**
 * Export with Validation Hook
 * 
 * Integrates validation checks with export functionality.
 * Shows modal when validation issues exist but allows override.
 */

import { useState, useCallback } from 'react';
import { 
  useExportReadiness, 
  useRecordValidationOverride,
  useValidateAllClaims 
} from '@/hooks/api/useClaimValidation';
import { logger } from '@/utils/clientLogger';

interface UseExportWithValidationOptions {
  projectId: string;
  onExportSuccess?: () => void;
  exportType?: 'EXPORT' | 'MARK_READY' | 'FILE';
}

export function useExportWithValidation({
  projectId,
  onExportSuccess,
  exportType = 'EXPORT',
}: UseExportWithValidationOptions) {
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const { data: exportReadiness, refetch: checkReadiness } = useExportReadiness(projectId);
  const recordOverride = useRecordValidationOverride();
  const validateAll = useValidateAllClaims();

  const handleExport = useCallback(async () => {
    try {
      // Check export readiness
      const readiness = await checkReadiness();
      
      if (!readiness.data) {
        logger.error('[useExportWithValidation] Failed to check readiness');
        return;
      }

      // If validation required and not overridden, show modal
      if (readiness.data.requiresOverride) {
        setShowValidationModal(true);
        return;
      }

      // Proceed with export
      setIsExporting(true);
      
      // Call the actual export function
      if (onExportSuccess) {
        await onExportSuccess();
      }
      
      logger.info('[useExportWithValidation] Export successful', { exportType });
    } catch (error) {
      logger.error('[useExportWithValidation] Export failed', {
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsExporting(false);
    }
  }, [checkReadiness, onExportSuccess, exportType]);

  const handleProceedWithOverride = useCallback(async () => {
    try {
      // Record the override for audit trail
      await recordOverride.mutateAsync({
        projectId,
        reason: `User proceeded with ${exportType} despite validation warnings`,
      });

      // Close modal and proceed
      setShowValidationModal(false);
      setIsExporting(true);

      if (onExportSuccess) {
        await onExportSuccess();
      }
      
      logger.info('[useExportWithValidation] Export with override successful', { 
        exportType,
        hadValidationWarnings: true,
      });
    } catch (error) {
      logger.error('[useExportWithValidation] Export with override failed', {
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsExporting(false);
    }
  }, [recordOverride, projectId, exportType, onExportSuccess]);

  const handleRunValidation = useCallback(async () => {
    try {
      // Get current claims from the export readiness data
      if (!exportReadiness?.summary) return;

      // This will trigger validation for all claims
      await validateAll.mutateAsync({
        projectId,
        claims: [], // Would need to pass actual claims here
      });

      // Recheck readiness after validation starts
      setTimeout(() => {
        checkReadiness();
      }, 2000);
    } catch (error) {
      logger.error('[useExportWithValidation] Failed to start validation', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }, [exportReadiness, validateAll, projectId, checkReadiness]);

  const handleCloseModal = useCallback(() => {
    setShowValidationModal(false);
  }, []);

  return {
    // State
    showValidationModal,
    isExporting,
    validationSummary: exportReadiness?.summary,
    isValidating: validateAll.isPending,
    
    // Actions
    handleExport,
    handleProceedWithOverride,
    handleRunValidation,
    handleCloseModal,
  };
}