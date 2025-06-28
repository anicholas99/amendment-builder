import React, { lazy, Suspense } from 'react';
import {
  Box,
  Center,
  Spinner,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import type { Editor } from '@tiptap/react';

// Lazy load the heavy TipTap editor component
const TiptapPatentEditor = lazy(() => import('./TiptapPatentEditor'));

// Match the exact props from TiptapPatentEditor
interface PatentEditorProps {
  content: string;
  setContent: (content: string) => void;
  isEditMode: boolean;
  hasGenerated: boolean;
  zoomLevel: number;
  containerRef?: React.RefObject<HTMLDivElement>;
  onSelectionChange?: (selection: {
    text: string;
    range: unknown;
    section: string | null;
  }) => void;
  onBlur?: () => void;
}

interface PatentEditorRef {
  handleUndo: () => void;
  handleRedo: () => void;
  getEditor: () => Editor | null;
}

const LoadingFallback = () => {
  const spinnerColor = useColorModeValue('blue.500', 'blue.300');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Center h="100vh" w="100%">
      <Box textAlign="center">
        <Spinner size="xl" color={spinnerColor} thickness="4px" />
        <Text mt={4} color={textColor}>
          Loading patent editor...
        </Text>
      </Box>
    </Center>
  );
};

/**
 * Lazy-loaded wrapper for TiptapPatentEditor to improve initial page load performance
 * This is a drop-in replacement that maintains the exact same interface
 */
const TiptapPatentEditorLazy = React.forwardRef<
  PatentEditorRef,
  PatentEditorProps
>((props, ref) => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <TiptapPatentEditor ref={ref} {...props} />
    </Suspense>
  );
});

TiptapPatentEditorLazy.displayName = 'TiptapPatentEditorLazy';

export default TiptapPatentEditorLazy;
