import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const expandableChatVariants = cva(
  'flex flex-col bg-background border shadow-lg transition-all duration-300 overflow-hidden',
  {
    variants: {
      size: {
        sm: 'w-80 h-96',
        md: 'w-96 h-[32rem]',
        lg: 'w-[28rem] h-[36rem]',
        full: 'w-full h-full',
      },
      position: {
        'bottom-right': 'fixed bottom-4 right-4 rounded-lg',
        'bottom-left': 'fixed bottom-4 left-4 rounded-lg',
        center: 'relative w-full h-full rounded-none border-0 shadow-none',
        floating: 'fixed bottom-20 right-4 rounded-lg',
      },
      state: {
        expanded: '',
        minimized: 'h-14 overflow-hidden',
      },
    },
    defaultVariants: {
      size: 'md',
      position: 'bottom-right',
      state: 'expanded',
    },
  }
);

interface ExpandableChatProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof expandableChatVariants> {
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  onExpandChange?: (expanded: boolean) => void;
  expanded?: boolean;
}

const ExpandableChatContext = React.createContext<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
}>({
  isOpen: true,
  setIsOpen: () => {},
  isExpanded: true,
  setIsExpanded: () => {},
});

const ExpandableChat = React.forwardRef<HTMLDivElement, ExpandableChatProps>(
  (
    {
      className,
      size,
      position,
      children,
      onOpenChange,
      open,
      onExpandChange,
      expanded,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpenState] = React.useState(open ?? true);
    const [isExpanded, setIsExpandedState] = React.useState(expanded ?? true);

    const setIsOpen = React.useCallback(
      (value: boolean) => {
        setIsOpenState(value);
        onOpenChange?.(value);
      },
      [onOpenChange]
    );

    const setIsExpanded = React.useCallback(
      (value: boolean) => {
        setIsExpandedState(value);
        onExpandChange?.(value);
      },
      [onExpandChange]
    );

    React.useEffect(() => {
      if (open !== undefined) {
        setIsOpenState(open);
      }
    }, [open]);

    React.useEffect(() => {
      if (expanded !== undefined) {
        setIsExpandedState(expanded);
      }
    }, [expanded]);

    if (!isOpen) return null;

    return (
      <ExpandableChatContext.Provider
        value={{ isOpen, setIsOpen, isExpanded, setIsExpanded }}
      >
        <div
          ref={ref}
          className={cn(
            expandableChatVariants({
              size: isExpanded ? size : 'sm',
              position,
              state: isExpanded ? 'expanded' : 'minimized',
            }),
            'animate-in fade-in-0 slide-in-from-bottom-4 duration-300',
            className
          )}
          {...props}
        >
          {children}
        </div>
      </ExpandableChatContext.Provider>
    );
  }
);
ExpandableChat.displayName = 'ExpandableChat';

interface ExpandableChatHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  showClose?: boolean;
  showExpand?: boolean;
}

const ExpandableChatHeader = React.forwardRef<
  HTMLDivElement,
  ExpandableChatHeaderProps
>(
  (
    { className, children, showClose = true, showExpand = true, ...props },
    ref
  ) => {
    const { setIsOpen, isExpanded, setIsExpanded } = React.useContext(
      ExpandableChatContext
    );

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-between p-4 border-b',
          'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
          className
        )}
        {...props}
      >
        <div className="flex-1">{children}</div>
        <div className="flex items-center gap-2">
          {showExpand && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
              <span className="sr-only">
                {isExpanded ? 'Minimize' : 'Maximize'}
              </span>
            </Button>
          )}
          {showClose && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          )}
        </div>
      </div>
    );
  }
);
ExpandableChatHeader.displayName = 'ExpandableChatHeader';

interface ExpandableChatBodyProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const ExpandableChatBody = React.forwardRef<
  HTMLDivElement,
  ExpandableChatBodyProps
>(({ className, children, ...props }, ref) => {
  const { isExpanded } = React.useContext(ExpandableChatContext);

  return (
    <div
      ref={ref}
      className={cn(
        'flex-1 overflow-hidden',
        isExpanded ? 'opacity-100' : 'opacity-0',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
ExpandableChatBody.displayName = 'ExpandableChatBody';

interface ExpandableChatFooterProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const ExpandableChatFooter = React.forwardRef<
  HTMLDivElement,
  ExpandableChatFooterProps
>(({ className, children, ...props }, ref) => {
  const { isExpanded } = React.useContext(ExpandableChatContext);

  return (
    <div
      ref={ref}
      className={cn(
        'border-t',
        isExpanded ? 'opacity-100' : 'opacity-0',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
ExpandableChatFooter.displayName = 'ExpandableChatFooter';

export {
  ExpandableChat,
  ExpandableChatHeader,
  ExpandableChatBody,
  ExpandableChatFooter,
  expandableChatVariants,
};
