import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ToggleLeft } from 'lucide-react';

// Import both chat interfaces
import ChatInterface from './ChatInterface';
import EnhancedChatInterface from './EnhancedChatInterface';

// Import types
import { ChatInterfaceProps } from '../types';

interface ChatInterfaceDemoProps extends ChatInterfaceProps {
  showToggle?: boolean;
}

/**
 * Demo component that allows switching between original and enhanced chat interfaces
 *
 * Usage:
 * ```tsx
 * <ChatInterfaceDemo
 *   projectData={projectData}
 *   onContentUpdate={handleContentUpdate}
 *   pageContext="technology"
 *   projectId={projectId}
 *   showToggle={true} // Show toggle button to switch between interfaces
 * />
 * ```
 */
const ChatInterfaceDemo: React.FC<ChatInterfaceDemoProps> = ({
  showToggle = true,
  ...props
}) => {
  const [useEnhanced, setUseEnhanced] = useState(true);

  return (
    <div className="relative h-full flex flex-col">
      {showToggle && (
        <div className="absolute top-2 right-2 z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setUseEnhanced(!useEnhanced)}
            className="gap-2"
          >
            <ToggleLeft className="h-4 w-4" />
            {useEnhanced ? 'Use Original' : 'Use Enhanced'}
          </Button>
        </div>
      )}

      <div className="flex-1 h-full overflow-hidden">
        {useEnhanced ? (
          <EnhancedChatInterface {...props} />
        ) : (
          <ChatInterface {...props} />
        )}
      </div>
    </div>
  );
};

export default ChatInterfaceDemo;
