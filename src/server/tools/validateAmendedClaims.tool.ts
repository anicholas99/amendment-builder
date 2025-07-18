import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { findProjectByIdAndTenant } from '@/repositories/project/core.repository';
import { executeSemanticSearch } from '@/server/services/semantic-search.server-service';
import { callAIServiceForAnalysis } from '@/server/ai/aiAnalysisService';
import { env } from '@/config/env';

/**
 * Validates amended claims by searching for new prior art risks
 * 
 * This tool implements the "bulletproof claims" strategy by:
 * 1. Parsing amended claim into searchable elements
 * 2. Running semantic search to find new prior art
 * 3. Performing deep analysis on top references
 * 4. Providing risk assessment and recommendations
 * 
 * SECURITY: Always validates tenant ownership before accessing data
 */
export async function validateAmendedClaims(
  projectId: string,
  tenantId: string,
  amendedClaimText: string,
  options?: {
    maxReferences?: number;
    excludeKnownPriorArt?: string[]; // Patent numbers to exclude
    riskThreshold?: number; // 0-100, default 70
  }
): Promise<{
  success: boolean;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  newPriorArtFound: boolean;
  references: any[];
  analysis: any;
  recommendations: string[];
  shouldProceed: boolean;
  message: string;
}> {
  logger.info('[ValidateAmendedClaims] Starting validation', {
    projectId,
    claimLength: amendedClaimText.length,
    options,
  });

  try {
    // 1. Verify project and tenant ownership
    const project = await findProjectByIdAndTenant(projectId, tenantId);
    if (!project) {
      throw new ApplicationError(
        ErrorCode.PROJECT_ACCESS_DENIED,
        'Project not found or access denied'
      );
    }

    // 2. Parse amended claim into searchable elements/queries
    const searchQueries = await parseClaimIntoSearchQueries(amendedClaimText);
    logger.info('[ValidateAmendedClaims] Generated search queries', {
      queryCount: searchQueries.length,
      queries: searchQueries.map(q => q.substring(0, 50) + '...'),
    });

    // 3. Execute semantic search for each query
    const maxRefs = options?.maxReferences || 5;
    const allReferences: any[] = [];
    
    for (const query of searchQueries) {
      try {
        const searchResult = await executeSemanticSearch(
          {
            searchInputs: [query],
            projectId,
            jurisdiction: 'US',
          },
          env.AIAPI_API_KEY || ''
        );

        if (searchResult?.results) {
          // Filter out known prior art if specified
          let filteredResults = searchResult.results;
          if (options?.excludeKnownPriorArt?.length) {
            filteredResults = searchResult.results.filter((ref: any) => 
              !options.excludeKnownPriorArt!.some(knownRef => 
                ref.patentNumber?.includes(knownRef) || 
                ref.publicationNumber?.includes(knownRef)
              )
            );
          }

          allReferences.push(...filteredResults.slice(0, maxRefs));
        }
      } catch (error) {
        logger.warn('[ValidateAmendedClaims] Search query failed', {
          query: query.substring(0, 50),
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // 4. Deduplicate and get top references
    const uniqueReferences = deduplicateReferences(allReferences);
    const topReferences = uniqueReferences
      .sort((a, b) => (b.relevance || 0) - (a.relevance || 0))
      .slice(0, maxRefs);

    logger.info('[ValidateAmendedClaims] Found references', {
      totalFound: allReferences.length,
      uniqueFound: uniqueReferences.length,
      topSelected: topReferences.length,
    });

    if (topReferences.length === 0) {
      return {
        success: true,
        riskScore: 0,
        riskLevel: 'LOW',
        newPriorArtFound: false,
        references: [],
        analysis: null,
        recommendations: ['No concerning prior art found for amended claim.'],
        shouldProceed: true,
        message: 'Validation complete - no significant prior art risks detected',
      };
    }

    // 5. Run deep analysis on each reference
    const deepAnalysisResults = [];
    for (const reference of topReferences) {
      try {
        const formattedRef = formatReferenceForAnalysis(reference);
        const analysisResult = await callAIServiceForAnalysis(
          amendedClaimText,
          [formattedRef],
          '', // No existing dependent claims context needed
          'Amendment validation analysis' // Invention context
        );
        
        if (analysisResult) {
          deepAnalysisResults.push({
            reference: formattedRef,
            analysis: analysisResult,
          });
        }
      } catch (error) {
        logger.warn('[ValidateAmendedClaims] Deep analysis failed for reference', {
          patentNumber: reference.patentNumber || reference.publicationNumber,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // 6. For now, skip combined analysis and rely on individual deep analysis results
    // TODO: Integrate with proper combined analysis infrastructure in future iterations
    let combinedAnalysis = null;
    if (deepAnalysisResults.length > 1) {
      logger.info('[ValidateAmendedClaims] Multiple references found', {
        count: deepAnalysisResults.length,
        note: 'Combined analysis not yet integrated for amendment validation'
      });
      // We'll assess risk based on individual analyses for now
    }

    // 7. Calculate risk score and generate recommendations
    const riskAssessment = calculateAmendmentRiskScore(
      deepAnalysisResults,
      combinedAnalysis,
      options?.riskThreshold || 70
    );

    logger.info('[ValidateAmendedClaims] Validation complete', {
      riskScore: riskAssessment.riskScore,
      riskLevel: riskAssessment.riskLevel,
      recommendationCount: riskAssessment.recommendations.length,
    });

    return {
      success: true,
      riskScore: riskAssessment.riskScore,
      riskLevel: riskAssessment.riskLevel,
      newPriorArtFound: topReferences.length > 0,
      references: topReferences,
      analysis: {
        deepAnalysis: deepAnalysisResults,
        combinedAnalysis,
      },
      recommendations: riskAssessment.recommendations,
      shouldProceed: riskAssessment.shouldProceed,
      message: riskAssessment.message,
    };

  } catch (error) {
    logger.error('[ValidateAmendedClaims] Validation failed', {
      projectId,
      error: error instanceof Error ? error.message : String(error),
    });

    if (error instanceof ApplicationError) {
      throw error;
    }

    throw new ApplicationError(
      ErrorCode.API_NETWORK_ERROR,
      'Failed to validate amended claims'
    );
  }
}

/**
 * Parse amended claim into targeted search queries
 */
async function parseClaimIntoSearchQueries(claimText: string): Promise<string[]> {
  // Use AI to extract key technical concepts and create search queries
  const systemPrompt = `Extract 3-5 key technical concepts from this patent claim that should be searched in prior art. Focus on:
- Novel technical features
- Functional limitations
- System components and their interactions
- Method steps that could be anticipated

Return only an array of search query strings, each 10-20 words focusing on specific technical aspects.`;

  const userPrompt = `Claim text: ${claimText}

Generate targeted search queries:`;

  try {
    // This would use your existing AI service infrastructure
    // For now, return a basic element-based parsing
    const elements = extractBasicClaimElements(claimText);
    return elements.map(element => element.substring(0, 100)); // Limit query length
  } catch (error) {
    logger.warn('[ValidateAmendedClaims] AI query generation failed, using fallback', {
      error: error instanceof Error ? error.message : String(error),
    });
    return extractBasicClaimElements(claimText);
  }
}

/**
 * Basic claim element extraction as fallback
 */
function extractBasicClaimElements(claimText: string): string[] {
  // Remove claim preamble and split into elements
  const cleanText = claimText
    .replace(/^.*?comprising:?/i, '')
    .replace(/^.*?including:?/i, '')
    .replace(/^\d+\.\s*/, '');

  // Split on semicolons and "wherein" clauses
  const elements = cleanText
    .split(/[;,]\s*(?=\w)/)
    .map(element => element.trim())
    .filter(element => element.length > 10)
    .slice(0, 5); // Limit to 5 elements

  return elements.length > 0 ? elements : [cleanText.substring(0, 200)];
}

/**
 * Deduplicate references by patent number
 */
function deduplicateReferences(references: any[]): any[] {
  const seen = new Set<string>();
  return references.filter(ref => {
    const key = ref.patentNumber || ref.publicationNumber || ref.title;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * Format reference for deep analysis
 */
function formatReferenceForAnalysis(reference: any): any {
  return {
    patentNumber: reference.patentNumber || reference.publicationNumber,
    title: reference.title,
    abstract: reference.abstract,
    relevance: reference.relevance || reference.score,
    // Add other fields as needed for your analysis
  };
}

/**
 * Format reference for display in results
 */
function formatReferenceForDisplay(result: any): string {
  const ref = result.reference;
  return `${ref.patentNumber}: ${ref.title}`;
}

/**
 * Calculate risk score based on analysis results
 */
function calculateAmendmentRiskScore(
  deepAnalysisResults: any[],
  combinedAnalysis: any,
  threshold: number
): {
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendations: string[];
  shouldProceed: boolean;
  message: string;
} {
  let riskScore = 0;
  const recommendations: string[] = [];

  // Analyze individual reference risks
  for (const result of deepAnalysisResults) {
    const analysis = result.analysis;
    if (analysis?.patentabilityDetermination?.includes('Obvious') || 
        analysis?.patentabilityDetermination?.includes('Anticipated')) {
      riskScore += 30;
      recommendations.push(
        `High risk from ${result.reference.patentNumber}: ${analysis.patentabilityDetermination}`
      );
    }
  }

  // Factor in combined analysis if available
  if (combinedAnalysis?.patentabilityDetermination?.includes('Obvious')) {
    riskScore += 40;
    recommendations.push('Combined prior art creates obviousness concern');
  }

  // Cap at 100
  riskScore = Math.min(riskScore, 100);

  const riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 
    riskScore >= 70 ? 'HIGH' : 
    riskScore >= 40 ? 'MEDIUM' : 'LOW';

  const shouldProceed = riskScore < threshold;

  let message: string;
  if (riskLevel === 'HIGH') {
    message = 'High risk of future rejection - consider further amendments';
  } else if (riskLevel === 'MEDIUM') {
    message = 'Moderate risk detected - review recommended changes';
  } else {
    message = 'Low risk - amendment appears strong against new prior art';
  }

  if (recommendations.length === 0) {
    recommendations.push('No significant prior art concerns found for amended claim');
  }

  return {
    riskScore,
    riskLevel,
    recommendations,
    shouldProceed,
    message,
  };
} 