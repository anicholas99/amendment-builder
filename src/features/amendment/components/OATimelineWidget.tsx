/**
 * OA Timeline Widget - Visual prosecution timeline
 * 
 * Displays prosecution progression in a horizontal timeline:
 * - Filing → OA-1 → Response-1 → OA-2 (current) → Response-2 (pending)
 * - Visual indicators for current status and next steps
 * - Click to navigate to specific events
 */

import React from 'react';
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
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useProsecutionTimeline } from '@/hooks/api/useProsecutionOverview';
import { useEnhancedProsecutionTimeline } from '@/hooks/api/useEnhancedProsecution';

interface OATimelineWidgetProps {
  projectId: string;
  applicationNumber?: string | null;
  onEventClick?: (eventId: string, eventType: string) => void;
  className?: string;
  useEnhanced?: boolean; // Toggle between legacy and enhanced timeline
}

const EVENT_CONFIG = {
  FILING: {
    icon: FileText,
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    label: 'Filed',
  },
  OFFICE_ACTION: {
    icon: AlertCircle,
    color: 'bg-orange-500',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50',
    label: 'OA',
  },
  RESPONSE: {
    icon: Send,
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    label: 'Response',
  },
  NOTICE_OF_ALLOWANCE: {
    icon: CheckCircle2,
    color: 'bg-emerald-500',
    textColor: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    label: 'NOA',
  },
  FINAL_REJECTION: {
    icon: AlertCircle,
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    label: 'Final',
  },
  RCE: {
    icon: FileText,
    color: 'bg-purple-500',
    textColor: 'text-purple-700',
    bgColor: 'bg-purple-50',
    label: 'RCE',
  },
} as const;

export const OATimelineWidget: React.FC<OATimelineWidgetProps> = ({
  projectId,
  applicationNumber,
  onEventClick,
  className,
  useEnhanced = true, // Default to enhanced if application number is available
}) => {
  // Use enhanced timeline if enabled and application number is available
  const { data: enhancedTimeline, isLoading: enhancedLoading } = useEnhancedProsecutionTimeline(
    projectId,
    applicationNumber
  );
  
  // Fallback to legacy timeline
  const { data: legacyTimeline, isLoading: legacyLoading } = useProsecutionTimeline(projectId);
  
  const timeline = useEnhanced && applicationNumber ? enhancedTimeline : legacyTimeline;
  const isLoading = useEnhanced && applicationNumber ? enhancedLoading : legacyLoading;

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

  // Group events by OA rounds for better visualization
  const rounds = timeline.reduce((acc, event, index) => {
    if (event.type === 'FILING') {
      acc.push({ filing: event, officeAction: null, response: null });
    } else if (event.type === 'OFFICE_ACTION' || event.type === 'FINAL_REJECTION') {
      acc.push({ filing: null, officeAction: event, response: null });
    } else if (event.type === 'RESPONSE' || event.type === 'RCE') {
      // Attach to most recent round
      const lastRound = acc[acc.length - 1];
      if (lastRound) {
        lastRound.response = event;
      }
    } else {
      // Other events (NOA, etc.) as standalone
      acc.push({ filing: null, officeAction: event, response: null });
    }
    return acc;
  }, [] as Array<{ filing: any; officeAction: any; response: any }>);

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200', className)}>
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Prosecution Timeline</h3>
            <p className="text-xs text-gray-500 mt-1">
              {timeline.length} events over {timeline[timeline.length - 1]?.daysFromPrevious ? 
                Math.round(timeline.reduce((sum, event) => sum + (event.daysFromPrevious || 0), 0)) : 
                'unknown'} days
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
          {timeline.map((event, index) => {
            const config = EVENT_CONFIG[event.type] || EVENT_CONFIG.OFFICE_ACTION;
            const Icon = config.icon;
            const isLast = index === timeline.length - 1;
            const isCurrent = event.status === 'ACTIVE' || event.status === 'PENDING';

            return (
              <React.Fragment key={event.id}>
                {/* Event Node */}
                <div className="flex flex-col items-center min-w-0">
                  <button
                    onClick={() => onEventClick?.(event.id, event.type)}
                    className={cn(
                      'relative w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all hover:scale-105',
                      isCurrent 
                        ? `${config.color} border-white shadow-lg` 
                        : `bg-white ${config.color.replace('bg-', 'border-')} hover:${config.bgColor}`
                    )}
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
                  <div className="mt-2 text-center min-w-0">
                    <div className={cn(
                      'text-xs font-medium',
                      isCurrent ? config.textColor : 'text-gray-600'
                    )}>
                      {config.label}
                      {event.type === 'OFFICE_ACTION' && ` ${index === 0 ? '1' : Math.ceil(index / 2)}`}
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
          {timeline.length > 0 && timeline[timeline.length - 1].type === 'OFFICE_ACTION' && (
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
              Current: {timeline[timeline.length - 1]?.title}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEventClick?.('timeline', 'VIEW_ALL')}
                className="text-xs"
              >
                <Eye className="h-3 w-3 mr-1" />
                View Details
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 