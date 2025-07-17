/**
 * Element Analysis Table Component
 *
 * Displays element-by-element rejection analysis in a table format with expandable rows.
 * Provides a more efficient way to scan all elements at once.
 */

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  FiInfo,
  FiCheckCircle,
  FiCornerUpRight,
  FiChevronDown,
  FiChevronUp,
  FiMaximize2,
  FiMinimize2,
} from 'react-icons/fi';
import { useThemeContext } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ParsedDeepAnalysis,
  StructuredDeepAnalysis,
  ExaminerStructuredDeepAnalysis,
  ExaminerElementAnalysis,
  RejectionType,
} from '../../types/deepAnalysis';
import {
  extractKeyPhrases,
  getRejectionColor,
  getRejectionScheme,
  determineRejectionType,
} from '../../utils/deepAnalysisUtils';

interface ElementAnalysisTableProps {
  analysisData: ParsedDeepAnalysis | StructuredDeepAnalysis;
  examinerData?: ExaminerStructuredDeepAnalysis | null;
  isStructuredFormat: boolean;
}

export const ElementAnalysisTable: React.FC<ElementAnalysisTableProps> = ({
  analysisData,
  examinerData,
  isStructuredFormat,
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [showAllDetails, setShowAllDetails] = useState(false);
  const { isDarkMode } = useThemeContext();

  // Get elements to display
  let elements: string[] = [];
  if (isStructuredFormat && analysisData) {
    const structured = analysisData as StructuredDeepAnalysis;
    if (
      structured.elementAnalysis &&
      typeof structured.elementAnalysis === 'object'
    ) {
      elements = Object.keys(structured.elementAnalysis);
    }
  } else if (
    analysisData &&
    typeof analysisData === 'object' &&
    !Array.isArray(analysisData)
  ) {
    const allKeys = Object.keys(analysisData as ParsedDeepAnalysis);
    elements = allKeys.filter(
      key =>
        ![
          'overallAssessment',
          'holisticAnalysis',
          'originalClaim',
          'revisedClaim',
          'highRelevanceElements',
        ].includes(key)
    );
  }

  const toggleRow = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  const toggleAllRows = () => {
    if (showAllDetails) {
      setExpandedRows(new Set());
      setShowAllDetails(false);
    } else {
      setExpandedRows(new Set(elements.map((_, i) => i)));
      setShowAllDetails(true);
    }
  };

  // Map rejection type to badge color classes
  const getRejectionBadgeClasses = (rejectionType: string) => {
    const scheme = getRejectionScheme(rejectionType as RejectionType);
    const colorMap: Record<string, string> = {
      red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      orange:
        'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      yellow:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      green:
        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      gray: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
    };
    return colorMap[scheme] || colorMap.gray;
  };

  // Get relevance score badge color
  const getScoreBadgeClass = (score: number) => {
    if (score > 0.7)
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    if (score > 0.4)
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
  };

  if (elements.length === 0) {
    return (
      <div
        className={cn(
          'p-4 rounded-md text-center',
          isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
        )}
      >
        <p
          className={cn(
            'text-sm',
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          )}
        >
          No element analysis data available.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3
            className={cn(
              'text-sm font-semibold mb-1',
              isDarkMode ? 'text-gray-200' : 'text-gray-900'
            )}
          >
            Element-by-Element Rejection Analysis
          </h3>
          <p
            className={cn(
              'text-xs',
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            )}
          >
            Overview of all elements with expandable details
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={toggleAllRows}
          className="flex items-center gap-2"
        >
          {showAllDetails ? (
            <FiMinimize2 className="w-4 h-4" />
          ) : (
            <FiMaximize2 className="w-4 h-4" />
          )}
          {showAllDetails ? 'Collapse All' : 'Expand All'}
        </Button>
      </div>

      <div
        className={cn(
          'overflow-x-auto border rounded-lg',
          isDarkMode ? 'border-gray-600' : 'border-gray-200'
        )}
      >
        <table className="w-full text-sm">
          <thead className={cn(isDarkMode ? 'bg-gray-800' : 'bg-gray-50')}>
            <tr>
              <th
                className={cn(
                  'w-2/5 px-3 py-2 text-left font-medium',
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                )}
              >
                Element
              </th>
              <th
                className={cn(
                  'w-1/4 px-3 py-2 text-left font-medium',
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                )}
              >
                Rejection Type
              </th>
              <th
                className={cn(
                  'w-[15%] px-3 py-2 text-right font-medium',
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                )}
              >
                Score
              </th>
              <th
                className={cn(
                  'w-1/5 px-3 py-2 text-center font-medium',
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                )}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {elements.map((element, index) => {
              const elementData = isStructuredFormat
                ? (examinerData as ExaminerStructuredDeepAnalysis)
                    ?.elementAnalysis[element]
                : null;

              const analysisText = elementData
                ? elementData.analysis
                : (analysisData as ParsedDeepAnalysis)[element];

              const keyFindings = elementData
                ? elementData.keyFindings
                : typeof analysisText === 'string'
                  ? extractKeyPhrases(analysisText)
                  : [];

              const rejectionType =
                elementData &&
                (elementData as ExaminerElementAnalysis).rejectionType
                  ? (elementData as ExaminerElementAnalysis).rejectionType
                  : typeof analysisText === 'string'
                    ? determineRejectionType(analysisText)
                    : 'Not Rejected';

              const isExpanded = expandedRows.has(index);

              return (
                <React.Fragment key={index}>
                  <tr
                    className={cn(
                      'cursor-pointer border-b',
                      isDarkMode
                        ? 'border-gray-600 hover:bg-gray-700'
                        : 'border-gray-200 hover:bg-gray-50'
                    )}
                    onClick={() => toggleRow(index)}
                  >
                    <td className="px-3 py-2">
                      <p className="font-medium text-sm">{element}</p>
                    </td>
                    <td className="px-3 py-2">
                      <Badge
                        className={cn(
                          'text-xs',
                          getRejectionBadgeClasses(
                            rejectionType || 'Not Rejected'
                          )
                        )}
                      >
                        <FiInfo className="w-3 h-3 mr-1" />
                        {rejectionType}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-right">
                      {elementData &&
                        elementData.relevanceScore !== undefined && (
                          <Badge
                            className={cn(
                              'text-xs',
                              getScoreBadgeClass(elementData.relevanceScore)
                            )}
                          >
                            {Math.round(elementData.relevanceScore * 100)}%
                          </Badge>
                        )}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={e => {
                          e.stopPropagation();
                          toggleRow(index);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        {isExpanded ? (
                          <FiChevronUp className="w-4 h-4" />
                        ) : (
                          <FiChevronDown className="w-4 h-4" />
                        )}
                        <span className="sr-only">
                          {isExpanded ? 'Collapse' : 'Expand'}
                        </span>
                      </Button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={4} className="p-0">
                        <div
                          className={cn(
                            'p-4 border-t',
                            isDarkMode
                              ? 'bg-gray-800 border-gray-600'
                              : 'bg-gray-50 border-gray-200'
                          )}
                        >
                          <div className="flex flex-col space-y-4">
                            {/* Analysis Text */}
                            <div>
                              <p className="text-sm font-semibold mb-2">
                                Analysis
                              </p>
                              <p
                                className={cn(
                                  'text-sm leading-relaxed',
                                  isDarkMode ? 'text-gray-300' : 'text-gray-900'
                                )}
                              >
                                {typeof analysisText === 'string'
                                  ? analysisText
                                  : JSON.stringify(analysisText)}
                              </p>
                            </div>

                            {/* Rejection Rationale */}
                            {elementData &&
                              (elementData as ExaminerElementAnalysis)
                                .rejectionRationale && (
                                <div
                                  className={cn(
                                    'p-4 rounded-md border-l-4 border-orange-400',
                                    isDarkMode
                                      ? 'bg-orange-900/30'
                                      : 'bg-orange-50'
                                  )}
                                >
                                  <p
                                    className={cn(
                                      'font-semibold text-sm mb-2',
                                      isDarkMode
                                        ? 'text-orange-300'
                                        : 'text-orange-700'
                                    )}
                                  >
                                    Rejection Rationale
                                  </p>
                                  <p
                                    className={cn(
                                      'text-sm leading-relaxed',
                                      isDarkMode
                                        ? 'text-gray-300'
                                        : 'text-gray-900'
                                    )}
                                  >
                                    {
                                      (elementData as ExaminerElementAnalysis)
                                        .rejectionRationale
                                    }
                                  </p>
                                </div>
                              )}

                            {/* Primary Citations */}
                            {elementData &&
                              ((elementData as ExaminerElementAnalysis)
                                .primaryCitations?.length ?? 0) > 0 && (
                                <div
                                  className={cn(
                                    'p-4 rounded-md border-l-4 border-blue-400',
                                    isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'
                                  )}
                                >
                                  <p
                                    className={cn(
                                      'font-semibold text-sm mb-3',
                                      isDarkMode
                                        ? 'text-blue-300'
                                        : 'text-blue-700'
                                    )}
                                  >
                                    Primary Citations
                                  </p>
                                  <div className="flex flex-col space-y-3">
                                    {(
                                      elementData as ExaminerElementAnalysis
                                    ).primaryCitations?.map((citation, i) => (
                                      <div
                                        key={i}
                                        className={cn(
                                          'p-3 rounded-md border',
                                          isDarkMode
                                            ? 'bg-gray-800 border-gray-600'
                                            : 'bg-white border-gray-200'
                                        )}
                                      >
                                        <div className="flex flex-col space-y-2">
                                          <p
                                            className={cn(
                                              'text-xs font-medium',
                                              isDarkMode
                                                ? 'text-blue-300'
                                                : 'text-blue-600'
                                            )}
                                          >
                                            {citation.location}
                                          </p>
                                          <p
                                            className={cn(
                                              'text-sm italic',
                                              isDarkMode
                                                ? 'text-gray-300'
                                                : 'text-gray-900'
                                            )}
                                          >
                                            &ldquo;{citation.citationText}
                                            &rdquo;
                                          </p>
                                          {citation.reasoning && (
                                            <p
                                              className={cn(
                                                'text-xs mt-1',
                                                isDarkMode
                                                  ? 'text-gray-400'
                                                  : 'text-gray-600'
                                              )}
                                            >
                                              <span className="font-medium">
                                                Relevance:
                                              </span>{' '}
                                              {citation.reasoning}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                            {/* Key Findings */}
                            {keyFindings.length > 0 && (
                              <div>
                                <p className="font-semibold text-sm mb-2">
                                  Key Findings
                                </p>
                                <div className="space-y-2">
                                  {keyFindings.map((finding, i) => (
                                    <div
                                      key={i}
                                      className="text-sm flex items-start"
                                    >
                                      <div className="mr-2 mt-1">
                                        <FiCheckCircle
                                          className="w-4 h-4"
                                          style={{
                                            color: getRejectionColor(
                                              rejectionType as any
                                            ),
                                          }}
                                        />
                                      </div>
                                      <p>{finding}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
