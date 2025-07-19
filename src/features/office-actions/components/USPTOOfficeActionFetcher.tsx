import React, { useState } from 'react';
import { Search, Download, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/useToastWrapper';
import { logger } from '@/utils/clientLogger';
import {
  useUSPTOOfficeActions,
  useProcessUSPTODocument,
} from '@/hooks/api/useUSPTO';
import { OFFICE_ACTION_CODES } from '@/lib/api/uspto/types';
import { formatDate } from '@/utils/formatters';
import { MinimalSpinner } from '@/components/common/MinimalSpinner';

interface USPTOOfficeActionFetcherProps {
  projectId: string;
  onFetchComplete?: (officeActionId: string) => void;
  disabled?: boolean;
}

/**
 * USPTO Office Action Fetcher Component
 * Allows users to search and import Office Actions directly from USPTO
 */
export const USPTOOfficeActionFetcher: React.FC<USPTOOfficeActionFetcherProps> = ({
  projectId,
  onFetchComplete,
  disabled = false,
}) => {
  const toast = useToast();
  const [applicationNumber, setApplicationNumber] = useState('');
  const [showResults, setShowResults] = useState(false);

  // Clean application number for display (e.g., 13937148 -> 13/937,148)
  const formatApplicationNumber = (appNum: string) => {
    const clean = appNum.replace(/[^\d]/g, '');
    if (clean.length >= 8) {
      return `${clean.slice(0, 2)}/${clean.slice(2, 5)},${clean.slice(5)}`;
    }
    return appNum;
  };

  // USPTO data fetching
  const {
    data: officeActionsData,
    isLoading,
    error,
    refetch,
  } = useUSPTOOfficeActions(
    showResults ? applicationNumber : null,
    { includeDocumentContent: false }
  );

  // Document processing mutation
  const processDocument = useProcessUSPTODocument();

  // Handle search
  const handleSearch = () => {
    if (!applicationNumber.trim()) {
      toast.error('Please enter an application number');
      return;
    }
    
    logger.info('[USPTOFetcher] Searching for Office Actions', {
      applicationNumber,
      projectId,
    });
    
    setShowResults(true);
    refetch();
  };

  // Handle import
  const handleImport = async (documentId: string, metadata: any) => {
    try {
      logger.info('[USPTOFetcher] Importing Office Action', {
        documentId,
        projectId,
        metadata,
      });

      const result = await processDocument.mutateAsync({
        documentId,
        projectId,
      });

      logger.info('[USPTOFetcher] Import successful', {
        jobId: result.jobId,
      });

      toast.success('Office Action import started');
      
      if (onFetchComplete) {
        onFetchComplete(result.jobId);
      }
    } catch (error) {
      logger.error('[USPTOFetcher] Import failed', { error });
      toast.error('Failed to import Office Action');
    }
  };

  // Get document type badge color
  const getDocumentBadgeVariant = (documentCode: string) => {
    switch (documentCode) {
      case OFFICE_ACTION_CODES.NON_FINAL_REJECTION:
        return 'default';
      case OFFICE_ACTION_CODES.FINAL_REJECTION:
        return 'destructive';
      case OFFICE_ACTION_CODES.NOTICE_OF_ALLOWANCE:
        return 'success';
      default:
        return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Fetch from USPTO
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search input */}
        <div className="space-y-2">
          <Label htmlFor="app-number">Application Number</Label>
          <div className="flex gap-2">
            <Input
              id="app-number"
              placeholder="e.g., 13/937,148 or 13937148"
              value={applicationNumber}
              onChange={(e) => setApplicationNumber(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              disabled={disabled || isLoading}
            />
            <Button
              onClick={handleSearch}
              disabled={disabled || isLoading || !applicationNumber.trim()}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Search
            </Button>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to fetch Office Actions. Please check the application number and try again.
            </AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {showResults && officeActionsData && (
          <div className="space-y-3">
            {/* Application info */}
            {officeActionsData.applicationData && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium">{officeActionsData.applicationData.title}</p>
                {officeActionsData.applicationData.examinerName && (
                  <p>Examiner: {officeActionsData.applicationData.examinerName}</p>
                )}
              </div>
            )}

            {/* Office Actions list */}
            {officeActionsData.officeActions.length === 0 ? (
              <Alert>
                <AlertDescription>
                  No Office Actions found for application {formatApplicationNumber(applicationNumber)}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Found {officeActionsData.officeActions.length} Office Action(s)
                </p>
                {officeActionsData.officeActions.map((oa) => (
                  <div
                    key={oa.documentId}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{oa.description}</span>
                          <Badge variant={getDocumentBadgeVariant(oa.documentCode)}>
                            {oa.documentCode}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Mailed: {formatDate(oa.mailDate)}
                          {oa.pageCount && ` • ${oa.pageCount} pages`}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleImport(oa.documentId, {
                        documentCode: oa.documentCode,
                        description: oa.description,
                        mailDate: oa.mailDate,
                        applicationNumber,
                      })}
                      disabled={disabled || processDocument.isPending}
                    >
                      {processDocument.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      Import
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Info text */}
        <div className="text-xs text-muted-foreground">
          <p>Search for Office Actions by entering a US patent application number.</p>
          <p>Office Actions will be automatically downloaded and processed.</p>
        </div>
      </CardContent>
    </Card>
  );
};