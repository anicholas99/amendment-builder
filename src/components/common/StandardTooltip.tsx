import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface StandardTooltipProps {
  children: React.ReactElement;
  label?: React.ReactNode;
  placement?: 'top' | 'right' | 'bottom' | 'left';
  delayDuration?: number;
  disabled?: boolean;
}

/**
 * StandardTooltip component that provides consistent tooltip styling across the application
 * Uses a high z-index to prevent clipping by overflow containers
 *
 * @example
 * <StandardTooltip label="Create new project">
 *   <IconButton ... />
 * </StandardTooltip>
 */
export const StandardTooltip: React.FC<StandardTooltipProps> = ({
  children,
  label,
  placement = 'top',
  delayDuration = 100,
  disabled = false,
}) => {
  if (!label || disabled) {
    return children;
  }

  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={placement}>
          {typeof label === 'string' ? <p>{label}</p> : label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
