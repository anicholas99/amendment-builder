import * as React from 'react';
import { Send, Paperclip, Mic, StopCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatInputProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
  onSendMessage?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
  onFileSelect?: (file: File) => void;
  onVoiceStart?: () => void;
  onVoiceStop?: () => void;
  isRecording?: boolean;
  showFileUpload?: boolean;
  showVoiceInput?: boolean;
  maxLength?: number;
}

const ChatInput = React.forwardRef<HTMLDivElement, ChatInputProps>(
  (
    {
      className,
      value,
      onValueChange,
      onSendMessage,
      placeholder = 'Type a message...',
      disabled,
      isLoading,
      onFileSelect,
      onVoiceStart,
      onVoiceStop,
      isRecording,
      showFileUpload = false,
      showVoiceInput = false,
      maxLength,
      ...props
    },
    ref
  ) => {
    const [localValue, setLocalValue] = React.useState(value || '');
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const inputValue = value !== undefined ? value : localValue;
    const setInputValue = (newValue: string) => {
      if (value === undefined) {
        setLocalValue(newValue);
      }
      onValueChange?.(newValue);
    };

    // Auto-resize textarea
    React.useEffect(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
      }
    }, [inputValue]);

    const handleSubmit = React.useCallback(
      (e?: React.FormEvent) => {
        e?.preventDefault();
        const trimmedValue = inputValue.trim();
        if (trimmedValue && !disabled && !isLoading) {
          onSendMessage?.(trimmedValue);
          setInputValue('');
        }
      },
      [inputValue, disabled, isLoading, onSendMessage, setInputValue]
    );

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSubmit();
        }
      },
      [handleSubmit]
    );

    const handleFileClick = React.useCallback(() => {
      fileInputRef.current?.click();
    }, []);

    const handleFileChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          onFileSelect?.(file);
          // Reset input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      },
      [onFileSelect]
    );

    const handleVoiceClick = React.useCallback(() => {
      if (isRecording) {
        onVoiceStop?.();
      } else {
        onVoiceStart?.();
      }
    }, [isRecording, onVoiceStart, onVoiceStop]);

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col gap-2 p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
          className
        )}
        {...props}
      >
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || isLoading}
              maxLength={maxLength}
              className={cn(
                'min-h-[40px] max-h-[120px] resize-none pr-12',
                'bg-muted/50 border-input',
                'hover:bg-muted/70',
                'focus:bg-background',
                'transition-colors duration-200',
                (disabled || isLoading) && 'opacity-50 cursor-not-allowed'
              )}
              style={{
                scrollbarWidth: 'thin',
                msOverflowStyle: 'auto',
                WebkitOverflowScrolling: 'touch',
              }}
            />
            {maxLength && (
              <div className="absolute bottom-2 right-12 text-xs text-muted-foreground">
                {inputValue.length}/{maxLength}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {showFileUpload && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleFileClick}
                  disabled={disabled || isLoading}
                  className="h-8 w-8"
                >
                  <Paperclip className="h-4 w-4" />
                  <span className="sr-only">Attach file</span>
                </Button>
              </>
            )}

            {showVoiceInput && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleVoiceClick}
                disabled={disabled || isLoading}
                className={cn(
                  'h-8 w-8',
                  isRecording && 'text-red-600 hover:text-red-700'
                )}
              >
                {isRecording ? (
                  <StopCircle className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {isRecording ? 'Stop recording' : 'Start recording'}
                </span>
              </Button>
            )}

            <Button
              type="submit"
              size="icon"
              disabled={!inputValue.trim() || disabled || isLoading}
              className={cn(
                'h-8 w-8',
                !isLoading && 'hover:scale-105',
                'transition-all duration-150'
              )}
            >
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="sr-only">
                {isLoading ? 'Sending...' : 'Send message'}
              </span>
            </Button>
          </div>
        </form>
      </div>
    );
  }
);
ChatInput.displayName = 'ChatInput';

export { ChatInput };
