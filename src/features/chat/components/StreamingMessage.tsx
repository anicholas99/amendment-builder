import React, { memo, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface StreamingMessageProps {
  content: string;
  isStreaming: boolean;
  className?: string;
}

export const StreamingMessage = memo<StreamingMessageProps>(
  ({ content, isStreaming, className }) => {
    const [displayContent, setDisplayContent] = useState(content);
    const contentRef = useRef(content);
    const animationFrameRef = useRef<number>();

    // Smooth content updates during streaming
    useEffect(() => {
      if (isStreaming && content !== contentRef.current) {
        // Cancel any pending animation frame
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }

        // Use requestAnimationFrame for smooth updates
        animationFrameRef.current = requestAnimationFrame(() => {
          setDisplayContent(content);
          contentRef.current = content;
        });
      } else if (!isStreaming) {
        // Ensure final content is displayed
        setDisplayContent(content);
        contentRef.current = content;
      }

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, [content, isStreaming]);

    return (
      <div className={cn('relative', className)}>
        <div
          className={cn(
            'transition-opacity duration-200',
            isStreaming ? 'opacity-90' : 'opacity-100'
          )}
        >
          {displayContent}
        </div>

        {isStreaming && displayContent && (
          <span className="inline-block ml-1">
            <span className="inline-flex">
              <span className="animate-pulse text-primary">▊</span>
            </span>
          </span>
        )}
      </div>
    );
  }
);

StreamingMessage.displayName = 'StreamingMessage';

// Typing indicator component
export const TypingIndicator = memo(() => {
  return (
    <div className="flex items-center gap-1 p-2">
      <div className="flex gap-1">
        <span className="h-2 w-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="h-2 w-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="h-2 w-2 bg-primary/60 rounded-full animate-bounce" />
      </div>
      <span className="text-xs text-muted-foreground ml-2">
        AI is thinking...
      </span>
    </div>
  );
});

TypingIndicator.displayName = 'TypingIndicator';

// Streaming status indicator
export const StreamingStatus = memo<{ isStreaming: boolean }>(
  ({ isStreaming }) => {
    if (!isStreaming) return null;

    return (
      <div className="absolute bottom-2 right-2 flex items-center gap-1">
        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-xs text-muted-foreground">Streaming</span>
      </div>
    );
  }
);

StreamingStatus.displayName = 'StreamingStatus';
