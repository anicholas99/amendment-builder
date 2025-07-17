import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import EditableField from './EditableField';

interface EditableListProps {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  isReadOnly?: boolean;
  fontSize?: string;
}

const EditableList = ({
  items = [],
  onChange,
  placeholder = 'Add new item...',
  isReadOnly = false,
  fontSize = 'md',
}: EditableListProps) => {
  const [newItem, setNewItem] = useState('');

  const handleAddItem = () => {
    if (newItem.trim()) {
      onChange([...items, newItem.trim()]);
      setNewItem('');
    }
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    onChange(newItems);
  };

  const handleUpdateItem = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    onChange(newItems);
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

  return (
    <div className="flex flex-col gap-1.5">
      {items.map((item, index) => (
        <div key={index} className="flex items-start h-[32px]">
          <span className={cn('mr-2 mt-1', getFontSizeClass())}>•</span>
          <div className="flex-1 min-w-0">
            <EditableField
              value={item}
              onChange={value => handleUpdateItem(index, value)}
              placeholder="Click to edit..."
              fontSize={fontSize}
              isTextarea={Boolean(item && item.length > 50)}
              isReadOnly={isReadOnly}
            />
          </div>
          {!isReadOnly && (
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'ml-2 h-8 w-8 p-0',
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
        <div className="flex items-start h-[32px]">
          <span className={cn('mr-2 mt-1', getFontSizeClass())}>•</span>
          <div className="flex-1">
            <Input
              placeholder={placeholder}
              value={newItem}
              onChange={e => setNewItem(e.target.value)}
              className={cn('min-h-[32px] w-full', getFontSizeClass())}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') {
                  handleAddItem();
                }
              }}
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="ml-2 h-8 w-8 p-0"
            onClick={handleAddItem}
            disabled={!newItem.trim()}
            aria-label="Add item"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default EditableList;
