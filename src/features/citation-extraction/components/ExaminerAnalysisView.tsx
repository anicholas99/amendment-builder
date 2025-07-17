import React from 'react';
import {
  AlertCircle,
  CheckCircle,
  Info,
  FileText,
  Shield,
  Target,
  Eye,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ExaminerAnalysisResult } from '@/types/domain/citation';

interface ExaminerAnalysisViewProps {
  analysis: ExaminerAnalysisResult;
  referenceNumber: string;
  onClose?: () => void;
}

export const ExaminerAnalysisView: React.FC<ExaminerAnalysisViewProps> = ({
  analysis,
  referenceNumber,
  onClose,
}) => {
  const [isStrategyOpen, setIsStrategyOpen] = React.useState(true);
  const [isElementsOpen, setIsElementsOpen] = React.useState(false);

  // Determine rejection severity
  const getRejectionSeverity = (type: string) => {
    switch (type) {
      case '102 Anticipation':
        return {
          color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
          icon: AlertCircle,
          alertVariant: 'destructive' as const,
        };
      case '103 Obviousness':
        return {
          color:
            'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
          icon: Info,
          alertVariant: 'default' as const,
        };
      case 'No Rejection':
        return {
          color:
            'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
          icon: CheckCircle,
          alertVariant: 'default' as const,
        };
      default:
        return {
          color:
            'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
          icon: Info,
          alertVariant: 'default' as const,
        };
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-start w-full">
                <div className="flex items-center space-x-3">
                  <FileText className="h-6 w-6" />
                  <h1 className="text-2xl font-semibold">
                    USPTO Examiner Analysis
                  </h1>
                </div>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200 text-base px-3 py-1"
                >
                  {referenceNumber}
                </Badge>
              </div>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>{analysis.referenceTitle}</span>
                <span>•</span>
                <span>Analysis Date: {formatDate(analysis.analysisDate)}</span>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Examiner Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Examiner Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-base leading-relaxed whitespace-pre-wrap text-foreground">
              {analysis.examinerSummary}
            </div>
          </CardContent>
        </Card>

        {/* Key Rejection Points */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <CardTitle className="text-lg">Key Rejection Analysis</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              {analysis.keyRejectionPoints.map((rejection, index) => {
                const severity = getRejectionSeverity(rejection.type);
                const Icon = severity.icon;

                return (
                  <Alert
                    key={index}
                    variant={
                      rejection.type === 'No Rejection'
                        ? 'default'
                        : severity.alertVariant
                    }
                    className={`border-l-4 ${
                      rejection.type === 'No Rejection'
                        ? 'border-l-green-400 bg-green-50 dark:bg-green-950/10'
                        : rejection.type === '102 Anticipation'
                          ? 'border-l-red-400 bg-red-50 dark:bg-red-950/10'
                          : 'border-l-orange-400 bg-orange-50 dark:bg-orange-950/10'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <div className="flex-1">
                      <AlertTitle className="mb-2">
                        <Badge className={severity.color}>
                          {rejection.type}
                        </Badge>
                      </AlertTitle>
                      <AlertDescription>
                        <div className="flex flex-col space-y-2">
                          <p className="text-sm">{rejection.rationale}</p>
                          {rejection.elements.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-semibold">
                                Elements:
                              </span>
                              {rejection.elements.map((element, i) => (
                                <Badge
                                  key={i}
                                  variant="outline"
                                  className="bg-blue-50 text-blue-700 border-blue-200"
                                >
                                  {element}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </AlertDescription>
                    </div>
                  </Alert>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Response Strategy */}
        <Card>
          <CardHeader>
            <Collapsible open={isStrategyOpen} onOpenChange={setIsStrategyOpen}>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <CardTitle className="text-lg">Response Strategy</CardTitle>
                </div>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    {isStrategyOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
                <CardContent className="pt-4">
                  <div className="flex flex-col space-y-4">
                    {/* Primary Argument */}
                    <div>
                      <h4 className="font-semibold mb-2">Primary Argument</h4>
                      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-400 rounded-md">
                        <p>{analysis.responseStrategy.primaryArgument}</p>
                      </div>
                    </div>

                    {/* Amendment Suggestions */}
                    {analysis.responseStrategy.amendmentSuggestions.length >
                      0 && (
                      <div>
                        <h4 className="font-semibold mb-2">
                          Recommended Amendments
                        </h4>
                        <ul className="space-y-2">
                          {analysis.responseStrategy.amendmentSuggestions.map(
                            (amendment, i) => (
                              <li key={i} className="text-sm flex items-start">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                <span>{amendment}</span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Key Distinctions */}
                    {analysis.responseStrategy.distinctionPoints.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Key Distinctions</h4>
                        <ul className="space-y-2">
                          {analysis.responseStrategy.distinctionPoints.map(
                            (point, i) => (
                              <li key={i} className="text-sm flex items-start">
                                <Info className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                                <span>{point}</span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </CardHeader>
        </Card>

        {/* Element-by-Element Comparison */}
        <Card>
          <CardHeader>
            <Collapsible open={isElementsOpen} onOpenChange={setIsElementsOpen}>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <CardTitle className="text-lg">
                    Element-by-Element Analysis
                  </CardTitle>
                </div>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    {isElementsOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
                <CardContent className="pt-4">
                  <Accordion type="multiple">
                    {analysis.elementComparisons.map((comparison, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left">
                          <span className="font-semibold text-sm">
                            {comparison.element}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <div className="flex flex-col space-y-3">
                            {/* Examiner View */}
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground mb-1">
                                Examiner's Assessment:
                              </p>
                              <p className="text-sm">
                                {comparison.examinerView}
                              </p>
                            </div>

                            {/* Top Citations */}
                            {comparison.topCitations.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground mb-2">
                                  Supporting Citations:
                                </p>
                                <div className="flex flex-col space-y-2">
                                  {comparison.topCitations.map(
                                    (citation, i) => (
                                      <div
                                        key={i}
                                        className="p-4 bg-muted/50 rounded-md text-sm"
                                      >
                                        <div className="flex justify-between items-center mb-1">
                                          <Badge
                                            variant="outline"
                                            className="bg-purple-50 text-purple-700 border-purple-200 text-xs"
                                          >
                                            {citation.location}
                                          </Badge>
                                          <Badge
                                            variant="outline"
                                            className="bg-green-50 text-green-700 border-green-200 text-xs"
                                          >
                                            {citation.relevance.toFixed(1)}%
                                            Match
                                          </Badge>
                                        </div>
                                        <p className="text-xs italic">
                                          "{citation.text}"
                                        </p>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};
