import React from 'react';
import {
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Mic,
  Paperclip,
  Download,
  Share2,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ChatBubbleAction,
  ChatBubble,
  ChatBubbleMessage,
} from '@/components/ui/chat';
import { cn } from '@/lib/utils';

// Message action bar component
export const MessageActionBar = ({
  content,
  onCopy,
  onFeedback,
  onRegenerate,
}: {
  content: string;
  onCopy?: () => void;
  onFeedback?: (type: 'positive' | 'negative') => void;
  onRegenerate?: () => void;
}) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    onCopy?.();
  };

  return (
    <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <ChatBubbleAction onClick={handleCopy} title="Copy message">
        <Copy className="h-3 w-3" />
      </ChatBubbleAction>

      <ChatBubbleAction
        onClick={() => onFeedback?.('positive')}
        title="Good response"
      >
        <ThumbsUp className="h-3 w-3" />
      </ChatBubbleAction>

      <ChatBubbleAction
        onClick={() => onFeedback?.('negative')}
        title="Poor response"
      >
        <ThumbsDown className="h-3 w-3" />
      </ChatBubbleAction>

      {onRegenerate && (
        <ChatBubbleAction onClick={onRegenerate} title="Regenerate response">
          <RotateCcw className="h-3 w-3" />
        </ChatBubbleAction>
      )}
    </div>
  );
};

// Enhanced input features
export const EnhancedInputFeatures = ({
  onVoiceInput,
  onFileAttach,
  isRecording,
}: {
  onVoiceInput?: () => void;
  onFileAttach?: () => void;
  isRecording?: boolean;
}) => {
  return (
    <div className="flex items-center gap-2 mr-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={onFileAttach}
        className="h-8 w-8"
        title="Attach file"
      >
        <Paperclip className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onVoiceInput}
        className={cn('h-8 w-8', isRecording && 'text-red-500 animate-pulse')}
        title={isRecording ? 'Stop recording' : 'Start voice input'}
      >
        <Mic className="h-4 w-4" />
      </Button>
    </div>
  );
};

// Prompt suggestions component
export const PromptSuggestions = ({
  suggestions,
  onSelect,
}: {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}) => {
  return (
    <div className="flex flex-wrap gap-2 p-4 border-t">
      <span className="text-xs text-muted-foreground flex items-center gap-1">
        <Sparkles className="h-3 w-3" />
        Suggestions:
      </span>
      {suggestions.map((suggestion, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          onClick={() => onSelect(suggestion)}
          className="text-xs"
        >
          {suggestion}
        </Button>
      ))}
    </div>
  );
};

// File attachment preview
export const FileAttachmentPreview = ({
  files,
  onRemove,
}: {
  files: File[];
  onRemove: (index: number) => void;
}) => {
  return (
    <div className="flex gap-2 p-2 border-t">
      {files.map((file, index) => (
        <div
          key={index}
          className="flex items-center gap-2 px-3 py-1 bg-muted rounded-md"
        >
          <Paperclip className="h-3 w-3" />
          <span className="text-xs max-w-[150px] truncate">{file.name}</span>
          <button
            onClick={() => onRemove(index)}
            className="text-xs hover:text-destructive"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

// Export chat button
export const ExportChatButton = ({
  messages,
  format = 'markdown',
}: {
  messages: any[];
  format?: 'markdown' | 'json' | 'pdf';
}) => {
  const handleExport = () => {
    // Implementation would go here
    console.log('Exporting chat as', format);
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleExport} className="gap-2">
      <Download className="h-4 w-4" />
      Export Chat
    </Button>
  );
};

// Share chat button
export const ShareChatButton = ({ chatId }: { chatId: string }) => {
  const handleShare = () => {
    // Implementation would go here
    console.log('Sharing chat', chatId);
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleShare} className="gap-2">
      <Share2 className="h-4 w-4" />
      Share
    </Button>
  );
};

// Demo component showing all features
export const ChatFeaturesDemo = () => {
  return (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-semibold">Available Chat Features</h3>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Message Actions</h4>
        <ChatBubble variant="assistant" side="left">
          <ChatBubbleMessage>
            This is a sample message with action buttons. Hover to see actions.
          </ChatBubbleMessage>
          <MessageActionBar
            content="Sample message content"
            onCopy={() => console.log('Copied')}
            onFeedback={type => console.log('Feedback:', type)}
            onRegenerate={() => console.log('Regenerate')}
          />
        </ChatBubble>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Input Enhancements</h4>
        <div className="flex items-center border rounded-md p-2">
          <EnhancedInputFeatures
            onVoiceInput={() => console.log('Voice input')}
            onFileAttach={() => console.log('File attach')}
          />
          <input
            type="text"
            placeholder="Enhanced input with voice and file support..."
            className="flex-1 outline-none bg-transparent"
          />
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Prompt Suggestions</h4>
        <PromptSuggestions
          suggestions={[
            'Explain this in simpler terms',
            'Can you provide an example?',
            'What are the key points?',
            'How does this compare to...',
          ]}
          onSelect={s => console.log('Selected:', s)}
        />
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Export & Share</h4>
        <div className="flex gap-2">
          <ExportChatButton messages={[]} />
          <ShareChatButton chatId="demo-123" />
        </div>
      </div>
    </div>
  );
};
