/**
 * Focused Action Banner - Single consolidated alert for attorney focus
 * 
 * Replaces multiple alert ribbons with one clear call-to-action
 * Yellow for pending actions, red only for urgent deadlines (<10 days)
 */

import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FocusedActionBannerProps {
  alerts: Array<{
    id: string;
    type: 'DEADLINE' | 'VALIDATION' | 'STRATEGY' | 'RISK';
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    title: string;
    message: string;
    daysRemaining?: number;
    actionRequired?: boolean;
  }>;
  onAction?: (alertId: string) => void;
  className?: string;
}

export const FocusedActionBanner: React.FC<FocusedActionBannerProps> = ({
  alerts,
  onAction,
  className,
}) => {
  if (alerts.length === 0) return null;

  // Prioritize validation alerts and urgent deadlines
  const priorityAlert = alerts.find(a => a.type === 'VALIDATION' && a.actionRequired) ||
                       alerts.find(a => a.type === 'DEADLINE' && a.daysRemaining && a.daysRemaining < 10) ||
                       alerts[0];

  if (!priorityAlert) return null;

  const isUrgent = priorityAlert.daysRemaining && priorityAlert.daysRemaining < 10;
  const bannerColor = isUrgent ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200';
  const textColor = isUrgent ? 'text-red-900' : 'text-yellow-900';
  const iconColor = isUrgent ? 'text-red-600' : 'text-yellow-600';

  return (
    <div className={cn(
      'px-6 py-3 border-b flex items-center justify-between',
      bannerColor,
      className
    )}>
      <div className="flex items-center space-x-3">
        {priorityAlert.type === 'DEADLINE' ? (
          <Clock className={cn('h-5 w-5', iconColor)} />
        ) : (
          <AlertTriangle className={cn('h-5 w-5', iconColor)} />
        )}
        
        <div className={cn('text-sm font-medium', textColor)}>
          <span>Pending actions: </span>
          <span className="font-normal">{priorityAlert.message}</span>
          {priorityAlert.daysRemaining && (
            <span className="ml-2">
              ({priorityAlert.daysRemaining} days)
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {priorityAlert.type === 'VALIDATION' && (
          <Button
            size="sm"
            variant="default"
            onClick={() => onAction?.(priorityAlert.id)}
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            Validate now
          </Button>
        )}
        {priorityAlert.type === 'DEADLINE' && (
          <Button
            size="sm"
            variant="default"
            onClick={() => onAction?.(priorityAlert.id)}
            className={isUrgent ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700'}
          >
            Open Draft
          </Button>
        )}
      </div>
    </div>
  );
};