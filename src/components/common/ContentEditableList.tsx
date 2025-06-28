import React, { useCallback } from 'react';
import {
  VStack,
  Flex,
  Text,
  IconButton,
  Box,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiTrash2 } from 'react-icons/fi';
import CustomEditable from './CustomEditable';

interface ContentEditableListProps {
  items: string[];
  onChange: (newItems: string[]) => void;
  placeholder?: string;
  fontSize?: string;
  isReadOnly?: boolean;
  lineHeight?: number | string;
}

/**
 * A component that displays a list of items, each with its own ContentEditableField
 * for a Word-like editing experience on each individual bullet point
 */
const ContentEditableList: React.FC<ContentEditableListProps> = React.memo(
  ({
    items,
    onChange,
    placeholder = 'Add an item...',
    fontSize,
    isReadOnly = false,
    lineHeight,
  }) => {
    const handleItemChange = useCallback(
      (index: number, newValue: string) => {
        const newItems = [...items];
        newItems[index] = newValue;
        onChange(newItems);
      },
      [items, onChange]
    );

    const handleAddItem = useCallback(() => {
      onChange([...items, '']);
    }, [items, onChange]);

    const handleRemoveItem = useCallback(
      (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        onChange(newItems);
      },
      [items, onChange]
    );

    const trashIconColor = useColorModeValue('gray.500', 'gray.400');
    const trashIconHoverColor = useColorModeValue('red.500', 'red.400');

    return (
      <VStack spacing={3} align="stretch">
        {items.map((item, index) => (
          <Flex
            key={`item-${index}`}
            align="flex-start"
            w="100%"
            transition="opacity 0.15s ease-out"
          >
            <Text
              mr={3}
              color="text.secondary"
              mt="2px"
              fontSize={fontSize}
              lineHeight={lineHeight}
              flexShrink={0}
            >
              •
            </Text>
            <Box flex={1}>
              <CustomEditable
                value={item}
                onChange={newValue => handleItemChange(index, newValue)}
                placeholder="Enter value..."
                fontSize={fontSize}
                isReadOnly={isReadOnly}
                lineHeight={lineHeight}
              />
            </Box>
            {!isReadOnly && (
              <IconButton
                aria-label="Remove item"
                icon={<FiTrash2 />}
                size="sm"
                variant="ghost"
                onClick={() => handleRemoveItem(index)}
                ml={2}
                mt="1px"
                color={trashIconColor}
                _hover={{ color: trashIconHoverColor }}
                transition="color 0.15s ease-out"
              />
            )}
          </Flex>
        ))}
        {!isReadOnly && (
          <Flex align="flex-start" w="100%">
            <Text
              mr={3}
              color="text.tertiary"
              mt="2px"
              fontSize={fontSize}
              lineHeight={lineHeight}
              flexShrink={0}
            >
              •
            </Text>
            <Box
              as="button"
              onClick={handleAddItem}
              textAlign="left"
              flex={1}
              p={2}
              color="text.tertiary"
              fontStyle="italic"
              fontSize={fontSize}
              _hover={{
                bg: 'bg.hover',
                color: 'text.secondary',
              }}
              borderRadius="md"
              transition="background-color 0.15s ease-out, color 0.15s ease-out"
            >
              {placeholder}
            </Box>
          </Flex>
        )}
      </VStack>
    );
  }
);

ContentEditableList.displayName = 'ContentEditableList';

export default ContentEditableList;
