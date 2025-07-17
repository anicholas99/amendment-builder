import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const chatBubbleVariants = cva(
  'relative inline-flex flex-col gap-2 rounded-2xl p-4 text-sm transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-muted text-muted-foreground',
        user: 'bg-primary text-primary-foreground',
        assistant: 'bg-muted text-foreground border border-border/50 shadow-sm',
      },
      side: {
        left: 'rounded-bl-none',
        right: 'rounded-br-none',
      },
    },
    defaultVariants: {
      variant: 'default',
      side: 'left',
    },
  }
);

interface ChatBubbleProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chatBubbleVariants> {
  isTyping?: boolean;
}

const ChatBubble = React.forwardRef<HTMLDivElement, ChatBubbleProps>(
  ({ className, variant, side, isTyping, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-end gap-2',
          side === 'right' ? 'flex-row-reverse' : 'flex-row',
          className
        )}
        {...props}
      >
        <div
          className={cn(
            chatBubbleVariants({ variant, side }),
            'animate-in fade-in-0 slide-in-from-bottom-2 duration-300',
            isTyping && 'min-w-[60px]'
          )}
        >
          {isTyping ? (
            <div className="flex gap-1">
              <span className="h-2 w-2 animate-bounce rounded-full bg-current opacity-75 [animation-delay:-0.3s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-current opacity-75 [animation-delay:-0.15s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-current opacity-75" />
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    );
  }
);
ChatBubble.displayName = 'ChatBubble';

interface ChatBubbleAvatarProps extends React.HTMLAttributes<HTMLDivElement> {}

const ChatBubbleAvatar = React.forwardRef<
  HTMLDivElement,
  ChatBubbleAvatarProps
>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn('flex-shrink-0', className)} {...props}>
      {children}
    </div>
  );
});
ChatBubbleAvatar.displayName = 'ChatBubbleAvatar';

interface ChatBubbleMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  isLoading?: boolean;
}

const ChatBubbleMessage = React.forwardRef<
  HTMLDivElement,
  ChatBubbleMessageProps
>(({ className, isLoading, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'text-sm leading-relaxed break-words text-current',
        isLoading && 'animate-pulse',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
ChatBubbleMessage.displayName = 'ChatBubbleMessage';

interface ChatBubbleTimestampProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const ChatBubbleTimestamp = React.forwardRef<
  HTMLDivElement,
  ChatBubbleTimestampProps
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('text-xs text-current opacity-60 mt-1', className)}
      {...props}
    >
      {children}
    </div>
  );
});
ChatBubbleTimestamp.displayName = 'ChatBubbleTimestamp';

interface ChatBubbleActionProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const ChatBubbleAction = React.forwardRef<
  HTMLButtonElement,
  ChatBubbleActionProps
>(({ className, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        'text-xs opacity-70 hover:opacity-100 transition-opacity',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
ChatBubbleAction.displayName = 'ChatBubbleAction';

export {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
  ChatBubbleTimestamp,
  ChatBubbleAction,
  chatBubbleVariants,
};
