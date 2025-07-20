/**
 * Amendment Project Card - Attorney-focused prosecution dashboard card
 * 
 * Shows only essential prosecution information:
 * - Next statutory deadline with color-coded urgency
 * - Current OA round and status
 * - Examiner statistics (allowance rate)
 * - Compact timeline strip
 * - Quick access to draft
 */

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { formatDistanceToNow, format, differenceInDays } from 'date-fns';
import {
  Calendar,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronRight,
  FileStack,
  User,
  BarChart3
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { isFeatureEnabled } from '@/config/featureFlags';

interface AmendmentProjectCardProps {
  project: {
    id: string;
    applicationNumber: string;
    title?: string;
    currentOA?: {
      type: 'NON_FINAL' | 'FINAL' | 'ADVISORY';
      mailedDate: Date;
      round: number;
    };
    nextDeadline?: {
      date: Date;
      type: 'RESPONSE_DUE' | 'APPEAL_DUE' | 'RCE_DUE';
      isStatutory: boolean;
    };
    examiner?: {
      name: string;
      artUnit: string;
      allowanceRate: number;
      artUnitAvgAllowance: number;
    };
    draftStatus?: 'NO_DRAFT' | 'IN_PROGRESS' | 'READY';
    fileCount?: number;
    milestones?: Array<{
      type: 'FILED' | 'NON_FINAL' | 'RESPONSE' | 'FINAL' | 'RCE' | 'NOA' | 'ABANDON';
      date: Date;
      label?: string;
    }>;
  };
  onOpenDraft: (projectId: string) => void;
  onViewFiles?: (projectId: string) => void;
  onViewTimeline?: (projectId: string) => void;
}

// Deadline urgency configuration
const getDeadlineConfig = (daysUntil: number) => {
  if (daysUntil < 0) return { color: 'bg-red-600', label: 'OVERDUE', priority: 'critical' };
  if (daysUntil <= 7) return { color: 'bg-red-500', label: `${daysUntil}d`, priority: 'urgent' };
  if (daysUntil <= 30) return { color: 'bg-orange-500', label: `${daysUntil}d`, priority: 'soon' };
  if (daysUntil <= 60) return { color: 'bg-yellow-500', label: `${daysUntil}d`, priority: 'normal' };
  return { color: 'bg-green-500', label: `${daysUntil}d`, priority: 'comfortable' };
};

// Milestone icons
const getMilestoneIcon = (type: string) => {
  switch (type) {
    case 'FILED': return FileText;
    case 'NON_FINAL': return AlertCircle;
    case 'FINAL': return AlertCircle;
    case 'RESPONSE': return ChevronRight;
    case 'RCE': return FileText;
    case 'NOA': return CheckCircle;
    default: return Clock;
  }
};

export const AmendmentProjectCard: React.FC<AmendmentProjectCardProps> = ({
  project,
  onOpenDraft,
  onViewFiles,
  onViewTimeline,
}) => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const isMinimalistUI = isFeatureEnabled('ENABLE_MINIMALIST_AMENDMENT_UI');

  const daysUntilDeadline = project.nextDeadline 
    ? differenceInDays(project.nextDeadline.date, new Date())
    : null;
  
  const deadlineConfig = daysUntilDeadline !== null 
    ? getDeadlineConfig(daysUntilDeadline)
    : null;

  const handleOpenDraft = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenDraft(project.id);
  };

  const handleCardClick = () => {
    // Navigate to amendment studio
    router.push(`/projects/${project.id}/amendment?tab=analysis`);
  };

  return (
    <Card
      className={cn(
        "relative transition-all duration-200 cursor-pointer",
        "hover:shadow-md hover:-translate-y-0.5",
        isHovered && "border-primary/50"
      )}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-4">
        {/* Header Row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-sm">
              {project.applicationNumber}
            </h3>
            {project.title && (
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                {project.title}
              </p>
            )}
          </div>
          
          {/* Deadline Badge */}
          {project.nextDeadline && deadlineConfig && (
            <Badge
              className={cn(
                "ml-2 text-white animate-pulse",
                deadlineConfig.color
              )}
            >
              <Calendar className="h-3 w-3 mr-1" />
              {deadlineConfig.label}
            </Badge>
          )}
        </div>

        {/* Current OA Status */}
        {project.currentOA && (
          <div className="mb-3 p-2 bg-muted/50 rounded-md">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">
                {project.currentOA.type === 'FINAL' ? 'Final' : 'Non-Final'} OA
              </span>
              <span className="text-muted-foreground">
                Round {project.currentOA.round} • Mailed {format(project.currentOA.mailedDate, 'MMM d, yyyy')}
              </span>
            </div>
          </div>
        )}

        {/* Examiner Stats */}
        {project.examiner && (
          <div className="flex items-center gap-4 mb-3 text-xs">
            <div className="flex items-center gap-1.5">
              <User className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">{project.examiner.name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BarChart3 className="h-3 w-3 text-muted-foreground" />
              <span className={cn(
                "font-medium",
                project.examiner.allowanceRate > project.examiner.artUnitAvgAllowance
                  ? "text-green-600"
                  : "text-orange-600"
              )}>
                {(project.examiner.allowanceRate * 100).toFixed(0)}%
              </span>
              <span className="text-muted-foreground">
                (AU: {(project.examiner.artUnitAvgAllowance * 100).toFixed(0)}%)
              </span>
            </div>
          </div>
        )}

        {/* Timeline Strip */}
        {project.milestones && project.milestones.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-1 overflow-hidden">
              {project.milestones.slice(-5).map((milestone, idx) => {
                const Icon = getMilestoneIcon(milestone.type);
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-1"
                    title={`${milestone.label || milestone.type} - ${format(milestone.date, 'MMM d, yyyy')}`}
                  >
                    <Icon className={cn(
                      "h-3 w-3",
                      milestone.type === 'NOA' ? "text-green-600" : "text-muted-foreground"
                    )} />
                    {idx < project.milestones!.length - 1 && (
                      <div className="w-4 h-0.5 bg-border" />
                    )}
                  </div>
                );
              })}
              {onViewTimeline && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 px-1 ml-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewTimeline(project.id);
                  }}
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Action Row */}
        <div className="flex items-center justify-between">
          <Button
            size="sm"
            variant={project.draftStatus === 'IN_PROGRESS' ? 'default' : 'outline'}
            onClick={handleOpenDraft}
            className="text-xs"
          >
            {project.draftStatus === 'IN_PROGRESS' ? 'Continue Draft' : 'Open Draft'}
          </Button>

          {/* Files Badge */}
          {project.fileCount !== undefined && project.fileCount > 0 && (
            <Badge
              variant="secondary"
              className="cursor-pointer hover:bg-secondary/80"
              onClick={(e) => {
                e.stopPropagation();
                onViewFiles?.(project.id);
              }}
            >
              <FileStack className="h-3 w-3 mr-1" />
              {project.fileCount}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};