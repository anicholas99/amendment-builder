import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-restricted-imports
import {
  Box,
  IconButton,
  ButtonGroup,
  Divider,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  useColorModeValue,
  MenuDivider,
} from '@chakra-ui/react';
import { Editor } from '@tiptap/react';
import {
  FiBold,
  FiItalic,
  FiUnderline,
  FiAlignLeft,
  FiAlignCenter,
  FiAlignRight,
  FiAlignJustify,
  FiCornerUpLeft,
  FiCornerUpRight,
  FiChevronDown,
  FiList,
  FiPlus,
  FiMinus,
} from 'react-icons/fi';
import { BiListOl } from 'react-icons/bi';
import { TbSubscript, TbSuperscript } from 'react-icons/tb';
import { RiSearchLine, RiText, RiFontSize } from 'react-icons/ri';

interface TiptapToolbarProps {
  editor: Editor | null;
  onFindReplace?: () => void;
}

// Font family options for the editor
const FONT_FAMILIES = [
  { label: 'Default', value: '' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Times New Roman', value: '"Times New Roman", serif' },
  { label: 'Helvetica', value: 'Helvetica, sans-serif' },
  { label: 'Courier New', value: '"Courier New", monospace' },
  { label: 'Consolas', value: 'Consolas, monospace' },
  { label: 'Inter', value: 'Inter, sans-serif' },
];

// Font size options
const FONT_SIZES = [
  { label: '12px', value: '12px' },
  { label: '14px', value: '14px' },
  { label: '16px', value: '16px' },
  { label: '18px', value: '18px' },
  { label: '20px', value: '20px' },
  { label: '24px', value: '24px' },
  { label: '28px', value: '28px' },
  { label: '32px', value: '32px' },
];

const TiptapToolbar: React.FC<TiptapToolbarProps> = ({
  editor,
  onFindReplace,
}) => {
  // Color mode values
  const menuBg = useColorModeValue('white', 'gray.800');
  const menuBorder = useColorModeValue('gray.200', 'gray.600');
  const activeColorScheme = useColorModeValue('blue', 'blue');
  const inactiveColorScheme = useColorModeValue('gray', 'gray');

  // Track current font scale - MUST be before any conditional returns
  const [fontScale, setFontScale] = useState(100);

  // Initialize font scale on mount - MUST be before any conditional returns
  useEffect(() => {
    const editorElement = editor?.view.dom.closest('.patent-editor-tiptap');
    if (editorElement) {
      (editorElement as HTMLElement).style.setProperty('--font-scale', '1');
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  // Helper function to apply font family to entire document
  const applyFontFamilyGlobally = (fontValue: string) => {
    // Save current selection
    const { from, to } = editor.state.selection;
    
    // Save current scroll position
    const scrollContainer = editor.view.dom.closest('.custom-scrollbar');
    const scrollTop = scrollContainer?.scrollTop || 0;
    
    editor.chain()
      .focus()
      .selectAll()
      .setFontFamily(fontValue)
      .setTextSelection({ from, to }) // Restore original selection
      .run();
    
    // Restore scroll position after a brief delay to ensure DOM updates
    requestAnimationFrame(() => {
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollTop;
      }
    });
  };

  // Helper function to apply font size to entire document
  const applyFontSizeGlobally = (sizeValue: string) => {
    // Save current selection
    const { from, to } = editor.state.selection;
    
    // Save current scroll position
    const scrollContainer = editor.view.dom.closest('.custom-scrollbar');
    const scrollTop = scrollContainer?.scrollTop || 0;
    
    editor.chain()
      .focus()
      .selectAll()
      .setFontSize(sizeValue)
      .setTextSelection({ from, to }) // Restore original selection
      .run();
    
    // Restore scroll position after a brief delay to ensure DOM updates
    requestAnimationFrame(() => {
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollTop;
      }
    });
  };

  // Helper function to increase font size globally
  const increaseFontSizeGlobally = () => {
    const newScale = Math.min(fontScale + 10, 150); // Max 150%
    setFontScale(newScale);
    
    // Apply scale to editor
    const editorElement = editor.view.dom.closest('.patent-editor-tiptap');
    if (editorElement) {
      (editorElement as HTMLElement).style.setProperty('--font-scale', `${newScale / 100}`);
    }
    
    // Handle elements with inline font-size styles
    const elementsWithFontSize = editorElement?.querySelectorAll('[style*="font-size"]');
    elementsWithFontSize?.forEach((element) => {
      const el = element as HTMLElement;
      const currentSize = el.style.fontSize;
      if (currentSize && !el.dataset.originalFontSize) {
        // Store original size
        el.dataset.originalFontSize = currentSize;
      }
      if (el.dataset.originalFontSize) {
        const originalSize = parseFloat(el.dataset.originalFontSize);
        const unit = el.dataset.originalFontSize.replace(/[\d.]/g, '');
        el.style.fontSize = `${originalSize * (newScale / 100)}${unit}`;
      }
    });
  };

  // Helper function to decrease font size globally
  const decreaseFontSizeGlobally = () => {
    const newScale = Math.max(fontScale - 10, 70); // Min 70%
    setFontScale(newScale);
    
    // Apply scale to editor
    const editorElement = editor.view.dom.closest('.patent-editor-tiptap');
    if (editorElement) {
      (editorElement as HTMLElement).style.setProperty('--font-scale', `${newScale / 100}`);
    }
    
    // Handle elements with inline font-size styles
    const elementsWithFontSize = editorElement?.querySelectorAll('[style*="font-size"]');
    elementsWithFontSize?.forEach((element) => {
      const el = element as HTMLElement;
      const currentSize = el.style.fontSize;
      if (currentSize && !el.dataset.originalFontSize) {
        // Store original size
        el.dataset.originalFontSize = currentSize;
      }
      if (el.dataset.originalFontSize) {
        const originalSize = parseFloat(el.dataset.originalFontSize);
        const unit = el.dataset.originalFontSize.replace(/[\d.]/g, '');
        el.style.fontSize = `${originalSize * (newScale / 100)}${unit}`;
      }
    });
  };

  // Get current alignment
  const getCurrentAlignment = () => {
    if (editor.isActive({ textAlign: 'left' }))
      return { icon: FiAlignLeft, label: 'Left' };
    if (editor.isActive({ textAlign: 'center' }))
      return { icon: FiAlignCenter, label: 'Center' };
    if (editor.isActive({ textAlign: 'right' }))
      return { icon: FiAlignRight, label: 'Right' };
    if (editor.isActive({ textAlign: 'justify' }))
      return { icon: FiAlignJustify, label: 'Justify' };
    return { icon: FiAlignLeft, label: 'Left' }; // Default
  };

  const currentAlignment = getCurrentAlignment();

  // Get current font family
  const getCurrentFontFamily = () => {
    if (!editor) return FONT_FAMILIES[0];
    const fontFamily = editor.getAttributes('textStyle').fontFamily;
    const found = FONT_FAMILIES.find(f => f.value === fontFamily);
    return found || FONT_FAMILIES[0];
  };

  // Get current font size
  const getCurrentFontSize = () => {
    if (!editor) return { label: '16px', value: '16px' };
    
    // Try to get font size from the current selection or cursor position
    const fontSize = editor.getAttributes('textStyle').fontSize;
    
    // If we have a font size at cursor, use it
    if (fontSize) {
      const found = FONT_SIZES.find(s => s.value === fontSize);
      return found || { label: fontSize, value: fontSize };
    }
    
    // If no explicit font size, check if we're in a heading
    if (editor.isActive('heading', { level: 1 })) {
      // h1 is typically 1.8em of base 16px = ~29px, closest is 28px
      return { label: '28px', value: '28px' };
    } else if (editor.isActive('heading', { level: 2 })) {
      // h2 is typically 1.5em of base 16px = 24px
      return { label: '24px', value: '24px' };
    } else if (editor.isActive('heading', { level: 3 })) {
      // h3 is typically 1.2em of base 16px = ~19px, closest is 20px
      return { label: '20px', value: '20px' };
    }
    
    // Default to 16px
    return { label: '16px', value: '16px' };
  };

  const currentFontFamily = getCurrentFontFamily();
  const currentFontSize = getCurrentFontSize();

  return (
    <Box
      display="flex"
      gap={0.5}
      flexWrap="nowrap"
      alignItems="center"
      minWidth={0}
    >
      {/* Compact Font Controls Menu */}
      <Menu>
        <Tooltip label="Font Settings">
          <MenuButton
            as={IconButton}
            icon={<RiText size={16} />}
            size="xs"
            variant="outline"
            colorScheme={inactiveColorScheme}
            aria-label="Font Settings"
          />
        </Tooltip>
        <MenuList bg={menuBg} borderColor={menuBorder} minW="200px">
          <Box px={3} py={2} fontSize="xs" fontWeight="semibold" color="text.secondary">
            Font Family
          </Box>
          {FONT_FAMILIES.map((font) => (
            <MenuItem
              key={font.value}
              onClick={() => {
                if (font.value === '') {
                  const { from, to } = editor.state.selection;
                  const scrollContainer = editor.view.dom.closest('.custom-scrollbar');
                  const scrollTop = scrollContainer?.scrollTop || 0;
                  
                  editor.chain().focus().selectAll().unsetFontFamily().setTextSelection({ from, to }).run();
                  
                  requestAnimationFrame(() => {
                    if (scrollContainer) {
                      scrollContainer.scrollTop = scrollTop;
                    }
                  });
                } else {
                  applyFontFamilyGlobally(font.value);
                }
              }}
              fontFamily={font.value || 'inherit'}
              bg={currentFontFamily.value === font.value ? 'bg.selected' : undefined}
              fontSize="sm"
            >
              {font.label}
            </MenuItem>
          ))}
          
          <MenuDivider />
          
          <Box px={3} py={2} fontSize="xs" fontWeight="semibold" color="text.secondary">
            Font Size
          </Box>
          <Box px={3} pb={2}>
            <ButtonGroup size="xs" isAttached variant="outline" width="100%">
              <Button
                leftIcon={<FiMinus />}
                onClick={decreaseFontSizeGlobally}
                flex={1}
                title="Decrease all font sizes proportionally"
                isDisabled={fontScale <= 70}
              >
                {fontScale}%
              </Button>
              <IconButton
                aria-label="Increase Font Size"
                icon={<FiPlus />}
                onClick={increaseFontSizeGlobally}
                title="Increase all font sizes proportionally"
                isDisabled={fontScale >= 150}
              />
            </ButtonGroup>
          </Box>
          {FONT_SIZES.map((size) => (
            <MenuItem
              key={size.value}
              onClick={() => {
                if (size.value === '16px') {
                  const { from, to } = editor.state.selection;
                  const scrollContainer = editor.view.dom.closest('.custom-scrollbar');
                  const scrollTop = scrollContainer?.scrollTop || 0;
                  
                  editor.chain().focus().selectAll().unsetFontSize().setTextSelection({ from, to }).run();
                  
                  requestAnimationFrame(() => {
                    if (scrollContainer) {
                      scrollContainer.scrollTop = scrollTop;
                    }
                  });
                } else {
                  applyFontSizeGlobally(size.value);
                }
              }}
              bg={currentFontSize.value === size.value ? 'bg.selected' : undefined}
              fontSize="sm"
            >
              {size.label}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>

      <Divider orientation="vertical" h="16px" />

      {/* Undo/Redo */}
      <ButtonGroup size="xs" isAttached variant="outline">
        <Tooltip label="Undo (Ctrl+Z)">
          <IconButton
            aria-label="Undo"
            icon={<FiCornerUpLeft size={14} />}
            onClick={() => editor.chain().focus().undo().run()}
            isDisabled={!editor.can().undo()}
            colorScheme={inactiveColorScheme}
          />
        </Tooltip>
        <Tooltip label="Redo (Ctrl+Y)">
          <IconButton
            aria-label="Redo"
            icon={<FiCornerUpRight size={14} />}
            onClick={() => editor.chain().focus().redo().run()}
            isDisabled={!editor.can().redo()}
            colorScheme={inactiveColorScheme}
          />
        </Tooltip>
      </ButtonGroup>

      <Divider orientation="vertical" h="16px" />

      {/* Text Formatting */}
      <ButtonGroup size="xs" isAttached variant="outline">
        <Tooltip label="Bold (Ctrl+B)">
          <IconButton
            aria-label="Bold"
            icon={<FiBold size={14} />}
            onClick={() => editor.chain().focus().toggleBold().run()}
            colorScheme={
              editor.isActive('bold') ? activeColorScheme : inactiveColorScheme
            }
          />
        </Tooltip>
        <Tooltip label="Italic (Ctrl+I)">
          <IconButton
            aria-label="Italic"
            icon={<FiItalic size={14} />}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            colorScheme={
              editor.isActive('italic')
                ? activeColorScheme
                : inactiveColorScheme
            }
          />
        </Tooltip>
        <Tooltip label="Underline (Ctrl+U)">
          <IconButton
            aria-label="Underline"
            icon={<FiUnderline size={14} />}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            colorScheme={
              editor.isActive('underline')
                ? activeColorScheme
                : inactiveColorScheme
            }
          />
        </Tooltip>
      </ButtonGroup>

      {/* Super/Subscript */}
      <ButtonGroup size="xs" isAttached variant="outline">
        <Tooltip label="Subscript (e.g., H₂O)">
          <IconButton
            aria-label="Subscript"
            icon={<TbSubscript size={14} />}
            onClick={() => editor.chain().focus().toggleSubscript().run()}
            colorScheme={
              editor.isActive('subscript')
                ? activeColorScheme
                : inactiveColorScheme
            }
          />
        </Tooltip>
        <Tooltip label="Superscript (e.g., x²)">
          <IconButton
            aria-label="Superscript"
            icon={<TbSuperscript size={14} />}
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
            colorScheme={
              editor.isActive('superscript')
                ? activeColorScheme
                : inactiveColorScheme
            }
          />
        </Tooltip>
      </ButtonGroup>

      <Divider orientation="vertical" h="16px" />

      {/* Lists */}
      <ButtonGroup size="xs" isAttached variant="outline">
        <Tooltip label="Bullet List">
          <IconButton
            aria-label="Bullet List"
            icon={<FiList size={14} />}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            colorScheme={
              editor.isActive('bulletList')
                ? activeColorScheme
                : inactiveColorScheme
            }
          />
        </Tooltip>
        <Tooltip label="Numbered List">
          <IconButton
            aria-label="Numbered List"
            icon={<BiListOl size={16} />}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            colorScheme={
              editor.isActive('orderedList')
                ? activeColorScheme
                : inactiveColorScheme
            }
          />
        </Tooltip>
      </ButtonGroup>

      {/* Text Alignment Dropdown */}
      <Menu>
        <Tooltip label="Text Alignment">
          <MenuButton
            as={IconButton}
            icon={<currentAlignment.icon size={14} />}
            size="xs"
            variant="outline"
            colorScheme={inactiveColorScheme}
            aria-label="Text Alignment"
          />
        </Tooltip>
        <MenuList bg={menuBg} borderColor={menuBorder} minW="150px">
          <MenuItem
            icon={<FiAlignLeft size={14} />}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            bg={editor.isActive({ textAlign: 'left' }) ? 'bg.selected' : undefined}
            fontSize="sm"
          >
            Align Left
          </MenuItem>
          <MenuItem
            icon={<FiAlignCenter size={14} />}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            bg={editor.isActive({ textAlign: 'center' }) ? 'bg.selected' : undefined}
            fontSize="sm"
          >
            Align Center
          </MenuItem>
          <MenuItem
            icon={<FiAlignRight size={14} />}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            bg={editor.isActive({ textAlign: 'right' }) ? 'bg.selected' : undefined}
            fontSize="sm"
          >
            Align Right
          </MenuItem>
          <MenuItem
            icon={<FiAlignJustify size={14} />}
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            bg={editor.isActive({ textAlign: 'justify' }) ? 'bg.selected' : undefined}
            fontSize="sm"
          >
            Justify
          </MenuItem>
        </MenuList>
      </Menu>

      {/* Find & Replace */}
      {onFindReplace && (
        <>
          <Divider orientation="vertical" h="16px" />
          <Tooltip label="Find & Replace (Ctrl+F)">
            <IconButton
              aria-label="Find & Replace"
              icon={<RiSearchLine size={14} />}
              onClick={onFindReplace}
              size="xs"
              variant="outline"
              colorScheme={inactiveColorScheme}
            />
          </Tooltip>
        </>
      )}
    </Box>
  );
};

export default TiptapToolbar;
