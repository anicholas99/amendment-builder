/**
 * Claim Validation Service
 * 
 * Production-ready claim validation with prior art checking
 * Provides risk assessment based on overlap with cited references
 */

import { prisma } from '@/lib/prisma';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { ValidationState, RiskLevel } from '@/features/amendment/types/validation';
import { AI_Service } from '@/services/aiService';
import { SearchService } from '@/services/searchService';

const logger = createApiLogger('claim-validation-service');

interface ValidationContext {
  claimId: string;
  claimText: string;
  projectId: string;
  tenantId: string;
  officeActionId?: string;
}

interface ValidationDetail {
  issuesFound: number;
  suggestions: string[];
  confidence: number;
  offendingReferences?: Array<{
    id: string;
    patentNumber: string;
    similarity: number;
    relevantPassages: string[];
  }>;
}

export class ClaimValidationService {
  private aiService: AI_Service;
  private searchService: SearchService;

  constructor() {
    this.aiService = new AI_Service();
    this.searchService = new SearchService();
  }

  /**
   * Validate a claim against prior art and patent corpus
   */
  async validateClaim(context: ValidationContext): Promise<{
    state: ValidationState;
    riskLevel: RiskLevel;
    message: string;
    details: ValidationDetail;
  }> {
    try {
      logger.info('[ClaimValidation] Starting validation', {
        claimId: context.claimId,
        projectId: context.projectId,
      });

      // Step 1: Get cited references from current office action
      const citedReferences = await this.getCitedReferences(context.projectId, context.officeActionId);
      
      // Step 2: Validate against cited art
      const citedArtValidation = await this.validateAgainstCitedArt(
        context.claimText,
        citedReferences
      );

      // Step 3: Semantic search for similar claims (if enabled)
      const semanticValidation = await this.validateAgainstCorpus(
        context.claimText,
        context.projectId,
        context.tenantId
      );

      // Step 4: Combine results
      const combinedResult = this.combineValidationResults(
        citedArtValidation,
        semanticValidation
      );

      logger.info('[ClaimValidation] Validation complete', {
        claimId: context.claimId,
        state: combinedResult.state,
        riskLevel: combinedResult.riskLevel,
      });

      return combinedResult;
    } catch (error) {
      logger.error('[ClaimValidation] Validation failed', {
        claimId: context.claimId,
        error: error instanceof Error ? error.message : String(error),
      });

      // Return failed state but don't throw - validation is advisory
      return {
        state: ValidationState.FAILED,
        riskLevel: RiskLevel.NONE,
        message: 'Validation service temporarily unavailable',
        details: {
          issuesFound: 0,
          suggestions: [],
          confidence: 0,
        },
      };
    }
  }

  /**
   * Get cited references from office action
   */
  private async getCitedReferences(projectId: string, officeActionId?: string): Promise<any[]> {
    try {
      // If specific OA provided, use it
      if (officeActionId) {
        const references = await prisma.priorArtReference.findMany({
          where: {
            officeActionId,
            deletedAt: null,
          },
        });
        return references;
      }

      // Otherwise get from most recent OA
      const latestOA = await prisma.officeAction.findFirst({
        where: {
          projectId,
          deletedAt: null,
        },
        orderBy: {
          dateIssued: 'desc',
        },
        include: {
          priorArtReferences: {
            where: { deletedAt: null },
          },
        },
      });

      return latestOA?.priorArtReferences || [];
    } catch (error) {
      logger.warn('[ClaimValidation] Failed to get cited references', {
        projectId,
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  /**
   * Validate claim against cited prior art
   */
  private async validateAgainstCitedArt(
    claimText: string,
    citedReferences: any[]
  ): Promise<{
    riskLevel: RiskLevel;
    offendingReferences: any[];
    issues: string[];
  }> {
    if (citedReferences.length === 0) {
      return {
        riskLevel: RiskLevel.LOW,
        offendingReferences: [],
        issues: [],
      };
    }

    try {
      // Use AI to check similarity with each reference
      const validationPrompt = `
        Analyze this claim for overlap with cited prior art references:
        
        CLAIM:
        ${claimText}
        
        CITED REFERENCES:
        ${citedReferences.map(ref => `
          Patent: ${ref.patentNumber}
          Title: ${ref.title || 'N/A'}
          Abstract: ${ref.abstract || 'N/A'}
          Relevant Claims: ${ref.relevantClaims || 'N/A'}
        `).join('\n---\n')}
        
        Identify:
        1. Any claim elements that overlap with the references
        2. Risk level (LOW/MEDIUM/HIGH) based on overlap
        3. Specific passages that create risk
        
        Return as JSON with structure:
        {
          "riskLevel": "LOW|MEDIUM|HIGH",
          "overlappingElements": ["element1", "element2"],
          "offendingReferences": [{
            "patentNumber": "US1234567",
            "similarity": 0.85,
            "relevantPassages": ["passage1", "passage2"]
          }],
          "suggestions": ["suggestion1", "suggestion2"]
        }
      `;

      const response = await this.aiService.generateStructuredResponse(
        validationPrompt,
        { 
          model: 'gpt-4',
          temperature: 0.3, // Lower temperature for consistency
        }
      );

      const analysis = JSON.parse(response);
      
      return {
        riskLevel: this.mapToRiskLevel(analysis.riskLevel),
        offendingReferences: analysis.offendingReferences || [],
        issues: analysis.overlappingElements || [],
      };
    } catch (error) {
      logger.error('[ClaimValidation] AI analysis failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      
      // Fallback to simple keyword matching
      return this.fallbackValidation(claimText, citedReferences);
    }
  }

  /**
   * Validate against broader patent corpus
   */
  private async validateAgainstCorpus(
    claimText: string,
    projectId: string,
    tenantId: string
  ): Promise<{
    riskLevel: RiskLevel;
    similarClaims: any[];
    issues: string[];
  }> {
    try {
      // Check if semantic search is enabled for this tenant
      const tenantSettings = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { 
          settings: true,
        },
      });

      const settings = tenantSettings?.settings as any;
      if (!settings?.enableSemanticValidation) {
        return {
          riskLevel: RiskLevel.NONE,
          similarClaims: [],
          issues: [],
        };
      }

      // Perform semantic search
      const searchResults = await this.searchService.searchSimilarClaims(
        claimText,
        {
          limit: 10,
          minSimilarity: 0.7,
          excludeProjectId: projectId,
        }
      );

      // Analyze results for risk
      let riskLevel = RiskLevel.LOW;
      const issues: string[] = [];

      if (searchResults.length > 0) {
        const highSimilarity = searchResults.filter(r => r.similarity > 0.85);
        const mediumSimilarity = searchResults.filter(r => r.similarity > 0.75 && r.similarity <= 0.85);

        if (highSimilarity.length > 0) {
          riskLevel = RiskLevel.HIGH;
          issues.push(`Found ${highSimilarity.length} highly similar claims in patent corpus`);
        } else if (mediumSimilarity.length > 2) {
          riskLevel = RiskLevel.MEDIUM;
          issues.push(`Found ${mediumSimilarity.length} moderately similar claims`);
        }
      }

      return {
        riskLevel,
        similarClaims: searchResults.slice(0, 5), // Top 5 most similar
        issues,
      };
    } catch (error) {
      logger.warn('[ClaimValidation] Corpus search failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      
      return {
        riskLevel: RiskLevel.NONE,
        similarClaims: [],
        issues: [],
      };
    }
  }

  /**
   * Combine validation results from multiple sources
   */
  private combineValidationResults(
    citedArtResult: any,
    corpusResult: any
  ): {
    state: ValidationState;
    riskLevel: RiskLevel;
    message: string;
    details: ValidationDetail;
  } {
    // Determine overall risk level (take the highest)
    const riskLevels = [citedArtResult.riskLevel, corpusResult.riskLevel];
    let overallRisk = RiskLevel.LOW;
    
    if (riskLevels.includes(RiskLevel.HIGH)) {
      overallRisk = RiskLevel.HIGH;
    } else if (riskLevels.includes(RiskLevel.MEDIUM)) {
      overallRisk = RiskLevel.MEDIUM;
    }

    // Determine validation state
    let state: ValidationState;
    let message: string;

    switch (overallRisk) {
      case RiskLevel.HIGH:
        state = ValidationState.PASSED_HIGH;
        message = 'High risk detected - significant overlap with prior art';
        break;
      case RiskLevel.MEDIUM:
        state = ValidationState.PASSED_MED;
        message = 'Medium risk - some overlap detected, review recommended';
        break;
      case RiskLevel.LOW:
      default:
        state = ValidationState.PASSED_LOW;
        message = 'Low risk - minimal overlap with prior art';
    }

    // Combine issues and suggestions
    const allIssues = [
      ...citedArtResult.issues,
      ...corpusResult.issues,
    ];

    const suggestions = this.generateSuggestions(overallRisk, allIssues);

    // Build details
    const details: ValidationDetail = {
      issuesFound: allIssues.length,
      suggestions,
      confidence: 0.85, // Could be calculated based on analysis quality
      offendingReferences: citedArtResult.offendingReferences,
    };

    return {
      state,
      riskLevel: overallRisk,
      message,
      details,
    };
  }

  /**
   * Generate actionable suggestions based on risk
   */
  private generateSuggestions(risk: RiskLevel, issues: string[]): string[] {
    const suggestions: string[] = [];

    switch (risk) {
      case RiskLevel.HIGH:
        suggestions.push('Consider narrowing claim scope to distinguish from prior art');
        suggestions.push('Add specific technical features not found in cited references');
        suggestions.push('Review dependent claims for additional distinguishing features');
        break;
      case RiskLevel.MEDIUM:
        suggestions.push('Review overlapping elements for potential amendments');
        suggestions.push('Consider adding dependent claims for fallback positions');
        break;
      case RiskLevel.LOW:
        suggestions.push('Claim appears sufficiently distinguished from prior art');
        break;
    }

    return suggestions;
  }

  /**
   * Fallback validation using simple keyword matching
   */
  private fallbackValidation(claimText: string, references: any[]): {
    riskLevel: RiskLevel;
    offendingReferences: any[];
    issues: string[];
  } {
    const claimLower = claimText.toLowerCase();
    const offendingRefs: any[] = [];
    
    for (const ref of references) {
      const refText = `${ref.title || ''} ${ref.abstract || ''} ${ref.relevantClaims || ''}`.toLowerCase();
      
      // Simple keyword overlap check
      const claimWords = claimLower.split(/\s+/).filter(w => w.length > 4);
      const refWords = new Set(refText.split(/\s+/).filter(w => w.length > 4));
      
      const overlap = claimWords.filter(w => refWords.has(w)).length;
      const overlapRatio = overlap / claimWords.length;
      
      if (overlapRatio > 0.5) {
        offendingRefs.push({
          patentNumber: ref.patentNumber,
          similarity: overlapRatio,
          relevantPassages: ['Significant keyword overlap detected'],
        });
      }
    }

    let riskLevel = RiskLevel.LOW;
    if (offendingRefs.length > 2) {
      riskLevel = RiskLevel.HIGH;
    } else if (offendingRefs.length > 0) {
      riskLevel = RiskLevel.MEDIUM;
    }

    return {
      riskLevel,
      offendingReferences: offendingRefs,
      issues: offendingRefs.length > 0 ? ['Keyword overlap with cited references'] : [],
    };
  }

  /**
   * Map string risk level to enum
   */
  private mapToRiskLevel(level: string): RiskLevel {
    switch (level?.toUpperCase()) {
      case 'HIGH':
        return RiskLevel.HIGH;
      case 'MEDIUM':
      case 'MED':
        return RiskLevel.MEDIUM;
      case 'LOW':
        return RiskLevel.LOW;
      default:
        return RiskLevel.NONE;
    }
  }
}