/**
 * OA Timeline Widget - Visual prosecution timeline
 * 
 * Displays prosecution progression in a horizontal timeline:
 * - Shows only key milestone documents on the timeline
 * - Supporting documents available in drawer
 * - Visual indicators for current status and next steps
 * - Click to navigate to specific events
 */

import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  FileText, 
  Send, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  ArrowRight,
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
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useProsecutionTimeline } from '@/hooks/api/useProsecutionOverview';
import { useEnhancedProsecutionTimeline } from '@/hooks/api/useEnhancedProsecution';
import { isFeatureEnabled } from '@/config/featureFlags';
import { 
  isTimelineDocument, 
  getDocumentDisplayConfig,
  DOCUMENT_DISPLAY_CONFIG 
} from '../config/prosecutionDocuments';

interface OATimelineWidgetProps {
  projectId: string;
  applicationNumber?: string | null;
  onEventClick?: (eventId: string, eventType: string) => void;
  className?: string;
  useEnhanced?: boolean; // Toggle between legacy and enhanced timeline
}

interface TimelineEvent {
  id: string;
  type: string;
  documentCode?: string;
  title: string;
  date: Date;
  status?: string;
  daysFromPrevious?: number;
  relatedDocuments?: any[];
}

// Visual configuration for timeline events
const EVENT_VISUAL_CONFIG = {
  // Office Actions
  'CTNF': {
    icon: Mail,
    color: 'bg-orange-500',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50',
  },
  'CTFR': {
    icon: FileX,
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
  },
  'CTAV': {
    icon: MessageSquare,
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
  },
  
  // Responses
  'REM': {
    icon: Send,
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
  },
  'A...': {
    icon: FileCheck,
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
  },
  'A.NE': {
    icon: FileCheck,
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
  },
  'AMSB': {
    icon: FileCheck,
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
  },
  'RCEX': {
    icon: RefreshCw,
    color: 'bg-purple-500',
    textColor: 'text-purple-700',
    bgColor: 'bg-purple-50',
  },
  'RCE': {
    icon: RefreshCw,
    color: 'bg-purple-500',
    textColor: 'text-purple-700',
    bgColor: 'bg-purple-50',
  },
  
  // Notices
  'NOA': {
    icon: Award,
    color: 'bg-emerald-500',
    textColor: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
  },
  'ISSUE.NTF': {
    icon: Award,
    color: 'bg-emerald-500',
    textColor: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
  },
  'ABN': {
    icon: Ban,
    color: 'bg-gray-500',
    textColor: 'text-gray-700',
    bgColor: 'bg-gray-50',
  },
  
  // Other
  'EXIN': {
    icon: Users,
    color: 'bg-indigo-500',
    textColor: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
  },
  'PET.DEC.TC': {
    icon: FileCheck,
    color: 'bg-purple-500',
    textColor: 'text-purple-700',
    bgColor: 'bg-purple-50',
  },
  'PETDEC': {
    icon: FileCheck,
    color: 'bg-purple-500',
    textColor: 'text-purple-700',
    bgColor: 'bg-purple-50',
  },
  
  // Filing Events
  'SPEC': {
    icon: FileText,
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
  },
  'APP.FILE.REC': {
    icon: FileCheck,
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
  },
  'TRNA': {
    icon: Eye,
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
  },
  
  // Restriction/Election
  'CTNR': {
    icon: AlertTriangle,
    color: 'bg-amber-500',
    textColor: 'text-amber-700',
    bgColor: 'bg-amber-50',
  },
  'CTRS': {
    icon: FileCheck,
    color: 'bg-amber-500',
    textColor: 'text-amber-700',
    bgColor: 'bg-amber-50',
  },
  
  // IDS
  'IDS': {
    icon: Folder,
    color: 'bg-cyan-500',
    textColor: 'text-cyan-700',
    bgColor: 'bg-cyan-50',
  },
  'R561': {
    icon: FileCheck,
    color: 'bg-cyan-500',
    textColor: 'text-cyan-700',
    bgColor: 'bg-cyan-50',
  },
  
  // Extensions
  'XT/': {
    icon: Clock,
    color: 'bg-violet-500',
    textColor: 'text-violet-700',
    bgColor: 'bg-violet-50',
  },
  'EXT.': {
    icon: Clock,
    color: 'bg-violet-500',
    textColor: 'text-violet-700',
    bgColor: 'bg-violet-50',
  },
  'PETXT': {
    icon: Clock,
    color: 'bg-violet-500',
    textColor: 'text-violet-700',
    bgColor: 'bg-violet-50',
  },
  
  // Additional Responses
  'RESP.FINAL': {
    icon: Send,
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
  },
  
  // Additional Notices
  'N271': {
    icon: AlertCircle,
    color: 'bg-orange-500',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50',
  },
  'NRES': {
    icon: AlertCircle,
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
  },
  'NTCN': {
    icon: RefreshCw,
    color: 'bg-indigo-500',
    textColor: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
  },
  
  // Legacy event types (for backward compatibility)
  'FILING': {
    icon: FileText,
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
  },
  'APPLICATION_FILED': {
    icon: FileText,
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
  },
  'OFFICE_ACTION': {
    icon: Mail,
    color: 'bg-orange-500',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50',
  },
  'NON_FINAL_OA': {
    icon: Mail,
    color: 'bg-orange-500',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50',
  },
  'FINAL_OA': {
    icon: FileX,
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
  },
  'FINAL_REJECTION': {
    icon: FileX,
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
  },
  'RESPONSE': {
    icon: Send,
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
  },
  'RESPONSE_FILED': {
    icon: Send,
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
  },
  'RCE_FILED': {
    icon: RefreshCw,
    color: 'bg-purple-500',
    textColor: 'text-purple-700',
    bgColor: 'bg-purple-50',
  },
  'NOTICE_OF_ALLOWANCE': {
    icon: Award,
    color: 'bg-emerald-500',
    textColor: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
  },
  'INTERVIEW_CONDUCTED': {
    icon: Users,
    color: 'bg-indigo-500',
    textColor: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
  },
  'ABANDONMENT': {
    icon: Ban,
    color: 'bg-gray-500',
    textColor: 'text-gray-700',
    bgColor: 'bg-gray-50',
  },
  
  // Add mappings for new event types
  'IDS_FILED': {
    icon: Folder,
    color: 'bg-cyan-500',
    textColor: 'text-cyan-700',
    bgColor: 'bg-cyan-50',
  },
  'EXTENSION': {
    icon: Clock,
    color: 'bg-violet-500',
    textColor: 'text-violet-700',
    bgColor: 'bg-violet-50',
  },
  'CONTINUATION_FILED': {
    icon: RefreshCw,
    color: 'bg-indigo-500',
    textColor: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
  },
  'OTHER': {
    icon: File,
    color: 'bg-gray-500',
    textColor: 'text-gray-700',
    bgColor: 'bg-gray-50',
  },
} as const;

export const OATimelineWidget: React.FC<OATimelineWidgetProps> = ({
  projectId,
  applicationNumber,
  onEventClick,
  className,
  useEnhanced = true, // Default to enhanced if application number is available
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  
  // Use enhanced timeline if enabled and application number is available
  const { data: enhancedTimeline, isLoading: enhancedLoading } = useEnhancedProsecutionTimeline(
    projectId,
    applicationNumber
  );
  
  // Fallback to legacy timeline
  const { data: legacyTimeline, isLoading: legacyLoading } = useProsecutionTimeline(projectId);
  
  const timeline = useEnhanced && applicationNumber ? enhancedTimeline : legacyTimeline;
  const isLoading = useEnhanced && applicationNumber ? enhancedLoading : legacyLoading;
  const isMinimalistUI = isFeatureEnabled('ENABLE_MINIMALIST_AMENDMENT_UI');
  
  // Filter timeline to only show milestone documents
  console.log('[OATimelineWidget] Raw timeline data:', timeline);
  const milestoneEvents = timeline?.filter(event => {
    // Check by document code first (if available)
    if (event.documentCode) {
      const isTimeline = isTimelineDocument(event.documentCode);
      console.log(`[OATimelineWidget] Document ${event.documentCode} is timeline: ${isTimeline}`);
      return isTimeline;
    }
    // Fallback to checking by type for legacy data
    const timelineTypes = ['FILING', 'APPLICATION_FILED', 'OFFICE_ACTION', 'NON_FINAL_OA', 
      'FINAL_OA', 'FINAL_REJECTION', 'RESPONSE', 'RESPONSE_FILED', 'RCE', 'RCE_FILED',
      'NOTICE_OF_ALLOWANCE', 'INTERVIEW_CONDUCTED', 'ABANDONMENT', 'IDS_FILED', 
      'EXTENSION', 'CONTINUATION_FILED', 'NOTICE'];
    return timelineTypes.includes(event.type);
  }) || [];
  console.log('[OATimelineWidget] Filtered milestone events:', milestoneEvents);

  const handleEventClick = (event: TimelineEvent) => {
    setSelectedEvent(event);
    setDrawerOpen(true);
    onEventClick?.(event.id, event.type);
  };

  if (isLoading) {
    return (
      <div className={cn('bg-white rounded-lg border border-gray-200 p-4', className)}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
          <div className="flex space-x-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-8 h-8 bg-gray-200 rounded-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-12"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!timeline || timeline.length === 0) {
    return (
      <div className={cn('bg-white rounded-lg border border-gray-200 p-4', className)}>
        <div className="text-center text-gray-500">
          <Clock className="h-8 w-8 mx-auto mb-2" />
          <p>No prosecution timeline available</p>
        </div>
      </div>
    );
  }

  // Get display config for an event
  const getEventConfig = (event: TimelineEvent) => {
    const docConfig = event.documentCode ? getDocumentDisplayConfig(event.documentCode) : null;
    const visualConfig = event.documentCode ? EVENT_VISUAL_CONFIG[event.documentCode] : EVENT_VISUAL_CONFIG[event.type];
    
    console.log(`[OATimelineWidget] Getting config for event:`, {
      documentCode: event.documentCode,
      type: event.type,
      hasVisualConfig: !!visualConfig,
      icon: visualConfig?.icon?.name || 'default'
    });
    
    return {
      label: docConfig?.label || event.title || event.type,
      shortLabel: docConfig?.shortLabel || event.type,
      description: docConfig?.description || '',
      icon: visualConfig?.icon || File,
      color: visualConfig?.color || 'bg-gray-500',
      textColor: visualConfig?.textColor || 'text-gray-700',
      bgColor: visualConfig?.bgColor || 'bg-gray-50',
    };
  };

  // Minimalist rendering - just milestone nodes in a strip
  if (isMinimalistUI) {
    return (
      <>
        <div className={cn('flex items-center gap-1 p-2 bg-muted/30 rounded-md', className)}>
          {milestoneEvents.map((event, index) => {
            const isLast = index === milestoneEvents.length - 1;
            const config = getEventConfig(event);
            const Icon = config.icon;
            const isCurrent = event.status === 'ACTIVE' || event.status === 'PENDING';
            
            return (
              <React.Fragment key={event.id}>
                <button
                  onClick={() => handleEventClick(event)}
                  className={cn(
                    'relative p-1.5 rounded',
                    'hover:bg-accent transition-colors',
                    'group'
                  )}
                  title={`${config.label} - ${format(event.date, 'MMM d, yyyy')}`}
                >
                  <Icon className={cn('h-4 w-4', config.textColor)} />
                  {isCurrent && (
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </button>
                {!isLast && <div className="w-3 h-0.5 bg-border" />}
              </React.Fragment>
            );
          })}
          {milestoneEvents.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 ml-auto"
              onClick={() => setDrawerOpen(true)}
              title="View all documents"
            >
              <Folder className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        {/* Document Drawer */}
        <DocumentDrawer 
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          timeline={timeline}
          selectedEvent={selectedEvent}
          applicationNumber={applicationNumber}
          getEventConfig={getEventConfig}
        />
      </>
    );
  }

  return (
    <>
    <div className={cn('bg-white rounded-lg border border-gray-200', className)}>
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Prosecution Timeline</h3>
            <p className="text-xs text-gray-500 mt-1">
              {milestoneEvents.length} key milestones • {timeline.length - milestoneEvents.length} supporting documents
            </p>
          </div>
          {useEnhanced && applicationNumber && enhancedTimeline && (
            <Badge variant="secondary" className="text-xs">
              USPTO Data
            </Badge>
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center space-x-1 overflow-x-auto pb-2">
          {milestoneEvents.map((event, index) => {
            const config = getEventConfig(event);
            const Icon = config.icon;
            const isLast = index === milestoneEvents.length - 1;
            const isCurrent = event.status === 'ACTIVE' || event.status === 'PENDING';

            return (
              <React.Fragment key={event.id}>
                {/* Event Node */}
                <div className="flex flex-col items-center min-w-0">
                  <button
                    onClick={() => handleEventClick(event)}
                    className={cn(
                      'relative w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all hover:scale-105',
                      isCurrent 
                        ? `${config.color} border-white shadow-lg` 
                        : `bg-white ${config.color.replace('bg-', 'border-')} hover:${config.bgColor}`
                    )}
                    title={config.description}
                  >
                    <Icon className={cn(
                      'h-4 w-4',
                      isCurrent ? 'text-white' : config.textColor
                    )} />
                    
                    {/* Current indicator */}
                    {isCurrent && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                    )}
                  </button>

                  {/* Event Label */}
                  <div className="mt-2 text-center min-w-0 max-w-[100px]">
                    <div className={cn(
                      'text-xs font-medium truncate',
                      isCurrent ? config.textColor : 'text-gray-600'
                    )}>
                      {config.shortLabel}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {format(event.date, 'MM/dd/yy')}
                    </div>
                    {event.daysFromPrevious && (
                      <div className="text-xs text-gray-400">
                        +{event.daysFromPrevious}d
                      </div>
                    )}
                  </div>
                </div>

                {/* Connector Line */}
                {!isLast && (
                  <div className="flex items-center px-2">
                    <ArrowRight className="h-3 w-3 text-gray-400" />
                  </div>
                )}
              </React.Fragment>
            );
          })}

          {/* Next Expected Event (if applicable) */}
          {milestoneEvents.length > 0 && 
           ['CTNF', 'CTFR', 'OFFICE_ACTION', 'NON_FINAL_OA', 'FINAL_OA'].includes(
             milestoneEvents[milestoneEvents.length - 1].documentCode || milestoneEvents[milestoneEvents.length - 1].type
           ) && (
            <>
              <div className="flex items-center px-2">
                <ArrowRight className="h-3 w-3 text-gray-300" />
              </div>
              <div className="flex flex-col items-center min-w-0">
                <div className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-gray-400" />
                </div>
                <div className="mt-2 text-center">
                  <div className="text-xs font-medium text-gray-400">Response</div>
                  <div className="text-xs text-gray-400 mt-1">Pending</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {milestoneEvents.length} milestones • {timeline.length - milestoneEvents.length} supporting documents
            </div>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDrawerOpen(true)}
                className="text-xs"
              >
                <Folder className="h-3 w-3 mr-1" />
                Files Drawer
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    {/* Document Drawer */}
    <DocumentDrawer 
      open={drawerOpen}
      onOpenChange={setDrawerOpen}
      timeline={timeline}
      selectedEvent={selectedEvent}
      applicationNumber={applicationNumber}
      getEventConfig={getEventConfig}
    />
    </>
  );
};

// Document Drawer Component
interface DocumentDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timeline: TimelineEvent[];
  selectedEvent: TimelineEvent | null;
  applicationNumber?: string | null;
  getEventConfig: (event: TimelineEvent) => any;
}

const DocumentDrawer: React.FC<DocumentDrawerProps> = ({
  open,
  onOpenChange,
  timeline,
  selectedEvent,
  applicationNumber,
  getEventConfig,
}) => {
  const [localSelectedEvent, setLocalSelectedEvent] = useState(selectedEvent);
  
  // Update local state when parent selection changes
  React.useEffect(() => {
    setLocalSelectedEvent(selectedEvent);
  }, [selectedEvent]);
  
  // Separate timeline and drawer documents
  const timelineDocuments = timeline.filter(event => {
    if (event.documentCode) {
      return isTimelineDocument(event.documentCode);
    }
    // Fallback for legacy data
    const timelineTypes = ['FILING', 'APPLICATION_FILED', 'OFFICE_ACTION', 'NON_FINAL_OA', 
      'FINAL_OA', 'FINAL_REJECTION', 'RESPONSE', 'RESPONSE_FILED', 'RCE', 'RCE_FILED',
      'NOTICE_OF_ALLOWANCE', 'INTERVIEW_CONDUCTED', 'ABANDONMENT', 'IDS_FILED', 
      'EXTENSION', 'CONTINUATION_FILED', 'NOTICE'];
    return timelineTypes.includes(event.type);
  });
  
  const drawerDocuments = timeline.filter(event => {
    if (event.documentCode) {
      return !isTimelineDocument(event.documentCode);
    }
    // Include documents without codes in drawer
    const timelineTypes = ['FILING', 'APPLICATION_FILED', 'OFFICE_ACTION', 'NON_FINAL_OA', 
      'FINAL_OA', 'FINAL_REJECTION', 'RESPONSE', 'RESPONSE_FILED', 'RCE', 'RCE_FILED',
      'NOTICE_OF_ALLOWANCE', 'INTERVIEW_CONDUCTED', 'ABANDONMENT', 'IDS_FILED', 
      'EXTENSION', 'CONTINUATION_FILED', 'NOTICE'];
    return !timelineTypes.includes(event.type);
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>USPTO Documents</SheetTitle>
          <SheetDescription>
            {applicationNumber && `Application ${applicationNumber}`}
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Selected Event Details */}
          {localSelectedEvent && (
            <div className="bg-muted/30 rounded-lg p-4">
              <h3 className="text-sm font-medium mb-2">Selected Event</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {(() => {
                    const config = getEventConfig(localSelectedEvent);
                    const Icon = config.icon;
                    return (
                      <>
                        <div className={cn('p-2 rounded', config.bgColor)}>
                          <Icon className={cn('h-4 w-4', config.textColor)} />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{config.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {format(localSelectedEvent.date, 'MMMM d, yyyy')}
                          </div>
                          {config.description && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {config.description}
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
                {localSelectedEvent.documentCode && (
                  <Badge variant="outline" className="text-xs">
                    {localSelectedEvent.documentCode}
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          {/* Timeline Documents */}
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              Timeline Milestones 
              <span className="text-xs font-normal text-muted-foreground">
                ({timelineDocuments.length})
              </span>
            </h3>
            <div className="space-y-2">
              {timelineDocuments.map(doc => {
                const config = getEventConfig(doc);
                const Icon = config.icon;
                const isSelected = localSelectedEvent?.id === doc.id;
                
                return (
                  <button
                    key={doc.id}
                    onClick={() => {
                      setLocalSelectedEvent(doc);
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors',
                      isSelected ? 'bg-accent' : 'hover:bg-muted/50'
                    )}
                  >
                    <div className={cn('p-2 rounded', config.bgColor)}>
                      <Icon className={cn('h-4 w-4', config.textColor)} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{config.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(doc.date, 'MMM d, yyyy')}
                        {doc.documentCode && ` • ${doc.documentCode}`}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Supporting Documents */}
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              Supporting Documents
              <span className="text-xs font-normal text-muted-foreground">
                ({drawerDocuments.length})
              </span>
            </h3>
            {drawerDocuments.length > 0 ? (
              <div className="space-y-1">
                {drawerDocuments.map(doc => {
                  const config = doc.documentCode ? getDocumentDisplayConfig(doc.documentCode) : null;
                  
                  return (
                    <div
                      key={doc.id}
                      className="flex items-center gap-3 p-2 rounded hover:bg-muted/30 text-sm"
                    >
                      <File className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div>{config?.label || doc.title || doc.type}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(doc.date, 'MMM d, yyyy')}
                          {doc.documentCode && ` • ${doc.documentCode}`}
                        </div>
                        {config?.description && (
                          <div className="text-xs text-muted-foreground italic">
                            {config.description}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No supporting documents available</p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};