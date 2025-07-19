# Advisory Validation System Integration Guide

## Overview
This validation system provides non-blocking, advisory risk assessment for patent amendments. Attorneys maintain full control while receiving helpful validation feedback.

## Key Features
- **Non-blocking**: Validation runs in background, never interrupts workflow
- **Advisory only**: Shows risk levels but allows override
- **Audit trail**: Tracks when validation is overridden
- **Auto-running**: Triggers automatically on claim changes

## Integration Steps

### 1. Display Validation Status in UI

Add validation badges to claim displays:

```tsx
import { ClaimValidationDisplay } from '@/features/amendment/components/ClaimValidationDisplay';

// Compact badge in headers
<ClaimValidationDisplay 
  projectId={projectId} 
  compact={true} 
/>

// Full display with details
<ClaimValidationDisplay 
  projectId={projectId} 
  compact={false}
  showDetails={true} 
/>
```

### 2. Replace Export Buttons

Replace existing export/file buttons with validation-aware versions:

```tsx
// Before:
<Button onClick={handleExport}>Export</Button>

// After:
import { ExportWithValidationButton } from '@/features/amendment/components/ExportWithValidationButton';

<ExportWithValidationButton 
  projectId={projectId}
  onExport={handleExport}
  exportType="EXPORT" // or "MARK_READY" or "FILE"
/>
```

### 3. Auto-trigger Validation

Use the auto-validation hook to trigger validation on claim changes:

```tsx
import { useAutoValidation } from '@/hooks/api/useClaimValidation';

// In your claim editor component
const claims = useClaimsQuery(projectId);
const { isValidating } = useAutoValidation(
  projectId,
  claims.data,
  true // enabled
);
```

### 4. Check Validation in Custom Export Logic

If you have custom export logic, integrate validation checks:

```tsx
import { useExportWithValidation } from '@/features/amendment/hooks/useExportWithValidation';
import { ExportValidationModal } from '@/features/amendment/components/ExportValidationModal';

const {
  showValidationModal,
  validationSummary,
  handleExport,
  handleProceedWithOverride,
  handleRunValidation,
  handleCloseModal,
} = useExportWithValidation({
  projectId,
  onExportSuccess: customExportLogic,
  exportType: 'EXPORT',
});

// In your component JSX
<>
  <Button onClick={handleExport}>Export</Button>
  
  {validationSummary && (
    <ExportValidationModal
      isOpen={showValidationModal}
      onClose={handleCloseModal}
      onProceed={handleProceedWithOverride}
      onRunValidation={handleRunValidation}
      validationSummary={validationSummary}
      exportType="EXPORT"
    />
  )}
</>
```

## Validation States

- **Blue badge**: Validation pending (autorunning)
- **Green badge**: Low risk - good to proceed
- **Amber badge**: Medium risk - review recommended
- **Red badge**: High risk - manual review strongly recommended
- **Gray badge**: Validation failed - service unavailable

## Database Schema

New tables added:
- `claim_validations`: Stores validation results per claim
- Amendment project fields: `validationOverridden`, `validationOverrideReason`, etc.

## API Endpoints

- `POST /api/claims/validate` - Trigger validation for a claim
- `GET /api/claims/[claimId]/validation` - Get validation status
- `GET /api/projects/[projectId]/validation-summary` - Get project summary
- `GET /api/projects/[projectId]/export-readiness` - Check if ready to export
- `POST /api/projects/validation-override` - Record override for audit

## Security Considerations

- All endpoints use tenant isolation
- Validation results are tenant-scoped
- Override actions are logged to AI audit trail
- Rate limited to prevent abuse

## Future Enhancements

1. Replace mock validation with actual AI risk assessment
2. Add more granular risk categories
3. Integrate with examiner analytics
4. Add validation history view
5. Export validation reports