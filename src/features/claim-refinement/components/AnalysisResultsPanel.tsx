import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import { MdArrowForward, MdCheckCircle, MdInfo } from 'react-icons/md';
import { FullAnalysisResponse } from '../../../types/priorArtAnalysisTypes';
import CoverageMatrixTable from './CoverageMatrixTable';
import DependentClaimSuggestionCard from './DependentClaimSuggestionCard';

const MotionDiv = motion.div;

const resultsVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface AnalysisResultsPanelProps {
  isAnalyzing: boolean;
  analysisData: FullAnalysisResponse | null;
  selectedSearchId: string | null;
  selectedReferenceNumbers: string[];
  claim1Text: string;
  displayedSuggestions: string[];
  onOpenApplyModal: (data: {
    elementText: string;
    newLanguage: string;
  }) => void;
  onInsertClaim: (claimText: string) => void;
  onEditSuggestion: (suggestionText: string) => void;
  onDismissSuggestion: (index: number) => void;
}

/**
 * Component for displaying analysis results with tabs for different views
 */
export const AnalysisResultsPanel: React.FC<AnalysisResultsPanelProps> = ({
  isAnalyzing,
  analysisData,
  selectedSearchId,
  selectedReferenceNumbers,
  claim1Text,
  displayedSuggestions,
  onOpenApplyModal,
  onInsertClaim,
  onEditSuggestion,
  onDismissSuggestion,
}) => {
  return (
    <MotionDiv
      className="pt-4 border-t mt-4"
      initial="hidden"
      animate={!isAnalyzing && analysisData ? 'visible' : 'hidden'}
      variants={resultsVariants}
    >
      {!isAnalyzing && analysisData && (
        <div>
          <Tabs defaultValue="overlap" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overlap">Overlap Summary</TabsTrigger>
              <TabsTrigger value="refinement">Refinement Advice</TabsTrigger>
            </TabsList>

            <TabsContent value="overlap" className="p-0">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Reference Overlap Summary
                  </h3>

                  {analysisData.coverageMatrix && (
                    <div className="mb-6">
                      <h4 className="text-base font-medium mb-2">
                        Element Coverage Matrix
                      </h4>
                      <p className="text-xs text-muted-foreground mb-3">
                        This matrix shows how each claim element is covered by
                        each reference.
                        <strong> Red = Yes</strong> (element disclosed),{' '}
                        <strong>Yellow = Partial</strong> (partially disclosed),
                        <strong> Green = No</strong> (not disclosed).
                      </p>
                      <CoverageMatrixTable
                        coverageMatrix={analysisData.coverageMatrix}
                        referenceIds={
                          analysisData.analyses.length > 0
                            ? analysisData.analyses.map(a => a.referenceId)
                            : []
                        }
                      />
                    </div>
                  )}

                  <h3 className="text-lg font-semibold mb-2">
                    Holistic Overlap & Risk Assessment
                  </h3>
                  {analysisData.analyses.length === 0 && (
                    <p>No overlap analysis available.</p>
                  )}
                  {analysisData.analyses.map(analysis => (
                    <div
                      key={analysis.referenceId}
                      className="border rounded-lg p-4 mt-3 shadow-sm bg-card"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-base font-medium">
                          {analysis.referenceId}
                        </h4>
                        <Badge
                          variant={
                            analysis.primaryRiskType === '§102 Anticipation'
                              ? 'destructive'
                              : analysis.primaryRiskType === '§103 Obviousness'
                                ? 'secondary'
                                : 'default'
                          }
                          className={cn(
                            'px-2 py-0.5 rounded-full',
                            analysis.primaryRiskType === '§102 Anticipation' &&
                              'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
                            analysis.primaryRiskType === '§103 Obviousness' &&
                              'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800',
                            analysis.primaryRiskType !== '§102 Anticipation' &&
                              analysis.primaryRiskType !== '§103 Obviousness' &&
                              'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                          )}
                        >
                          {analysis.primaryRiskType}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground mb-2">
                        <strong>Holistic Overlap:</strong>{' '}
                        {analysis.overlapSummary}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <strong>Risk Rationale:</strong>{' '}
                        {analysis.riskRationale ||
                          (analysis.primaryRiskType === 'Low Risk'
                            ? 'No significant rationale provided.'
                            : 'Rationale missing.')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="refinement" className="p-0">
              <div className="space-y-6">
                {/* Priority Actions Section */}
                {analysisData.priorityActions &&
                  analysisData.priorityActions.length > 0 && (
                    <div className="mb-4 p-4 border rounded-md border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
                      <h4 className="text-base font-medium mb-2 text-blue-600 dark:text-blue-200">
                        Priority Drafting Actions
                      </h4>
                      <ul className="space-y-2">
                        {analysisData.priorityActions.map((action, idx) => (
                          <li key={idx} className="flex items-start">
                            <MdArrowForward className="w-4 h-4 text-blue-500 mt-1 mr-2 flex-shrink-0" />
                            <span className="text-sm">{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {/* Overall Assessment */}
                {analysisData.overallAssessment && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Overall Assessment (Combined Art)
                    </h3>
                    <p className="text-sm">{analysisData.overallAssessment}</p>
                  </div>
                )}

                {/* Key Distinguishing Features */}
                {analysisData.keyDistinguishingFeatures &&
                  analysisData.keyDistinguishingFeatures.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        Key Distinguishing Features (vs Combined Art)
                      </h3>
                      <ul className="space-y-2 pl-2">
                        {analysisData.keyDistinguishingFeatures.map(
                          (feature, idx) => (
                            <li key={idx} className="flex items-start">
                              <MdCheckCircle className="w-4 h-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                              <span className="text-sm">{feature}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                {/* Holistic Refinement Suggestions */}
                {analysisData.holisticRefinementSuggestions &&
                  analysisData.holisticRefinementSuggestions.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        Holistic Refinement Suggestions
                      </h3>
                      <div className="space-y-4">
                        {analysisData.holisticRefinementSuggestions.map(
                          (suggestion, idx) => (
                            <div
                              key={idx}
                              className="border rounded-lg p-4 shadow-sm bg-card"
                            >
                              <p className="text-sm font-medium mb-2">
                                {suggestion.suggestion}
                              </p>
                              <p className="text-xs text-muted-foreground mb-2">
                                <strong>Rationale:</strong>{' '}
                                {suggestion.rationale}
                              </p>
                              {suggestion.addressesReferences &&
                                suggestion.addressesReferences.length > 0 && (
                                  <div className="flex gap-1 items-center">
                                    <span className="text-xs text-muted-foreground">
                                      Addresses:
                                    </span>
                                    {suggestion.addressesReferences.map(
                                      refId => (
                                        <Badge
                                          key={refId}
                                          variant="outline"
                                          className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800"
                                        >
                                          {refId}
                                        </Badge>
                                      )
                                    )}
                                  </div>
                                )}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Obviousness Combinations */}
                {analysisData.obviousnessCombinations &&
                  analysisData.obviousnessCombinations.length > 0 && (
                    <div className="pt-4 border-t mt-4">
                      <h3 className="text-lg font-semibold mb-2">
                        Potential Obviousness Combinations (§103)
                      </h3>
                      <div className="space-y-4">
                        {analysisData.obviousnessCombinations.map(
                          (combo, idx) => (
                            <div
                              key={idx}
                              className="border rounded-lg p-4 shadow-sm bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"
                            >
                              <div className="flex gap-2 mb-2 items-center">
                                <span className="font-semibold text-sm">
                                  Combination:
                                </span>
                                {combo.combination.map(refId => (
                                  <Badge
                                    key={refId}
                                    className="bg-orange-500 text-white hover:bg-orange-600"
                                  >
                                    {refId}
                                  </Badge>
                                ))}
                              </div>
                              <p className="text-sm">
                                <strong>Rationale:</strong> {combo.rationale}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Dependent Claim Suggestions */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Dependent Claim Suggestions
                  </h3>
                  {displayedSuggestions.length > 0 ? (
                    <div className="space-y-3">
                      {displayedSuggestions.map((suggestion, index) => (
                        <DependentClaimSuggestionCard
                          key={`suggestion-${index}`}
                          suggestionText={suggestion}
                          onInsert={onInsertClaim}
                          onEdit={onEditSuggestion}
                          onDismiss={() => onDismissSuggestion(index)}
                        />
                      ))}
                    </div>
                  ) : analysisData?.dependentClaimSuggestions?.length ? (
                    <p className="text-muted-foreground">
                      All suggestions have been dismissed.
                    </p>
                  ) : (
                    <p className="text-muted-foreground">
                      No dependent claim suggestions generated.
                    </p>
                  )}
                </div>

                {/* Suggested Independent Claim */}
                <div className="pt-4 border-t mt-4">
                  <h3 className="text-lg font-semibold mb-2">
                    Suggested Independent Claim (Claim 1)
                  </h3>
                  <div className="p-4 border rounded-md border-border">
                    <pre className="whitespace-pre-wrap text-sm font-mono">
                      {JSON.stringify(analysisData, null, 2)}
                    </pre>
                    {analysisData.finalClaimDraft && (
                      <div className="flex justify-end mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            onOpenApplyModal({
                              elementText: claim1Text,
                              newLanguage: analysisData.finalClaimDraft,
                            })
                          }
                        >
                          Review & Apply Suggestion
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {!isAnalyzing &&
        !analysisData &&
        selectedSearchId &&
        selectedReferenceNumbers.length > 0 && (
          <Alert>
            <MdInfo className="h-4 w-4" />
            <AlertDescription>
              Click "Analyze References" to generate analysis.
            </AlertDescription>
          </Alert>
        )}
    </MotionDiv>
  );
};
