import React from 'react';
import { Tooltip, TooltipProps } from '@chakra-ui/react';

interface StandardTooltipProps extends Omit<TooltipProps, 'children'> {
  children: React.ReactElement;
}

/**
 * StandardTooltip component that provides consistent tooltip styling across the application
 *
 * @example
 * <StandardTooltip label="Create new project">
 *   <IconButton ... />
 * </StandardTooltip>
 */
export const StandardTooltip: React.FC<StandardTooltipProps> = ({
  children,
  placement = 'top',
  hasArrow = true,
  openDelay = 100,
  closeDelay = 100,
  ...props
}) => {
  return (
    <Tooltip
      placement={placement}
      hasArrow={hasArrow}
      openDelay={openDelay}
      closeDelay={closeDelay}
      {...props}
    >
      {children}
    </Tooltip>
  );
};
