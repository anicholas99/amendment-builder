/**
 * Alerts Ribbon - Prosecution alerts and strategic recommendations
 * 
 * Displays urgent alerts and recommendations:
 * - Deadline warnings
 * - Validation alerts
 * - Strategic recommendations
 * - Risk warnings
 */

import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Target,
  X,
  ChevronRight,
  Info,
  Zap,
  Brain
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useProsecutionAlerts } from '@/hooks/api/useProsecutionOverview';

interface AlertsRibbonProps {
  projectId: string;
  onAlertClick?: (alertId: string, alertType: string) => void;
  onDismissAlert?: (alertId: string) => void;
  className?: string;
}

const ALERT_CONFIG = {
  DEADLINE: {
    icon: Clock,
    title: 'Deadline Alert',
    colorClass: 'border-l-orange-500 bg-orange-50',
    iconColor: 'text-orange-600',
    textColor: 'text-orange-900',
    badgeColor: 'bg-orange-100 text-orange-700',
  },
  VALIDATION: {
    icon: AlertTriangle,
    title: 'Validation Required',
    colorClass: 'border-l-red-500 bg-red-50',
    iconColor: 'text-red-600',
    textColor: 'text-red-900',
    badgeColor: 'bg-red-100 text-red-700',
  },
  STRATEGY: {
    icon: Brain,
    title: 'Strategic Recommendation',
    colorClass: 'border-l-blue-500 bg-blue-50',
    iconColor: 'text-blue-600',
    textColor: 'text-blue-900',
    badgeColor: 'bg-blue-100 text-blue-700',
  },
  RISK: {
    icon: Target,
    title: 'Risk Warning',
    colorClass: 'border-l-yellow-500 bg-yellow-50',
    iconColor: 'text-yellow-600',
    textColor: 'text-yellow-900',
    badgeColor: 'bg-yellow-100 text-yellow-700',
  },
} as const;

const SEVERITY_CONFIG = {
  CRITICAL: {
    label: 'Critical',
    color: 'bg-red-600 text-white',
    priority: 4,
  },
  HIGH: {
    label: 'High',
    color: 'bg-orange-600 text-white',
    priority: 3,
  },
  MEDIUM: {
    label: 'Medium',
    color: 'bg-yellow-600 text-white',
    priority: 2,
  },
  LOW: {
    label: 'Low',
    color: 'bg-gray-600 text-white',
    priority: 1,
  },
} as const;

export const AlertsRibbon: React.FC<AlertsRibbonProps> = ({
  projectId,
  onAlertClick,
  onDismissAlert,
  className,
}) => {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const {
    criticalAlerts,
    highAlerts,
    mediumAlerts,
    lowAlerts,
    totalAlerts,
    actionRequiredCount,
  } = useProsecutionAlerts(projectId);

  // Combine and sort alerts by priority
  const allAlerts = [
    ...criticalAlerts,
    ...highAlerts,
    ...mediumAlerts,
    ...lowAlerts,
  ]
    .filter(alert => !dismissedAlerts.has(alert.id))
    .sort((a, b) => SEVERITY_CONFIG[b.severity].priority - SEVERITY_CONFIG[a.severity].priority);

  const handleDismiss = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
    onDismissAlert?.(alertId);
  };

  const handleAlertClick = (alert: any) => {
    onAlertClick?.(alert.id, alert.type);
  };

  if (allAlerts.length === 0) {
    return null; // No alerts to show
  }

  // Show top 3 alerts in ribbon format
  const displayAlerts = allAlerts.slice(0, 3);
  const remainingCount = Math.max(0, allAlerts.length - 3);

  return (
    <div className={cn('space-y-2', className)}>
      {displayAlerts.map((alert) => {
        const config = ALERT_CONFIG[alert.type];
        const severityConfig = SEVERITY_CONFIG[alert.severity];
        const Icon = config.icon;

        return (
          <Alert 
            key={alert.id}
            className={cn(
              'border-l-4 cursor-pointer transition-all hover:shadow-md',
              config.colorClass
            )}
            onClick={() => handleAlertClick(alert)}
          >
            <div className="flex items-start space-x-3">
              {/* Alert Icon */}
              <Icon className={cn('h-5 w-5 mt-0.5', config.iconColor)} />
              
              {/* Alert Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className={cn('font-medium text-sm', config.textColor)}>
                    {alert.title}
                  </h4>
                  <Badge className={cn('text-xs', severityConfig.color)}>
                    {severityConfig.label}
                  </Badge>
                  {alert.actionRequired && (
                    <Badge className="bg-red-100 text-red-700 text-xs">
                      Action Required
                    </Badge>
                  )}
                </div>
                
                <AlertDescription className={cn('text-sm', config.textColor)}>
                  {alert.message}
                </AlertDescription>
                
                {alert.dueDate && (
                  <div className={cn('text-xs mt-2', config.textColor)}>
                    Due: {format(alert.dueDate, 'MMM d, yyyy')}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                {alert.actionRequired && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAlertClick(alert);
                    }}
                  >
                    <Zap className="h-3 w-3 mr-1" />
                    Take Action
                  </Button>
                )}
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDismiss(alert.id);
                  }}
                  className={cn('text-xs', config.textColor)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </Alert>
        );
      })}

      {/* Summary Bar (if more alerts exist) */}
      {remainingCount > 0 && (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
          <div className="flex items-center space-x-2">
            <Info className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-700">
              {remainingCount} more alert{remainingCount !== 1 ? 's' : ''}
            </span>
            {actionRequiredCount > displayAlerts.filter(a => a.actionRequired).length && (
              <Badge className="bg-red-100 text-red-700 text-xs">
                {actionRequiredCount - displayAlerts.filter(a => a.actionRequired).length} require action
              </Badge>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAlertClick?.('all', 'VIEW_ALL')}
            className="text-sm"
          >
            View All
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}; 