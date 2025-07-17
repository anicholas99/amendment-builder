/**
 * Validation Info Box Component
 * 
 * Displays information about the two-phase validation system
 * to help users understand what validated suggestions mean.
 */

import React from 'react';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Flex } from '@/components/ui/flex';
import { Badge } from '@/components/ui/badge';
import { FiInfo, FiShield, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import { cn } from '@/lib/utils';

interface ValidationResults {
  totalSuggestions?: number;
  disclosedCount?: number;
  keepCount?: number;
  validationSummary?: string;
}

interface ValidationInfoBoxProps {
  className?: string;
  variant?: 'compact' | 'detailed';
  validationResults?: ValidationResults;
}

export const ValidationInfoBox: React.FC<ValidationInfoBoxProps> = ({ 
  className, 
  variant = 'compact',
  validationResults
}) => {
  const hasSpecificResults = validationResults && (
    validationResults.totalSuggestions !== undefined ||
    validationResults.disclosedCount !== undefined ||
    validationResults.keepCount !== undefined
  );

  const hasValidationSummary = validationResults && validationResults.validationSummary;

  // Show the component if we have specific results OR at least a validation summary
  if (!hasSpecificResults && !hasValidationSummary) return null;

  if (variant === 'compact') {
    return (
      <Box className={cn("p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-800", className)}>
        <Flex align="start" className="mb-2">
          <FiShield className="text-green-600 dark:text-green-400 mr-2 mt-0.5 h-4 w-4 flex-shrink-0" />
          <Box className="flex-1">
            <Text className="text-sm text-foreground">
              {(() => {
                // Check if this is multi-reference validation based on the summary text
                const isMultiReference = hasValidationSummary && 
                  validationResults.validationSummary &&
                  (validationResults.validationSummary.includes('ALL') && validationResults.validationSummary.includes('references in this combination'));
                
                if (isMultiReference) {
                  return (
                    <>
                      <strong className="text-green-700 dark:text-green-300">Multi-Reference Validation Complete:</strong> All 
                      amendment recommendations have been validated against all prior art references in this combination.
                    </>
                  );
                } else {
                  return (
                    <>
                      <strong className="text-green-700 dark:text-green-300">Two-Phase Validation Complete:</strong> All 
                      amendment recommendations have been validated against the prior art reference.
                    </>
                  );
                }
              })()}
            </Text>
            
            {hasSpecificResults && (
              <Flex align="center" className="mt-2 gap-2">
                {validationResults.totalSuggestions !== undefined && (
                  <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700">
                    <FiInfo className="w-3 h-3 mr-1" />
                    {validationResults.totalSuggestions} tested
                  </Badge>
                )}
                {validationResults.keepCount !== undefined && (
                  <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700">
                    <FiCheckCircle className="w-3 h-3 mr-1" />
                    {validationResults.keepCount} validated
                  </Badge>
                )}
                {validationResults.disclosedCount !== undefined && validationResults.disclosedCount > 0 && (
                  <Badge variant="outline" className="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700">
                    <FiAlertTriangle className="w-3 h-3 mr-1" />
                    {validationResults.disclosedCount} filtered out
                  </Badge>
                )}
              </Flex>
            )}

            {hasValidationSummary && !hasSpecificResults && (
              <Text className="text-sm text-muted-foreground mt-2 italic">
                {validationResults.validationSummary}
              </Text>
            )}
          </Box>
        </Flex>
      </Box>
    );
  }

  return (
    <Box className={cn("p-4 bg-gradient-to-br from-green-50 via-blue-50 to-green-50 dark:from-green-900/20 dark:via-blue-900/20 dark:to-green-900/20 rounded-lg border border-green-200 dark:border-green-800", className)}>
      <Flex align="start" className="mb-3">
        <FiShield className="text-green-600 dark:text-green-400 mr-3 mt-0.5 h-5 w-5 flex-shrink-0" />
        <Box>
          <Flex align="center" className="mb-2">
            <Text weight="semibold" className="text-green-700 dark:text-green-300">
              {(() => {
                // Check if this is multi-reference validation based on the summary text
                const isMultiReference = hasValidationSummary && 
                  validationResults.validationSummary &&
                  (validationResults.validationSummary.includes('ALL') && validationResults.validationSummary.includes('references in this combination'));
                
                return isMultiReference ? 'Multi-Reference Validation System Active' : 'Two-Phase Validation System Active';
              })()}
            </Text>
            <Badge className="ml-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
              ✓ Validated
            </Badge>
          </Flex>
          
          {hasSpecificResults && (
            <Box className="mb-3 p-3 bg-white dark:bg-gray-800/50 rounded-md border border-green-200 dark:border-green-700">
              <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Validation Results:
              </Text>
              <Flex align="center" className="gap-3">
                {validationResults.totalSuggestions !== undefined && (
                  <Flex align="center">
                    <FiInfo className="w-4 h-4 text-blue-500 mr-1" />
                    <Text className="text-sm text-foreground">
                      <strong>{validationResults.totalSuggestions}</strong> suggestions analyzed
                    </Text>
                  </Flex>
                )}
                {validationResults.keepCount !== undefined && (
                  <Flex align="center">
                    <FiCheckCircle className="w-4 h-4 text-green-500 mr-1" />
                    <Text className="text-sm text-foreground">
                      <strong>{validationResults.keepCount}</strong> passed validation
                    </Text>
                  </Flex>
                )}
                {validationResults.disclosedCount !== undefined && (
                  <Flex align="center">
                    <FiAlertTriangle className="w-4 h-4 text-orange-500 mr-1" />
                    <Text className="text-sm text-foreground">
                      <strong>{validationResults.disclosedCount}</strong> already disclosed
                    </Text>
                  </Flex>
                )}
              </Flex>
              {validationResults.validationSummary && (
                <Text className="text-sm text-muted-foreground mt-2 italic">
                  {validationResults.validationSummary}
                </Text>
              )}
            </Box>
          )}

          <Text className="text-sm text-foreground mb-3">
            This analysis uses our advanced two-phase validation system to ensure suggestion quality:
          </Text>
          <Box className="space-y-2">
            <Flex align="start">
              <Text className="text-sm font-semibold text-blue-700 dark:text-blue-300 mr-2">Phase 1:</Text>
              <Text className="text-sm text-foreground">
                AI analyzes claim elements and generates potential amendments
              </Text>
            </Flex>
            <Flex align="start">
              <Text className="text-sm font-semibold text-green-700 dark:text-green-300 mr-2">Phase 2:</Text>
              <Text className="text-sm text-foreground">
                Each suggestion is validated against the prior art to ensure novelty
              </Text>
            </Flex>
          </Box>
          <Text className="text-sm text-muted-foreground mt-3">
            Only suggestions that pass validation are shown, giving you confidence that recommended 
            amendments are genuinely novel over the analyzed reference.
          </Text>
        </Box>
      </Flex>
    </Box>
  );
}; 