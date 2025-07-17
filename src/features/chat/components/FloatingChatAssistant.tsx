import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

// Import shadcn/ui components
import { Button } from '@/components/ui/button';
import {
  ExpandableChat,
  ExpandableChatHeader,
  ExpandableChatBody,
  ExpandableChatFooter,
} from '@/components/ui/chat';

// Import the enhanced chat interface
import EnhancedChatInterface from './EnhancedChatInterface';

// Import types
import { ChatInterfaceProps } from '../types';

interface FloatingChatAssistantProps
  extends Omit<ChatInterfaceProps, 'setPreviousContent'> {
  position?: 'bottom-right' | 'bottom-left' | 'floating';
  size?: 'sm' | 'md' | 'lg';
  defaultOpen?: boolean;
  buttonLabel?: string;
}

/**
 * Floating chat assistant that can be embedded anywhere in the application
 *
 * Features:
 * - Expandable/collapsible chat window
 * - Floating action button
 * - Customizable position and size
 * - Maintains chat history
 *
 * Usage:
 * ```tsx
 * <FloatingChatAssistant
 *   projectData={projectData}
 *   onContentUpdate={handleContentUpdate}
 *   pageContext="technology"
 *   projectId={projectId}
 *   position="bottom-right"
 *   size="md"
 * />
 * ```
 */
const FloatingChatAssistant: React.FC<FloatingChatAssistantProps> = ({
  position = 'bottom-right',
  size = 'md',
  defaultOpen = false,
  buttonLabel = 'Chat with AI Assistant',
  ...chatProps
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (!isOpen) {
    return (
      <div
        className={`fixed z-50 ${
          position === 'bottom-right'
            ? 'bottom-4 right-4'
            : position === 'bottom-left'
              ? 'bottom-4 left-4'
              : 'bottom-20 right-4'
        }`}
      >
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="shadow-lg hover:shadow-xl transition-all duration-200 gap-2"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="hidden sm:inline">{buttonLabel}</span>
        </Button>
      </div>
    );
  }

  return (
    <ExpandableChat
      size={size}
      position={position}
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <ExpandableChatHeader>
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <span className="font-semibold">AI Assistant</span>
        </div>
      </ExpandableChatHeader>

      <ExpandableChatBody className="p-0">
        <div className="h-full">
          <EnhancedChatInterface
            {...chatProps}
            setPreviousContent={() => {}} // Not used in floating mode
          />
        </div>
      </ExpandableChatBody>
    </ExpandableChat>
  );
};

export default FloatingChatAssistant;
