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
  Clock
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
  selectedOfficeAction?: any;
  selectedOfficeActionId?: string | null;
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
  selectedOfficeAction,
  selectedOfficeActionId,
  onSave,
  onExport,
  className,
}) => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('claims');
  
  // Claims state
  const [claimAmendments, setClaimAmendments] = useState<ClaimAmendment[]>([
    {
      id: '1',
      claimNumber: '1',
      status: 'CURRENTLY_AMENDED',
      originalText: 'A method comprising: providing a system for processing data; executing operations on the data; and generating output results.',
      amendedText: 'A method comprising: providing a system for processing data in real-time with sub-100ms latency; executing operations on the data using dedicated hardware acceleration; and generating output results with enhanced accuracy.',
      reasoning: 'Added real-time processing limitation and hardware acceleration to distinguish over Smith + Johnson combination.',
    },
  ]);

  // Arguments state
  const [argumentSections, setArgumentSections] = useState<ArgumentSection[]>([
    {
      id: '1',
      title: 'Response to § 103 Rejection',
      content: 'Applicant respectfully traverses the rejection under 35 U.S.C. § 103 and submits that the claims are patentable for at least the following reasons:\n\nThe prior art fails to teach or suggest the combination of real-time processing with sub-100ms latency constraints as claimed.',
      type: 'RESPONSE_TO_REJECTION',
      rejectionId: 'rej-1',
    },
  ]);

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
  const handleExport = () => {
    handleSave(); // Save before export
    onExport?.();
    
    toast.success({
      title: 'Export Initiated',
      description: 'Generating USPTO-compliant document...',
    });
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

  // Format claim text for display
  const formatClaimText = (original: string, amended: string) => {
    // This is a simplified diff - in a real implementation, you'd use a proper diff algorithm
    const words = amended.split(' ');
    return words.map((word, index) => {
      const isAdded = !original.includes(word);
      return (
        <span
          key={index}
          className={cn(
            isAdded && "underline decoration-blue-500 decoration-2 bg-blue-50"
          )}
        >
          {word}{' '}
        </span>
      );
    });
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
          {/* Claim text editor */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              {statusConfig.prefix} Claim Text
            </label>
            <Textarea
              value={claim.amendedText}
              onChange={(e) => updateClaimAmendment(claim.id, { amendedText: e.target.value })}
              placeholder="Enter the amended claim text..."
              className="min-h-[120px] font-mono text-sm"
            />
          </div>

          {/* Reasoning */}
          <div>
            <label className="text-sm font-medium mb-2 block">Amendment Reasoning</label>
            <Textarea
              value={claim.reasoning}
              onChange={(e) => updateClaimAmendment(claim.id, { reasoning: e.target.value })}
              placeholder="Explain why this amendment was made..."
              className="min-h-[60px] text-sm"
            />
          </div>

          {/* Formatted preview */}
          {claim.originalText && claim.amendedText && (
            <div>
              <label className="text-sm font-medium mb-2 block">Formatted Preview</label>
              <div className="p-3 bg-gray-50 rounded border text-sm font-mono leading-relaxed">
                <div className="font-semibold mb-2">{claim.claimNumber}. {statusConfig.prefix}</div>
                {formatClaimText(claim.originalText, claim.amendedText)}
              </div>
            </div>
          )}
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
      <div className={cn("h-full flex items-center justify-center text-gray-500", className)}>
        <div className="text-center">
          <FileEdit className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="font-medium mb-2">No Office Action Selected</h3>
          <p className="text-sm">Upload an Office Action to start drafting your response</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("h-full flex flex-col", className)}>
      {renderHeader()}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 rounded-none border-b bg-gray-50">
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

        <TabsContent value="claims" className="flex-1 mt-0">
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
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="font-medium mb-2">No claim amendments yet</h3>
                  <p className="text-sm mb-4">Add your first claim amendment to get started</p>
                  <Button onClick={addClaimAmendment}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Claim
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {claimAmendments.map(renderClaimAmendment)}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="arguments" className="flex-1 mt-0">
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

        <TabsContent value="preview" className="flex-1 mt-0">
          <ScrollArea className="h-full">
            <div className="p-6 max-w-4xl mx-auto">
              <div className="bg-white border rounded-lg p-8 shadow-sm font-mono text-sm leading-relaxed">
                <div className="text-center mb-8">
                  <h1 className="text-xl font-bold mb-2">{documentTitle}</h1>
                  <p className="text-gray-600">USPTO {responseType} Response</p>
                </div>

                {/* Claims section */}
                {claimAmendments.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-lg font-bold mb-4">CLAIM AMENDMENTS</h2>
                    {claimAmendments.map(claim => (
                      <div key={claim.id} className="mb-6">
                        <p className="font-bold mb-2">
                          {claim.claimNumber}. {CLAIM_STATUS_CONFIG[claim.status].prefix}
                        </p>
                        <div className="pl-4 mb-4">
                          {formatClaimText(claim.originalText, claim.amendedText)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Arguments section */}
                {argumentSections.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold mb-4">REMARKS</h2>
                    {argumentSections.map((section, index) => (
                      <div key={section.id} className="mb-6">
                        <h3 className="font-bold mb-2">
                          {String.fromCharCode(65 + index)}. {section.title}
                        </h3>
                        <div className="pl-4 whitespace-pre-wrap">
                          {section.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 