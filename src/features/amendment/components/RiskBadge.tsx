/**
 * Risk Badge - Simple risk indicator for claims
 * 
 * Displays LOW/MED/HIGH risk levels with color coding
 * Click to expand details (progressive disclosure)
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'PENDING';

interface RiskBadgeProps {
  level: RiskLevel;
  onClick?: () => void;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'default';
}

const RISK_CONFIG = {
  LOW: {
    label: 'LOW',
    color: 'bg-green-100 text-green-800 hover:bg-green-200',
    icon: CheckCircle,
  },
  MEDIUM: {
    label: 'MED',
    color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    icon: AlertCircle,
  },
  HIGH: {
    label: 'HIGH',
    color: 'bg-red-100 text-red-800 hover:bg-red-200',
    icon: AlertTriangle,
  },
  PENDING: {
    label: '...',
    color: 'bg-gray-100 text-gray-600',
    icon: AlertCircle,
  },
} as const;

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  onClick,
  className,
  showIcon = false,
  size = 'default',
}) => {
  const config = RISK_CONFIG[level];
  const Icon = config.icon;
  
  return (
    <Badge
      variant="outline"
      className={cn(
        'border-0 font-medium transition-colors',
        config.color,
        onClick && 'cursor-pointer',
        size === 'sm' ? 'text-xs px-1.5 py-0' : 'text-xs px-2 py-0.5',
        className
      )}
      onClick={onClick}
    >
      {showIcon && <Icon className={cn('mr-1', size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')} />}
      {config.label}
    </Badge>
  );
};