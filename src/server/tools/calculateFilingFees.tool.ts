import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { findProjectByIdAndTenant } from '@/repositories/project/core.repository';
import { ClaimRepository } from '@/repositories/claimRepository';
import { findDraftDocumentsByProject } from '@/repositories/project/draft.repository';

export interface FilingFeeResult {
  entityType: 'large' | 'small' | 'micro';
  baseFees: {
    basicFilingFee: number;
    searchFee: number;
    examinationFee: number;
  };
  excessFees: {
    excessClaimsFee: number;
    excessIndependentClaimsFee: number;
    multipleIndependentClaimsFee: number;
    excessPagesFee: number;
  };
  totalFee: number;
  breakdown: {
    totalClaims: number;
    independentClaims: number;
    dependentClaims: number;
    estimatedPages: number;
    excessClaims: number;
    excessIndependentClaims: number;
  };
  recommendations: string[];
}

// USPTO Fee Schedule (as of 2024)
const FEE_SCHEDULE = {
  large: {
    basicFilingFee: 1820,
    searchFee: 700,
    examinationFee: 860,
    excessClaimFee: 120,
    excessIndependentClaimFee: 600,
    multipleIndependentClaimPenalty: 600,
    excessPageFee: 200,
  },
  small: {
    basicFilingFee: 728,
    searchFee: 280,
    examinationFee: 344,
    excessClaimFee: 48,
    excessIndependentClaimFee: 240,
    multipleIndependentClaimPenalty: 240,
    excessPageFee: 80,
  },
  micro: {
    basicFilingFee: 364,
    searchFee: 140,
    examinationFee: 172,
    excessClaimFee: 24,
    excessIndependentClaimFee: 120,
    multipleIndependentClaimPenalty: 120,
    excessPageFee: 40,
  },
};

/**
 * Calculates USPTO filing fees based on claims and specification
 * 
 * This tool:
 * 1. Counts total claims and independent claims
 * 2. Estimates page count from specification
 * 3. Calculates excess fees based on USPTO rules
 * 4. Provides recommendations for cost reduction
 * 
 * SECURITY: Always validates tenant ownership before accessing data
 */
export async function calculateFilingFees(
  projectId: string,
  tenantId: string,
  entityType: 'large' | 'small' | 'micro' = 'large'
): Promise<FilingFeeResult> {
  logger.info('[CalculateFilingFees] Starting fee calculation', {
    projectId,
    tenantId,
    entityType,
  });

  try {
    // Verify tenant ownership
    const project = await findProjectByIdAndTenant(projectId, tenantId);
    
    if (!project) {
      throw new ApplicationError(
        ErrorCode.PROJECT_ACCESS_DENIED,
        'Project not found or access denied'
      );
    }

    // Get all claims
    const claims = project.invention 
      ? await ClaimRepository.findByInventionId(project.invention.id)
      : [];

    // Count claim types
    const totalClaims = claims.length;
    const independentClaims = claims.filter(claim => {
      // Check if claim text doesn't reference another claim
      const text = claim.text.toLowerCase();
      return !text.includes('claim ') || text.indexOf('claim ') > 50;
    }).length;
    const dependentClaims = totalClaims - independentClaims;

    // Get specification to estimate pages
    const draftDocuments = await findDraftDocumentsByProject(projectId);
    let totalCharacters = 0;
    
    draftDocuments.forEach(doc => {
      if (doc.content && doc.type !== 'FULL_CONTENT') {
        totalCharacters += doc.content.length;
      }
    });

    // Estimate pages (roughly 3000 characters per page)
    const estimatedPages = Math.ceil(totalCharacters / 3000);

    // Calculate excess fees
    const fees = FEE_SCHEDULE[entityType];
    const excessClaims = Math.max(0, totalClaims - 20);
    const excessIndependentClaims = Math.max(0, independentClaims - 3);
    const excessPages = Math.max(0, estimatedPages - 100);

    // Calculate fees
    const baseFees = {
      basicFilingFee: fees.basicFilingFee,
      searchFee: fees.searchFee,
      examinationFee: fees.examinationFee,
    };

    const excessFees = {
      excessClaimsFee: excessClaims * fees.excessClaimFee,
      excessIndependentClaimsFee: excessIndependentClaims * fees.excessIndependentClaimFee,
      multipleIndependentClaimsFee: independentClaims > 3 ? fees.multipleIndependentClaimPenalty : 0,
      excessPagesFee: excessPages * fees.excessPageFee,
    };

    const totalFee = 
      Object.values(baseFees).reduce((sum, fee) => sum + fee, 0) +
      Object.values(excessFees).reduce((sum, fee) => sum + fee, 0);

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (excessClaims > 0) {
      recommendations.push(
        `Consider reducing total claims to 20 or fewer to save $${excessFees.excessClaimsFee}`
      );
    }
    
    if (independentClaims > 3) {
      recommendations.push(
        `Consider reducing independent claims to 3 to save $${excessFees.excessIndependentClaimsFee + excessFees.multipleIndependentClaimsFee}`
      );
    }
    
    if (excessPages > 0) {
      recommendations.push(
        `Consider condensing specification to under 100 pages to save $${excessFees.excessPagesFee}`
      );
    }

    if (entityType === 'large') {
      recommendations.push(
        'If eligible, small entity status would reduce fees by 60%, micro entity by 80%'
      );
    }

    logger.info('[CalculateFilingFees] Calculation completed', {
      projectId,
      totalFee,
      totalClaims,
      independentClaims,
    });

    return {
      entityType,
      baseFees,
      excessFees,
      totalFee,
      breakdown: {
        totalClaims,
        independentClaims,
        dependentClaims,
        estimatedPages,
        excessClaims,
        excessIndependentClaims,
      },
      recommendations,
    };
  } catch (error) {
    logger.error('[CalculateFilingFees] Calculation failed', {
      projectId,
      error,
    });
    throw error;
  }
} 