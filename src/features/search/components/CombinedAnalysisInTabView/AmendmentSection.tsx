/**
 * Amendment Section Component for Combined Analysis
 *
 * Displays strategic recommendations with amendment application functionality.
 * Professional, document-style design for attorneys.
 */

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  FiCheck,
  FiPlus,
  FiChevronDown,
  FiChevronUp,
  FiLoader,
} from 'react-icons/fi';
import { diffWords } from 'diff';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/useToastWrapper';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ValidationInfoBox } from '../DeepAnalysis/ValidationInfoBox';

interface StrategicRecommendation {
  recommendation: string;
  suggestedAmendmentLanguage: string;
  // Optional validation fields for multi-reference validation
  validation?: {
    isValidated: boolean;
    isDisclosedInAny: boolean;
    recommendation: 'remove' | 'modify' | 'keep';
    validationScore: number;
    disclosingReferences: string[];
    validationSummary: string;
    disclosureByReference: Record<string, {
      isDisclosed: boolean;
      evidence: string[];
      score: number;
    }>;
  };
}

interface AmendmentSectionProps {
  recommendations: StrategicRecommendation[];
  claim1Text?: string;
  originalClaim?: string;
  revisedClaim?: string;
  completeAmendmentRationale?: string;
  alternativeAmendmentOptions?: string[] | null;
  onApplyAmendment?: (original: string, revised: string) => void;
  onAddDependent?: (dependentClaimText: string) => void;
  // Optional validation summary for multi-reference validation
  validationSummary?: {
    totalSuggestions: number;
    validatedSuggestions: number;
    disclosedCount: number;
    keepCount: number;
    validationEnabled: boolean;
    validationError?: string;
    referenceCount?: number;
    referenceNumbers?: string[];
  };
}

export const AmendmentSection: React.FC<AmendmentSectionProps> = ({
  recommendations,
  claim1Text,
  originalClaim,
  revisedClaim,
  completeAmendmentRationale,
  alternativeAmendmentOptions,
  onApplyAmendment,
  onAddDependent,
  validationSummary,
}) => {
  const toast = useToast();
  const { isDarkMode } = useThemeContext();
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [applyingAmendment, setApplyingAmendment] = useState(false);
  const [amendmentApplied, setAmendmentApplied] = useState(false);

  // Check if validation was performed and get metrics
  const hasValidation = validationSummary?.validationEnabled || false;
  const hasValidationError = validationSummary?.validationError;
  const validationMetrics = hasValidation ? {
    totalSuggestions: validationSummary?.totalSuggestions || 0,
    disclosedCount: validationSummary?.disclosedCount || 0,
    keepCount: validationSummary?.keepCount || 0,
    validationSummary: hasValidationError 
      ? validationSummary?.validationError 
      : (() => {
          const refCount = validationSummary?.referenceCount || 0;
          const keepCount = validationSummary?.keepCount || 0;
          const totalCount = validationSummary?.totalSuggestions || 0;
          
          if (refCount > 1) {
            return `Multi-Reference Validation Complete: All ${totalCount} amendment recommendations have been validated against ALL ${refCount} prior art references in this combination. ${keepCount} suggestions passed validation.`;
          } else {
            return `Validation complete: ${keepCount} of ${totalCount} suggestions validated against prior art reference.`;
          }
        })()
  } : undefined;

  // Word-level diff rendering
  const renderWordDiff = (oldText: string, newText: string) => {
    const diff = diffWords(oldText, newText);
    return (
      <pre className="font-mono text-sm whitespace-pre-wrap leading-relaxed">
        {diff.map((part, idx) => {
          if (part.added) {
            return (
              <span
                key={idx}
                className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-1 rounded"
              >
                {part.value}
              </span>
            );
          } else if (part.removed) {
            return (
              <span
                key={idx}
                className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 px-1 rounded line-through"
              >
                {part.value}
              </span>
            );
          } else {
            return <span key={idx}>{part.value}</span>;
          }
        })}
      </pre>
    );
  };

  // Clean the amendment language to remove claim numbering
  const cleanAmendmentLanguage = (text: string): string => {
    // Remove claim numbering like "1." or "2." at the beginning
    return text.replace(/^\d+\.\s+/, '');
  };

  // Determine if recommendation is for a dependent claim based on the recommendation text
  const isDependent = (
    recommendation: string,
    amendmentLanguage: string
  ): boolean => {
    const cleanedLanguage = amendmentLanguage.toLowerCase();
    const recLower = recommendation.toLowerCase();

    // Check if the recommendation explicitly mentions dependent claim
    if (
      recLower.includes('dependent claim') ||
      recLower.includes('add dependent')
    ) {
      return true;
    }

    // Check if the amendment language looks like a dependent claim
    if (
      cleanedLanguage.includes('the system of claim 1') ||
      cleanedLanguage.includes('the method of claim 1') ||
      cleanedLanguage.includes('claim 1, wherein')
    ) {
      return true;
    }

    return false;
  };

  // Handle apply amendment with nice transitions
  const handleApplyAmendment = async () => {
    if (!onApplyAmendment || !originalClaim || !revisedClaim) return;

    setApplyingAmendment(true);

    try {
      // Simulate a brief processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 800));

      await onApplyAmendment(originalClaim, revisedClaim);

      setApplyingAmendment(false);
      setAmendmentApplied(true);

      // Reset the applied state after 3 seconds
      setTimeout(() => {
        setAmendmentApplied(false);
      }, 3000);
    } catch (error) {
      setApplyingAmendment(false);
      toast({
        title: 'Error applying amendment',
        description: 'Please try again',
        duration: 3000,
      });
    }
  };

  // Add dependent claim
  const handleAddDependent = (amendmentLanguage: string) => {
    if (!onAddDependent) {
      toast({
        title: 'Cannot add dependent claim',
        description: 'Dependent claim handler not available',
        duration: 3000,
      });
      return;
    }

    onAddDependent(amendmentLanguage);
  };

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Validation Info Box - Show prominently at top if validation was performed */}
      {hasValidation && validationMetrics && (
        <ValidationInfoBox 
          variant="compact" 
          className="mb-4" 
          validationResults={validationMetrics}
        />
      )}

      {/* Proposed Claim 1 Amendment */}
      {originalClaim && revisedClaim && originalClaim !== revisedClaim && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
            A. Proposed Claim 1 Amendment
          </h3>

          {/* Amendment Rationale */}
          {completeAmendmentRationale && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rationale:
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {completeAmendmentRationale}
              </p>
            </div>
          )}

          {/* Amendment Markup */}
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Proposed Amendment (Marked-Up):
            </p>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-200 dark:border-gray-700">
              {renderWordDiff(originalClaim, revisedClaim)}
            </div>
          </div>

          {/* Clean Version */}
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Clean Version:
            </p>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-200 dark:border-gray-700">
              <pre className="font-mono text-sm whitespace-pre-wrap leading-relaxed text-gray-800 dark:text-gray-200">
                {revisedClaim}
              </pre>
            </div>
          </div>

          {/* Action Button with States */}
          <Button
            onClick={handleApplyAmendment}
            disabled={
              !onApplyAmendment || applyingAmendment || amendmentApplied
            }
            size="sm"
            className={cn(
              'flex items-center gap-2 transition-all duration-300',
              amendmentApplied && 'bg-green-600 hover:bg-green-600'
            )}
          >
            {applyingAmendment ? (
              <>
                <FiLoader className="w-4 h-4 animate-spin" />
                Applying Amendment...
              </>
            ) : amendmentApplied ? (
              <>
                <FiCheck className="w-4 h-4" />
                Amendment Applied!
              </>
            ) : (
              <>
                <FiCheck className="w-4 h-4" />
                Apply Amendment to Claim 1
              </>
            )}
          </Button>

          {/* Alternative Amendment Options */}
          {alternativeAmendmentOptions &&
            alternativeAmendmentOptions.length > 0 && (
              <div className="mt-4">
                <Collapsible
                  open={showAlternatives}
                  onOpenChange={setShowAlternatives}
                >
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-xs">
                      {showAlternatives ? 'Hide' : 'View'} Alternative
                      Approaches ({alternativeAmendmentOptions.length})
                      {showAlternatives ? (
                        <FiChevronUp className="w-3 h-3 ml-1" />
                      ) : (
                        <FiChevronDown className="w-3 h-3 ml-1" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="mt-3 space-y-2">
                      {alternativeAmendmentOptions.map((option, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded text-sm text-gray-700 dark:text-gray-300"
                        >
                          <span className="font-medium">
                            Alternative {idx + 1}:
                          </span>{' '}
                          {option}
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}
        </div>
      )}

      {/* Additional Strategic Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
            {originalClaim && revisedClaim && originalClaim !== revisedClaim
              ? 'B. Additional'
              : 'A.'}{' '}
            Strategic Recommendations
          </h3>

          <div className="space-y-4">
            {recommendations.map((rec, index) => {
              const isDependentClaim = isDependent(
                rec.recommendation,
                rec.suggestedAmendmentLanguage
              );
              const cleanedAmendmentLanguage = cleanAmendmentLanguage(
                rec.suggestedAmendmentLanguage
              );

              return (
                <div
                  key={index}
                  className="border-l-2 border-gray-300 dark:border-gray-600 pl-4"
                >
                  {/* Recommendation */}
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {index + 1}. {rec.recommendation}
                    </p>
                    <Badge variant="outline" className="text-xs ml-3">
                      {isDependentClaim ? 'Dependent' : 'Amendment'}
                    </Badge>
                  </div>

                  {/* Amendment Language */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Suggested Language:
                    </p>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded text-sm">
                      <pre className="font-mono whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                        {cleanedAmendmentLanguage}
                      </pre>
                    </div>
                  </div>

                  {/* Action Button */}
                  {isDependentClaim && onAddDependent && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleAddDependent(cleanedAmendmentLanguage)
                      }
                      className="flex items-center gap-2 text-xs"
                    >
                      <FiPlus className="w-3 h-3" />
                      Add as Dependent Claim
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
