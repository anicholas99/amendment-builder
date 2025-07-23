import React from 'react';
import { AlertTriangle, BookOpen, FileText, Eye, Lightbulb, Info, ChevronDown, ChevronRight, Scale, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { abbreviateClaimRanges } from '@/utils/claims';
import type { ParsedRejection, CitedReference } from '@/types/amendment';

interface RejectionViewerProps {
  rejections: ParsedRejection[];
  citedReferences?: CitedReference[];
  onAddressRejection?: (rejectionIndex: number) => void;
  onViewReference?: (patentNumber: string) => void;
  className?: string;
}

/**
 * Enhanced Rejection Viewer Component
 * Now displays GPT's detailed legal analysis including:
 * - Specific rejection classifications (e.g., "§112(b) indefiniteness")
 * - Legal reasoning insights about examiner errors
 * - Confidence indicators for quality control
 * - Full legal basis citations
 */
export const RejectionViewer: React.FC<RejectionViewerProps> = ({
  rejections,
  citedReferences = [],
  onAddressRejection,
  onViewReference,
  className,
}) => {
  const [expandedInsights, setExpandedInsights] = React.useState<Record<string, boolean>>({});

  // Toggle insights panel for a rejection
  const toggleInsights = React.useCallback((rejectionId: string) => {
    setExpandedInsights(prev => ({
      ...prev,
      [rejectionId]: !prev[rejectionId]
    }));
  }, []);

  // Get rejection type information with enhanced display
  const getRejectionInfo = React.useCallback((rejection: ParsedRejection) => {
    const baseConfig = (() => {
      switch (rejection.type) {
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
            description: 'Claims lack adequate written description or enablement',
            icon: <FileText className="h-4 w-4" />,
            variant: 'secondary' as const,
            bgColor: 'bg-blue-50 dark:bg-blue-950/20',
            borderColor: 'border-blue-200 dark:border-blue-800',
          };
        default:
          return {
            title: 'Other Rejection',
            description: 'Other type of rejection',
            icon: <AlertTriangle className="h-4 w-4" />,
            variant: 'outline' as const,
            bgColor: 'bg-gray-50 dark:bg-gray-950/20',
            borderColor: 'border-gray-200 dark:border-gray-800',
          };
      }
    })();

    // Enhanced with GPT's specific classification if available
    if (rejection.rawType && rejection.rawType !== rejection.type) {
      return {
        ...baseConfig,
        title: rejection.rawType, // Use GPT's specific classification
        specificCategory: rejection.rejectionCategory,
        legalBasis: rejection.legalBasis,
      };
    }

    return baseConfig;
  }, []);

  // Get confidence indicator
  const getConfidenceIndicator = React.useCallback((confidence?: number) => {
    if (!confidence) return null;
    
    const level = confidence >= 0.9 ? 'high' : confidence >= 0.7 ? 'medium' : 'low';
    const colors = {
      high: 'bg-green-100 text-green-800 border-green-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
      low: 'bg-red-100 text-red-800 border-red-200'
    };
    
    return (
      <Tooltip>
        <TooltipTrigger>
          <Badge variant="outline" className={cn('text-xs', colors[level])}>
            {Math.round(confidence * 100)}% confidence
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>GPT's confidence in this classification</p>
        </TooltipContent>
      </Tooltip>
    );
  }, []);

  if (!rejections?.length) {
    return (
      <div className={cn('p-6 text-center text-muted-foreground', className)}>
        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">No Rejections Found</h3>
        <p>This Office Action contains no rejections to review.</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={cn('space-y-4', className)}>
        {rejections.map((rejection, index) => {
          const info = getRejectionInfo(rejection);
          const hasInsights = rejection.reasoningInsights && rejection.reasoningInsights.length > 0;
          const hasEnhancedData = rejection.rawType || rejection.rejectionCategory || rejection.legalBasis;
          
          return (
            <Card
              key={rejection.id || index}
              className={cn(
                'transition-all duration-200 hover:shadow-md',
                info.bgColor,
                info.borderColor,
                rejection.requiresHumanReview && 'ring-2 ring-amber-200 ring-offset-2'
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex-shrink-0 mt-0.5">
                      {info.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-base font-semibold">
                          {info.title}
                        </CardTitle>
                        {rejection.requiresHumanReview && (
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                Review Required
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Complex case requiring human review</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {getConfidenceIndicator(rejection.classificationConfidence)}
                      </div>
                      
                      {/* Enhanced classification details */}
                      {hasEnhancedData && (
                        <div className="text-sm text-muted-foreground space-y-1">
                          {rejection.rejectionCategory && (
                            <div className="flex items-center gap-2">
                              <Target className="h-3 w-3" />
                              <span className="font-medium">Category:</span>
                              <span>{rejection.rejectionCategory}</span>
                            </div>
                          )}
                          {rejection.legalBasis && (
                            <div className="flex items-center gap-2">
                              <Scale className="h-3 w-3" />
                              <span className="font-medium">Legal Basis:</span>
                              <span>{rejection.legalBasis}</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <p className="text-sm text-muted-foreground mt-1">
                        {info.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={info.variant}>
                      Claims {abbreviateClaimRanges(rejection.claims)}
                    </Badge>
                    {onAddressRejection && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAddressRejection(index)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Address
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Examiner Reasoning */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Examiner's Reasoning:</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {rejection.examinerReasoning}
                  </p>
                </div>

                {/* Prior Art References */}
                {rejection.priorArtReferences?.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Prior Art References:</h4>
                    <div className="flex flex-wrap gap-2">
                      {rejection.priorArtReferences.map((ref, refIndex) => (
                        <Button
                          key={refIndex}
                          variant="outline"
                          size="sm"
                          onClick={() => onViewReference?.(ref)}
                          className="text-xs"
                        >
                          <BookOpen className="h-3 w-3 mr-1" />
                          {ref}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Legal Reasoning Insights - NEW */}
                {hasInsights && (
                  <div className="border-t pt-4">
                    <Collapsible
                      open={expandedInsights[rejection.id || index.toString()]}
                      onOpenChange={() => toggleInsights(rejection.id || index.toString())}
                    >
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-full justify-between p-0 h-auto">
                          <div className="flex items-center gap-2">
                            <Info className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium">Legal Analysis Insights</span>
                            <Badge variant="secondary" className="text-xs">
                              {rejection.reasoningInsights!.length}
                            </Badge>
                          </div>
                          {expandedInsights[rejection.id || index.toString()] ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-3">
                        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3">
                          <p className="text-xs text-blue-700 dark:text-blue-300 mb-2 font-medium">
                            GPT's Legal Analysis:
                          </p>
                          <ul className="space-y-2">
                            {rejection.reasoningInsights!.map((insight, insightIndex) => (
                              <li key={insightIndex} className="text-sm text-blue-900 dark:text-blue-100 flex items-start gap-2">
                                <span className="text-blue-500 mt-1">•</span>
                                <span>{insight}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                )}

                <Separator className="my-4" />
                
                {/* Action Buttons */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Affects {rejection.claims.length} claim{rejection.claims.length !== 1 ? 's' : ''}
                    {rejection.priorArtReferences?.length > 0 && 
                      ` • ${rejection.priorArtReferences.length} reference${rejection.priorArtReferences.length !== 1 ? 's' : ''}`
                    }
                  </span>
                  {hasEnhancedData && (
                    <span className="text-blue-600">Enhanced Analysis Available</span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </TooltipProvider>
  );
}; 