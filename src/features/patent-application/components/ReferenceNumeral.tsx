import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { cn } from '@/lib/utils';
import { useThemeContext } from '@/contexts/ThemeContext';

// Reference numeral is a simple text label with a reference number
const ReferenceNumeral: React.FC<NodeProps> = ({ data, selected }) => {
  const { isDarkMode } = useThemeContext();
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label || 'Element');
  const inputRef = useRef<HTMLInputElement>(null);

  // Extract reference number from label if it exists
  const refNumberMatch = label.match(/\((\d+)\)$/);
  const refNumber = refNumberMatch ? refNumberMatch[1] : '';
  const displayLabel = refNumberMatch
    ? label.replace(/\s*\(\d+\)$/, '')
    : label;

  // Handle double click to edit
  const handleDoubleClick = () => {
    if (data.readOnly) return;
    setIsEditing(true);
  };

  // Handle blur to save changes
  const handleBlur = () => {
    setIsEditing(false);
    // Ensure reference number is preserved
    const newLabel = refNumber
      ? `${inputRef.current?.value || displayLabel} (${refNumber})`
      : inputRef.current?.value || displayLabel;
    setLabel(newLabel);
    if (data.onChange) {
      data.onChange(newLabel);
    }
  };

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  return (
    <div
      className={cn(
        'relative p-2 rounded-md border',
        selected ? 'border-2 border-blue-500' : 'border-gray-200',
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      )}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          defaultValue={displayLabel}
          onBlur={handleBlur}
          onKeyPress={e => {
            if (e.key === 'Enter') {
              handleBlur();
            }
          }}
          className="input-clean"
        />
      ) : (
        <span className="text-sm">
          {displayLabel}
          {refNumber && (
            <span
              className={cn(
                'ml-1',
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              )}
            >
              ({refNumber})
            </span>
          )}
        </span>
      )}
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
    </div>
  );
};

export default ReferenceNumeral;
