import React from 'react';
import { cn } from '@/lib/utils';
import { FiArrowLeft, FiClock, FiFileText, FiCopy } from 'react-icons/fi';
import { StructuredCombinedAnalysis } from '@/client/services/patent/patentability/combined-analysis.client-service';
import { useThemeContext } from '@/contexts/ThemeContext';
import { AnalysisMarkdownViewer } from './AnalysisMarkdownViewer';
import { AmendmentSection } from './AmendmentSection';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface CombinedAnalysisResultProps {
  result: StructuredCombinedAnalysis;
  isViewingPast: boolean;
  onBackToList?: () => void;
  onCreateNew: () => void;
  onClearResult?: () => void;
  onCopy: () => void;
  getDeterminationColorScheme: (determination?: string) => string;
  claim1Text?: string;
  onApplyAmendment?: (original: string, revised: string) => void;
  onAddDependent?: (dependentClaimText: string) => void;
}

export const CombinedAnalysisResult: React.FC<CombinedAnalysisResultProps> = ({
  result,
  isViewingPast,
  onBackToList,
  onCreateNew,
  onClearResult,
  onCopy,
  getDeterminationColorScheme,
  claim1Text,
  onApplyAmendment,
  onAddDependent,
}) => {
  const { isDarkMode } = useThemeContext();

  // Use the complete disclosure analysis from the AI response with defensive programming
  const singleReferences =
    result.completeDisclosureAnalysis?.singleReferences || [];
  const combinations =
    result.completeDisclosureAnalysis?.minimalCombinations || [];

  // Defensive programming for required arrays
  const combinedReferences = result.combinedReferences || [];
  const claimElementMapping =
    result.rejectionJustification?.claimElementMapping || [];
  const strategicRecommendations = result.strategicRecommendations || [];

  return (
    <div>
      {/* Main Document Container */}
      <div
        className={cn(
          'bg-white dark:bg-gray-900 rounded-lg border p-8',
          'shadow-sm max-w-6xl mx-auto'
        )}
      >
        {/* Document Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Combined Prior Art Analysis
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            35 U.S.C. § 102 and § 103 Analysis of Claim 1
          </p>
        </div>

        <Separator className="mb-8" />

        {/* Executive Summary */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            I. EXECUTIVE SUMMARY
          </h2>

          <div className="space-y-4 pl-4">
            {/* Determination */}
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Patentability Determination:
              </p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {result.patentabilityDetermination}
              </p>
            </div>

            {/* Primary Basis */}
            {result.primaryReference && (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Primary Reference (§ 102):
                </p>
                <p className="font-mono text-sm text-gray-800 dark:text-gray-200">
                  {result.primaryReference}
                </p>
              </div>
            )}

            {/* Combined References for § 103 */}
            {!result.primaryReference && combinedReferences.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  References Under Consideration:
                </p>
                <p className="font-mono text-sm text-gray-800 dark:text-gray-200">
                  {combinedReferences.join(', ')}
                </p>
              </div>
            )}
          </div>
        </section>

        <Separator className="mb-8" />

        {/* Disclosure Analysis */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            II. COMPLETE DISCLOSURE ANALYSIS
          </h2>

          <div className="space-y-4 pl-4">
            {singleReferences.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  References Disclosing All Elements:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  {singleReferences.map(ref => (
                    <li
                      key={ref}
                      className="text-sm text-gray-700 dark:text-gray-300"
                    >
                      <span className="font-mono">{ref}</span> - Discloses all
                      elements of Claim 1
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {combinations.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Minimal Reference Combinations:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  {combinations.map((combo, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-gray-700 dark:text-gray-300"
                    >
                      <span className="font-mono">{combo.join(' + ')}</span> -
                      Together disclose all elements
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {singleReferences.length === 0 && combinations.length === 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                No single reference or minimal combination fully discloses all
                elements of Claim 1.
              </p>
            )}
          </div>
        </section>

        <Separator className="mb-8" />

        {/* Detailed Analysis */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            III. DETAILED ANALYSIS
          </h2>

          {/* Motivation to Combine */}
          {result.rejectionJustification?.motivationToCombine && (
            <div className="mb-6 pl-4">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                A. Motivation to Combine References
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {result.rejectionJustification.motivationToCombine}
              </p>
            </div>
          )}

          {/* Element-by-Element Analysis */}
          {result.rejectionJustification && claimElementMapping.length > 0 && (
            <div className="mb-6 pl-4">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                B. Element-by-Element Analysis
              </h3>
              <div className="space-y-3">
                {claimElementMapping.map((mapping, index) => (
                  <div
                    key={index}
                    className="border-l-2 border-gray-300 dark:border-gray-600 pl-4"
                  >
                    <p className="font-medium text-sm text-gray-800 dark:text-gray-200 mb-1">
                      Element {index + 1}: "{mapping.element}"
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {mapping.taughtBy}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Narrative */}
          {result.rejectionJustification?.fullNarrative && (
            <div className="pl-4">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                C. Complete Analysis Narrative
              </h3>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <AnalysisMarkdownViewer
                  markdownText={result.rejectionJustification.fullNarrative}
                />
              </div>
            </div>
          )}
        </section>

        <Separator className="mb-8" />

        {/* Recommendations and Amendments */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            IV. RECOMMENDATIONS & PROPOSED AMENDMENTS
          </h2>

          <div className="pl-4">
            <AmendmentSection
              recommendations={strategicRecommendations}
              claim1Text={claim1Text}
              originalClaim={result.originalClaim}
              revisedClaim={result.revisedClaim}
              completeAmendmentRationale={result.completeAmendmentRationale}
              alternativeAmendmentOptions={result.alternativeAmendmentOptions}
              onApplyAmendment={onApplyAmendment}
              onAddDependent={onAddDependent}
              validationSummary={result.validationSummary}
            />
          </div>
        </section>
      </div>
    </div>
  );
};
