/**
 * Overall Relevance Section Component
 *
 * Displays overall relevance metrics and rejection determination.
 * Single responsibility: Overall analysis summary display.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { FiAlertCircle, FiEdit3, FiBookOpen } from 'react-icons/fi';
import { useThemeContext } from '@/contexts/ThemeContext';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  ExaminerStructuredDeepAnalysis,
  RelevanceCalculation,
} from '../../types/deepAnalysis';
import { getRejectionColor } from '../../utils/deepAnalysisUtils';

interface OverallRelevanceSectionProps {
  relevanceData: RelevanceCalculation | null;
  examinerData?: ExaminerStructuredDeepAnalysis | null;
  isStructuredFormat: boolean;
}

export const OverallRelevanceSection: React.FC<
  OverallRelevanceSectionProps
> = ({ relevanceData, examinerData, isStructuredFormat }) => {
  const { isDarkMode } = useThemeContext();

  // Handle null relevanceData
  if (!relevanceData) {
    return (
      <div className="mb-6">
        <p
          className={cn(
            'text-sm',
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          )}
        >
          No relevance data available
        </p>
      </div>
    );
  }

  const { score, level, color } = relevanceData;

  if (isStructuredFormat && examinerData) {
    return (
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <div
            className={cn(
              'p-4 rounded-lg border shadow-sm',
              isDarkMode
                ? 'bg-gray-800 border-gray-600'
                : 'bg-white border-gray-200'
            )}
          >
            <p
              className={cn(
                'text-xs font-medium mb-1',
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              )}
            >
              REJECTION DETERMINATION
            </p>
            <p
              className="text-2xl font-bold mb-1"
              style={{
                color: getRejectionColor(
                  examinerData.overallAssessment.overallRejection ||
                    'Not Rejected'
                ) as any,
              }}
            >
              {examinerData.overallAssessment.overallRejection ||
                'Not Rejected'}
            </p>
            <p
              className={cn(
                'text-sm',
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              )}
            >
              Patentability:{' '}
              {Math.round(
                examinerData.overallAssessment.patentabilityScore * 100
              )}
              %
            </p>
          </div>

          <div
            className={cn(
              'p-4 rounded-lg border shadow-sm',
              isDarkMode
                ? 'bg-gray-800 border-gray-600'
                : 'bg-white border-gray-200'
            )}
          >
            <p
              className={cn(
                'text-xs font-medium mb-3',
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              )}
            >
              REJECTION BASIS
            </p>
            <div className="space-y-2 text-sm">
              {examinerData.overallAssessment.keyConcerns.map((concern, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex items-start',
                    isDarkMode ? 'text-gray-300' : 'text-gray-900'
                  )}
                >
                  <FiAlertCircle className="w-4 h-4 text-orange-500 mt-1 mr-2 flex-shrink-0" />
                  <p className="leading-relaxed">{concern}</p>
                </div>
              ))}
            </div>
          </div>

          <div
            className={cn(
              'p-4 rounded-lg border shadow-sm',
              isDarkMode
                ? 'bg-gray-800 border-gray-600'
                : 'bg-white border-gray-200'
            )}
          >
            <p
              className={cn(
                'text-xs font-medium mb-3',
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              )}
            >
              STRATEGIC RECOMMENDATIONS
            </p>
            <div className="space-y-2 text-sm">
              {examinerData.overallAssessment.strategicRecommendations.map(
                (suggestion, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex items-start',
                      isDarkMode ? 'text-gray-300' : 'text-gray-900'
                    )}
                  >
                    <FiEdit3 className="w-4 h-4 text-blue-500 mt-1 mr-2 flex-shrink-0" />
                    <p className="leading-relaxed">{suggestion}</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Office Action Style Rejection Summary */}
        {examinerData.overallAssessment.rejectionSummary && (
          <div
            className={cn(
              'mt-4 p-4 rounded-lg border-l-4 border-blue-400',
              isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
            )}
          >
            <div className="flex items-center mb-2">
              <FiBookOpen className="w-4 h-4 mr-2 text-blue-500" />
              <p
                className={cn(
                  'text-sm font-semibold',
                  isDarkMode ? 'text-gray-200' : 'text-gray-900'
                )}
              >
                USPTO Office Action Summary
              </p>
            </div>
            <p
              className={cn(
                'text-sm leading-relaxed',
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              )}
            >
              {examinerData.overallAssessment.rejectionSummary}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Legacy format display
  const getBadgeColorClass = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'medium':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      default:
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    }
  };

  const getProgressColorClass = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-orange-500';
      default:
        return 'bg-green-500';
    }
  };

  return (
    <div className="mb-6">
      <h3
        className={cn(
          'text-xs font-semibold mb-3',
          isDarkMode ? 'text-gray-200' : 'text-gray-900'
        )}
      >
        Overall Reference Relevance
      </h3>
      <div className="flex items-center mb-3">
        <div className="w-full">
          <div
            className={cn(
              'w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700'
            )}
          >
            <div
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                getProgressColorClass(level)
              )}
              style={{ width: `${score * 100}%` }}
            />
          </div>
        </div>
        <div className="ml-4 min-w-[100px] text-right">
          <Badge
            className={cn('text-base px-2 py-1', getBadgeColorClass(level))}
          >
            {Math.round(score * 100)}% Match
          </Badge>
        </div>
      </div>
    </div>
  );
};
