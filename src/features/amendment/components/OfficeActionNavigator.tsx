/**
 * Enhanced Office Action Navigator - Left panel component for AmendmentStudio
 * 
 * Now displays:
 * - GPT's specific rejection classifications and confidence indicators
 * - Legal reasoning insights for each rejection
 * - Enhanced prior art references with detailed metadata
 * - Human review flags and quality indicators
 * 
 * Clean, organized interface for navigating through Office Action content with rich legal analysis
 */

import React, { useState, useMemo, useCallback } from 'react';
import { 
  FileText, 
  AlertTriangle, 
  Scale, 
  BookOpen,
  User,
  Calendar,
  Hash,
  ChevronDown,
  ChevronRight,
  Eye,
  Target,
  Filter,
  Search,
  ExternalLink,
  Download,
  FileCheck,
  Clock,
  Info,
  Lightbulb,
  AlertCircle
} from 'lucide-react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
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
import { DocumentViewer } from '@/components/common/DocumentViewer';
import { OfficeActionDetailedSummary } from './OfficeActionDetailedSummary';
import { isFeatureEnabled } from '@/config/featureFlags';
import { abbreviateClaimRanges } from '@/utils/claims';
import type { DetailedAnalysis } from '@/types/amendment';

// Enhanced types to support new GPT data
interface Rejection {
  id: string;
  type: '§102' | '§103' | '§101' | '§112' | 'OTHER';
  rawType?: string; // GPT's specific classification
  rejectionCategory?: string; // Specific subcategory  
  legalBasis?: string; // Full legal citation
  claims: string[];
  priorArtReferences: string[];
  examinerReasoning: string;
  reasoningInsights?: string[]; // GPT's legal insights
  rawText: string;
  classificationConfidence?: number; // Confidence score
  requiresHumanReview?: boolean; // Human review flag
}

// Document viewer state
interface DocumentViewerState {
  isOpen: boolean;
  documentId: string | null;
  documentType: 'office-action' | 'prior-art' | null;
  title?: string;
  description?: string;
}

interface OfficeActionData {
  id: string;
  fileName: string;
  metadata: {
    applicationNumber?: string;
    mailingDate?: string;
    examinerName?: string;
    artUnit?: string;
    documentType?: string; // Enhanced document type
  };
  rejections: Rejection[];
  allPriorArtReferences: string[];
  summary: {
    totalRejections: number;
    rejectionTypes: string[];
    totalClaimsRejected: number;
    uniquePriorArtCount: number;
  };
  examinerRemarks?: string;
  detailedAnalysis?: DetailedAnalysis;
}

interface OfficeActionNavigatorProps {
  officeAction?: OfficeActionData;
  selectedRejectionId?: string | null;
  onRejectionSelect?: (rejectionId: string) => void;
  onPriorArtSelect?: (reference: string) => void;
  projectId: string;
  className?: string;
}

// Enhanced rejection type configuration with confidence indicators
const REJECTION_TYPE_CONFIG = {
  '§102': {
    label: '§ 102 - Anticipation',
    icon: BookOpen,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    description: 'Prior art anticipates claimed invention',
  },
  '§103': {
    label: '§ 103 - Obviousness',
    icon: Lightbulb,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    description: 'Claims would be obvious over prior art',
  },
  '§101': {
    label: '§ 101 - Eligibility',
    icon: AlertTriangle,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    description: 'Claims directed to ineligible subject matter',
  },
  '§112': {
    label: '§ 112 - Description',
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description: 'Written description or enablement issues',
  },
  'OTHER': {
    label: 'Other',
    icon: AlertCircle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    description: 'Other type of rejection',
  },
};

export const OfficeActionNavigator: React.FC<OfficeActionNavigatorProps> = ({
  officeAction,
  selectedRejectionId,
  onRejectionSelect,
  onPriorArtSelect,
  projectId,
  className,
}) => {
  // State for filtering and collapsible sections
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sectionsExpanded, setSectionsExpanded] = useState({
    metadata: true,
    rejections: true,
    priorArt: true,
    insights: false, // New section for insights
  });
  const [rejectionInsightsExpanded, setRejectionInsightsExpanded] = useState<Record<string, boolean>>({});

  // Enhanced navigation features
  const showMinimalistUI = isFeatureEnabled('ENABLE_MINIMALIST_AMENDMENT_UI');

  // Document viewer state
  const [documentViewer, setDocumentViewer] = useState<DocumentViewerState>({
    isOpen: false,
    documentId: null,
    documentType: null,
    title: undefined,
    description: undefined,
  });

  // Toggle section expansion
  const toggleSection = useCallback((section: keyof typeof sectionsExpanded) => {
    setSectionsExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  // Toggle rejection insights
  const toggleRejectionInsights = useCallback((rejectionId: string) => {
    setRejectionInsightsExpanded(prev => ({
      ...prev,
      [rejectionId]: !prev[rejectionId]
    }));
  }, []);

  // Document viewer handlers
  const handleViewOfficeAction = useCallback(() => {
    if (!officeAction) return;
    
    setDocumentViewer({
      isOpen: true,
      documentId: officeAction.id,
      documentType: 'office-action',
      title: officeAction.fileName || 'Office Action',
      description: officeAction.metadata?.applicationNumber 
        ? `App. No. ${officeAction.metadata.applicationNumber}`
        : undefined,
    });
  }, [officeAction]);

  const handleViewPriorArt = useCallback((patentNumber: string) => {
    // Note: This would need actual prior art ID mapping
    // For now, we'll use the patent number as a placeholder
    setDocumentViewer({
      isOpen: true,
      documentId: patentNumber, // Would need actual SavedPriorArt ID
      documentType: 'prior-art',
      title: patentNumber,
      description: 'Prior Art Reference',
    });
  }, []);

  const handleCloseDocumentViewer = useCallback(() => {
    setDocumentViewer({
      isOpen: false,
      documentId: null,
      documentType: null,
      title: undefined,
      description: undefined,
    });
  }, []);

  // Get confidence indicator component
  const getConfidenceIndicator = useCallback((confidence?: number) => {
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
            {Math.round(confidence * 100)}%
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Classification confidence</p>
        </TooltipContent>
      </Tooltip>
    );
  }, []);

  // Enhanced filtering logic
  const filteredRejections = useMemo(() => {
    if (!officeAction?.rejections) return [];

    return officeAction.rejections.filter(rejection => {
      const matchesSearch = !searchTerm || 
        rejection.examinerReasoning.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rejection.claims.some(claim => claim.includes(searchTerm)) ||
        (rejection.rawType && rejection.rawType.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (rejection.rejectionCategory && rejection.rejectionCategory.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesType = filterType === 'all' || rejection.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [officeAction?.rejections, searchTerm, filterType]);

  // Enhanced prior art organization
  const organizedPriorArt = useMemo(() => {
    if (!officeAction?.rejections) return [];

    const priorArtMap = new Map();
    
    officeAction.rejections.forEach((rejection) => {
      rejection.priorArtReferences.forEach(ref => {
        if (!priorArtMap.has(ref)) {
          priorArtMap.set(ref, {
            reference: ref,
            rejectionTypes: new Set(),
            claimsAffected: new Set(),
            rejectionIds: new Set(),
          });
        }
        
        const entry = priorArtMap.get(ref);
        entry.rejectionTypes.add(rejection.type);
        rejection.claims.forEach(claim => entry.claimsAffected.add(claim));
        entry.rejectionIds.add(rejection.id);
      });
    });

    return Array.from(priorArtMap.values());
  }, [officeAction?.rejections]);

  if (!officeAction) {
    return (
      <div className={cn('p-6 text-center', className)}>
        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-2">No Office Action Selected</h3>
        <p className="text-muted-foreground">
          Select an Office Action to view details and navigate rejections.
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={cn('h-full flex flex-col bg-card', className)}>
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-start gap-3 mb-3">
            <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-sm truncate" title={officeAction.fileName}>
                {officeAction.fileName}
              </h2>
              {officeAction.metadata.documentType && (
                <p className="text-xs text-muted-foreground">
                  {officeAction.metadata.documentType}
                </p>
              )}
            </div>
          </div>

          {/* Enhanced Search and Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search rejections, claims, insights..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 text-xs"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="§102">§ 102 - Anticipation</SelectItem>
                <SelectItem value="§103">§ 103 - Obviousness</SelectItem>
                <SelectItem value="§101">§ 101 - Eligibility</SelectItem>
                <SelectItem value="§112">§ 112 - Description</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {/* Enhanced Metadata Section */}
            <Collapsible
              open={sectionsExpanded.metadata}
              onOpenChange={() => toggleSection('metadata')}
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium text-sm">Document Info</span>
                  </div>
                  {sectionsExpanded.metadata ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <Card className="bg-muted/30">
                  <CardContent className="p-3 text-xs space-y-2">
                    {officeAction.metadata.applicationNumber && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Application:</span>
                        <span className="font-mono">{officeAction.metadata.applicationNumber}</span>
                      </div>
                    )}
                    {officeAction.metadata.examinerName && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Examiner:</span>
                        <span>{officeAction.metadata.examinerName}</span>
                      </div>
                    )}
                    {officeAction.metadata.artUnit && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Art Unit:</span>
                        <span>{officeAction.metadata.artUnit}</span>
                      </div>
                    )}
                    {officeAction.metadata.mailingDate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Mailed:</span>
                        <span>{new Date(officeAction.metadata.mailingDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* View Office Action button */}
                <div className="mt-3 space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleViewOfficeAction}
                    className="w-full"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Office Action
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Enhanced Rejections Section */}
            <Collapsible
              open={sectionsExpanded.rejections}
              onOpenChange={() => toggleSection('rejections')}
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium text-sm">
                      Rejections ({filteredRejections.length})
                    </span>
                  </div>
                  {sectionsExpanded.rejections ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="space-y-2">
                  {filteredRejections.map((rejection) => {
                    const config = REJECTION_TYPE_CONFIG[rejection.type as keyof typeof REJECTION_TYPE_CONFIG] || REJECTION_TYPE_CONFIG['OTHER'];
                    const IconComponent = config.icon;
                    const isSelected = selectedRejectionId === rejection.id;
                    const hasInsights = rejection.reasoningInsights && rejection.reasoningInsights.length > 0;
                    const hasEnhancedData = rejection.rawType || rejection.rejectionCategory || rejection.legalBasis;

                    return (
                      <Card
                        key={rejection.id}
                        className={cn(
                          'cursor-pointer transition-all duration-200 hover:shadow-sm',
                          config.bgColor,
                          config.borderColor,
                          isSelected && 'ring-2 ring-blue-500 ring-offset-1',
                          rejection.requiresHumanReview && 'ring-2 ring-amber-300'
                        )}
                        onClick={() => onRejectionSelect?.(rejection.id)}
                      >
                        <CardContent className="p-3">
                          <div className="space-y-2">
                            {/* Enhanced Header */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <IconComponent className={cn('h-4 w-4 flex-shrink-0', config.color)} />
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-1 mb-1">
                                    <span className="text-sm font-medium">
                                      {rejection.rawType || rejection.type}
                                    </span>
                                    {getConfidenceIndicator(rejection.classificationConfidence)}
                                    {rejection.requiresHumanReview && (
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
                                            Review
                                          </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Requires human review</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    )}
                                  </div>

                                  {/* Enhanced Classification Details */}
                                  {hasEnhancedData && (
                                    <div className="text-xs text-muted-foreground space-y-0.5">
                                      {rejection.rejectionCategory && (
                                        <div>Category: {rejection.rejectionCategory}</div>
                                      )}
                                      {rejection.legalBasis && (
                                        <div>Basis: {rejection.legalBasis}</div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <Badge variant="outline" className="text-xs flex-shrink-0">
                                Claims {abbreviateClaimRanges(rejection.claims)}
                              </Badge>
                            </div>

                            {/* Enhanced Insights Section */}
                            {hasInsights && (
                              <Collapsible
                                open={rejectionInsightsExpanded[rejection.id]}
                                onOpenChange={() => toggleRejectionInsights(rejection.id)}
                              >
                                <CollapsibleTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="w-full justify-between p-1 h-auto text-xs"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="flex items-center gap-1">
                                      <Lightbulb className="h-3 w-3 text-blue-600" />
                                      <span>Legal Insights ({rejection.reasoningInsights!.length})</span>
                                    </div>
                                    {rejectionInsightsExpanded[rejection.id] ? (
                                      <ChevronDown className="h-3 w-3" />
                                    ) : (
                                      <ChevronRight className="h-3 w-3" />
                                    )}
                                  </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="mt-1">
                                  <div className="bg-blue-50/50 rounded p-2 space-y-1">
                                    {rejection.reasoningInsights!.slice(0, 2).map((insight, index) => (
                                      <div key={index} className="text-xs text-blue-900 flex items-start gap-1">
                                        <span className="text-blue-500 mt-0.5">•</span>
                                        <span className="line-clamp-2">{insight}</span>
                                      </div>
                                    ))}
                                    {rejection.reasoningInsights!.length > 2 && (
                                      <div className="text-xs text-blue-700 text-center">
                                        +{rejection.reasoningInsights!.length - 2} more insights
                                      </div>
                                    )}
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                            )}

                            {/* Summary */}
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>
                                {rejection.priorArtReferences.length} reference{rejection.priorArtReferences.length !== 1 ? 's' : ''}
                              </span>
                              {hasEnhancedData && (
                                <span className="text-blue-600">Enhanced</span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}

                  {filteredRejections.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No rejections match your search</p>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Enhanced Prior Art Section */}
            <Collapsible
              open={sectionsExpanded.priorArt}
              onOpenChange={() => toggleSection('priorArt')}
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span className="font-medium text-sm">
                      Prior Art ({organizedPriorArt.length})
                    </span>
                  </div>
                  {sectionsExpanded.priorArt ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="space-y-2">
                  {organizedPriorArt.map((entry, index) => (
                    <Card 
                      key={index} 
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => onPriorArtSelect?.(entry.reference)}
                    >
                      <CardContent className="p-3">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium font-mono truncate">
                              {entry.reference}
                            </span>
                            <div className="flex gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-6 w-6 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewPriorArt(entry.reference);
                                    }}
                                  >
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>View patent document</p>
                                </TooltipContent>
                              </Tooltip>
                              
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <ExternalLink className="h-3 w-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Open in USPTO database</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {Array.from(entry.rejectionTypes).map((type, typeIndex) => (
                              <Badge key={typeIndex} variant="outline" className="text-xs">
                                {String(type)}
                              </Badge>
                            ))}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Claims: {abbreviateClaimRanges(Array.from(entry.claimsAffected))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Summary Card */}
            <Card className="bg-muted/30">
              <CardContent className="p-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-center">
                    <div className="font-semibold text-lg">{officeAction.summary.totalRejections}</div>
                    <div className="text-muted-foreground">Rejections</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-lg">{officeAction.summary.totalClaimsRejected}</div>
                    <div className="text-muted-foreground">Claims</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Detailed Analysis */}
            {officeAction.detailedAnalysis && (
              <OfficeActionDetailedSummary 
                detailedAnalysis={officeAction.detailedAnalysis}
              />
            )}
          </div>
        </ScrollArea>

        {/* Document Viewer */}
        {documentViewer.isOpen && documentViewer.documentId && documentViewer.documentType && (
          <DocumentViewer
            isOpen={documentViewer.isOpen}
            onClose={handleCloseDocumentViewer}
            documentId={documentViewer.documentId}
            projectId={projectId}
            documentType={documentViewer.documentType}
            title={documentViewer.title}
            description={documentViewer.description}
          />
        )}
      </div>
    </TooltipProvider>
  );
}; 