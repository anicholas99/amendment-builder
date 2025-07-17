import * as React from 'react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';

interface CollapseProps extends React.HTMLAttributes<HTMLDivElement> {
  in?: boolean;
  children: React.ReactNode;
}

const Collapse = React.forwardRef<HTMLDivElement, CollapseProps>(
  ({ in: isOpen = false, children, className, ...props }, ref) => (
    <Collapsible open={isOpen}>
      <CollapsibleContent
        ref={ref}
        className={cn(
          'data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down',
          className
        )}
        {...props}
      >
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
);
Collapse.displayName = 'Collapse';

export { Collapse };
