import React, {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { cn } from '@/lib/utils';

interface CustomEditableProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: string;
  onChange: (newValue: string) => void;
  placeholder?: string;
  fontSize?: string;
  fontWeight?: string | number;
  isReadOnly?: boolean;
  lineHeight?: number | string;
  /**
   * Optional padding override
   */
  padding?: string;
  /** Show a persistent border even when not hovered/focused */
  staticBorder?: boolean;
}

export interface CustomEditableHandle {
  focus: () => void;
}

// Font size mapping from theme to Tailwind classes
const getFontSizeClass = (fontSize?: string) => {
  switch (fontSize) {
    case 'xs':
      return 'text-xs';
    case 'sm':
      return 'text-sm';
    case 'md':
      return 'text-base';
    case 'lg':
      return 'text-lg';
    case 'xl':
      return 'text-xl';
    case '2xl':
      return 'text-2xl';
    default:
      return 'text-base';
  }
};

// Font weight mapping
const getFontWeightClass = (fontWeight?: string | number) => {
  if (fontWeight === 'bold' || fontWeight === 700) return 'font-bold';
  if (fontWeight === 'semibold' || fontWeight === 600) return 'font-semibold';
  if (fontWeight === 'medium' || fontWeight === 500) return 'font-medium';
  return 'font-normal';
};

export const CustomEditable = forwardRef<
  CustomEditableHandle,
  CustomEditableProps
>(
  (
    {
      value,
      onChange,
      placeholder = 'Click to edit...',
      fontSize = 'md',
      fontWeight = 'normal',
      isReadOnly = false,
      lineHeight = 1.8,
      padding = '0.5rem', // Default p={2}
      staticBorder = false,
      className,
      ...rest
    },
    ref
  ) => {
    const editableRef = useRef<HTMLDivElement>(null);

    // Expose focus method to parent components
    useImperativeHandle(ref, () => ({
      focus: () => {
        if (editableRef.current) {
          editableRef.current.focus();
        }
      },
    }));

    // Sync external value changes to the div
    useEffect(() => {
      if (editableRef.current && editableRef.current.innerText !== value) {
        editableRef.current.innerText = value || '';
      }
    }, [value]);

    const handleBlur = () => {
      if (editableRef.current) {
        const newValue = editableRef.current.innerText;
        if (newValue !== value) {
          onChange(newValue);
        }
      }
    };

    return (
      <div
        ref={editableRef}
        contentEditable={!isReadOnly}
        suppressContentEditableWarning
        onBlur={handleBlur}
        style={{
          lineHeight,
          padding,
        }}
        className={cn(
          // Base styles
          'outline-none whitespace-pre-wrap break-words min-h-[1.5em]',
          'bg-transparent transition-all duration-150 ease-out rounded-md',

          // Font styling
          getFontSizeClass(fontSize),
          getFontWeightClass(fontWeight),

          // Border styles
          'border',
          staticBorder ? 'border-border/60' : 'border-transparent',

          // Cursor
          isReadOnly ? 'cursor-default' : 'cursor-text',

          // Hover states (only when not readonly)
          !isReadOnly && [
            'hover:bg-accent/50',
            staticBorder ? 'hover:border-ring/50' : 'hover:border-border/60',
          ],

          // Focus states
          'focus:bg-background focus:border-ring',
          'focus:ring-2 focus:ring-ring/20 focus:ring-offset-2 focus:ring-offset-background',

          // Empty state placeholder
          'empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground empty:before:italic empty:before:pointer-events-none',

          className
        )}
        data-placeholder={placeholder}
        {...rest}
      />
    );
  }
);

CustomEditable.displayName = 'CustomEditable';

export default CustomEditable;
