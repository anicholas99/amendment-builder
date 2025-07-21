/**
 * Drafting Workspace - Enhanced center panel component for AmendmentStudio
 * 
 * Provides USPTO-compliant claim amendment editor with formatting,
 * argument sections, and live preview capabilities
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  FileEdit,
  MessageSquare,
  FileText,
  Eye,
  EyeOff,
  Download,
  Save,
  Undo,
  Redo,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  Plus,
  Trash2,
  Copy,
  CheckCircle2,
  AlertCircle,
  Clock,
  Lightbulb,
  History,
  X
} from 'lucide-react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/useToastWrapper';
import { AmendmentFileHistory } from './AmendmentFileHistory';
import ClaimDiffViewer from './ClaimDiffViewer';
import LegitimateClaimViewer from './LegitimateClaimViewer';
import { 
  useAmendmentProjectFiles, 
  useDeleteAmendmentProjectFile 
} from '@/hooks/api/useAmendmentProjectFiles';
import { AmendmentExportService } from '@/services/api/amendmentExportService';

// Types
interface ClaimAmendment {
  id: string;
  claimNumber: string;
  status: 'CURRENTLY_AMENDED' | 'PREVIOUSLY_PRESENTED' | 'NEW' | 'CANCELLED';
  originalText: string;
  amendedText: string;
  reasoning: string;
}

interface ArgumentSection {
  id: string;
  title: string;
  content: string;
  type: 'MAIN_ARGUMENT' | 'TECHNICAL_ARGUMENT' | 'LEGAL_ARGUMENT' | 'RESPONSE_TO_REJECTION';
  rejectionId?: string;
}

interface DraftingWorkspaceProps {
  projectId: string;
  selectedOfficeAction?: any;
  selectedOfficeActionId?: string | null;
  amendmentProjectId?: string;
  onSave?: (content: any) => void;
  onExport?: () => void;
  className?: string;
}

// Claim status configuration
const CLAIM_STATUS_CONFIG = {
  CURRENTLY_AMENDED: {
    label: 'Currently Amended',
    color: 'bg-blue-100 text-blue-700',
    prefix: '(Currently Amended)',
  },
  PREVIOUSLY_PRESENTED: {
    label: 'Previously Presented',
    color: 'bg-gray-100 text-gray-700',
    prefix: '(Previously Presented)',
  },
  NEW: {
    label: 'New',
    color: 'bg-green-100 text-green-700',
    prefix: '(New)',
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-700',
    prefix: '(Cancelled)',
  },
} as const;

export const DraftingWorkspace: React.FC<DraftingWorkspaceProps> = ({
  projectId,
  selectedOfficeAction,
  selectedOfficeActionId,
  amendmentProjectId,
  onSave,
  onExport,
  className,
}) => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('claims');
  
  // Fetch amendment project files
  const { 
    data: filesData, 
    isLoading: filesLoading, 
    error: filesError 
  } = useAmendmentProjectFiles(amendmentProjectId || '', {
    enabled: !!amendmentProjectId,
  });
  
  // Delete file mutation
  const deleteFileMutation = useDeleteAmendmentProjectFile();
  
  // Claims state - Initialize empty, to be populated from Office Action data
  const [claimAmendments, setClaimAmendments] = useState<ClaimAmendment[]>([]);

  // Arguments state - Initialize empty, to be populated based on actual rejections
  const [argumentSections, setArgumentSections] = useState<ArgumentSection[]>([]);

  // Load existing amendment data from database
  useEffect(() => {
    const loadAmendmentDraft = async () => {
      if (!projectId || !selectedOfficeAction) return;

      try {
        console.log('🔍 Loading amendment draft for project:', projectId);

        // Try to load existing amendment draft from the database
        let draftData = null;
        
        // First try with amendmentProjectId if provided
        if (amendmentProjectId) {
          const draftResponse = await fetch(`/api/projects/${projectId}/draft-documents?amendmentProjectId=${amendmentProjectId}`);
          if (draftResponse.ok) {
            draftData = await draftResponse.json();
            console.log('📄 Draft documents found with amendmentProjectId:', draftData.documents?.length || 0);
          }
        }
        
        // If no data found with amendmentProjectId, try loading all project drafts
        if (!draftData || !draftData.documents || draftData.documents.length === 0) {
          console.log('🔍 No docs found with amendmentProjectId, trying all project drafts...');
          const allDraftsResponse = await fetch(`/api/projects/${projectId}/draft-documents`);
          if (allDraftsResponse.ok) {
            draftData = await allDraftsResponse.json();
            console.log('📄 All draft documents found:', draftData.documents?.length || 0);
            
            // Log what types we found
            if (draftData.documents) {
              const types = draftData.documents.map((doc: any) => doc.type);
              console.log('📋 Document types found:', types);
            }
          }
        }
        
        if (draftData && draftData.documents) {
          // Look for existing claim amendments
          const claimsAmendmentDoc = draftData.documents?.find((doc: any) => doc.type === 'CLAIMS_AMENDMENTS');
          if (claimsAmendmentDoc && claimsAmendmentDoc.content) {
            try {
              const existingClaimAmendments = JSON.parse(claimsAmendmentDoc.content);
              setClaimAmendments(existingClaimAmendments);
              console.log('✅ Loaded existing claim amendments from database:', existingClaimAmendments.length);
            } catch (parseError) {
              console.warn('Failed to parse existing claim amendments:', parseError);
            }
          }

          // Look for existing argument sections
          const argumentsDoc = draftData.documents?.find((doc: any) => doc.type === 'ARGUMENTS_SECTION');
          if (argumentsDoc && argumentsDoc.content) {
            try {
              const existingArguments = JSON.parse(argumentsDoc.content);
              setArgumentSections(existingArguments);
              console.log('✅ Loaded existing arguments from database:', existingArguments.length);
            } catch (parseError) {
              console.warn('Failed to parse existing arguments:', parseError);
            }
          }

          // If we found existing data, we're done
          if (claimsAmendmentDoc || argumentsDoc) {
            console.log('✅ Successfully loaded existing amendment data');
            return;
          }
        }
      } catch (error) {
        console.warn('Failed to load existing amendment draft:', error);
      }

      // Fallback: Initialize from Office Action if no existing data found
      if (selectedOfficeAction && selectedOfficeAction.rejections.length > 0) {
        console.log('⚠️ No existing data found, creating placeholder amendments');
        
        // Create argument sections for each rejection
        const newArgumentSections = selectedOfficeAction.rejections.map((rejection: any, index: number) => ({
          id: `arg-${rejection.id}`,
          title: `Response to ${rejection.type} Rejection`,
          content: `Applicant respectfully traverses the ${rejection.type} rejection and submits that the claims are patentable for at least the following reasons:\n\n[AI-generated arguments will appear here when you use the AI Assistant]`,
          type: 'RESPONSE_TO_REJECTION' as const,
          rejectionId: rejection.id,
        }));

        setArgumentSections(newArgumentSections);

        // Create placeholder claim amendments for rejected claims  
        const rejectedClaims = new Set<string>();
        selectedOfficeAction.rejections.forEach((rejection: any) => {
          rejection.claims.forEach((claim: string) => rejectedClaims.add(claim));
        });

        const newClaimAmendments = Array.from(rejectedClaims).map(claimNumber => ({
          id: `claim-${claimNumber}`,
          claimNumber,
          status: 'CURRENTLY_AMENDED' as const,
          originalText: `[Original text for Claim ${claimNumber} - please add via project claims or AI Assistant]`,
          amendedText: `[Amended text for Claim ${claimNumber} - use AI Assistant for suggestions]`,
          reasoning: `[Amendment reasoning for Claim ${claimNumber} - use AI Assistant for suggestions]`,
        }));

        setClaimAmendments(newClaimAmendments);
        console.log('⚠️ Created placeholder claim amendments - no existing data found');
      }
    };

    loadAmendmentDraft();
  }, [selectedOfficeAction, amendmentProjectId, projectId]);

  // Document metadata
  const [documentTitle, setDocumentTitle] = useState('Amendment Response');
  const [responseType, setResponseType] = useState<'AMENDMENT' | 'CONTINUATION' | 'RCE'>('AMENDMENT');

  // Auto-save state
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Auto-save effect
  useEffect(() => {
    const timer = setInterval(() => {
      if (hasUnsavedChanges) {
        handleSave();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(timer);
  }, [hasUnsavedChanges]);

  // Handle save
  const handleSave = () => {
    const content = {
      title: documentTitle,
      responseType,
      claimAmendments,
      argumentSections,
      lastSaved: new Date(),
    };

    onSave?.(content);
    setLastSaved(new Date());
    setHasUnsavedChanges(false);

    toast.success({
      title: 'Draft Saved',
      description: 'Your amendment response has been saved',
    });
  };

  // Handle export
  const handleExport = async () => {
    handleSave(); // Save before export
    
    if (!selectedOfficeAction) {
      toast.error({
        title: 'Export Failed',
        description: 'No office action selected for export',
      });
      return;
    }

    try {
      // Prepare export request
      const exportRequest = {
        projectId,
        officeActionId: selectedOfficeAction.id,
        content: {
          title: documentTitle,
          responseType,
          claimAmendments,
          argumentSections,
        },
        options: {
          format: 'docx' as const,
          includeMetadata: true,
        },
      };

      toast.info({
        title: 'Generating Document',
        description: 'Creating USPTO-compliant amendment response...',
      });

      // Export and download using the new service
      await AmendmentExportService.exportAndDownload(exportRequest, {
        customFilename: AmendmentExportService.generateExportFilename(
          {
            applicationNumber: selectedOfficeAction.applicationNumber,
            mailingDate: selectedOfficeAction.mailingDate,
            examinerName: selectedOfficeAction.examinerName,
          },
          'docx'
        ),
                 onExportStart: () => {
           toast.info({
             title: 'Exporting Document',
             description: 'Generating USPTO-compliant DOCX file...',
           });
         },
        onExportComplete: () => {
          toast.success({
            title: 'Export Complete',
            description: 'Amendment response downloaded successfully',
          });
          // Call the original onExport callback if provided
          onExport?.();
        },
        onExportError: (error) => {
          toast.error({
            title: 'Export Failed',
            description: error.message || 'Failed to generate document',
          });
        },
      });

    } catch (error) {
      toast.error({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  };

  // Claim amendment handlers
  const addClaimAmendment = () => {
    const newClaim: ClaimAmendment = {
      id: `${Date.now()}`,
      claimNumber: `${claimAmendments.length + 1}`,
      status: 'CURRENTLY_AMENDED',
      originalText: '',
      amendedText: '',
      reasoning: '',
    };

    setClaimAmendments(prev => [...prev, newClaim]);
    setHasUnsavedChanges(true);
  };

  const updateClaimAmendment = (id: string, updates: Partial<ClaimAmendment>) => {
    setClaimAmendments(prev => 
      prev.map(claim => 
        claim.id === id ? { ...claim, ...updates } : claim
      )
    );
    setHasUnsavedChanges(true);
  };

  const deleteClaim = (id: string) => {
    setClaimAmendments(prev => prev.filter(claim => claim.id !== id));
    setHasUnsavedChanges(true);
  };

  // Argument section handlers
  const addArgumentSection = () => {
    const newSection: ArgumentSection = {
      id: `${Date.now()}`,
      title: 'New Argument Section',
      content: '',
      type: 'MAIN_ARGUMENT',
    };

    setArgumentSections(prev => [...prev, newSection]);
    setHasUnsavedChanges(true);
  };

  const updateArgumentSection = (id: string, updates: Partial<ArgumentSection>) => {
    setArgumentSections(prev =>
      prev.map(section =>
        section.id === id ? { ...section, ...updates } : section
      )
    );
    setHasUnsavedChanges(true);
  };

  const deleteArgumentSection = (id: string) => {
    setArgumentSections(prev => prev.filter(section => section.id !== id));
    setHasUnsavedChanges(true);
  };

  // State to control showing original claim text
  const [showOriginalText, setShowOriginalText] = useState<Record<string, boolean>>({});
  
  // State to control showing live preview
  const [showLivePreview, setShowLivePreview] = useState<Record<string, boolean>>({});
  
  // State to control showing file history panel
  const [showFileHistory, setShowFileHistory] = useState(false);

  const toggleShowOriginalText = (claimId: string) => {
    setShowOriginalText(prev => ({
      ...prev,
      [claimId]: !prev[claimId]
    }));
  };

  const toggleShowLivePreview = (claimId: string) => {
    setShowLivePreview(prev => ({
      ...prev,
      [claimId]: !prev[claimId]
    }));
  };

  // Render header
  const renderHeader = () => (
    <div className="p-4 border-b bg-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Input
            value={documentTitle}
            onChange={(e) => {
              setDocumentTitle(e.target.value);
              setHasUnsavedChanges(true);
            }}
            className="text-lg font-semibold border-none p-0 bg-transparent"
            placeholder="Document title..."
          />
          
          <Select 
            value={responseType} 
            onValueChange={(value: any) => {
              setResponseType(value);
              setHasUnsavedChanges(true);
            }}
          >
            <SelectTrigger className="w-[140px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AMENDMENT">Amendment</SelectItem>
              <SelectItem value="CONTINUATION">Continuation</SelectItem>
              <SelectItem value="RCE">RCE</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              <Clock className="h-3 w-3 mr-1" />
              Unsaved
            </Badge>
          )}
          
          <span className="text-xs text-gray-500">
            Last saved: {lastSaved.toLocaleTimeString()}
          </span>

          <Separator orientation="vertical" className="h-6" />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={showFileHistory ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setShowFileHistory(!showFileHistory)}
                >
                  <History className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>File History</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Save draft</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Preview response</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button onClick={handleExport} className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="flex items-center gap-6 text-sm text-gray-600">
        <span>{claimAmendments.length} claim amendments</span>
        <span>•</span>
        <span>{argumentSections.length} argument sections</span>
        <span>•</span>
        <span>
          {claimAmendments.reduce((sum, claim) => sum + claim.amendedText.split(' ').length, 0) +
           argumentSections.reduce((sum, section) => sum + section.content.split(' ').length, 0)} words
        </span>
      </div>
    </div>
  );

  // Render claim amendment item
  const renderClaimAmendment = (claim: ClaimAmendment) => {
    const statusConfig = CLAIM_STATUS_CONFIG[claim.status];

    return (
      <Card key={claim.id} className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold">Claim {claim.claimNumber}</h3>
              <Badge className={statusConfig.color} variant="secondary">
                {statusConfig.label}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleShowOriginalText(claim.id)}
                      className={showOriginalText[claim.id] ? 'bg-gray-100' : ''}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {showOriginalText[claim.id] ? 'Hide' : 'Show'} original claim text
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleShowLivePreview(claim.id)}
                      className={showLivePreview[claim.id] ? 'bg-blue-100' : ''}
                    >
                      {showLivePreview[claim.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {showLivePreview[claim.id] ? 'Hide' : 'Show'} live preview
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Select
                value={claim.status}
                onValueChange={(value: any) => updateClaimAmendment(claim.id, { status: value })}
              >
                <SelectTrigger className="w-[160px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CURRENTLY_AMENDED">Currently Amended</SelectItem>
                  <SelectItem value="PREVIOUSLY_PRESENTED">Previously Presented</SelectItem>
                  <SelectItem value="NEW">New</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteClaim(claim.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Optional Original Text Field - Hidden by default */}
          {showOriginalText[claim.id] && (
            <div className="border-l-4 border-gray-300 pl-4 bg-gray-50/30 py-3 -mx-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  Original Claim Text (As Filed)
                  <Badge variant="secondary" className="text-xs">Read Only</Badge>
                </label>
                {!claim.originalText && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const originalText = prompt('Enter the original claim text as filed with the USPTO:');
                      if (originalText) {
                        updateClaimAmendment(claim.id, { originalText });
                      }
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Original Text
                  </Button>
                )}
              </div>
              <div className="min-h-[80px] p-3 bg-white border rounded font-mono text-sm leading-relaxed text-gray-700">
                {claim.originalText || (
                  <span className="text-gray-400 italic">
                    Click "Add Original Text" to enter the claim as originally filed with the USPTO...
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                This is the claim text as originally filed with the USPTO (cannot be edited)
              </p>
            </div>
          )}

          {/* Amended Text Editor */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Amended Claim Text
            </label>
            <Textarea
              value={claim.amendedText}
              onChange={(e) => updateClaimAmendment(claim.id, { amendedText: e.target.value })}
              placeholder="Enter the amended claim text..."
              className="min-h-[120px] font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Click the <Eye className="h-3 w-3 inline mx-1" /> icon to toggle live preview
            </p>
          </div>

          {/* Live Amendment Preview */}
          {claim.amendedText && showLivePreview[claim.id] && (
            <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-200">
              <label className="text-sm font-medium mb-2 block text-blue-700">
                Live Amendment Preview
              </label>
              {claim.originalText ? (
                <ClaimDiffViewer
                  claimNumber={claim.claimNumber}
                  originalText={claim.originalText}
                  amendedText={claim.amendedText}
                  status={claim.status}
                  showSideBySide={false}
                  className="border border-blue-200 bg-blue-50/30"
                />
              ) : (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-blue-800 text-sm mb-2">
                    <strong>Claim {claim.claimNumber}. {CLAIM_STATUS_CONFIG[claim.status].prefix}</strong>
                  </p>
                  <div className="font-mono text-sm leading-relaxed text-blue-900 whitespace-pre-wrap">
                    {claim.amendedText}
                  </div>
                  <p className="text-xs text-blue-600 mt-2 italic">
                    Add original text (click <FileText className="h-3 w-3 inline mx-1" /> icon above) to see change highlighting
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Reasoning */}
          <div>
            <label className="text-sm font-medium mb-2 block">Amendment Reasoning</label>
            <Textarea
              value={claim.reasoning}
              onChange={(e) => updateClaimAmendment(claim.id, { reasoning: e.target.value })}
              placeholder="Explain why this amendment was made (e.g., to distinguish over prior art, add limitations, etc.)..."
              className="min-h-[80px] text-sm"
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render argument section
  const renderArgumentSection = (section: ArgumentSection) => {
    return (
      <Card key={section.id} className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Input
              value={section.title}
              onChange={(e) => updateArgumentSection(section.id, { title: e.target.value })}
              className="font-semibold text-base border-none p-0 bg-transparent"
              placeholder="Section title..."
            />

            <div className="flex items-center gap-2">
              <Select
                value={section.type}
                onValueChange={(value: any) => updateArgumentSection(section.id, { type: value })}
              >
                <SelectTrigger className="w-[160px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MAIN_ARGUMENT">Main Argument</SelectItem>
                  <SelectItem value="TECHNICAL_ARGUMENT">Technical Argument</SelectItem>
                  <SelectItem value="LEGAL_ARGUMENT">Legal Argument</SelectItem>
                  <SelectItem value="RESPONSE_TO_REJECTION">Response to Rejection</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteArgumentSection(section.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Textarea
            value={section.content}
            onChange={(e) => updateArgumentSection(section.id, { content: e.target.value })}
            placeholder="Enter your argument text..."
            className="min-h-[150px] text-sm leading-relaxed"
          />
          
          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <span>{section.content.split(' ').filter(w => w.length > 0).length} words</span>
            <span>{section.content.length} characters</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Main content
  if (!selectedOfficeAction && !selectedOfficeActionId) {
    return (
      <div className={cn("h-full flex items-center justify-center text-gray-500 p-6", className)}>
        <div className="text-center">
          <FileEdit className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="font-medium mb-2">No Office Action Selected</h3>
          <p className="text-sm">Upload an Office Action to start drafting your response</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("h-full flex flex-col relative", className)}>
      {renderHeader()}

      {/* File History Overlay Panel */}
      {showFileHistory && (
        <div className="absolute top-[65px] right-4 z-20 w-[400px] max-h-[calc(100%-80px)] bg-white border border-gray-200 rounded-lg shadow-xl animate-in fade-in-0 slide-in-from-right-2 duration-200">
          <div className="p-4 border-b bg-gray-50 rounded-t-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <History className="h-4 w-4" />
                File History
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFileHistory(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="max-h-[500px] overflow-y-auto">
            <AmendmentFileHistory
              amendmentProjectId={amendmentProjectId || ''}
              files={filesData?.files || []}
              isLoading={filesLoading}
              onDownload={(file) => {
                if (file.storageUrl) {
                  window.open(file.storageUrl, '_blank');
                } else {
                  toast.error({
                    title: 'Download Failed',
                    description: 'No download URL available for this file',
                  });
                }
              }}
              onPreview={(file) => {
                if (file.storageUrl) {
                  window.open(file.storageUrl, '_blank');
                } else {
                  toast.error({
                    title: 'Preview Failed',
                    description: 'No preview available for this file',
                  });
                }
              }}
              onDelete={(file) => {
                deleteFileMutation.mutate(file.id, {
                  onSuccess: () => {
                    toast.success({
                      title: 'File Deleted',
                      description: `${file.fileName} has been deleted successfully`,
                    });
                  },
                  onError: (error) => {
                    toast.error({
                      title: 'Delete Failed',
                      description: error.message || 'Failed to delete file',
                    });
                  },
                });
              }}
            />
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid w-full grid-cols-3 rounded-none border-b bg-gray-50 flex-shrink-0">
          <TabsTrigger value="claims" className="flex items-center gap-2">
            <FileEdit className="h-4 w-4" />
            Claims ({claimAmendments.length})
          </TabsTrigger>
          <TabsTrigger value="arguments" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Arguments ({argumentSections.length})
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="claims" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Claim Amendments</h2>
                <Button onClick={addClaimAmendment} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Claim
                </Button>
              </div>

              {claimAmendments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  {selectedOfficeAction ? (
                    <div className="max-w-md mx-auto">
                      <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="font-medium mb-2 text-gray-900">Ready to Generate Amendments</h3>
                      <p className="text-sm mb-4">
                        Your Office Action has been analyzed. Use the AI Assistant to generate claim amendments 
                        based on your {selectedOfficeAction.summary.totalRejections} rejection(s).
                      </p>
                      <Badge variant="outline" className="mb-4">
                        {selectedOfficeAction.summary.rejectionTypes.join(', ')} Rejection(s) Found
                      </Badge>
                      <p className="text-xs text-gray-400">
                        Click "Suggest Amendments" in the AI Assistant panel →
                      </p>
                    </div>
                  ) : (
                    <div>
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <h3 className="font-medium mb-2">No claim amendments yet</h3>
                      <p className="text-sm mb-4">Add your first claim amendment to get started</p>
                      <Button onClick={addClaimAmendment}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Claim
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {claimAmendments.map(renderClaimAmendment)}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="arguments" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Arguments & Remarks</h2>
                <Button onClick={addArgumentSection} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Section
                </Button>
              </div>

              {argumentSections.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="font-medium mb-2">No argument sections yet</h3>
                  <p className="text-sm mb-4">Add your first argument section to build your response</p>
                  <Button onClick={addArgumentSection}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Section
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {argumentSections.map(renderArgumentSection)}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>


        <TabsContent value="preview" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6 bg-gray-50">
            {/* Document container with proper page styling */}
            <div className="max-w-[8.5in] mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
              {/* Document content with proper margins */}
              <div className="p-12 text-black" style={{ 
                fontFamily: 'Times, serif',
                fontSize: '12pt',
                lineHeight: '1.6'
              }}>
                {/* Document Header */}
                <div className="text-center mb-8 border-b-2 border-gray-800 pb-4">
                  <div className="mb-4">
                    <p className="text-sm font-bold">IN THE UNITED STATES PATENT AND TRADEMARK OFFICE</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-8 text-left text-sm mb-4">
                    <div>
                      <p><span className="font-bold">Applicant:</span> [APPLICANT NAME]</p>
                      <p><span className="font-bold">Application No.:</span> [APPLICATION NUMBER]</p>
                      <p><span className="font-bold">Filing Date:</span> [FILING DATE]</p>
                    </div>
                    <div>
                      <p><span className="font-bold">Art Unit:</span> [ART UNIT]</p>
                      <p><span className="font-bold">Examiner:</span> [EXAMINER NAME]</p>
                      <p><span className="font-bold">Confirmation No.:</span> [CONFIRMATION NO.]</p>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-lg font-bold">{documentTitle.toUpperCase()}</p>
                    <p className="text-sm mt-2">({responseType} Response to Office Action)</p>
                  </div>
                </div>

                {/* Introduction */}
                <div className="mb-8">
                  <p className="mb-4">
                    <span className="font-bold">Commissioner for Patents</span><br/>
                    <span className="font-bold">United States Patent and Trademark Office</span><br/>
                    <span className="font-bold">Alexandria, VA 22314</span>
                  </p>
                  
                  <p className="mb-4">
                    <span className="font-bold">Sir:</span>
                  </p>
                  
                  <p className="mb-4 text-justify">
                    In response to the Office Action dated [OFFICE ACTION DATE], Applicant respectfully submits 
                    the following amendment and remarks. This response is being filed within the statutory period 
                    for response, and no extension of time is required.
                  </p>
                </div>

                {/* Claims Section */}
                {claimAmendments.length > 0 && (
                  <div className="mb-10">
                    <h2 className="text-lg font-bold mb-6 text-center border-b border-gray-400 pb-2">
                      CLAIM AMENDMENTS
                    </h2>
                    
                    <p className="mb-4 text-justify">
                      This listing of claims will replace all prior versions, and listings, of claims in the application:
                    </p>
                    
                    {claimAmendments.map(claim => {
                      return (
                        <div key={claim.id} className="mb-8">
                          <LegitimateClaimViewer
                            claimNumber={claim.claimNumber}
                            amendedText={claim.amendedText}
                            status={claim.status}
                          />
                          
                          {claim.reasoning && claim.status === 'CURRENTLY_AMENDED' && (
                            <div className="pl-8 mb-6">
                              <p className="text-sm font-bold mb-2">Amendment Basis:</p>
                              <p className="text-sm text-justify leading-relaxed">{claim.reasoning}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Remarks Section */}
                {argumentSections.length > 0 && (
                  <div className="mb-10">
                    <h2 className="text-lg font-bold mb-6 text-center border-b border-gray-400 pb-2">
                      REMARKS
                    </h2>
                    
                    <div className="mb-6">
                      <p className="text-justify">
                        Applicant respectfully submits the following remarks in response to the Office Action. 
                        The rejections are respectfully traversed for the reasons set forth below.
                      </p>
                    </div>
                    
                    {argumentSections.map((section, index) => (
                      <div key={section.id} className="mb-8">
                        <h3 className="font-bold mb-4 text-lg">
                          {String.fromCharCode(65 + index)}. {section.title}
                        </h3>
                        <div className="pl-6 text-justify whitespace-pre-wrap leading-relaxed">
                          {section.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Conclusion */}
                <div className="mb-10">
                  <h2 className="text-lg font-bold mb-6 text-center border-b border-gray-400 pb-2">
                    CONCLUSION
                  </h2>
                  <div className="text-justify space-y-4">
                    <p>
                      For the foregoing reasons, Applicant respectfully submits that the claims as amended 
                      are patentable and requests that the Examiner reconsider the application and allow 
                      the pending claims.
                    </p>
                    <p>
                      If the Examiner believes that a telephone conference would expedite prosecution of 
                      this application, the Examiner is invited to contact the undersigned.
                    </p>
                    <p>
                      Any amendments or remarks not specifically addressed herein are not admitted as 
                      being pertinent to the patentability of the claims.
                    </p>
                  </div>
                </div>

                {/* Certificate of Electronic Filing */}
                <div className="mb-8">
                  <h3 className="font-bold mb-4">CERTIFICATE OF ELECTRONIC FILING</h3>
                  <p className="text-justify">
                    I hereby certify that this correspondence is being electronically filed with the 
                    United States Patent and Trademark Office on {new Date().toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}.
                  </p>
                </div>

                {/* Signature Block */}
                <div className="mt-12">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="mb-8">Respectfully submitted,</p>
                      <div className="border-b border-gray-400 mb-2" style={{ height: '40px' }}></div>
                      <p className="text-sm">
                        <span className="font-bold">[ATTORNEY NAME]</span><br/>
                        Registration No. [REG. NO.]<br/>
                        Attorney for Applicant<br/>
                        [FIRM NAME]<br/>
                        [ADDRESS]<br/>
                        Tel: [PHONE]<br/>
                        Email: [EMAIL]
                      </p>
                    </div>
                    <div className="text-sm">
                      <p className="mb-4">
                        <span className="font-bold">Date:</span> {new Date().toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="mb-4">
                        <span className="font-bold">Customer Number:</span> [CUSTOMER NO.]
                      </p>
                      <div className="mt-8 p-3 border border-gray-400">
                        <p className="font-bold text-center mb-2">FEES</p>
                        <p>Extension Fee: $____</p>
                        <p>Other Fees: $____</p>
                        <p className="font-bold border-t border-gray-400 pt-2 mt-2">
                          Total Fee: $____
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Document Footer */}
                <div className="mt-12 pt-6 border-t border-gray-300 text-xs text-gray-600">
                  <div className="text-center">
                    <p>
                      Document Generated: {new Date().toLocaleDateString()} | 
                      Page 1 of 1 | 
                      Word Count: {
                        claimAmendments.reduce((sum, claim) => sum + claim.amendedText.split(' ').length, 0) +
                        argumentSections.reduce((sum, section) => sum + section.content.split(' ').length, 0) + 200
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Export Actions */}
            <div className="max-w-[8.5in] mx-auto mt-6 text-center">
              <div className="bg-white rounded-lg p-4 shadow">
                <h3 className="font-bold mb-3">Export Options</h3>
                <div className="flex justify-center gap-4">
                  <Button onClick={handleExport} className="bg-blue-600 hover:bg-blue-700">
                    <Download className="h-4 w-4 mr-2" />
                    Export to DOCX
                  </Button>
                  <Button variant="outline" onClick={() => window.print()}>
                    <FileText className="h-4 w-4 mr-2" />
                    Print Preview
                  </Button>
                </div>
              </div>
            </div>
          </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 