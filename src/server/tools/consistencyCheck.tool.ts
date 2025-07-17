import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import type { ConsistencyIssue } from '@/types/tools';
import { findProjectByIdAndTenant } from '@/repositories/project/core.repository';
import { ClaimRepository } from '@/repositories/claimRepository';
import { figureRepository } from '@/repositories/figure';

/**
 * Validates invention consistency by checking:
 * 1. Claim references point to existing claims
 * 2. No duplicate claim numbers
 * 3. Mirror claim patterns and consistency
 * 4. All claims are properly linked to invention
 * 5. Figure and reference numeral consistency
 *
 * SECURITY: Always validates tenant ownership before accessing data
 */
export async function validateInventionConsistency(
  projectId: string,
  tenantId: string
): Promise<ConsistencyIssue[]> {
  logger.debug('[ConsistencyCheck] Starting validation', {
    projectId,
    tenantId,
  });

  try {
    // First, verify tenant ownership
    const project = await findProjectByIdAndTenant(projectId, tenantId);

    if (!project) {
      throw new ApplicationError(
        ErrorCode.PROJECT_ACCESS_DENIED,
        'Project not found or access denied'
      );
    }

    if (!project.invention) {
      return [
        {
          type: 'missing_reference',
          severity: 'error',
          message: 'No invention data found for this project',
        },
      ];
    }

    const issues: ConsistencyIssue[] = [];

    // Get claims from repository
    const claims = await ClaimRepository.findByInventionId(
      project.invention.id
    );

    // Get figures for the project
    const figures = await figureRepository.getFiguresWithElements(projectId);

    // 1. Check for duplicate claim numbers
    const claimNumbers = new Map<number, string[]>();
    claims.forEach(claim => {
      if (!claimNumbers.has(claim.number)) {
        claimNumbers.set(claim.number, []);
      }
      claimNumbers.get(claim.number)!.push(claim.id);
    });

    claimNumbers.forEach((claimIds, number) => {
      if (claimIds.length > 1) {
        issues.push({
          type: 'duplicate_claim',
          severity: 'error',
          claimNumber: number,
          message: `Multiple claims found with number ${number}`,
          suggestion: 'Renumber claims to ensure unique numbers',
        });
      }
    });

    // 2. Check claim references
    const validClaimNumbers = new Set(claims.map(c => c.number));

    claims.forEach(claim => {
      // Look for references like "claim 1", "claims 2-4", etc.
      const references = Array.from(
        claim.text.matchAll(/claims?\s+(\d+)(?:\s*[-–]\s*(\d+))?/gi)
      );

      for (const match of references) {
        const startNum = parseInt(match[1], 10);
        const endNum = match[2] ? parseInt(match[2], 10) : startNum;

        for (let num = startNum; num <= endNum; num++) {
          if (!validClaimNumbers.has(num) && num !== claim.number) {
            issues.push({
              type: 'missing_reference',
              severity: 'error',
              claimId: claim.id,
              claimNumber: claim.number,
              message: `Claim ${claim.number} references non-existent claim ${num}`,
              suggestion: `Verify claim ${num} exists or update the reference`,
            });
          }
        }
      }
    });

    // 3. Check for mirror claim patterns and consistency
    const mirrorIssues = checkMirrorClaimConsistency(claims);
    issues.push(...mirrorIssues);

    // 4. Check Figure Reference Consistency
    if (figures && figures.length > 0) {
      // Check if invention text references the figures
      const inventionText = JSON.stringify(project.invention).toLowerCase();

      figures.forEach(figure => {
        if (figure.figureKey) {
          const figureRef = figure.figureKey.toLowerCase();
          if (!inventionText.includes(figureRef)) {
            issues.push({
              type: 'missing_reference',
              severity: 'warning',
              message: `${figure.figureKey} is not referenced in the invention description`,
              suggestion: `Add references to ${figure.figureKey} in the technical implementation or features sections`,
            });
          }
        }

        // Check if figure has reference numerals
        if (!figure.elements || figure.elements.length === 0) {
          issues.push({
            type: 'missing_reference',
            severity: 'warning',
            message: `${figure.figureKey || 'A figure'} has no reference numerals`,
            suggestion:
              'Add reference numerals to identify key components in the figure',
          });
        }
      });

      // Check if reference numerals in text match figures
      const numeralPattern = /reference numeral[s]?\s+(\d+[a-zA-Z]?)/gi;
      const textNumerals = new Set<string>();
      let match;
      while ((match = numeralPattern.exec(inventionText)) !== null) {
        textNumerals.add(match[1]);
      }

      const figureNumerals = new Set<string>();
      figures.forEach(fig => {
        fig.elements?.forEach(el => figureNumerals.add(el.elementKey));
      });

      // Find numerals in text but not in figures
      textNumerals.forEach(numeral => {
        if (!figureNumerals.has(numeral)) {
          issues.push({
            type: 'missing_reference',
            severity: 'error',
            message: `Reference numeral ${numeral} mentioned in text but not defined in any figure`,
            suggestion: `Add reference numeral ${numeral} to the appropriate figure`,
          });
        }
      });
    } else {
      // No figures but have invention data
      issues.push({
        type: 'missing_reference',
        severity: 'warning',
        message: 'No figures have been created for this invention',
        suggestion:
          'Consider using the chat to analyze your invention and suggest appropriate figures',
      });
    }

    logger.info('[ConsistencyCheck] Validation complete', {
      projectId,
      issueCount: issues.length,
      errorCount: issues.filter(i => i.severity === 'error').length,
      warningCount: issues.filter(i => i.severity === 'warning').length,
    });

    return issues;
  } catch (error) {
    logger.error('[ConsistencyCheck] Validation failed', { projectId, error });
    throw error;
  }
}

/**
 * Detects claim types based on preamble
 */
function detectClaimType(
  claimText: string
): 'system' | 'method' | 'apparatus' | 'process' | 'crm' | 'unknown' {
  const lowerText = claimText.toLowerCase();

  if (
    lowerText.includes('system comprising') ||
    lowerText.includes('system for')
  ) {
    return 'system';
  } else if (
    lowerText.includes('method comprising') ||
    lowerText.includes('method for') ||
    lowerText.includes('method of')
  ) {
    return 'method';
  } else if (
    lowerText.includes('apparatus comprising') ||
    lowerText.includes('apparatus for')
  ) {
    return 'apparatus';
  } else if (
    lowerText.includes('process comprising') ||
    lowerText.includes('process for')
  ) {
    return 'process';
  } else if (
    lowerText.includes('computer-readable medium') ||
    lowerText.includes('non-transitory')
  ) {
    return 'crm';
  }

  return 'unknown';
}

/**
 * Extracts claim elements from a claim for comparison
 */
function extractClaimElementsForComparison(claimText: string): string[] {
  // Remove the preamble
  const withoutPreamble = claimText.replace(/^[^:]+:\s*/, '');

  // Split by semicolons and clean up
  const elements = withoutPreamble
    .split(/[;.]/)
    .map(elem => elem.trim())
    .filter(elem => elem.length > 0)
    .map(elem => {
      // Remove common transitional phrases
      return elem
        .replace(/^(and\s+)?/, '')
        .replace(/^wherein\s+/, '')
        .replace(/^configured to\s+/, '')
        .replace(/^adapted to\s+/, '')
        .replace(/^for\s+/, '')
        .trim();
    });

  return elements;
}

/**
 * Checks for mirror claim patterns and validates consistency
 */
function checkMirrorClaimConsistency(claims: any[]): ConsistencyIssue[] {
  const issues: ConsistencyIssue[] = [];

  // Group claims by type
  const claimsByType: { [key: string]: any[] } = {};
  claims.forEach(claim => {
    const type = detectClaimType(claim.text);
    if (!claimsByType[type]) {
      claimsByType[type] = [];
    }
    claimsByType[type].push(claim);
  });

  // Sort each group by claim number
  Object.values(claimsByType).forEach(group => {
    group.sort((a, b) => a.number - b.number);
  });

  // Check for potential mirror patterns
  const claimTypes = Object.keys(claimsByType).filter(
    type => type !== 'unknown'
  );

  // Common mirror patterns
  const mirrorPatterns = [
    ['system', 'method'],
    ['apparatus', 'method'],
    ['system', 'process'],
    ['apparatus', 'process'],
  ];

  for (const [type1, type2] of mirrorPatterns) {
    if (claimsByType[type1] && claimsByType[type2]) {
      const group1 = claimsByType[type1];
      const group2 = claimsByType[type2];

      // Check if groups appear to be mirrors (similar count, sequential numbering)
      const group1Numbers = group1.map(c => c.number);
      const group2Numbers = group2.map(c => c.number);

      // Check if they're in sequential ranges
      const isGroup1Sequential = isSequential(group1Numbers);
      const isGroup2Sequential = isSequential(group2Numbers);
      const group1Follows2 =
        Math.min(...group1Numbers) > Math.max(...group2Numbers);
      const group2Follows1 =
        Math.min(...group2Numbers) > Math.max(...group1Numbers);

      if (
        isGroup1Sequential &&
        isGroup2Sequential &&
        (group1Follows2 || group2Follows1)
      ) {
        // Likely mirror claims - add info issue
        issues.push({
          type: 'element_mismatch',
          severity: 'warning',
          message: `Detected potential mirror claim pattern: ${type1} claims (${group1Numbers.join(', ')}) and ${type2} claims (${group2Numbers.join(', ')})`,
          suggestion: 'Reviewing mirror claim consistency',
        });

        // Compare independent claims
        const independentClaims1 = group1.filter(
          c => !c.text.includes('claim ')
        );
        const independentClaims2 = group2.filter(
          c => !c.text.includes('claim ')
        );

        if (independentClaims1.length > 0 && independentClaims2.length > 0) {
          // Compare elements between first independent claims of each type
          const elements1 = extractClaimElementsForComparison(
            independentClaims1[0].text
          );
          const elements2 = extractClaimElementsForComparison(
            independentClaims2[0].text
          );

          // Check for missing elements in mirror
          const elements1Set = new Set(elements1.map(e => normalizeElement(e)));
          const elements2Set = new Set(elements2.map(e => normalizeElement(e)));

          elements1.forEach((elem, idx) => {
            const normalized = normalizeElement(elem);
            if (!hasEquivalentElement(normalized, elements2Set, type1, type2)) {
              issues.push({
                type: 'element_mismatch',
                severity: 'error',
                claimNumber: independentClaims1[0].number,
                message: `${type1} claim ${independentClaims1[0].number} element "${elem}" appears to be missing from mirror ${type2} claim ${independentClaims2[0].number}`,
                suggestion: `Ensure ${type2} claim includes equivalent element or explain why it's intentionally omitted`,
              });
            }
          });

          elements2.forEach((elem, idx) => {
            const normalized = normalizeElement(elem);
            if (!hasEquivalentElement(normalized, elements1Set, type2, type1)) {
              issues.push({
                type: 'element_mismatch',
                severity: 'error',
                claimNumber: independentClaims2[0].number,
                message: `${type2} claim ${independentClaims2[0].number} element "${elem}" appears to be missing from mirror ${type1} claim ${independentClaims1[0].number}`,
                suggestion: `Ensure ${type1} claim includes equivalent element or explain why it's intentionally omitted`,
              });
            }
          });

          // Check dependent claim mirroring
          const dependentClaims1 = group1.filter(c =>
            c.text.includes('claim ')
          );
          const dependentClaims2 = group2.filter(c =>
            c.text.includes('claim ')
          );

          if (Math.abs(dependentClaims1.length - dependentClaims2.length) > 1) {
            issues.push({
              type: 'element_mismatch',
              severity: 'warning',
              message: `Unequal number of dependent claims: ${type1} has ${dependentClaims1.length} dependent claims, ${type2} has ${dependentClaims2.length}`,
              suggestion:
                'Consider adding corresponding dependent claims for complete mirror coverage',
            });
          }
        }
      }
    }
  }

  return issues;
}

/**
 * Checks if claim numbers are sequential
 */
function isSequential(numbers: number[]): boolean {
  if (numbers.length < 2) return true;
  const sorted = [...numbers].sort((a, b) => a - b);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] - sorted[i - 1] !== 1) return false;
  }
  return true;
}

/**
 * Normalizes a claim element for comparison
 */
function normalizeElement(element: string): string {
  return element
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks if an equivalent element exists in the mirror set
 */
function hasEquivalentElement(
  element: string,
  mirrorSet: Set<string>,
  sourceType: string,
  targetType: string
): boolean {
  // Direct match
  if (mirrorSet.has(element)) return true;

  // Check for type-specific transformations
  const transformations = getTypeTransformations(
    element,
    sourceType,
    targetType
  );
  for (const transform of transformations) {
    if (mirrorSet.has(transform)) return true;
  }

  // Fuzzy match - check if most key words are present
  const elementWords = element.split(' ').filter(w => w.length > 3);
  for (const mirrorElement of mirrorSet) {
    const mirrorWords = mirrorElement.split(' ');
    const matchCount = elementWords.filter(w => mirrorWords.includes(w)).length;
    if (matchCount >= elementWords.length * 0.7) return true;
  }

  return false;
}

/**
 * Get type-specific transformations for an element
 */
function getTypeTransformations(
  element: string,
  sourceType: string,
  targetType: string
): string[] {
  const transforms: string[] = [];

  // System/Apparatus to Method transformations
  if (
    (sourceType === 'system' || sourceType === 'apparatus') &&
    targetType === 'method'
  ) {
    transforms.push(
      element.replace(/processor/g, 'processing'),
      element.replace(/sensor/g, 'sensing'),
      element.replace(/detector/g, 'detecting'),
      element.replace(/analyzer/g, 'analyzing'),
      element.replace(/module/g, 'step'),
      element.replace(/unit/g, 'step')
    );
  }

  // Method to System/Apparatus transformations
  if (
    sourceType === 'method' &&
    (targetType === 'system' || targetType === 'apparatus')
  ) {
    transforms.push(
      element.replace(/processing/g, 'processor'),
      element.replace(/sensing/g, 'sensor'),
      element.replace(/detecting/g, 'detector'),
      element.replace(/analyzing/g, 'analyzer'),
      element.replace(/step of/g, ''),
      element.replace(/step/g, 'module')
    );
  }

  return transforms.filter(t => t !== element);
}
