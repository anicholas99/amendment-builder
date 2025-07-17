import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Edit, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditableFieldProps {
  value: string;
  onChange: (newValue: string) => void;
  placeholder?: string;
  isTextarea?: boolean;
  fontSize?: string;
  fontWeight?: string | number;
  isTitle?: boolean;
  isReadOnly?: boolean;
}

const EditableField = ({
  value,
  onChange,
  placeholder = 'Click to edit...',
  isTextarea = false,
  fontSize = 'md',
  fontWeight = 'normal',
  isTitle = false,
  isReadOnly = false,
}: EditableFieldProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value || '');
  const [textHeight, setTextHeight] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);

  // Calculate the height of the text when not editing
  useEffect(() => {
    if (!isEditing && textContainerRef.current) {
      // Get the exact height of the text container
      const height = textContainerRef.current.clientHeight;
      // Ensure a minimum height for bullet points
      setTextHeight(Math.max(height, 32));
    }
  }, [value, isEditing]);

  // Focus the input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSubmit = () => {
    onChange(tempValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempValue(value || '');
    setIsEditing(false);
  };

  // Font size mapping
  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'sm':
        return 'text-sm';
      case 'md':
        return 'text-base';
      case 'lg':
        return 'text-lg';
      case 'xl':
        return 'text-xl';
      default:
        return 'text-base';
    }
  };

  // Font weight mapping
  const getFontWeightClass = () => {
    if (fontWeight === 'bold' || fontWeight === 700) return 'font-bold';
    if (fontWeight === 'semibold' || fontWeight === 600) return 'font-semibold';
    if (fontWeight === 'medium' || fontWeight === 500) return 'font-medium';
    return 'font-normal';
  };

  return (
    <div className="relative w-full">
      {!isEditing ? (
        <div className="flex items-center w-full">
          <div
            className={cn(
              'flex-1 p-1.5 rounded-md min-h-[32px] w-full transition-colors duration-200',
              !isReadOnly &&
                'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800'
            )}
            onDoubleClick={() => !isReadOnly && setIsEditing(true)}
            ref={textContainerRef}
          >
            <p
              className={cn(
                getFontSizeClass(),
                getFontWeightClass(),
                !value && 'text-muted-foreground italic'
              )}
            >
              {value || placeholder}
            </p>
          </div>
          {!isReadOnly && (
            <Button
              variant="ghost"
              size="sm"
              className="ml-1 h-8 w-8 p-0"
              onClick={() => setIsEditing(true)}
              aria-label="Edit"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col w-full">
          {isTextarea ? (
            <Textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={tempValue}
              onChange={e => setTempValue(e.target.value)}
              className={cn('min-h-[80px] p-3 resize-y', getFontSizeClass())}
              style={{
                height:
                  textHeight && textHeight > 80 ? `${textHeight}px` : undefined,
                lineHeight: '1.5',
              }}
            />
          ) : (
            <Input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              value={tempValue}
              onChange={e => setTempValue(e.target.value)}
              className={cn(
                'min-h-[32px] px-1.5',
                getFontSizeClass(),
                getFontWeightClass()
              )}
              style={{
                height: textHeight ? `${textHeight}px` : undefined,
              }}
            />
          )}
          <div className="flex mt-2 justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="mr-2 h-8 w-8 p-0"
              onClick={handleCancel}
              aria-label="Cancel"
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700"
              onClick={handleSubmit}
              aria-label="Save"
            >
              <Check className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditableField;
