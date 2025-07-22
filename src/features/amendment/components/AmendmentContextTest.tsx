import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, AlertCircle, Brain, FileText } from 'lucide-react';
import { useAmendmentContext } from '@/hooks/api/useAmendmentContext';

interface AmendmentContextTestProps {
  projectId: string;
  className?: string;
}

/**
 * Test component to verify amendment context service is working
 * Shows which documents are available for AI processing
 */
export function AmendmentContextTest({ projectId, className }: AmendmentContextTestProps) {
  const { data, isLoading, error, refetch } = useAmendmentContext(projectId);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Checking amendment context...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center text-red-600 mb-4">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>Failed to load amendment context</span>
          </div>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const { context, summary } = data;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Brain className="h-5 w-5 mr-2 text-blue-600" />
          AI Amendment Context
        </CardTitle>
        <CardDescription>
          Documents available for AI amendment generation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Overview */}
        <div className="flex items-center gap-2">
          {summary.readyForAI ? (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Ready for AI
            </Badge>
          ) : (
            <Badge variant="secondary">
              <AlertCircle className="h-3 w-3 mr-1" />
              Missing Documents
            </Badge>
          )}
          <span className="text-sm text-gray-600">
            {context.metadata.ocrDocuments}/{context.metadata.totalDocuments} docs processed
          </span>
        </div>

        {/* Document Status */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center">
            <FileText className={`h-4 w-4 mr-2 ${summary.hasOfficeAction ? 'text-green-600' : 'text-gray-400'}`} />
            <span>Office Action</span>
            {summary.hasOfficeAction && <CheckCircle2 className="h-3 w-3 ml-auto text-green-600" />}
          </div>
          
          <div className="flex items-center">
            <FileText className={`h-4 w-4 mr-2 ${summary.hasClaims ? 'text-green-600' : 'text-gray-400'}`} />
            <span>Claims</span>
            {summary.hasClaims && <CheckCircle2 className="h-3 w-3 ml-auto text-green-600" />}
          </div>
          
          <div className="flex items-center">
            <FileText className={`h-4 w-4 mr-2 ${summary.hasSpecification ? 'text-green-600' : 'text-gray-400'}`} />
            <span>Specification</span>
            {summary.hasSpecification && <CheckCircle2 className="h-3 w-3 ml-auto text-green-600" />}
          </div>
          
          <div className="flex items-center">
            <FileText className={`h-4 w-4 mr-2 ${summary.hasLastResponse ? 'text-green-600' : 'text-gray-400'}`} />
            <span>Last Response</span>
            {summary.hasLastResponse && <CheckCircle2 className="h-3 w-3 ml-auto text-green-600" />}
          </div>
        </div>

        {/* Missing Documents */}
        {context.metadata.missingDocuments.length > 0 && (
          <div className="p-3 bg-yellow-50 rounded-lg">
            <div className="text-sm font-medium text-yellow-800 mb-1">
              Missing Documents:
            </div>
            <div className="text-sm text-yellow-700">
              {context.metadata.missingDocuments.join(', ')}
            </div>
          </div>
        )}

        {/* Document Details */}
        {(context.officeAction || context.claims || context.specification) && (
          <div className="space-y-2 pt-2 border-t">
            <div className="text-sm font-medium text-gray-700">Document Details:</div>
            
            {context.officeAction && (
              <div className="text-xs text-gray-600">
                Office Action ({context.officeAction.docCode}): {context.officeAction.text.length} chars
              </div>
            )}
            
            {context.claims && (
              <div className="text-xs text-gray-600">
                Claims ({context.claims.docCode}): {context.claims.text.length} chars
              </div>
            )}
            
            {context.specification && (
              <div className="text-xs text-gray-600">
                Specification ({context.specification.docCode}): {context.specification.text.length} chars
              </div>
            )}
          </div>
        )}

        {/* Test Button */}
        <Button 
          onClick={() => refetch()} 
          variant="outline" 
          size="sm" 
          className="w-full"
        >
          Refresh Context
        </Button>
      </CardContent>
    </Card>
  );
} 