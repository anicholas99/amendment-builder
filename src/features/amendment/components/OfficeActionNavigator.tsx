/**
 * Office Action Navigator - Left panel component for AmendmentStudio
 * 
 * Displays parsed rejections, prior art references, affected claims, and examiner info
 * Clean, organized interface for navigating through Office Action content
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
  Clock
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

// Types
interface Rejection {
  id: string;
  type: '§102' | '§103' | '§101' | '§112' | 'OTHER';
  claims: string[];
  priorArtReferences: string[];
  examinerReasoning: string;
  rawText: string;
}

interface OfficeActionData {
  id: string;
  fileName?: string;
  metadata?: {
    applicationNumber?: string;
    mailingDate?: string;
    examinerName?: string;
    artUnit?: string;
  };
  examinerRemarks?: string; // User-friendly summary of the Office Action
  rejections: Rejection[];
  allPriorArtReferences: string[];
  summary: {
    totalRejections: number;
    rejectionTypes: string[];
    totalClaimsRejected: number;
    uniquePriorArtCount: number;
  };
}

interface OfficeActionNavigatorProps {
  officeAction?: OfficeActionData;
  selectedRejectionId?: string | null;
  onRejectionSelect?: (rejectionId: string) => void;
  onPriorArtSelect?: (reference: string) => void;
  projectId: string; // Required for document viewing
  className?: string;
}

// Document viewer state
interface DocumentViewerState {
  isOpen: boolean;
  documentId: string | null;
  documentType: 'office-action' | 'prior-art' | null;
  title?: string;
  description?: string;
}

// Enhanced rejection type configuration
const REJECTION_TYPE_CONFIG = {
  '§102': {
    label: 'Anticipation',
    description: 'Prior art discloses invention',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: FileCheck,
    priority: 1,
  },
  '§103': {
    label: 'Obviousness',
    description: 'Combination of prior art',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    icon: Target,
    priority: 2,
  },
  '§101': {
    label: 'Eligibility',
    description: 'Not patent-eligible subject matter',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: Scale,
    priority: 3,
  },
  '§112': {
    label: 'Disclosure',
    description: 'Inadequate written description',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: FileText,
    priority: 4,
  },
  'OTHER': {
    label: 'Other',
    description: 'Miscellaneous rejection',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: AlertTriangle,
    priority: 5,
  },
} as const;

export const OfficeActionNavigator: React.FC<OfficeActionNavigatorProps> = ({
  officeAction,
  selectedRejectionId,
  onRejectionSelect,
  onPriorArtSelect,
  projectId,
  className,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['rejections', 'prior-art', 'overview'])
  );
  const [hoveredPriorArt, setHoveredPriorArt] = useState<string | null>(null);

  // Document viewer state
  const [documentViewer, setDocumentViewer] = useState<DocumentViewerState>({
    isOpen: false,
    documentId: null,
    documentType: null,
    title: undefined,
    description: undefined,
  });

  // Filter rejections based on search and type
  const filteredRejections = useMemo(() => {
    if (!officeAction?.rejections) return [];
    
    return officeAction.rejections
      .filter(rejection => {
        const matchesSearch = searchTerm === '' || 
          rejection.examinerReasoning.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rejection.claims.some(claim => claim.includes(searchTerm));
        
        const matchesType = filterType === 'all' || rejection.type === filterType;
        
        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        // Sort by priority (higher priority rejections first)
        const priorityA = REJECTION_TYPE_CONFIG[a.type]?.priority || 999;
        const priorityB = REJECTION_TYPE_CONFIG[b.type]?.priority || 999;
        return priorityA - priorityB;
      });
  }, [officeAction?.rejections, searchTerm, filterType]);

  // Group prior art by frequency and relevance
  const priorArtAnalysis = useMemo(() => {
    if (!officeAction?.rejections) return [];
    
    const priorArtMap = new Map<string, {
      patentNumber: string;
      rejectionCount: number;
      rejectionTypes: Set<string>;
      claimsAffected: Set<string>;
    }>();

    officeAction.rejections.forEach(rejection => {
      rejection.priorArtReferences.forEach(ref => {
        if (!priorArtMap.has(ref)) {
          priorArtMap.set(ref, {
            patentNumber: ref,
            rejectionCount: 0,
            rejectionTypes: new Set(),
            claimsAffected: new Set(),
          });
        }
        
        const entry = priorArtMap.get(ref)!;
        entry.rejectionCount++;
        entry.rejectionTypes.add(rejection.type);
        rejection.claims.forEach(claim => entry.claimsAffected.add(claim));
      });
    });

    return Array.from(priorArtMap.values())
      .sort((a, b) => b.rejectionCount - a.rejectionCount);
  }, [officeAction?.rejections]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const handlePriorArtClick = (patentNumber: string) => {
    onPriorArtSelect?.(patentNumber);
    // Will be enhanced with prior art lookup
  };

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

  if (!officeAction) {
    return (
      <div className={cn('h-full bg-gray-50 border-r', className)}>
        <div className="p-6 text-center text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="font-medium mb-2">No Office Action Selected</h3>
          <p className="text-sm">Upload an Office Action to begin analysis</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={cn('h-full bg-gray-50 border-r flex flex-col', className)}>
        {/* Header */}
        <div className="p-4 border-b bg-white">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="h-5 w-5 text-blue-600" />
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-gray-900 truncate">
                {officeAction.fileName || 'Office Action'}
              </h2>
              {officeAction.metadata?.applicationNumber && (
                <p className="text-sm text-gray-600">
                  App. No. {officeAction.metadata.applicationNumber}
                </p>
              )}
            </div>
          </div>
          
          {/* Search and filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search rejections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-8"
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="§102">§102 Anticipation</SelectItem>
                <SelectItem value="§103">§103 Obviousness</SelectItem>
                <SelectItem value="§101">§101 Eligibility</SelectItem>
                <SelectItem value="§112">§112 Disclosure</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            
            {/* Overview Section */}
            <Collapsible
              open={expandedSections.has('overview')}
              onOpenChange={() => toggleSection('overview')}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-0 h-auto"
                >
                  <span className="font-medium text-gray-900">Overview</span>
                  {expandedSections.has('overview') ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="mt-3">
                <Card>
                  <CardContent className="pt-3">
                    {/* Display user-friendly summary if available */}
                    {officeAction.examinerRemarks && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="flex items-start gap-2">
                          <FileText className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-medium text-blue-900 mb-1">Summary</h4>
                            <p className="text-sm text-blue-800">{officeAction.examinerRemarks}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="font-medium text-gray-900">
                          {officeAction.summary.totalRejections}
                        </div>
                        <div className="text-gray-600">Rejections</div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {officeAction.summary.totalClaimsRejected}
                        </div>
                        <div className="text-gray-600">Claims Affected</div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {officeAction.summary.uniquePriorArtCount}
                        </div>
                        <div className="text-gray-600">Prior Art Refs</div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {officeAction.metadata?.examinerName || 'Unknown'}
                        </div>
                        <div className="text-gray-600">Examiner</div>
                      </div>
                    </div>
                    
                    {officeAction.metadata?.mailingDate && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>Mailed: {new Date(officeAction.metadata.mailingDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    )}

                    {/* View Office Action button */}
                    <div className="mt-3 pt-3 border-t">
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
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>

            {/* Rejections Section */}
            <Collapsible
              open={expandedSections.has('rejections')}
              onOpenChange={() => toggleSection('rejections')}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-0 h-auto"
                >
                  <span className="font-medium text-gray-900">
                    Rejections ({filteredRejections.length})
                  </span>
                  {expandedSections.has('rejections') ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="mt-3 space-y-2">
                {filteredRejections.map((rejection) => {
                  const config = REJECTION_TYPE_CONFIG[rejection.type as keyof typeof REJECTION_TYPE_CONFIG] || REJECTION_TYPE_CONFIG['OTHER'];
                  const IconComponent = config.icon;
                  const isSelected = selectedRejectionId === rejection.id;
                  
                  return (
                    <Card
                      key={rejection.id}
                      className={cn(
                        'cursor-pointer transition-all hover:shadow-md',
                        isSelected && 'ring-2 ring-blue-500 bg-blue-50'
                      )}
                      onClick={() => onRejectionSelect?.(rejection.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <IconComponent className="h-4 w-4 mt-1 text-gray-600" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge 
                                variant="outline" 
                                className={cn('text-xs', config.color)}
                              >
                                {rejection.type}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                Claims {rejection.claims.join(', ')}
                              </span>
                            </div>
                            
                            <h4 className="font-medium text-sm text-gray-900 mb-1">
                              {config.label}
                            </h4>
                            
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {rejection.examinerReasoning.slice(0, 100)}...
                            </p>
                            
                            {rejection.priorArtReferences.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {rejection.priorArtReferences.slice(0, 3).map(ref => (
                                  <Badge 
                                    key={ref} 
                                    variant="secondary" 
                                    className="text-xs"
                                  >
                                    {ref}
                                  </Badge>
                                ))}
                                {rejection.priorArtReferences.length > 3 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{rejection.priorArtReferences.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                
                {filteredRejections.length === 0 && (
                  <div className="text-center py-6 text-gray-500">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No rejections match your filter</p>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>

            {/* Prior Art Section */}
            <Collapsible
              open={expandedSections.has('prior-art')}
              onOpenChange={() => toggleSection('prior-art')}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-0 h-auto"
                >
                  <span className="font-medium text-gray-900">
                    Prior Art ({priorArtAnalysis.length})
                  </span>
                  {expandedSections.has('prior-art') ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="mt-3 space-y-2">
                {priorArtAnalysis.map((priorArt) => (
                  <Card
                    key={priorArt.patentNumber}
                    className={cn(
                      'cursor-pointer transition-all hover:shadow-md hover:bg-gray-50',
                      hoveredPriorArt === priorArt.patentNumber && 'bg-blue-50'
                    )}
                    onMouseEnter={() => setHoveredPriorArt(priorArt.patentNumber)}
                    onMouseLeave={() => setHoveredPriorArt(null)}
                    onClick={() => handlePriorArtClick(priorArt.patentNumber)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <BookOpen className="h-4 w-4 text-gray-600" />
                            <span className="font-medium text-sm text-gray-900">
                              {priorArt.patentNumber}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                            <span>{priorArt.rejectionCount} rejection{priorArt.rejectionCount !== 1 ? 's' : ''}</span>
                            <span>Claims {Array.from(priorArt.claimsAffected).join(', ')}</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            {Array.from(priorArt.rejectionTypes).map(type => (
                              <Badge 
                                key={type} 
                                variant="outline" 
                                className={cn('text-xs', REJECTION_TYPE_CONFIG[type as keyof typeof REJECTION_TYPE_CONFIG]?.color)}
                              >
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewPriorArt(priorArt.patentNumber);
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
                    </CardContent>
                  </Card>
                ))}
                
                {priorArtAnalysis.length === 0 && (
                  <div className="text-center py-6 text-gray-500">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No prior art references found</p>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
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