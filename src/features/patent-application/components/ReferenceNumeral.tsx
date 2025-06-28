import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Box, Text } from '@chakra-ui/react';

// Reference numeral is a simple text label with a reference number
const ReferenceNumeral: React.FC<NodeProps> = ({ data, selected }) => {
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
    <Box
      position="relative"
      padding={2}
      borderWidth={selected ? '2px' : '1px'}
      borderRadius="md"
      borderColor={selected ? 'blue.500' : 'gray.200'}
      backgroundColor="white"
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
        <Text fontSize="sm">
          {displayLabel}
          {refNumber && (
            <Text as="span" color="gray.500" ml={1}>
              ({refNumber})
            </Text>
          )}
        </Text>
      )}
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
    </Box>
  );
};

export default ReferenceNumeral;
