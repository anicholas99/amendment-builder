'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { cn } from '@/lib/utils';

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal container={document.body}>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 rounded-md bg-gray-900 px-3 py-1.5 text-xs text-white shadow-lg animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        'relative',
        'before:content-[""] before:absolute before:w-0 before:h-0',
        'before:data-[side=top]:border-l-4 before:data-[side=top]:border-r-4 before:data-[side=top]:border-t-4 before:data-[side=top]:border-l-transparent before:data-[side=top]:border-r-transparent before:data-[side=top]:border-t-gray-900 before:data-[side=top]:top-full before:data-[side=top]:left-1/2 before:data-[side=top]:-translate-x-1/2',
        'before:data-[side=bottom]:border-l-4 before:data-[side=bottom]:border-r-4 before:data-[side=bottom]:border-b-4 before:data-[side=bottom]:border-l-transparent before:data-[side=bottom]:border-r-transparent before:data-[side=bottom]:border-b-gray-900 before:data-[side=bottom]:bottom-full before:data-[side=bottom]:left-1/2 before:data-[side=bottom]:-translate-x-1/2',
        'before:data-[side=left]:border-t-4 before:data-[side=left]:border-b-4 before:data-[side=left]:border-l-4 before:data-[side=left]:border-t-transparent before:data-[side=left]:border-b-transparent before:data-[side=left]:border-l-gray-900 before:data-[side=left]:left-full before:data-[side=left]:top-1/2 before:data-[side=left]:-translate-y-1/2',
        'before:data-[side=right]:border-t-4 before:data-[side=right]:border-b-4 before:data-[side=right]:border-r-4 before:data-[side=right]:border-t-transparent before:data-[side=right]:border-b-transparent before:data-[side=right]:border-r-gray-900 before:data-[side=right]:right-full before:data-[side=right]:top-1/2 before:data-[side=right]:-translate-y-1/2',
        className
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
