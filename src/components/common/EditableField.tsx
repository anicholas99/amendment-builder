import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Text,
  IconButton,
  Input,
  Flex,
  Icon,
  Textarea,
} from '@chakra-ui/react';
import { FiEdit, FiX, FiCheck } from 'react-icons/fi';

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

  return (
    <Box position="relative" width="100%">
      {!isEditing ? (
        <Flex align="center" width="100%">
          <Box
            flex="1"
            onDoubleClick={() => !isReadOnly && setIsEditing(true)}
            style={{
              cursor: isReadOnly ? 'default' : 'pointer',
              padding: '6px',
              borderRadius: '6px',
              minHeight: '32px',
              width: '100%',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
              if (!isReadOnly) {
                e.currentTarget.style.backgroundColor = '#F7FAFC'; // gray.50
              }
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
              if (!isReadOnly) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
            ref={textContainerRef}
          >
            <Text fontSize={fontSize} fontWeight={String(fontWeight)}>
              {value || placeholder}
            </Text>
          </Box>
          {!isReadOnly && (
            <IconButton
              aria-label="Edit"
              icon={<Icon as={FiEdit} />}
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(true)}
              className="ml-1"
            />
          )}
        </Flex>
      ) : (
        <Flex direction="column" width="100%">
          {isTextarea ? (
            <Textarea
              value={tempValue}
              onChange={e => setTempValue(e.target.value)}
              size="md"
              minH="80px"
              h={textHeight && textHeight > 80 ? `${textHeight}px` : undefined}
              resize="vertical"
              style={{
                fontSize,
                padding: '12px',
                borderRadius: '6px',
                lineHeight: '1.5',
                width: '100%',
              }}
            />
          ) : (
            <Input
              value={tempValue}
              onChange={e => setTempValue(e.target.value)}
              size="md"
              style={{
                fontSize,
                minHeight: '32px',
                height: textHeight ? `${textHeight}px` : undefined,
                padding: '6px',
                width: '100%',
                fontWeight: String(fontWeight),
              }}
            />
          )}
          <Flex mt={2} justify="flex-end">
            <IconButton
              aria-label="Cancel"
              icon={<Icon as={FiX} />}
              size="sm"
              className="mr-2"
              onClick={handleCancel}
            />
            <IconButton
              aria-label="Save"
              icon={<Icon as={FiCheck} />}
              size="sm"
              colorScheme="blue"
              onClick={handleSubmit}
            />
          </Flex>
        </Flex>
      )}
    </Box>
  );
};

export default EditableField;
