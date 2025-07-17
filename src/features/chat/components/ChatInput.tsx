import React, { useCallback, useState, useRef, useEffect } from 'react';
import { Send, Paperclip } from 'lucide-react';

// Import shadcn/ui components
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isAssistantTyping: boolean;
  assistantColor: string;
  onFileSelect?: (file: File) => void;
  isUploadingFile?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = React.memo(
  ({
    onSendMessage,
    isAssistantTyping,
    assistantColor,
    onFileSelect,
    isUploadingFile,
  }) => {
    const [inputMessage, setInputMessage] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auto-resize textarea
    const adjustTextareaHeight = useCallback(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
      }
    }, []);

    // Auto-resize on content change
    useEffect(() => {
      adjustTextareaHeight();
    }, [inputMessage, adjustTextareaHeight]);

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputMessage(e.target.value);
      },
      [setInputMessage]
    );

    const handleKeyPress = useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (
          e.key === 'Enter' &&
          !e.shiftKey &&
          inputMessage.trim() &&
          !isAssistantTyping
        ) {
          e.preventDefault();
          onSendMessage(inputMessage);
          setInputMessage('');
        }
      },
      [inputMessage, isAssistantTyping, onSendMessage]
    );

    const handleSendClick = useCallback(() => {
      if (inputMessage.trim()) {
        onSendMessage(inputMessage);
        setInputMessage('');
      }
    }, [inputMessage, onSendMessage]);

    const handleFileClick = useCallback(() => {
      fileInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && onFileSelect) {
          onFileSelect(file);
          // Reset input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      },
      [onFileSelect]
    );

    return (
      <div className="p-4 border-t border-border bg-secondary/50 shadow-sm">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            placeholder="Ask me about your patent application..."
            value={inputMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            disabled={isAssistantTyping || isUploadingFile}
            className={cn(
              'min-h-[36px] max-h-[120px] resize-none pr-20',
              'bg-background border-input',
              'hover:border-border/70',
              'focus:border-primary focus:ring-1 focus:ring-primary',
              'placeholder:text-muted-foreground',
              'text-sm',
              'transition-colors duration-150',
              (isAssistantTyping || isUploadingFile) &&
                'opacity-50 cursor-not-allowed'
            )}
            style={{
              scrollbarWidth: 'thin',
              msOverflowStyle: 'auto',
              WebkitOverflowScrolling: 'touch',
            }}
          />
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            {onFileSelect && (
              <Button
                size="sm"
                variant="ghost"
                disabled={isAssistantTyping || isUploadingFile}
                onClick={handleFileClick}
                className={cn(
                  'h-6 w-6 p-0 rounded-md',
                  'hover:bg-muted',
                  'transition-all duration-150',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
                title="Upload patent document"
              >
                <Paperclip className="w-3 h-3" />
              </Button>
            )}
            <Button
              size="sm"
              variant="default"
              disabled={
                !inputMessage.trim() || isAssistantTyping || isUploadingFile
              }
              onClick={handleSendClick}
              className={cn(
                'h-6 w-6 p-0 rounded-md',
                'hover:scale-105 hover:shadow-sm',
                'transition-all duration-150',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
              style={{
                backgroundColor: assistantColor?.includes('blue')
                  ? 'hsl(var(--primary))'
                  : assistantColor,
              }}
            >
              <Send className="w-3 h-3" />
            </Button>
          </div>
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>
    );
  }
);

ChatInput.displayName = 'ChatInput';
