/**
 * Amendment Workspace Tabs - Four-tab interface for complete response workflow
 * 
 * 1. Analysis - Review rejections and strategy recommendations
 * 2. Claims - Simplified claims amendment interface
 * 3. Arguments - Draft responses to rejections
 * 4. Preview - Review formatted document before export
 */

import React, { useState, useCallback, useMemo } from 'react';
import { 
  FileSearch,
  Edit3,
  Eye,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Download,
  MessageSquare
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

// Import components
import { RejectionAnalysisPanel } from './RejectionAnalysisPanel';
import { SimplifiedClaimsTab } from './SimplifiedClaimsTab';
import { ArgumentsTab } from './ArgumentsTab';
import { ClaimsDocumentPreview } from './ClaimsDocumentPreview';
import { RemarksDocumentPreview } from './RemarksDocumentPreview';
import { useDraftDocumentByType } from '@/hooks/api/useDraftDocuments';
import { useToast } from '@/hooks/useToastWrapper';
import { AmendmentExportService } from '@/services/api/amendmentExportService';
import { logger } from '@/utils/clientLogger';
import type { OfficeAction } from '@/types/domain/amendment';
import type { 
  RejectionAnalysisResult,
  StrategyRecommendation 
} from '@/types/domain/rejection-analysis';

interface AmendmentWorkspaceTabsProps {
  projectId: string;
  selectedOfficeAction?: any;
  selectedOfficeActionId?: string | null;
  amendmentProjectId?: string | null;
  analyses?: RejectionAnalysisResult[] | null;
  overallStrategy?: StrategyRecommendation | null;
  isAnalyzing?: boolean;
  selectedRejectionId?: string | null;
  onSelectRejection?: (rejectionId: string) => void;
  onGenerateAmendment?: () => void;
  onSave?: (content: any) => Promise<void>;
  onAnalyzeRejections?: (forceRefresh?: boolean) => void;
  onTabChange?: (tab: string) => void;
  className?: string;
}

export function AmendmentWorkspaceTabs({
  projectId,
  selectedOfficeAction,
  selectedOfficeActionId,
  amendmentProjectId,
  analyses,
  overallStrategy,
  isAnalyzing = false,
  selectedRejectionId,
  onSelectRejection,
  onGenerateAmendment,
  onSave,
  onAnalyzeRejections,
  onTabChange,
  className,
}: AmendmentWorkspaceTabsProps) {
  const [activeTab, setActiveTab] = useState('analysis');

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
    onTabChange?.(value);
    logger.debug('[AmendmentWorkspaceTabs] Tab changed', { tab: value });
  }, [onTabChange]);

  // Calculate tab states
  const hasAnalysis = analyses && analyses.length > 0;
  const hasRejections = selectedOfficeAction?.rejections?.length > 0;
  const canAnalyze = hasRejections && selectedOfficeActionId;

  // Data fetching for preview
  const toast = useToast();
  const { data: claimsDraft } = useDraftDocumentByType(projectId, 'AMENDMENT_RESPONSE');
  const { data: argumentsDraft } = useDraftDocumentByType(projectId, 'ARGUMENTS');

  // Parse claims data
  const claimsData = useMemo(() => {
    if (!claimsDraft?.content) return [];
    try {
      const parsed = JSON.parse(claimsDraft.content);
      return parsed.claims || [];
    } catch {
      return [];
    }
  }, [claimsDraft]);

  // Parse arguments data
  const argumentsData = useMemo(() => {
    if (!argumentsDraft?.content) return [];
    try {
      const parsed = JSON.parse(argumentsDraft.content);
      return parsed.arguments || [];
    } catch {
      return [];
    }
  }, [argumentsDraft]);

  // Export handlers
  const handleExportClaims = useCallback(async () => {
    if (!selectedOfficeActionId || claimsData.length === 0) {
      toast.error({ 
        title: 'Export Failed', 
        description: 'No claims available to export' 
      });
      return;
    }

    try {
      toast.info({ title: 'Generating CLM Document...', description: 'Creating claims document' });
      
      const exportRequest = {
        projectId,
        officeActionId: selectedOfficeActionId,
        content: {
          title: 'Claim Amendments',
          responseType: 'AMENDMENT' as const,
          claimAmendments: claimsData,
          argumentSections: [], // Empty for CLM-only export
        },
        options: { format: 'docx' as const, documentType: 'CLM' }
      };

      await AmendmentExportService.exportAndDownload(exportRequest, {
        customFilename: `CLM_${selectedOfficeActionId}_${new Date().toISOString().split('T')[0]}.docx`,
        onExportComplete: () => {
          toast.success({ title: 'CLM Export Complete', description: 'Claims document downloaded successfully' });
        },
        onExportError: (error) => {
          toast.error({ title: 'CLM Export Failed', description: error.message });
        }
      });
    } catch (error) {
      toast.error({ 
        title: 'Export Failed', 
        description: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }, [projectId, selectedOfficeActionId, claimsData, toast]);

  const handleExportRemarks = useCallback(async () => {
    if (!selectedOfficeActionId || argumentsData.length === 0) {
      toast.error({ 
        title: 'Export Failed', 
        description: 'No remarks available to export' 
      });
      return;
    }

    try {
      toast.info({ title: 'Generating REM Document...', description: 'Creating remarks document' });
      
      const exportRequest = {
        projectId,
        officeActionId: selectedOfficeActionId,
        content: {
          title: 'Remarks',
          responseType: 'AMENDMENT' as const,
          claimAmendments: [], // Empty for REM-only export
          argumentSections: argumentsData,
        },
        options: { format: 'docx' as const, documentType: 'REM' }
      };

      await AmendmentExportService.exportAndDownload(exportRequest, {
        customFilename: `REM_${selectedOfficeActionId}_${new Date().toISOString().split('T')[0]}.docx`,
        onExportComplete: () => {
          toast.success({ title: 'REM Export Complete', description: 'Remarks document downloaded successfully' });
        },
        onExportError: (error) => {
          toast.error({ title: 'REM Export Failed', description: error.message });
        }
      });
    } catch (error) {
      toast.error({ 
        title: 'Export Failed', 
        description: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }, [projectId, selectedOfficeActionId, argumentsData, toast]);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4 rounded-none border-b bg-gray-50 flex-shrink-0">
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <FileSearch className="h-4 w-4" />
            Analysis
            {isAnalyzing && <Clock className="h-3 w-3 animate-pulse" />}
            {hasAnalysis && <CheckCircle2 className="h-3 w-3 text-green-600" />}
          </TabsTrigger>
          
          <TabsTrigger value="claims" className="flex items-center gap-2">
            <Edit3 className="h-4 w-4" />
            Claims
          </TabsTrigger>
          
          <TabsTrigger value="remarks" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Remarks
          </TabsTrigger>
          
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="flex-1 mt-0 overflow-hidden">
          {!selectedOfficeAction ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <FileSearch className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="font-medium mb-2">No Office Action Selected</h3>
                <p className="text-sm">Select an Office Action to begin analysis</p>
              </div>
            </div>
          ) : !hasRejections ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-400" />
                <h3 className="font-medium mb-2">No Rejections Found</h3>
                <p className="text-sm">This Office Action contains no rejections to analyze</p>
              </div>
            </div>
          ) : (
                         <RejectionAnalysisPanel
               analyses={analyses ?? null}
               overallStrategy={overallStrategy ?? null}
               isLoading={isAnalyzing}
               selectedRejectionId={selectedRejectionId}
               onSelectRejection={onSelectRejection}
               onGenerateAmendment={onGenerateAmendment}
             />
          )}
        </TabsContent>

        <TabsContent value="claims" className="flex-1 mt-0 overflow-hidden">
          {!selectedOfficeActionId ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Edit3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="font-medium mb-2">No Office Action Selected</h3>
                <p className="text-sm">Select an Office Action to work on claims</p>
              </div>
            </div>
          ) : (
            <SimplifiedClaimsTab
              projectId={projectId}
              officeActionId={selectedOfficeActionId}
              className="h-full"
            />
          )}
        </TabsContent>

        <TabsContent value="remarks" className="flex-1 mt-0 overflow-hidden">
          {!selectedOfficeActionId ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="font-medium mb-2">No Office Action Selected</h3>
                <p className="text-sm">Select an Office Action to draft remarks</p>
              </div>
            </div>
          ) : (
            <ArgumentsTab
              projectId={projectId}
              officeActionId={selectedOfficeActionId}
            />
          )}
        </TabsContent>

        <TabsContent value="preview" className="flex-1 mt-0 overflow-hidden">
          <div className="flex h-full">
            {/* REM Preview Panel */}
            <div className="flex-1 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b bg-gray-50 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Remarks Document (REM)
                  </h3>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={handleExportRemarks}
                      disabled={argumentsData.length === 0}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export REM
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {argumentsData.length} argument section{argumentsData.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex-1 overflow-auto">
                <RemarksDocumentPreview 
                  argumentSections={argumentsData}
                  responseType="AMENDMENT"
                  applicationNumber={selectedOfficeAction?.metadata?.applicationNumber}
                  examinerName={selectedOfficeAction?.metadata?.examinerName}
                  artUnit={selectedOfficeAction?.metadata?.artUnit}
                />
              </div>
            </div>

            {/* CLM Preview Panel */}
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b bg-gray-50 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Claims Document (CLM)
                  </h3>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={handleExportClaims}
                      disabled={claimsData.length === 0}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export CLM
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {claimsData.length} claim amendment{claimsData.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex-1 overflow-auto">
                <ClaimsDocumentPreview 
                  claimAmendments={claimsData}
                  applicationNumber={selectedOfficeAction?.metadata?.applicationNumber}
                  examinerName={selectedOfficeAction?.metadata?.examinerName}
                  artUnit={selectedOfficeAction?.metadata?.artUnit}
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}