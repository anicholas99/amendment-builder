/**
 * Prosecution Header - Essential application metadata and deadline tracking
 * 
 * Displays critical prosecution information in a data-dense header strip:
 * - Application number, title, examiner, art unit
 * - Filing date, disposition type, response deadline
 * - Urgency indicators and quick status overview
 */

import React from 'react';
import { format } from 'date-fns';
import { 
  User, 
  Calendar, 
  Hash, 
  AlertTriangle, 
  Clock, 
  CheckCircle2,
  Building,
  FileText,
  TrendingUp
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { abbreviateClaimRanges } from '@/utils/claims';
import { useProsecutionOverview, useOfficeActionUrgency } from '@/hooks/api/useProsecutionOverview';

interface ProsecutionHeaderProps {
  projectId: string;
  className?: string;
}

const URGENCY_CONFIG = {
  CRITICAL: {
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: AlertTriangle,
    label: 'OVERDUE',
  },
  HIGH: {
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: Clock,
    label: 'URGENT',
  },
  MEDIUM: {
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
    label: 'DUE SOON',
  },
  LOW: {
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle2,
    label: 'ON TIME',
  },
} as const;

const STATUS_CONFIG = {
  'PRE_FILING': { color: 'bg-gray-100 text-gray-700', label: 'Pre-Filing' },
  'PENDING_RESPONSE': { color: 'bg-blue-100 text-blue-700', label: 'Pending Response' },
  'ACTIVE': { color: 'bg-green-100 text-green-700', label: 'Active' },
  'ALLOWED': { color: 'bg-emerald-100 text-emerald-700', label: 'Allowed' },
  'ABANDONED': { color: 'bg-gray-100 text-gray-700', label: 'Abandoned' },
  'ISSUED': { color: 'bg-purple-100 text-purple-700', label: 'Issued' },
} as const;

const OA_TYPE_CONFIG = {
  'NON_FINAL': { color: 'bg-blue-100 text-blue-700', label: 'Non-Final' },
  'FINAL': { color: 'bg-red-100 text-red-700', label: 'Final' },
  'NOTICE_OF_ALLOWANCE': { color: 'bg-green-100 text-green-700', label: 'Notice of Allowance' },
  'OTHER': { color: 'bg-gray-100 text-gray-700', label: 'Other' },
} as const;

export const ProsecutionHeader: React.FC<ProsecutionHeaderProps> = ({
  projectId,
  className,
}) => {
  const { data: overview, isLoading } = useProsecutionOverview(projectId);
  const { urgencyLevel, daysToRespond, isOverdue, deadline } = useOfficeActionUrgency(projectId);

  if (isLoading) {
    return (
      <div className={cn('bg-white border-b border-gray-200 px-6 py-4', className)}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className={cn('bg-white border-b border-gray-200 px-6 py-4', className)}>
        <div className="text-gray-500">
          <FileText className="h-5 w-5 inline mr-2" />
          No prosecution data available
        </div>
      </div>
    );
  }

  const { applicationMetadata, currentOfficeAction, examinerAnalytics } = overview;
  const urgencyConfig = URGENCY_CONFIG[urgencyLevel];
  const statusConfig = STATUS_CONFIG[applicationMetadata.prosecutionStatus];
  const UrgencyIcon = urgencyConfig.icon;

  return (
    <div className={cn('bg-white border-b border-gray-200', className)}>
      {/* Main Header Row */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Application Info */}
          <div className="flex items-center space-x-6">
            {/* Application Number & Title */}
            <div className="flex flex-col">
              <div className="flex items-center space-x-3">
                <div className="text-lg font-semibold text-gray-900">
                  {applicationMetadata.applicationNumber || 'No App. Number'}
                </div>
                <Badge className={statusConfig.color}>
                  {statusConfig.label}
                </Badge>
              </div>
              {applicationMetadata.title && (
                <div className="text-sm text-gray-600 mt-1 max-w-md truncate">
                  {applicationMetadata.title}
                </div>
              )}
            </div>

            {/* Examiner & Art Unit */}
            <div className="flex items-center space-x-4 text-sm">
              {examinerAnalytics?.examiner?.name && (
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">{examinerAnalytics.examiner.name}</span>
                </div>
              )}
              {(examinerAnalytics?.examiner?.artUnit || applicationMetadata.artUnit) && (
                <div className="flex items-center space-x-1">
                  <Building className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">
                    AU {examinerAnalytics?.examiner?.artUnit || applicationMetadata.artUnit}
                  </span>
                </div>
              )}
            </div>

            {/* Filing Date */}
            {applicationMetadata.filingDate && (
              <div className="flex items-center space-x-1 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-700">
                  Filed {format(applicationMetadata.filingDate, 'MM/dd/yyyy')}
                </span>
              </div>
            )}
          </div>

          {/* Right: Current OA Status & Deadline */}
          <div className="flex items-center space-x-4">
            {currentOfficeAction && (
              <>
                {/* OA Type */}
                <Badge className={OA_TYPE_CONFIG[currentOfficeAction.type].color}>
                  {OA_TYPE_CONFIG[currentOfficeAction.type].label}
                </Badge>

                {/* Response Deadline */}
                <div className="flex items-center space-x-2">
                  <UrgencyIcon className={cn(
                    'h-4 w-4',
                    urgencyLevel === 'CRITICAL' ? 'text-red-600' :
                    urgencyLevel === 'HIGH' ? 'text-orange-600' :
                    urgencyLevel === 'MEDIUM' ? 'text-yellow-600' :
                    'text-green-600'
                  )} />
                  <div className="text-right">
                    <div className={cn(
                      'text-sm font-medium',
                      urgencyLevel === 'CRITICAL' ? 'text-red-900' :
                      urgencyLevel === 'HIGH' ? 'text-orange-900' :
                      urgencyLevel === 'MEDIUM' ? 'text-yellow-900' :
                      'text-green-900'
                    )}>
                      {isOverdue ? 'OVERDUE' : 
                       daysToRespond === 1 ? '1 day' :
                       daysToRespond === 0 ? 'Due today' :
                       `${daysToRespond} days`}
                    </div>
                    {deadline && (
                      <div className="text-xs text-gray-500">
                        Due {format(deadline, 'MM/dd/yyyy')}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Info Row (if current OA exists) */}
      {currentOfficeAction && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            {/* Left: OA Details */}
            <div className="flex items-center space-x-6">
              {/* Issue Date */}
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">
                  Issued {format(currentOfficeAction.dateIssued, 'MM/dd/yyyy')}
                </span>
              </div>

              {/* Rejection Summary */}
              <div className="flex items-center space-x-3">
                <div className="text-gray-600">
                  {currentOfficeAction.rejectionSummary.total} rejection{currentOfficeAction.rejectionSummary.total !== 1 ? 's' : ''}
                </div>
                <div className="flex space-x-1">
                  {Object.entries(currentOfficeAction.rejectionSummary.byType).map(([type, count]) => (
                    <Badge key={type} variant="secondary" className="text-xs">
                      {type}: {count}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Claims Affected */}
              {currentOfficeAction.rejectionSummary.claimsAffected.length > 0 && (
                <div className="text-gray-600">
                  Claims {abbreviateClaimRanges(currentOfficeAction.rejectionSummary.claimsAffected)}
                </div>
              )}
            </div>

            {/* Right: AI Strategy & Risk */}
            <div className="flex items-center space-x-4">
              {/* Risk Level */}
              <Badge 
                className={cn(
                  currentOfficeAction.rejectionSummary.riskLevel === 'HIGH' ? 'bg-red-100 text-red-700' :
                  currentOfficeAction.rejectionSummary.riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                )}
              >
                {currentOfficeAction.rejectionSummary.riskLevel} Risk
              </Badge>

              {/* AI Strategy */}
              {currentOfficeAction.aiStrategy && (
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <span className="text-blue-700 font-medium">
                    {currentOfficeAction.aiStrategy.primaryApproach === 'ARGUE' ? 'Argue' :
                     currentOfficeAction.aiStrategy.primaryApproach === 'AMEND' ? 'Amend' :
                     'Argue + Amend'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 