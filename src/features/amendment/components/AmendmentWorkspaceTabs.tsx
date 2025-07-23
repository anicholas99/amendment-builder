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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

// Import components
import { RejectionAnalysisPanel } from './RejectionAnalysisPanel';
import { SimplifiedClaimsTab } from './SimplifiedClaimsTab';
import { ArgumentsTab } from './ArgumentsTab';
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
          
          <TabsTrigger value="arguments" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Arguments
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

        <TabsContent value="arguments" className="flex-1 mt-0 overflow-hidden">
          {!selectedOfficeActionId ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="font-medium mb-2">No Office Action Selected</h3>
                <p className="text-sm">Select an Office Action to draft arguments</p>
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
          <ScrollArea className="h-full">
            <div className="p-6">
              <div className="text-center py-12 text-gray-500">
                <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="font-medium mb-2">Preview Coming Soon</h3>
                <p className="text-sm">Document preview will be available once claims are generated</p>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}