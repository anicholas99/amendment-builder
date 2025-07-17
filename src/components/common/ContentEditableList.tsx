import React, { useCallback, useRef, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import CustomEditable, { CustomEditableHandle } from './CustomEditable';

interface ContentEditableListProps {
  items: string[];
  onChange: (newItems: string[]) => void;
  placeholder?: string;
  fontSize?: string;
  isReadOnly?: boolean;
  lineHeight?: number | string;
}

// This component provides an editable list, using shadcn/ui and custom styling.
// It is designed to be visually consistent with previous versions.
const ContentEditableList: React.FC<ContentEditableListProps> = React.memo(
  ({
    items,
    onChange,
    placeholder = 'Add an item...',
    fontSize,
    isReadOnly = false,
    lineHeight,
  }) => {
    const itemRefs = useRef<(CustomEditableHandle | null)[]>([]);
    const shouldFocusNewItem = useRef(false);

    // Focus the last item when a new item is added via placeholder click
    useEffect(() => {
      if (shouldFocusNewItem.current && items.length > 0) {
        const lastIndex = items.length - 1;
        const lastItemRef = itemRefs.current[lastIndex];
        if (lastItemRef) {
          // Small delay to ensure the component is mounted
          requestAnimationFrame(() => {
            lastItemRef.focus();
          });
        }
        shouldFocusNewItem.current = false;
      }
    }, [items.length]);

    const handleItemChange = useCallback(
      (index: number, newValue: string) => {
        const newItems = [...items];
        newItems[index] = newValue;
        onChange(newItems);
      },
      [items, onChange]
    );

    const handleAddItem = useCallback(() => {
      shouldFocusNewItem.current = true;
      onChange([...items, '']);
    }, [items, onChange]);

    const handleRemoveItem = useCallback(
      (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        onChange(newItems);
      },
      [items, onChange]
    );

    return (
      <div className="flex flex-col gap-3">
        {items.map((item, index) => (
          <div
            key={`item-${index}`}
            className="flex items-start w-full transition-opacity duration-150 ease-out"
          >
            <span
              className={cn(
                'mr-3 text-text-secondary flex-shrink-0 pt-2',
                fontSize === 'sm' && 'text-sm',
                fontSize === 'md' && 'text-base',
                fontSize === 'lg' && 'text-lg'
              )}
              style={{ lineHeight }}
            >
              •
            </span>
            <div className="flex-1">
              <CustomEditable
                ref={el => {
                  itemRefs.current[index] = el;
                }}
                value={item}
                onChange={newValue => handleItemChange(index, newValue)}
                placeholder="Enter value..."
                fontSize={fontSize}
                isReadOnly={isReadOnly}
                lineHeight={lineHeight}
                padding="0.5rem"
              />
            </div>
            {!isReadOnly && (
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'ml-2 mt-2 h-8 w-8 p-0',
                  'text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400',
                  'transition-colors duration-150 ease-out'
                )}
                onClick={() => handleRemoveItem(index)}
                aria-label="Remove item"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        {!isReadOnly && (
          <div className="flex items-start w-full">
            <span
              className={cn(
                'mr-3 text-text-tertiary flex-shrink-0 pt-2',
                fontSize === 'sm' && 'text-sm',
                fontSize === 'md' && 'text-base',
                fontSize === 'lg' && 'text-lg'
              )}
              style={{ lineHeight }}
            >
              •
            </span>
            <button
              onClick={handleAddItem}
              className={cn(
                'text-left flex-1 p-2 text-text-tertiary italic rounded-md',
                'hover:bg-bg-hover hover:text-text-secondary',
                'transition-colors duration-150 ease-out',
                fontSize === 'sm' && 'text-sm',
                fontSize === 'md' && 'text-base',
                fontSize === 'lg' && 'text-lg'
              )}
            >
              {placeholder}
            </button>
          </div>
        )}
      </div>
    );
  }
);

ContentEditableList.displayName = 'ContentEditableList';

export default ContentEditableList;
