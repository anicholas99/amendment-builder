import React from 'react';
import { AlertTriangle, BookOpen, FileText, Eye, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ParsedRejection, CitedReference } from '@/types/amendment';

interface RejectionViewerProps {
  rejections: ParsedRejection[];
  citedReferences?: CitedReference[];
  onAddressRejection?: (rejectionIndex: number) => void;
  onViewReference?: (patentNumber: string) => void;
  className?: string;
}

/**
 * Rejection Viewer Component
 * Displays parsed rejections from Office Actions with proper styling for each rejection type
 * Helps attorneys understand what needs to be addressed in the amendment response
 */
export const RejectionViewer: React.FC<RejectionViewerProps> = ({
  rejections,
  citedReferences = [],
  onAddressRejection,
  onViewReference,
  className,
}) => {
  // Get rejection type information
  const getRejectionInfo = React.useCallback((type: string) => {
    switch (type) {
      case '102':
        return {
          title: '§ 102 - Anticipation',
          description: 'Prior art anticipates the claimed invention',
          icon: <BookOpen className="h-4 w-4" />,
          variant: 'destructive' as const,
          bgColor: 'bg-red-50 dark:bg-red-950/20',
          borderColor: 'border-red-200 dark:border-red-800',
        };
      case '103':
        return {
          title: '§ 103 - Obviousness',
          description: 'The claimed invention would be obvious',
          icon: <Lightbulb className="h-4 w-4" />,
          variant: 'secondary' as const,
          bgColor: 'bg-orange-50 dark:bg-orange-950/20',
          borderColor: 'border-orange-200 dark:border-orange-800',
        };
      case '101':
        return {
          title: '§ 101 - Subject Matter Eligibility',
          description: 'Claims are directed to non-patentable subject matter',
          icon: <AlertTriangle className="h-4 w-4" />,
          variant: 'destructive' as const,
          bgColor: 'bg-purple-50 dark:bg-purple-950/20',
          borderColor: 'border-purple-200 dark:border-purple-800',
        };
      case '112':
        return {
          title: '§ 112 - Written Description/Enablement',
          description: 'Specification does not adequately describe or enable the invention',
          icon: <FileText className="h-4 w-4" />,
          variant: 'default' as const,
          bgColor: 'bg-blue-50 dark:bg-blue-950/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
        };
      default:
        return {
          title: `§ ${type} - Rejection`,
          description: 'Examiner rejection',
          icon: <AlertTriangle className="h-4 w-4" />,
          variant: 'outline' as const,
          bgColor: 'bg-gray-50 dark:bg-gray-950/20',
          borderColor: 'border-gray-200 dark:border-gray-800',
        };
    }
  }, []);

  // Format claim numbers for display
  const formatClaimNumbers = React.useCallback((claimNumbers: string[]) => {
    if (claimNumbers.length === 0) return 'No claims specified';
    if (claimNumbers.length === 1) return `Claim ${claimNumbers[0]}`;
    if (claimNumbers.length <= 3) return `Claims ${claimNumbers.join(', ')}`;
    return `Claims ${claimNumbers.slice(0, 3).join(', ')} and ${claimNumbers.length - 3} more`;
  }, []);

  // Find referenced patents
  const findReferencedPatents = React.useCallback((patentNumbers: string[]) => {
    return patentNumbers.map(patentNum => {
      const reference = citedReferences.find(ref => 
        ref.patentNumber === patentNum || 
        ref.patentNumber.includes(patentNum) ||
        patentNum.includes(ref.patentNumber)
      );
      return reference || { patentNumber: patentNum };
    });
  }, [citedReferences]);

  if (rejections.length === 0) {
    return (
      <div className={cn('space-y-4', className)}>
        <h3 className="text-lg font-semibold">Rejections</h3>
        <Card>
          <CardContent className="p-6 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h4 className="text-sm font-medium mb-1">No Rejections Found</h4>
            <p className="text-xs text-muted-foreground">
              No rejections were parsed from this Office Action, or the document is still processing.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Rejections ({rejections.length})
        </h3>
        <Badge variant="outline" className="text-xs">
          Requires Response
        </Badge>
      </div>

      <div className="space-y-4">
        {rejections.map((rejection, index) => {
          const info = getRejectionInfo(rejection.type);
          const referencedPatents = findReferencedPatents(rejection.citedReferences);

          return (
            <Card
              key={index}
              className={cn(
                'border-l-4 transition-all duration-200',
                info.borderColor,
                info.bgColor
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="flex-shrink-0 mt-0.5">
                      {info.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base font-semibold mb-1">
                        {info.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mb-2">
                        {info.description}
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant={info.variant} className="text-xs">
                          {formatClaimNumbers(rejection.claimNumbers)}
                        </Badge>
                        {rejection.elements && rejection.elements.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {rejection.elements.length} element{rejection.elements.length > 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {onAddressRejection && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAddressRejection(index)}
                      className="flex-shrink-0"
                    >
                      Address
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Examiner Reasoning */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Examiner's Reasoning</h4>
                  <div className="text-sm text-muted-foreground bg-muted/50 rounded-md p-3">
                    {rejection.reasoning || 'No specific reasoning provided'}
                  </div>
                </div>

                {/* Cited References */}
                {referencedPatents.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">
                      Cited References ({referencedPatents.length})
                    </h4>
                    <div className="space-y-2">
                      {referencedPatents.map((patent, patentIndex) => (
                        <div
                          key={patentIndex}
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-md border"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <FileText className="h-3 w-3 flex-shrink-0" />
                              <span className="text-sm font-medium">
                                {patent.patentNumber}
                              </span>
                            </div>
                            {(patent as CitedReference).title && (
                              <p className="text-xs text-muted-foreground truncate">
                                {(patent as CitedReference).title}
                              </p>
                            )}
                            {(patent as CitedReference).inventors && (
                              <p className="text-xs text-muted-foreground">
                                {(patent as CitedReference).inventors}
                              </p>
                            )}
                          </div>
                          {onViewReference && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onViewReference(patent.patentNumber)}
                              className="flex-shrink-0"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Claim Elements (if available) */}
                {rejection.elements && rejection.elements.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">
                      Affected Claim Elements
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {rejection.elements.map((element, elementIndex) => (
                        <Badge
                          key={elementIndex}
                          variant="outline"
                          className="text-xs"
                        >
                          {element}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary */}
      <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold mb-1">Response Required</h4>
              <p className="text-xs text-muted-foreground">
                All {rejections.length} rejection{rejections.length > 1 ? 's' : ''} must be addressed 
                in your amendment response. Consider claim amendments, arguments, or both for each rejection.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 