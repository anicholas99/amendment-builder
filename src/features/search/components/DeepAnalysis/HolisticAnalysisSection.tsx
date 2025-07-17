/**
 * Holistic Analysis Section Component
 *
 * Displays holistic examiner analysis and claim amendment functionality.
 * Single responsibility: Holistic analysis display and claim amendment interaction.
 */

import React from 'react';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Flex } from '@/components/ui/flex';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FiLayers, FiEdit3, FiCheck, FiShield, FiInfo } from 'react-icons/fi';
import { diffWords } from 'diff';
import { ExaminerStructuredDeepAnalysis } from '../../types/deepAnalysis';
import { extractSuggestion } from '../../utils/deepAnalysisUtils';
import { ValidationInfoBox } from './ValidationInfoBox';

interface HolisticAnalysisSectionProps {
  examinerData: ExaminerStructuredDeepAnalysis;
  onApplyAmendment?: (original: string, revised: string) => void;
}

export const HolisticAnalysisSection: React.FC<
  HolisticAnalysisSectionProps
> = ({ examinerData, onApplyAmendment }) => {
  const originalClaim = examinerData.originalClaim;
  const revisedClaim = examinerData.revisedClaim;
  const isAmended = revisedClaim && revisedClaim !== originalClaim;
  
  // Check if validation was performed
  const hasValidation = 
    examinerData && 
    'validationPerformed' in examinerData && 
    examinerData.validationPerformed === true;

  // Extract validation results if available
  const validationResults = 
    examinerData && 
    'validationResults' in examinerData &&
    typeof examinerData.validationResults === 'object' &&
    examinerData.validationResults !== null
      ? examinerData.validationResults as any
      : null;

  // Extract validation summary
  const validationSummary = 
    validationResults && 
    'validationSummary' in validationResults &&
    typeof validationResults.validationSummary === 'string'
      ? validationResults.validationSummary
      : examinerData && 'validationSummary' in examinerData && typeof examinerData.validationSummary === 'string'
        ? examinerData.validationSummary
        : null;

  // Extract specific validation metrics from the detailed results
  const validationMetrics = (() => {
    if (!validationResults) return undefined;

    // Handle summary format (what UI expects)
    if ('totalSuggestions' in validationResults) {
      return {
        totalSuggestions: validationResults.totalSuggestions as number | undefined,
        disclosedCount: validationResults.disclosedCount as number | undefined,
        keepCount: validationResults.keepCount as number | undefined,
        validationSummary: validationSummary as string | undefined,
      };
    }

    // Handle detailed format (what's actually stored) - calculate metrics
    const detailedValidation = Object.keys(validationResults).filter(key => 
      key !== 'validationSummary' && 
      typeof validationResults[key] === 'object' && 
      validationResults[key] !== null
    );

    if (detailedValidation.length > 0) {
      const totalSuggestions = detailedValidation.length;
      const disclosedCount = detailedValidation.filter(key => {
        const result = validationResults[key];
        return result.isDisclosed === true || result.recommendation === 'remove';
      }).length;
      const keepCount = detailedValidation.filter(key => {
        const result = validationResults[key];
        return result.isDisclosed === false || result.recommendation === 'keep';
      }).length;

      return {
        totalSuggestions,
        disclosedCount,
        keepCount,
        validationSummary: validationSummary as string | undefined,
      };
    }

    return undefined;
  })();

  // Extract AI-generated amendment explanation from holistic analysis
  const extractAmendmentExplanation = (holistic: string): string | null => {
    if (!holistic) return null;

    // Look for amendment-specific reasoning in the AI-generated text
    const amendmentPatterns = [
      /(?:To overcome[^.]*\.(?:[^.]*\.)*)/i,
      /(?:The claim should be amended[^.]*\.(?:[^.]*\.)*)/i,
      /(?:Amendment.*?:.*?\.(?:[^.]*\.)*)/i,
      /(?:Suggested amendment[^.]*\.(?:[^.]*\.)*)/i,
      /(?:The revised claim[^.]*\.(?:[^.]*\.)*)/i,
    ];

    for (const pattern of amendmentPatterns) {
      const match = holistic.match(pattern);
      if (match) {
        // Clean up the matched text
        return match[0].trim().replace(/\s+/g, ' ');
      }
    }

    // If no specific amendment pattern found, look for reasoning about rejections
    const rejectionPatterns = [
      /(?:The reference.*?(?:anticipates|discloses|teaches).*?\.(?:[^.]*\.)*)/i,
      /(?:This reference.*?(?:renders obvious|supports).*?\.(?:[^.]*\.)*)/i,
    ];

    for (const pattern of rejectionPatterns) {
      const match = holistic.match(pattern);
      if (match) {
        return match[0].trim().replace(/\s+/g, ' ');
      }
    }

    return null;
  };

  const suggestion =
    isAmended && originalClaim && revisedClaim
      ? examinerData.amendmentExplanation ||
        extractAmendmentExplanation(examinerData.holisticAnalysis) ||
        extractSuggestion(examinerData.holisticAnalysis)
      : extractSuggestion(examinerData.holisticAnalysis);

  // Check if there's a rejection that requires amendment
  const hasRejection =
    examinerData.overallAssessment.overallRejection &&
    examinerData.overallAssessment.overallRejection !== 'Not Rejected';

  return (
    <Box>
      {/* Validation Info Box - Show prominently at top if validation was performed */}
      {hasValidation && (
        <ValidationInfoBox 
          variant="compact" 
          className="mb-4" 
          validationResults={validationMetrics}
        />
      )}

      <Box className="mb-4">
        <Flex align="center" justify="between" className="mb-1">
          <Heading size="sm" className="text-foreground">
            Holistic Examiner Analysis
          </Heading>
          {hasValidation && (
            <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700">
              <FiShield className="w-3 h-3 mr-1" />
              Validated Suggestions
            </Badge>
          )}
        </Flex>
        <Text size="xs" className="text-muted-foreground">
          Overall assessment and recommendations for overcoming rejections
          {hasValidation && ' • Suggestions validated against prior art'}
        </Text>
      </Box>

      <Box className="p-4 bg-card border border-border rounded-lg shadow-sm mb-4">
        <Text size="sm" className="text-foreground leading-relaxed">
          {examinerData.holisticAnalysis}
        </Text>
      </Box>

      {/* Validation Summary if available - but less prominent since we show metrics above */}
      {hasValidation && validationSummary && !validationMetrics && (
        <Box className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800 mb-4">
          <Flex align="start">
            <FiShield className="text-blue-500 mr-2 mt-0.5 h-4 w-4" />
            <Box>
              <Text
                weight="semibold"
                className="text-blue-700 dark:text-blue-300 text-sm mb-1"
              >
                Validation Status
              </Text>
              <Text className="text-foreground text-sm">
                {validationSummary}
              </Text>
            </Box>
          </Flex>
        </Box>
      )}

      {/* Highlight actionable suggestion if present */}
      {suggestion && (
        <Box className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md border-l-4 border-l-blue-400 mb-4">
          <Flex align="start">
            <FiEdit3 className="text-blue-500 mr-2 mt-0.5 h-4 w-4" />
            <Box className="flex-1">
              <Flex align="center" justify="between" className="mb-1">
                <Text
                  weight="semibold"
                  className="text-blue-700 dark:text-blue-300 text-sm"
                >
                  {validationMetrics?.totalSuggestions && validationMetrics.totalSuggestions > 1 
                    ? `Combined Amendment (${validationMetrics.totalSuggestions} validated suggestions)`
                    : 'Amendment Suggestion'
                  }
                </Text>
                {hasValidation && (
                  <Badge 
                    variant="secondary" 
                    className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                  >
                    ✓ Validated
                  </Badge>
                )}
              </Flex>
              <Text className="text-foreground text-sm leading-relaxed">
                {suggestion}
              </Text>

              {/* Show individual validated suggestions if available */}
              {validationMetrics?.totalSuggestions && validationMetrics.totalSuggestions > 1 && 
               examinerData && 'validatedAmendments' in examinerData && 
               Array.isArray(examinerData.validatedAmendments) && (
                <Box className="mt-3">
                  <details className="group">
                    <summary className="cursor-pointer text-sm font-medium text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 flex items-center">
                      <span>View Individual Validated Suggestions ({examinerData.validatedAmendments.length})</span>
                      <FiInfo className="ml-1 h-3 w-3" />
                    </summary>
                    <Box className="mt-2 pl-3 border-l-2 border-blue-200 dark:border-blue-700">
                      {examinerData.validatedAmendments.map((amendment: string, index: number) => (
                        <Box key={index} className="mb-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded text-xs">
                          <Text className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Suggestion {index + 1}:
                          </Text>
                          <Text className="text-gray-600 dark:text-gray-400 font-mono text-xs">
                            {amendment}
                          </Text>
                        </Box>
                      ))}
                      <Text className="text-xs text-muted-foreground mt-2 italic">
                        All suggestions above were validated as novel and combined into the final amendment.
                      </Text>
                    </Box>
                  </details>
                </Box>
              )}

              {/* Show the diff if we have both claims */}
              {isAmended && originalClaim && revisedClaim && (
                <Box className="mt-3">
                  <Text className="text-sm font-medium text-foreground mb-2">
                    {validationMetrics?.totalSuggestions && validationMetrics.totalSuggestions > 1 
                      ? `Combined Amendment (${validationMetrics.totalSuggestions} improvements):`
                      : 'Proposed Amendment:'
                    }
                  </Text>
                  <Box className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded border text-sm font-mono leading-relaxed">
                    {diffWords(originalClaim, revisedClaim).map(
                      (part, index) => (
                        <span
                          key={index}
                          className={
                            part.added
                              ? 'bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100'
                              : part.removed
                                ? 'bg-red-200 dark:bg-red-800 text-red-900 dark:text-red-100 line-through'
                                : 'text-foreground'
                          }
                        >
                          {part.value}
                        </span>
                      )
                    )}
                  </Box>

                  {onApplyAmendment && (
                    <Button
                      onClick={() =>
                        onApplyAmendment(originalClaim, revisedClaim)
                      }
                      size="sm"
                      className="mt-3"
                    >
                      <Flex align="center">
                        <FiCheck className="mr-2 h-4 w-4" />
                        Apply {validationMetrics?.totalSuggestions && validationMetrics.totalSuggestions > 1 
                          ? 'Combined ' : ''
                        }Amendment to Claim 1
                      </Flex>
                    </Button>
                  )}
                </Box>
              )}
            </Box>
          </Flex>
        </Box>
      )}
    </Box>
  );
};
