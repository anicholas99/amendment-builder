import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Box, Text } from '@chakra-ui/react';

// Process node is a rectangular box with text inside
const ProcessNode: React.FC<NodeProps> = ({ data, selected }) => {
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
      <Box
        width="200px"
        minHeight="60px"
        padding="10px"
        borderRadius="4px"
        border="1px solid black"
        backgroundColor="white"
        boxShadow={selected ? '0 0 0 2px #1a192b' : 'none'}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
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
          <Text textAlign="center" fontWeight="normal" fontSize="14px">
            {displayLabel}
          </Text>
        )}
      </Box>

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
