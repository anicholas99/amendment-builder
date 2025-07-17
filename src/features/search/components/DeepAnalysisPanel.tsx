/**
 * Deep Analysis Panel
 *
 * Clean, focused component that orchestrates sub-components for deep analysis display.
 * Follows architectural blueprint: single responsibility, clear separation of concerns.
 *
 * Responsibilities:
 * - Data processing and validation
 * - Sub-component orchestration
 * - Loading and error state management
 */

import React from 'react';
import { logger } from '@/utils/clientLogger';
import { cn } from '@/lib/utils';
import { useThemeContext } from '@/contexts/ThemeContext';
import { Separator } from '@/components/ui/separator';
import {
  DeepAnalysisPanelProps,
  ExaminerStructuredDeepAnalysis,
} from '../types/deepAnalysis';
import {
  calculateOverallRelevance,
  isExaminerStructuredFormat,
} from '../utils/deepAnalysisUtils';
import { ElementAnalysisAccordion } from './DeepAnalysis/ElementAnalysisAccordion';
import { OverallRelevanceSection } from './DeepAnalysis/OverallRelevanceSection';
import { HolisticAnalysisSection } from './DeepAnalysis/HolisticAnalysisSection';
import { ValidationInfoBox } from './DeepAnalysis/ValidationInfoBox';
import { Badge } from '@/components/ui/badge';

/**
 * Component to display deep AI analysis of citation extraction data
 *
 * This component presents a holistic analysis of citation relevance for each claim element,
 * based on all extracted citation snippets for a reference. It includes patent examiner
 * perspectives on patentability under 35 U.S.C. 102 and 103.
 */
export const DeepAnalysisPanel: React.FC<DeepAnalysisPanelProps> = ({
  analysisData,
  referenceNumber,
  isLoading = false,
  onApplyAmendment,
}) => {
  const { isDarkMode } = useThemeContext();

  // Comprehensive logging for debugging
  logger.debug('[DeepAnalysisPanel] Component rendering with props:', {
    hasAnalysisData: !!analysisData,
    analysisDataType: analysisData ? typeof analysisData : 'null',
    analysisKeys: analysisData ? Object.keys(analysisData) : [],
    isArray: Array.isArray(analysisData),
    analysisDataSample: analysisData
      ? JSON.stringify(analysisData).substring(0, 200)
      : 'null',
    referenceNumber,
    isLoading,
  });

  // Early returns for loading and no data states
  if (isLoading) {
    return (
      <div className="w-full">
        <div
          className={cn(
            'p-4 rounded-md text-center',
            isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
          )}
        >
          <p className={cn(isDarkMode ? 'text-gray-400' : 'text-gray-600')}>
            Loading analysis data...
          </p>
        </div>
      </div>
    );
  }

  if (
    !analysisData ||
    (Array.isArray(analysisData) && analysisData.length === 0)
  ) {
    logger.debug('[DeepAnalysisPanel] No analysis data available:', {
      analysisDataExists: !!analysisData,
      isEmptyArray: Array.isArray(analysisData) && analysisData.length === 0,
      referenceNumber,
      isLoading,
    });

    return (
      <div className="w-full">
        <div
          className={cn(
            'p-4 rounded-md text-center',
            isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
          )}
        >
          <p className={cn(isDarkMode ? 'text-gray-400' : 'text-gray-600')}>
            No analysis data available for this reference.
          </p>
        </div>
      </div>
    );
  }

  // Handle wrapped data structures
  let processedData: any = analysisData;

  // Check if data is wrapped in a single key (e.g., { highRelevanceElements: { ... } })
  if (typeof analysisData === 'object' && !Array.isArray(analysisData)) {
    const keys = Object.keys(analysisData);

    logger.debug('[DeepAnalysisPanel] Checking for wrapped structure:', {
      keys,
      keysLength: keys.length,
    });

    // If there's only one key and it's not a known structure key
    if (
      keys.length === 1 &&
      !['elementAnalysis', 'overallAssessment', 'holisticAnalysis'].includes(
        keys[0]
      )
    ) {
      const wrapperKey = keys[0];
      const wrappedData = (analysisData as any)[wrapperKey];

      logger.debug('[DeepAnalysisPanel] Detected wrapped data structure:', {
        wrapperKey,
        wrappedDataType: typeof wrappedData,
        wrappedDataKeys:
          wrappedData && typeof wrappedData === 'object'
            ? Object.keys(wrappedData)
            : [],
        isWrappedArray: Array.isArray(wrappedData),
        wrappedDataSample: wrappedData
          ? JSON.stringify(wrappedData).substring(0, 200)
          : 'null',
      });

      // If the wrapped data looks like element analysis data
      if (
        wrappedData &&
        typeof wrappedData === 'object' &&
        !Array.isArray(wrappedData)
      ) {
        processedData = wrappedData;
      }
    }
  }

  logger.debug('[DeepAnalysisPanel] After processing:', {
    processedDataType: typeof processedData,
    processedDataKeys:
      processedData &&
      typeof processedData === 'object' &&
      !Array.isArray(processedData)
        ? Object.keys(processedData)
        : [],
    isProcessedArray: Array.isArray(processedData),
  });

  // Data processing and validation
  const isStructuredFormat = isExaminerStructuredFormat(processedData);
  const examinerData = isStructuredFormat
    ? (processedData as ExaminerStructuredDeepAnalysis)
    : null;

  const relevanceData =
    isStructuredFormat && examinerData
      ? calculateOverallRelevance(examinerData.overallAssessment)
      : null;

  // Check if validation was performed
  const hasValidation = 
    isStructuredFormat && 
    examinerData && 
    'validationPerformed' in examinerData && 
    examinerData.validationPerformed === true;

  logger.debug('[DeepAnalysisPanel] Validation check:', {
    isStructuredFormat,
    hasExaminerData: !!examinerData,
    hasValidationPerformed: examinerData && 'validationPerformed' in examinerData,
    validationPerformedValue: examinerData && 'validationPerformed' in examinerData ? examinerData.validationPerformed : undefined,
    hasValidation,
    examinerDataKeys: examinerData ? Object.keys(examinerData) : [],
  });

  // Extract validation results for better logging and debugging
  const validationResults = 
    examinerData && 
    'validationResults' in examinerData &&
    typeof examinerData.validationResults === 'object' &&
    examinerData.validationResults !== null
      ? examinerData.validationResults as any
      : null;

  logger.debug('[DeepAnalysisPanel] Validation results:', {
    hasValidationResults: !!validationResults,
    validationResults: validationResults,
    validationResultsKeys: validationResults ? Object.keys(validationResults) : [],
  });

  // Calculate validation metrics from the detailed results
  const calculatedValidationMetrics = (() => {
    if (!validationResults) return undefined;

    // Handle summary format (what UI expects)
    if ('totalSuggestions' in validationResults) {
      return {
        totalSuggestions: validationResults.totalSuggestions,
        disclosedCount: validationResults.disclosedCount, 
        keepCount: validationResults.keepCount,
        validationSummary: validationResults.validationSummary,
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

      // Get validation summary from examinerData if not in validationResults
      const validationSummary = validationResults.validationSummary || 
        (examinerData && 'validationSummary' in examinerData ? examinerData.validationSummary : undefined);

      return {
        totalSuggestions,
        disclosedCount,
        keepCount,
        validationSummary,
      };
    }

    return undefined;
  })();

  logger.debug('[DeepAnalysisPanel] Calculated validation metrics:', {
    calculatedValidationMetrics,
    hasDetailedValidation: validationResults ? Object.keys(validationResults).filter(key => 
      key !== 'validationSummary' && 
      typeof validationResults[key] === 'object' && 
      validationResults[key] !== null
    ).length : 0,
  });

  return (
    <div className="flex flex-col gap-6 w-full px-2">
      {/* Header section */}
      <div>
        <h3
          className={cn(
            'text-lg font-medium mb-2',
            isDarkMode ? 'text-gray-200' : 'text-gray-900'
          )}
        >
          USPTO Examiner Analysis
          {hasValidation && (
            <Badge className="ml-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
              ✓ Validated
            </Badge>
          )}
        </h3>

        {isStructuredFormat && examinerData && (
          <p
            className={cn(
              'text-sm leading-relaxed',
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            )}
          >
            {examinerData.overallAssessment.summary}
          </p>
        )}
      </div>

      {/* Overall Relevance Section */}
      <OverallRelevanceSection
        relevanceData={relevanceData}
        examinerData={examinerData}
        isStructuredFormat={isStructuredFormat}
      />

      <Separator
        className={cn(isDarkMode ? 'border-gray-700' : 'border-gray-200')}
      />

      {/* Element Analysis Section */}
      <ElementAnalysisAccordion
        analysisData={processedData}
        examinerData={examinerData}
        isStructuredFormat={isStructuredFormat}
      />

      <Separator
        className={cn(isDarkMode ? 'border-gray-700' : 'border-gray-200')}
      />

      {/* Holistic Analysis Section */}
      {isStructuredFormat && examinerData && examinerData.holisticAnalysis && (
        <>
          <HolisticAnalysisSection
            examinerData={examinerData}
            onApplyAmendment={onApplyAmendment}
          />
        </>
      )}
    </div>
  );
};

export default DeepAnalysisPanel;
