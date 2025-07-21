/**
 * Enhanced Timeline Component
 * 
 * A beautiful, scrollable timeline that handles long prosecution histories
 * with proper dates, icons, and visual hierarchy
 */

import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import {
  FileText,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Eye,
  Download,
  ChevronRight,
  FileCheck,
  FileX,
  MessageSquare,
  AlertTriangle,
  Users,
  Award,
  Ban,
  RefreshCw,
  File,
  Mail,
  Folder,
  ScrollText,
  FileSearch,
  Timer,
  Briefcase,
  Scale,
  Gavel,
  Info,
  Loader2,
  Reply,
  PlusCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useRealUSPTOTimeline } from '@/hooks/api/useRealUSPTOTimeline';
import { getDocumentDisplayConfig } from '../config/prosecutionDocuments';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { AmendmentClientService } from '@/client/services/amendment.client-service';
import { apiFetch } from '@/lib/api/apiClient';
import { useRouter } from 'next/router';

interface EnhancedTimelineProps {
  projectId: string;
  className?: string;
  onAmendmentClick?: (officeActionId: string) => void;
}

// Enhanced visual configuration with more icons and better colors
const EVENT_VISUAL_CONFIG: Record<string, {
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  // Filing Events
  'SPEC': {
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  'APP.FILE.REC': {
    icon: FileCheck,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  'TRNA': {
    icon: Eye,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  
  // Office Actions
  'CTNF': {
    icon: Mail,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  'CTFR': {
    icon: FileX,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  'CTAV': {
    icon: MessageSquare,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
  'CTNR': {
    icon: AlertTriangle,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  
  // Responses
  'REM': {
    icon: Send,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  'A...': {
    icon: FileCheck,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  'A.NE': {
    icon: FileCheck,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  'AMSB': {
    icon: ScrollText,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  'RESP.FINAL': {
    icon: Send,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  'CTRS': {
    icon: FileCheck,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  
  // RCE
  'RCEX': {
    icon: RefreshCw,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  'RCE': {
    icon: RefreshCw,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  
  // IDS
  'IDS': {
    icon: FileSearch,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
  },
  'R561': {
    icon: FileCheck,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
  },
  
  // Extensions
  'XT/': {
    icon: Timer,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
  },
  'EXT.': {
    icon: Clock,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
  },
  'PETXT': {
    icon: Clock,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
  },
  
  // Petitions
  'PET.DEC.TC': {
    icon: Gavel,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  'PETDEC': {
    icon: Scale,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  
  // Notices
  'NOA': {
    icon: Award,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  'ISSUE.NTF': {
    icon: Award,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  'N271': {
    icon: AlertCircle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  'NRES': {
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  
  // Other
  'ABN': {
    icon: Ban,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  },
  'EXIN': {
    icon: Users,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
  },
  'NTCN': {
    icon: RefreshCw,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
  },
  
  // Default
  'DEFAULT': {
    icon: File,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  },
};

export const EnhancedTimeline: React.FC<EnhancedTimelineProps> = ({
  projectId,
  className,
  onAmendmentClick,
}) => {
  const { data: usptoData, isLoading } = useRealUSPTOTimeline(projectId);
  const queryClient = useQueryClient();
  const router = useRouter();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [downloadingDocs, setDownloadingDocs] = useState<Set<string>>(new Set());
  const [processingOfficeAction, setProcessingOfficeAction] = useState<string | null>(null);
  
  // Find the latest office action that needs a response
  const latestOfficeAction = useMemo(() => {
    if (!usptoData?.timeline) return null;
    
    // Office action document codes that typically need responses
    const officeActionCodes = ['CTNF', 'CTFR', 'CTAV', 'MCTNF', 'MCTFR'];
    
    // Sort by date descending and find the first office action
    const sortedEvents = [...usptoData.timeline].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    return sortedEvents.find(event => 
      officeActionCodes.includes(event.documentCode)
    );
  }, [usptoData?.timeline]);
  
  // Download USPTO document mutation
  const downloadUSPTODoc = useMutation({
    mutationFn: async (params: {
      id: string; // Database record ID
      documentId: string;
      documentCode: string;
      mailRoomDate: string;
      documentDescription?: string;
    }) => {
      const response = await apiFetch(`/api/projects/${projectId}/office-actions/uspto-download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to download document');
      }
      
      return response.json();
    },
    onMutate: (variables) => {
      setDownloadingDocs(prev => new Set(prev).add(variables.documentId));
    },
    onSuccess: (data, variables) => {
      toast({
        title: 'Document Downloaded',
        description: `Successfully downloaded ${variables.documentCode} document to project storage`,
      });
      // Refetch timeline to update button state
      queryClient.invalidateQueries({ queryKey: ['uspto-timeline', projectId] });
    },
    onError: (error, variables) => {
      toast({
        title: 'Download Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
    onSettled: (data, error, variables) => {
      setDownloadingDocs(prev => {
        const next = new Set(prev);
        next.delete(variables.documentId);
        return next;
      });
    }
  });
  
  if (isLoading) {
    return (
      <div className={cn('bg-white rounded-lg border p-6', className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  const timeline = usptoData?.timeline || [];
  
  if (timeline.length === 0) {
    return (
      <div className={cn('bg-white rounded-lg border p-6', className)}>
        <div className="text-center text-gray-500 py-8">
          <Briefcase className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm font-medium">No Prosecution History</p>
          <p className="text-xs mt-1">Sync with USPTO to view timeline</p>
        </div>
      </div>
    );
  }
  
  const getEventConfig = (event: any) => {
    const docConfig = getDocumentDisplayConfig(event.documentCode);
    const visualConfig = EVENT_VISUAL_CONFIG[event.documentCode] || EVENT_VISUAL_CONFIG.DEFAULT;
    
    return {
      label: docConfig?.label || event.title || event.type,
      shortLabel: docConfig?.shortLabel || event.documentCode || 'Document',
      description: docConfig?.description || event.description,
      ...visualConfig,
    };
  };
  
  // Group events by year for better organization (latest first)
  const eventsByYear = timeline.reduce((acc: any, event: any) => {
    const year = format(event.date, 'yyyy');
    if (!acc[year]) acc[year] = [];
    acc[year].push(event);
    return acc;
  }, {});
  
  // Sort events within each year by date (latest first)
  Object.keys(eventsByYear).forEach(year => {
    eventsByYear[year].sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  });
  
  return (
    <div className={cn('bg-white rounded-lg border', className)}>
      {/* Header */}
      <div className="p-4 border-b bg-gray-50/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Prosecution Timeline</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {timeline.length} events • {Object.keys(eventsByYear).length} years
            </p>
          </div>
          {usptoData?.stats && (
            <div className="flex items-center gap-4 text-xs">
              <div className="text-center">
                <div className="font-semibold text-gray-900">{usptoData.stats.totalDocuments}</div>
                <div className="text-gray-500">Total Docs</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-orange-600">{usptoData.stats.officeActionCount}</div>
                <div className="text-gray-500">Office Actions</div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Timeline */}
      <ScrollArea className="h-[600px]">
        <div className="p-6">
          <TooltipProvider>
            {Object.entries(eventsByYear)
              .sort(([yearA], [yearB]) => parseInt(yearB) - parseInt(yearA))
              .map(([year, yearEvents]: [string, any]) => (
              <div key={year} className="mb-8 last:mb-0">
                {/* Year Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px bg-gray-200 flex-1"></div>
                  <Badge variant="secondary" className="font-semibold">
                    {year}
                  </Badge>
                  <div className="h-px bg-gray-200 flex-1"></div>
                </div>
                
                {/* Events in this year */}
                <div className="space-y-4 ml-8">
                  {yearEvents.map((event: any, index: number) => {
                    const config = getEventConfig(event);
                    const Icon = config.icon;
                    const isSelected = selectedEvent?.id === event.id;
                    
                    return (
                      <div
                        key={event.id}
                        className={cn(
                          'flex items-start gap-4 group cursor-pointer transition-all',
                          'hover:translate-x-1',
                          isSelected && 'translate-x-2'
                        )}
                        onClick={() => setSelectedEvent(event)}
                      >
                        {/* Icon */}
                        <Tooltip>
                          <TooltipTrigger>
                            <div className={cn(
                              'w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all',
                              'group-hover:scale-110',
                              config.bgColor,
                              config.borderColor,
                              isSelected && 'ring-2 ring-offset-2 ring-gray-400'
                            )}>
                              <Icon className={cn('h-5 w-5', config.color)} />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-medium">{config.shortLabel}</p>
                            <p className="text-xs">{event.documentCode}</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        {/* Content */}
                        <div className={cn(
                          "flex-1 pb-4",
                          latestOfficeAction && event.id === latestOfficeAction.id && "border-l-4 border-blue-500 pl-4 -ml-1"
                        )}>
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-gray-900 group-hover:text-gray-700">
                                  {config.label}
                                </h4>
                                {/* Latest OA indicator */}
                                {latestOfficeAction && event.id === latestOfficeAction.id && (
                                  <Badge className="text-xs px-2 py-0 bg-blue-600 text-white">
                                    Latest OA
                                  </Badge>
                                )}
                              </div>
                              {config.description && (
                                <p className="text-sm text-gray-500 mt-0.5">
                                  {config.description}
                                </p>
                              )}
                              <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {format(event.date, 'MMM d, yyyy')}
                                </div>
                                {event.pageCount && (
                                  <div className="flex items-center gap-1">
                                    <FileText className="h-3 w-3" />
                                    {event.pageCount} pages
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Action buttons */}
                            <div className="flex items-center gap-1">
                              {/* Download from USPTO button */}
                              {event.documentCode && usptoData?.applicationNumber && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant={event.storageUrl && event.storageUrl.startsWith('/api/') ? "secondary" : "outline"}
                                      size="sm"
                                      className="h-8 px-2 gap-1"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        
                                        // Check if already downloaded
                                        if (event.storageUrl && event.storageUrl.startsWith('/api/')) {
                                          // Open PDF viewer in new tab
                                          window.open(event.storageUrl, '_blank');
                                          return;
                                        }
                                        
                                        // Download logic
                                        if (!event.documentId) {
                                          toast({
                                            title: "Document ID not found",
                                            description: "This document may need to be re-synced from USPTO",
                                            variant: "destructive",
                                          });
                                          return;
                                        }
                                        downloadUSPTODoc.mutate({
                                          id: event.id, // Pass the actual record ID
                                          documentId: event.documentId,
                                          documentCode: event.documentCode,
                                          mailRoomDate: format(event.date, 'MM/dd/yyyy'),
                                          documentDescription: event.title
                                        });
                                      }}
                                      disabled={downloadingDocs.has(event.id) || (!event.documentId && !event.storageUrl)}
                                    >
                                      {downloadingDocs.has(event.id) ? (
                                        <>
                                          <Loader2 className="h-3 w-3 animate-spin" />
                                          <span className="text-xs">Downloading...</span>
                                        </>
                                      ) : event.storageUrl && event.storageUrl.startsWith('/api/') ? (
                                        <>
                                          <Eye className="h-3 w-3" />
                                          <span className="text-xs">View PDF</span>
                                        </>
                                      ) : (
                                        <>
                                          <Download className="h-3 w-3" />
                                          <span className="text-xs">Get PDF</span>
                                        </>
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{event.storageUrl && event.storageUrl.startsWith('/api/') 
                                      ? 'View PDF' 
                                      : 'Download PDF from USPTO'}</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                              {/* Existing download button for already downloaded PDFs */}
                              {event.pdfUrl && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(event.pdfUrl, '_blank');
                                      }}
                                    >
                                      <Eye className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>View PDF</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                              
                              {/* New Response button for latest office action */}
                              {latestOfficeAction && event.id === latestOfficeAction.id && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="default"
                                      size="sm"
                                      className="h-8 px-3 gap-1 bg-blue-600 hover:bg-blue-700"
                                      disabled={processingOfficeAction === event.id}
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        setProcessingOfficeAction(event.id);
                                        
                                        try {
                                          // Process the timeline office action
                                          // event.id is the ProjectDocument ID for timeline events
                                          const result = await AmendmentClientService.processTimelineOfficeAction(
                                            projectId,
                                            event.id // This is the ProjectDocument ID
                                          );
                                          
                                          toast({
                                            title: "Office Action Processed",
                                            description: `Response created for ${event.documentCode} dated ${format(event.date, 'MMM d, yyyy')}`,
                                          });
                                          
                                          // Update the view inline using the same pattern as existing responses
                                          if (result.officeActionId && onAmendmentClick) {
                                            onAmendmentClick(result.officeActionId);
                                          }
                                        } catch (error) {
                                          console.error('Failed to process office action:', error);
                                          toast({
                                            title: "Error",
                                            description: "Failed to create response. Please try again.",
                                            variant: "destructive",
                                          });
                                        } finally {
                                          setProcessingOfficeAction(null);
                                        }
                                      }}
                                    >
                                      {processingOfficeAction === event.id ? (
                                        <>
                                          <Loader2 className="h-3 w-3 animate-spin" />
                                          <span className="text-xs font-medium">Processing...</span>
                                        </>
                                      ) : (
                                        <>
                                          <Reply className="h-3 w-3" />
                                          <span className="text-xs font-medium">New Response</span>
                                        </>
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Create a new response for this office action</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                              >
                                <Info className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Connecting line */}
                          {index < yearEvents.length - 1 && (
                            <div className="absolute left-[1.75rem] mt-4 w-0.5 h-16 bg-gray-200"></div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </TooltipProvider>
        </div>
      </ScrollArea>
      
      {/* Selected Event Details */}
      {selectedEvent && (
        <div className="border-t bg-gray-50/50 p-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium text-sm text-gray-900">
                {getEventConfig(selectedEvent).label}
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                {format(selectedEvent.date, 'MMMM d, yyyy')} • Document Code: {selectedEvent.documentCode}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedEvent(null)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};