import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface TooltipTestProps {
  position?: 'fixed-header' | 'sidebar' | 'content' | 'floating';
  className?: string;
}

/**
 * Test component to verify tooltip z-index behavior in different layout contexts
 * Use this component temporarily to test tooltip visibility in problematic areas
 */
export const TooltipTest: React.FC<TooltipTestProps> = ({
  position = 'content',
  className,
}) => {
  const getPositionStyles = () => {
    switch (position) {
      case 'fixed-header':
        return 'fixed top-4 right-4 z-[100]';
      case 'sidebar':
        return 'fixed left-4 top-20 z-[15]';
      case 'floating':
        return 'fixed bottom-4 left-4 z-[1500]';
      default:
        return 'relative';
    }
  };

  return (
    <div className={cn(getPositionStyles(), className)}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Test Z-Index
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div>
              <p className="font-bold">Tooltip Test - {position}</p>
              <p>Z-index: 99999</p>
              <p>Portal: document.body</p>
              <p>If you can see this, tooltips are working!</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
