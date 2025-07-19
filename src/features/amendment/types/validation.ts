/**
 * Validation Types - Advisory validation system for amendments
 * 
 * Non-blocking validation that runs in background and provides
 * risk assessment without preventing attorney workflow
 */

export enum ValidationState {
  PENDING = 'PENDING',
  PASSED_LOW = 'PASSED_LOW',
  PASSED_MED = 'PASSED_MED', 
  PASSED_HIGH = 'PASSED_HIGH',
  FAILED = 'FAILED',
  NOT_STARTED = 'NOT_STARTED',
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  NONE = 'NONE',
}

export interface ValidationResult {
  state: ValidationState;
  riskLevel: RiskLevel;
  message?: string;
  details?: {
    issuesFound: number;
    suggestions: string[];
    confidence: number;
  };
  timestamp: Date;
}

export interface ClaimValidation {
  claimId: string;
  claimNumber: string;
  validationResult?: ValidationResult;
  lastValidated?: Date;
  isValidating: boolean;
}

export interface AmendmentValidationSummary {
  totalClaims: number;
  validatedClaims: number;
  pendingValidations: number;
  failedValidations: number;
  highRiskClaims: number;
  mediumRiskClaims: number;
  lowRiskClaims: number;
  hasUnvalidatedClaims: boolean;
  hasHighRiskClaims: boolean;
  overallRisk: RiskLevel;
}

// Badge color mapping for UI consistency
export const VALIDATION_BADGE_CONFIG = {
  [ValidationState.NOT_STARTED]: {
    color: 'bg-gray-100 text-gray-700',
    label: 'Not validated',
    icon: 'clock',
  },
  [ValidationState.PENDING]: {
    color: 'bg-blue-100 text-blue-700',
    label: 'Validation pending',
    icon: 'loader',
  },
  [ValidationState.PASSED_LOW]: {
    color: 'bg-green-100 text-green-700',
    label: 'Low risk',
    icon: 'check-circle',
  },
  [ValidationState.PASSED_MED]: {
    color: 'bg-amber-100 text-amber-700',
    label: 'Medium risk',
    icon: 'alert-triangle',
  },
  [ValidationState.PASSED_HIGH]: {
    color: 'bg-red-100 text-red-700',
    label: 'High risk',
    icon: 'alert-octagon',
  },
  [ValidationState.FAILED]: {
    color: 'bg-gray-400 text-gray-900',
    label: 'Validation failed',
    icon: 'x-circle',
  },
};

export interface ValidationOverride {
  userId: string;
  reason?: string;
  timestamp: Date;
  validationSummary: AmendmentValidationSummary;
}