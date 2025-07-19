/**
 * Export With Validation Button
 * 
 * Example integration showing how to add validation checks to export actions.
 * Drop-in replacement for existing export buttons.
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileCheck, Send } from 'lucide-react';
import { ExportValidationModal } from './ExportValidationModal';
import { useExportWithValidation } from '../hooks/useExportWithValidation';
import { cn } from '@/lib/utils';

interface ExportWithValidationButtonProps {
  projectId: string;
  onExport: () => void | Promise<void>;
  exportType?: 'EXPORT' | 'MARK_READY' | 'FILE';
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  disabled?: boolean;
}

export const ExportWithValidationButton: React.FC<ExportWithValidationButtonProps> = ({
  projectId,
  onExport,
  exportType = 'EXPORT',
  className,
  variant = 'default',
  size = 'default',
  disabled = false,
}) => {
  const {
    showValidationModal,
    isExporting,
    validationSummary,
    isValidating,
    handleExport,
    handleProceedWithOverride,
    handleRunValidation,
    handleCloseModal,
  } = useExportWithValidation({
    projectId,
    onExportSuccess: onExport,
    exportType,
  });

  const buttonConfig = {
    EXPORT: {
      icon: Download,
      label: 'Export',
      loadingLabel: 'Exporting...',
    },
    MARK_READY: {
      icon: FileCheck,
      label: 'Mark Ready',
      loadingLabel: 'Marking Ready...',
    },
    FILE: {
      icon: Send,
      label: 'File',
      loadingLabel: 'Filing...',
    },
  }[exportType];

  const Icon = buttonConfig.icon;

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleExport}
        disabled={disabled || isExporting}
        className={cn(className)}
      >
        <Icon className="h-4 w-4 mr-2" />
        {isExporting ? buttonConfig.loadingLabel : buttonConfig.label}
      </Button>

      {validationSummary && (
        <ExportValidationModal
          isOpen={showValidationModal}
          onClose={handleCloseModal}
          onProceed={handleProceedWithOverride}
          onRunValidation={handleRunValidation}
          validationSummary={validationSummary}
          isValidating={isValidating}
          exportType={exportType}
        />
      )}
    </>
  );
};

/**
 * Example usage in existing components:
 * 
 * Replace:
 * <Button onClick={handleExport}>Export</Button>
 * 
 * With:
 * <ExportWithValidationButton 
 *   projectId={projectId}
 *   onExport={handleExport}
 *   exportType="EXPORT"
 * />
 */