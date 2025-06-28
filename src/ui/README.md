# UI Design System

This directory contains our design system components built on top of Chakra UI. After a successful migration, we now use Chakra UI components directly for better maintainability and developer experience.

## 🎨 Design Philosophy

We follow a **simplified component architecture**:

- **Direct Chakra UI Usage**: Import components directly from `@chakra-ui/react`
- **Molecules**: Complex components that combine multiple Chakra UI components
- **Templates**: Page layouts and complex UI patterns
- **Theme System**: Centralized styling through Chakra UI's theme

## 📁 Current Structure

```
ui/
├── molecules/      # Complex composite components
├── templates/      # Layout components  
├── hooks/          # UI-specific hooks
└── index.ts        # Re-exports for convenience
```

## 🧩 Component Architecture

### Direct Chakra UI Components (Recommended)

Import basic UI components directly from Chakra UI:

```tsx
import { 
  Box, 
  Text, 
  Button, 
  Input, 
  Flex, 
  VStack, 
  HStack,
  Grid,
  Heading,
  Icon,
  Spinner,
  Badge
} from '@chakra-ui/react';
```

### Molecules (Custom Composite Components)

Complex components that combine multiple Chakra UI components:

- **FormField**: Complete form field with validation
- **Card**: Content card with header/body/footer
- **Alert**: Notification messages
- **Modal**: Dialog/popup system
- **Table**: Data table with sorting
- **Menu**: Dropdown menu system
- **Accordion**: Collapsible sections
- **Avatar**: User profile image
- **Tooltip**: Hover information

### Templates (Layouts)

- **DashboardLayout**: Main application layout with sidebar

## 🎯 Updated Usage Examples

### Basic Components (Direct Chakra UI)

```tsx
import { Button, Text, Box, VStack } from '@chakra-ui/react';
import { FiSave } from 'react-icons/fi';

<Box bg="white" p={4} borderRadius="md" shadow="sm">
  <VStack spacing={4}>
    <Text fontSize="lg" fontWeight="bold">Project Details</Text>
    <Button 
      leftIcon={<FiSave />}
      colorScheme="blue" 
      size="md" 
      onClick={handleSave}
    >
      Save Changes
    </Button>
  </VStack>
</Box>
```

### Form Field with Validation (Molecule)

```tsx
import { FormControl, FormLabel, Input, FormErrorMessage } from '@chakra-ui/react';

<FormControl isInvalid={!!errors.name}>
  <FormLabel>Project Name</FormLabel>
  <Input
    name="name"
    value={name}
    onChange={(e) => setName(e.target.value)}
  />
  {errors.name && (
    <FormErrorMessage>{errors.name}</FormErrorMessage>
  )}
</FormControl>
```

### Modal Dialog (Direct Chakra UI)

```tsx
import { 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalFooter, 
  ModalBody, 
  ModalCloseButton,
  Button,
  Text,
  useDisclosure
} from '@chakra-ui/react';

const { isOpen, onOpen, onClose } = useDisclosure();

<Modal isOpen={isOpen} onClose={onClose}>
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>Confirm Action</ModalHeader>
    <ModalCloseButton />
    <ModalBody>
      <Text>Are you sure you want to proceed?</Text>
    </ModalBody>
    <ModalFooter>
      <Button variant="ghost" onClick={onClose}>Cancel</Button>
      <Button colorScheme="blue" onClick={handleConfirm}>
        Confirm
      </Button>
    </ModalFooter>
  </ModalContent>
</Modal>
```

## 🎨 Theming

Our components use Chakra UI's theme system. Custom theme configuration is in `/src/theme/`.

### Color Palette

- **Primary**: Blue shades for main actions
- **Secondary**: Gray shades for secondary elements  
- **Success**: Green for positive feedback
- **Warning**: Orange for cautions
- **Error**: Red for errors
- **Info**: Blue for information

### Spacing Scale

We use Chakra's spacing scale (4px base):
- `1` = 4px
- `2` = 8px
- `4` = 16px
- `8` = 32px

### Typography Scale

- `xs`: 12px
- `sm`: 14px
- `md`: 16px (base)
- `lg`: 18px
- `xl`: 20px
- `2xl`: 24px

## 📋 Best Practices

### 1. **Use Direct Chakra UI Imports**

```tsx
// ✅ Good: Direct Chakra UI imports
import { Box, Text, Button } from '@chakra-ui/react';

<Box bg="gray.50" p={4} borderRadius="md">
  <Text fontSize="lg" fontWeight="bold">Title</Text>
  <Button colorScheme="blue">Action</Button>
</Box>
```

### 2. **Use Design Tokens**

```tsx
// ✅ Good: Using theme tokens
<Box bg="gray.50" p={4} borderRadius="md">

// ❌ Bad: Hardcoded values
<Box backgroundColor="#f5f5f5" padding="16px" borderRadius="8px">
```

### 3. **Responsive Design**

```tsx
// ✅ Good: Responsive props
<Box width={{ base: '100%', md: '50%', lg: '33%' }}>

// ❌ Bad: Fixed widths
<Box width="400px">
```

### 4. **Accessibility First**

```tsx
// ✅ Good: Accessible button
<Button aria-label="Delete item" onClick={handleDelete}>
  <Icon as={FiTrash} />
</Button>

// ❌ Bad: Missing accessibility
<div onClick={handleDelete}>🗑️</div>
```

### 5. **Icon Usage**

```tsx
// ✅ Good: react-icons with Chakra's Icon
import { Icon } from '@chakra-ui/react';
import { FiSave, FiEdit } from 'react-icons/fi';

<Button leftIcon={<Icon as={FiSave} />}>Save</Button>
```

## 🔧 Creating New Components

1. **Check Chakra UI first**: Use existing components when possible
2. **Molecule level**: Create molecules for complex reusable patterns
3. **Props interface**: Define TypeScript props extending Chakra props when relevant
4. **Theme integration**: Use theme tokens and `useColorModeValue`
5. **Accessibility**: Add ARIA attributes
6. **Documentation**: Add JSDoc comments

### Molecule Component Template

```tsx
import React from 'react';
import { Box, Text, Button, VStack, useColorModeValue } from '@chakra-ui/react';

export interface MyMoleculeProps {
  /** Component title */
  title: string;
  /** Whether the component is active */
  isActive?: boolean;
  /** Click handler */
  onClick?: () => void;
}

/**
 * MyMolecule - A reusable composite component
 */
export const MyMolecule: React.FC<MyMoleculeProps> = ({
  title,
  isActive = false,
  onClick,
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="md"
      p={4}
      opacity={isActive ? 1 : 0.8}
    >
      <VStack spacing={3}>
        <Text fontSize="lg" fontWeight="bold">
          {title}
        </Text>
        {onClick && (
          <Button size="sm" onClick={onClick}>
            Action
          </Button>
        )}
      </VStack>
    </Box>
  );
};
```

## 🚀 Migration Notes

- **✅ Completed**: Migration from `@/ui/atoms` to direct Chakra UI usage
- **Benefits**: Better documentation, community support, type safety, and maintainability
- **Breaking Change**: Old `@/ui/atoms` imports no longer work
- **New Pattern**: Import directly from `@chakra-ui/react`

## 🔗 Resources

- [Chakra UI Documentation](https://chakra-ui.com)
- [React Icons](https://react-icons.github.io/react-icons/)
- [Theme Configuration](../theme/README.md)
- [Component Migration Guide](../../docs/development/UI_REORGANIZATION_PLAN.md)
