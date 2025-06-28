import React, { useState } from 'react';
import {
  VStack,
  Flex,
  Text,
  Input,
  IconButton,
  Box,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiTrash2, FiPlus } from 'react-icons/fi';
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

  const trashIconColor = useColorModeValue('gray.500', 'gray.400');
  const trashIconHoverColor = useColorModeValue('red.500', 'red.400');

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

  return (
    <VStack align="stretch" spacing={1.5}>
      {items.map((item, index) => (
        <Flex key={index} align="flex-start" height="32px">
          <Text mr="8px" mt="4px" fontSize={fontSize}>
            •
          </Text>
          <Box flex="1" minWidth="0">
            <EditableField
              value={item}
              onChange={value => handleUpdateItem(index, value)}
              placeholder="Click to edit..."
              fontSize={fontSize}
              isTextarea={Boolean(item && item.length > 50)}
              isReadOnly={isReadOnly}
            />
          </Box>
          {!isReadOnly && (
            <IconButton
              aria-label="Remove item"
              icon={<Icon as={FiTrash2} />}
              size="sm"
              variant="ghost"
              onClick={() => handleRemoveItem(index)}
              ml="8px"
              color={trashIconColor}
              _hover={{ color: trashIconHoverColor }}
              transition="color 0.15s ease-out"
            />
          )}
        </Flex>
      ))}
      {!isReadOnly && (
        <Flex align="flex-start" height="32px">
          <Text mr="8px" mt="4px" fontSize={fontSize}>
            •
          </Text>
          <Box flex="1">
            <Input
              placeholder={placeholder}
              value={newItem}
              onChange={e => setNewItem(e.target.value)}
              size="md"
              minH="32px"
              fontSize={fontSize}
              w="100%"
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') {
                  handleAddItem();
                }
              }}
            />
          </Box>
          <IconButton
            aria-label="Add item"
            icon={<Icon as={FiPlus} />}
            size="sm"
            variant="ghost"
            onClick={handleAddItem}
            disabled={!newItem.trim()}
            ml="8px"
          />
        </Flex>
      )}
    </VStack>
  );
};

export default EditableList;
