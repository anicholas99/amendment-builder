import React, { useRef, useEffect } from 'react';
import { Box, useColorModeValue, BoxProps } from '@chakra-ui/react';

interface CustomEditableProps
  extends Omit<BoxProps, 'onChange' | 'value' | 'children'> {
  value: string;
  onChange: (newValue: string) => void;
  placeholder?: string;
  fontSize?: string;
  fontWeight?: string | number;
  isReadOnly?: boolean;
  lineHeight?: number | string;
  /**
   * Optional padding override (e.g., "4px" | 1 | { base: 1, md: 2 })
   * Falls back to Chakra default of 2 if not specified
   */
  p?: any;
  /** Show a persistent border even when not hovered/focused */
  staticBorder?: boolean;
}

export const CustomEditable: React.FC<CustomEditableProps> = React.memo(
  ({
    value,
    onChange,
    placeholder = 'Click to edit...',
    fontSize = 'md',
    fontWeight = 'normal',
    isReadOnly = false,
    lineHeight = 1.8,
    p: padding = 2 as any,
    staticBorder = false,
    ...rest
  }) => {
    const editableRef = useRef<HTMLDivElement>(null);
    const hoverBg = useColorModeValue('gray.50', 'gray.800');
    const focusBg = useColorModeValue('white', 'gray.700');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const focusBorderColor = useColorModeValue('blue.400', 'blue.300');

    // Sync external value changes to the div
    useEffect(() => {
      if (editableRef.current && editableRef.current.innerText !== value) {
        editableRef.current.innerText = value || '';
      }
    }, [value]);

    const handleBlur = () => {
      if (editableRef.current) {
        const newValue = editableRef.current.innerText;
        if (newValue !== value) {
          onChange(newValue);
        }
      }
    };

    const baseBorderStyle = '1px solid';
    const initialBorderColor = staticBorder ? borderColor : 'transparent';

    return (
      <Box
        ref={editableRef}
        contentEditable={!isReadOnly}
        suppressContentEditableWarning
        onBlur={handleBlur}
        fontSize={fontSize}
        fontWeight={fontWeight}
        lineHeight={lineHeight}
        p={padding}
        border={baseBorderStyle}
        borderColor={initialBorderColor}
        bg="transparent"
        transition="background-color 0.15s ease-out, border-color 0.15s ease-out, box-shadow 0.15s ease-out"
        cursor={isReadOnly ? 'default' : 'text'}
        outline="none"
        whiteSpace="pre-wrap"
        wordBreak="break-word"
        minH="1.5em"
        _hover={
          !isReadOnly
            ? {
                bg: hoverBg,
                borderColor: staticBorder ? focusBorderColor : borderColor,
              }
            : {}
        }
        _focus={{
          bg: focusBg,
          borderColor: focusBorderColor,
          boxShadow: `0 0 0 1px ${focusBorderColor}`,
        }}
        _empty={{
          _before: {
            content: `"${placeholder}"`,
            color: 'gray.400',
            fontStyle: 'italic',
            pointerEvents: 'none',
          },
        }}
        {...rest}
      />
    );
  }
);

CustomEditable.displayName = 'CustomEditable';

export default CustomEditable;
