import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { cn } from '@/lib/utils';
import { useThemeContext } from '@/contexts/ThemeContext';

// Process node is a rectangular box with text inside
const ProcessNode: React.FC<NodeProps> = ({ data, selected }) => {
  const { isDarkMode } = useThemeContext();
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label || 'Process Step');
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
    <>
      {/* Input source handle */}
      <Handle type="target" position={Position.Top} className="flow-handle" />

      {/* Node body */}
      <div
        className={cn(
          'w-[200px] min-h-[60px] p-2.5 rounded border border-black',
          'flex flex-col justify-center items-center',
          isDarkMode ? 'bg-gray-800' : 'bg-white',
          selected && 'shadow-[0_0_0_2px_#1a192b]'
        )}
        onDoubleClick={handleDoubleClick}
      >
        {isEditing ? (
          <input
            ref={inputRef}
            defaultValue={displayLabel}
            onBlur={handleBlur}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                handleBlur();
              }
            }}
            className="input-reset"
          />
        ) : (
          <span className="text-center font-normal text-sm">
            {displayLabel}
          </span>
        )}
      </div>

      {/* Output target handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="flow-handle"
      />
    </>
  );
};

export default ProcessNode;
