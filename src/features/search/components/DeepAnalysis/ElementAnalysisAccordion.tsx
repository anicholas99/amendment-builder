/**
 * Element Analysis Accordion Component
 *
 * Displays element-by-element rejection analysis in an accordion format.
 * Single responsibility: Element analysis display and interaction.
 */

import React, { useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  FiInfo,
  FiCheckCircle,
  FiCornerUpRight,
  FiChevronDown,
  FiCheck,
} from 'react-icons/fi';
import { useTimeout } from '@/hooks/useTimeout';
import { useThemeContext } from '@/contexts/ThemeContext';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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

interface ElementAnalysisAccordionProps {
  analysisData: ParsedDeepAnalysis | StructuredDeepAnalysis;
  examinerData?: ExaminerStructuredDeepAnalysis | null;
  isStructuredFormat: boolean;
  defaultExpanded?: boolean;
}

export const ElementAnalysisAccordion: React.FC<
  ElementAnalysisAccordionProps
> = ({
  analysisData,
  examinerData,
  isStructuredFormat,
  defaultExpanded = false,
}) => {
  const { isDarkMode } = useThemeContext();

  // Get elements to display - either from structured or legacy format
  let elements: string[] = [];

  if (isStructuredFormat && analysisData) {
    const structured = analysisData as StructuredDeepAnalysis;
    // Check if elementAnalysis exists
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
    // For legacy format, get all keys except known metadata keys
    const allKeys = Object.keys(analysisData as ParsedDeepAnalysis);
    // Filter out any keys that might be metadata or wrapper keys
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

  // Create refs for each accordion item
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [expandedIndices, setExpandedIndices] = useState<number[]>(
    defaultExpanded ? [0] : []
  );
  const [pendingScrollIndex, setPendingScrollIndex] = useState<number | null>(
    null
  );

  // Scroll handler using useCallback for performance
  const handleScrollToElement = useCallback((elementIndex: number) => {
    const element = itemRefs.current[elementIndex];
    if (!element) return;

    // Find the scrollable parent container by checking computed styles
    let scrollableParent: HTMLElement | null = element.parentElement;
    while (scrollableParent) {
      const computedStyle = window.getComputedStyle(scrollableParent);
      if (
        computedStyle.overflowY === 'auto' ||
        computedStyle.overflowY === 'scroll' ||
        computedStyle.overflow === 'auto' ||
        computedStyle.overflow === 'scroll'
      ) {
        break;
      }
      scrollableParent = scrollableParent.parentElement;
    }

    if (!scrollableParent) return;

    // Calculate position relative to the scrollable container
    const elementRect = element.getBoundingClientRect();
    const containerRect = scrollableParent.getBoundingClientRect();

    // Calculate the element's position relative to the container
    const relativeTop =
      elementRect.top - containerRect.top + scrollableParent.scrollTop;

    // Calculate center position
    const scrollPosition =
      relativeTop - containerRect.height / 2 + elementRect.height / 2;

    // Smooth scroll within the container
    scrollableParent.scrollTo({
      top: Math.max(0, scrollPosition),
      behavior: 'smooth',
    });
  }, []);

  // Use useTimeout for delayed scroll after accordion expansion
  useTimeout(
    () => {
      if (pendingScrollIndex !== null) {
        handleScrollToElement(pendingScrollIndex);
        setPendingScrollIndex(null);
      }
    },
    pendingScrollIndex !== null ? 150 : null
  );

  // Handle accordion change to scroll expanded item into view within its container
  const handleAccordionChange = (newExpandedIndices: number[]) => {
    // Find which index was newly expanded
    const newlyExpanded = newExpandedIndices.find(
      index => !expandedIndices.includes(index)
    );

    if (newlyExpanded !== undefined && itemRefs.current[newlyExpanded]) {
      setPendingScrollIndex(newlyExpanded);
    }

    setExpandedIndices(newExpandedIndices);
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

  return (
    <div>
      <div className="mb-4">
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
          Click on any element to see detailed analysis and citations
        </p>
      </div>

      {elements.length === 0 ? (
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
            No element analysis data available. The analysis data may be in an
            unexpected format.
          </p>
        </div>
      ) : (
        <Accordion
          type="multiple"
          className="w-full"
          defaultValue={defaultExpanded ? [`item-0`] : []}
        >
          {elements.map((element, index) => {
            // Get element analysis - either from structured or legacy format
            const elementData = isStructuredFormat
              ? (examinerData as ExaminerStructuredDeepAnalysis)
                  ?.elementAnalysis[element]
              : null;

            const analysisText = elementData
              ? elementData.analysis
              : (analysisData as ParsedDeepAnalysis)[element];

            // For legacy format, try to extract some key phrases to simulate key findings
            const keyFindings = elementData
              ? elementData.keyFindings
              : typeof analysisText === 'string'
                ? extractKeyPhrases(analysisText)
                : [];

            // Get rejection type if available
            const rejectionType =
              elementData &&
              (elementData as ExaminerElementAnalysis).rejectionType
                ? (elementData as ExaminerElementAnalysis).rejectionType
                : typeof analysisText === 'string'
                  ? determineRejectionType(analysisText)
                  : 'Not Rejected';

            // Generate a color based on the rejection type
            const elementColor = getRejectionColor(rejectionType);

            // Get primary citations
            const primaryCitations =
              elementData &&
              (elementData as ExaminerElementAnalysis).primaryCitations
                ? (elementData as ExaminerElementAnalysis).primaryCitations
                : [];

            return (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className={cn(
                  'border rounded-lg mb-3 shadow-sm',
                  isDarkMode ? 'border-gray-600' : 'border-gray-200'
                )}
                ref={el => {
                  itemRefs.current[index] = el;
                }}
              >
                <AccordionTrigger
                  className={cn(
                    'px-4 py-4 text-left rounded-lg hover:no-underline w-full',
                    'hover:bg-gray-50 dark:hover:bg-gray-700',
                    'data-[state=open]:bg-blue-50 dark:data-[state=open]:bg-gray-700'
                  )}
                >
                  <div className="flex w-full justify-between items-center gap-2 min-w-0">
                    <span
                      className={cn(
                        'font-semibold text-sm flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-left',
                        isDarkMode ? 'text-gray-200' : 'text-gray-900'
                      )}
                      title={element}
                    >
                      {element}
                    </span>
                    {elementData && (
                      <div className="flex-shrink-0">
                        <Badge
                          className={cn(
                            'text-xs px-2 whitespace-nowrap inline-flex items-center',
                            getRejectionBadgeClasses(
                              rejectionType || 'Not Rejected'
                            )
                          )}
                        >
                          <FiInfo className="w-3 h-3 mr-1 flex-shrink-0" />
                          <span>
                            {rejectionType}
                            {elementData.relevanceScore !== undefined &&
                              ` (${Math.round(elementData.relevanceScore * 100)}%)`}
                          </span>
                        </Badge>
                      </div>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pt-4 px-4">
                  <div className="flex flex-col space-y-4">
                    <div>
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

                    {/* If we have rejection rationale, display it */}
                    {elementData &&
                      (elementData as ExaminerElementAnalysis)
                        .rejectionRationale &&
                      (elementData as ExaminerElementAnalysis)
                        .rejectionRationale !==
                        (typeof analysisText === 'string'
                          ? analysisText
                          : JSON.stringify(analysisText)) && (
                        <div
                          className={cn(
                            'p-4 rounded-md border-l-4 border-orange-400',
                            isDarkMode ? 'bg-orange-900/30' : 'bg-orange-50'
                          )}
                        >
                          <p
                            className={cn(
                              'font-semibold text-sm mb-2',
                              isDarkMode ? 'text-orange-300' : 'text-orange-700'
                            )}
                          >
                            Rejection Rationale
                          </p>
                          <p
                            className={cn(
                              'text-sm leading-relaxed',
                              isDarkMode ? 'text-gray-300' : 'text-gray-900'
                            )}
                          >
                            {
                              (elementData as ExaminerElementAnalysis)
                                .rejectionRationale
                            }
                          </p>
                        </div>
                      )}

                    {/* Display primary citations if available */}
                    {primaryCitations && primaryCitations.length > 0 && (
                      <div>
                        <p
                          className={cn(
                            'font-semibold text-sm mb-2',
                            isDarkMode ? 'text-gray-300' : 'text-gray-900'
                          )}
                        >
                          Key Citations
                        </p>
                        <div className="flex flex-col space-y-3">
                          {primaryCitations.map((citation, i) => (
                            <div
                              key={i}
                              className={cn(
                                'p-4 rounded-md w-full border-l-3 border-blue-400',
                                isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'
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
                                  &ldquo;{citation.citationText}&rdquo;
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

                    {keyFindings && keyFindings.length > 0 && (
                      <div>
                        <p
                          className={cn(
                            'font-semibold text-sm mb-2',
                            isDarkMode ? 'text-gray-300' : 'text-gray-900'
                          )}
                        >
                          Key Findings
                        </p>
                        <div className="space-y-2">
                          {keyFindings.map((finding, i) => (
                            <div key={i} className="text-sm flex items-start">
                              <div className="mr-2 mt-1">
                                <FiCheckCircle
                                  className="w-4 h-4"
                                  style={{ color: elementColor }}
                                />
                              </div>
                              <p
                                className={cn(
                                  'leading-relaxed',
                                  isDarkMode ? 'text-gray-300' : 'text-gray-900'
                                )}
                              >
                                {finding}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
};
