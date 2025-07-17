import * as React from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';

interface ChatMessageListProps extends React.HTMLAttributes<HTMLDivElement> {
  isLoading?: boolean;
  loadingText?: string;
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
  messagesEndRef?: React.RefObject<HTMLDivElement>;
}

const ChatMessageList = React.forwardRef<HTMLDivElement, ChatMessageListProps>(
  (
    {
      className,
      children,
      isLoading,
      loadingText = 'Loading messages...',
      onScroll,
      messagesEndRef,
      ...props
    },
    ref
  ) => {
    const scrollAreaRef = React.useRef<HTMLDivElement>(null);
    const [isAtBottom, setIsAtBottom] = React.useState(true);

    const handleScroll = React.useCallback(
      (event: React.UIEvent<HTMLDivElement>) => {
        const element = event.currentTarget;
        const threshold = 50;
        const isBottom =
          element.scrollHeight - element.scrollTop - element.clientHeight <
          threshold;

        setIsAtBottom(isBottom);
        onScroll?.(event);
      },
      [onScroll]
    );

    const scrollToBottom = React.useCallback(
      (smooth = true) => {
        if (messagesEndRef?.current) {
          messagesEndRef.current.scrollIntoView({
            behavior: smooth ? 'smooth' : 'instant',
            block: 'end',
          });
        } else if (scrollAreaRef.current) {
          const scrollContainer = scrollAreaRef.current.querySelector(
            '[data-radix-scroll-area-viewport]'
          );
          if (scrollContainer) {
            scrollContainer.scrollTo({
              top: scrollContainer.scrollHeight,
              behavior: smooth ? 'smooth' : 'instant',
            });
          }
        }
      },
      [messagesEndRef]
    );

    // Auto-scroll to bottom when new messages arrive (if already at bottom)
    React.useEffect(() => {
      if (isAtBottom) {
        scrollToBottom();
      }
    }, [children, isAtBottom, scrollToBottom]);

    if (isLoading) {
      return (
        <div className={cn('flex items-center justify-center py-8', className)}>
          <div className="flex flex-col items-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">{loadingText}</p>
          </div>
        </div>
      );
    }

    const { dir, ...scrollAreaProps } = props;

    return (
      <div className={cn('h-full overflow-hidden', className)}>
        <ScrollArea
          ref={scrollAreaRef}
          className="h-full w-full chat-scroll-area"
          dir={dir as any}
          {...scrollAreaProps}
        >
          <div className="space-y-4 p-4" onScroll={handleScroll}>
            {children}
            {messagesEndRef && (
              <div ref={messagesEndRef} className="h-px w-full" />
            )}
          </div>
        </ScrollArea>
      </div>
    );
  }
);
ChatMessageList.displayName = 'ChatMessageList';

interface ChatMessageListItemProps
  extends React.HTMLAttributes<HTMLDivElement> {
  animate?: boolean;
}

const ChatMessageListItem = React.forwardRef<
  HTMLDivElement,
  ChatMessageListItemProps
>(({ className, animate = true, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        animate && 'animate-in fade-in-0 slide-in-from-bottom-2 duration-300',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
ChatMessageListItem.displayName = 'ChatMessageListItem';

export { ChatMessageList, ChatMessageListItem };
