import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Text } from '@chakra-ui/react';

// Decision node is a diamond shape with text inside
const DecisionNode: React.FC<NodeProps> = ({ data, selected }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label || 'Decision');
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
    <div className="relative">
      {/* Diamond shape using SVG for perfect diamond */}
      <div
        className="relative"
        style={{
          width: '180px',
          height: '100px',
          boxShadow: selected ? '0 0 0 2px #1a192b' : 'none',
        }}
        onDoubleClick={handleDoubleClick}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 180 100"
          className="absolute top-0 left-0"
        >
          <polygon
            points="90,0 180,50 90,100 0,50"
            fill="white"
            stroke="black"
            strokeWidth="1"
          />
        </svg>

        {/* Content container */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            zIndex: 1,
          }}
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
              className="input-reset z-2"
              style={{ width: '80%' }}
            />
          ) : (
            <Text textAlign="center" fontWeight="normal" fontSize="14px">
              {displayLabel}
            </Text>
          )}
        </div>
      </div>

      {/* Input handle at top */}
      <Handle
        type="target"
        position={Position.Top}
        className="flow-handle z-2"
      />

      {/* Output handles - left, right, bottom */}
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        className="flow-handle z-2"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="flow-handle z-2"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="flow-handle z-2"
      />
    </div>
  );
};

export default DecisionNode;
