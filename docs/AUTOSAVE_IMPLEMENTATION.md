# Patent Application Autosave Implementation

This document describes the improved autosave implementation for the patent application editor, following Tiptap's official recommendations.

## Overview

The autosave functionality has been refactored to follow Tiptap's recommended pattern:
- **Single debounce mechanism** in the editor (2-second delay)
- **Immediate save on blur** when the editor loses focus
- **Visual feedback** with timestamps for save status

## Architecture

```
User Input → TipTap Editor → Debounced Update (2s) → Patent Autosave Hook → Draft Documents
                   ↓
                onBlur → Flush & Save Immediately
```

## Key Components

### 1. TiptapPatentEditor.tsx

The editor now implements Tiptap's recommended autosave pattern:

```typescript
// Debounced update function - 2 second delay as recommended
const debouncedUpdate = useDebouncedCallback(
  (newContent: string) => {
    if (newContent !== lastSentContentRef.current) {
      lastSentContentRef.current = newContent;
      setContent(newContent);
    }
  },
  2000 // 2 second debounce
);

// Editor configuration
const editor = useEditor({
  // ... other config
  onUpdate: ({ editor }) => {
    const newContent = editor.getHTML();
    debouncedUpdate(newContent); // Debounced autosave
    checkHeaderDeletion(newContent);
  },
  onBlur: () => {
    // Flush pending updates and save immediately
    debouncedUpdate.flush();
    const currentContent = editor?.getHTML();
    if (currentContent && currentContent !== lastSentContentRef.current) {
      lastSentContentRef.current = currentContent;
      setContent(currentContent);
    }
    if (onBlur) onBlur();
  },
});
```

### 2. usePatentAutosave.ts

The autosave hook has been simplified:
- **No double debouncing** - the editor handles debouncing
- **Immediate saves** when content is received
- **Section extraction** for efficient storage

```typescript
// Update content - no debouncing needed, editor handles that
const updateContent = useCallback((content: string) => {
  setLocalContent(content);
  pendingContentRef.current = content;
  
  const hasChanges = content !== lastSavedContentRef.current;
  setHasUnsavedChanges(hasChanges);
  
  if (!hasChanges || !enabled) return;
  
  // Since the editor already debounces, we can save immediately
  performSave(content);
}, [performSave, enabled]);
```

### 3. SaveStatusIndicator.tsx

Enhanced visual feedback:
- Shows "Saving..." with spinner during save
- Shows "Saved at [timestamp]" when complete
- Shows "Unsaved changes" when there are pending changes

## Benefits

1. **Follows Tiptap Best Practices**: Implements the officially recommended autosave pattern
2. **Single Source of Truth**: Only one debounce mechanism (in the editor)
3. **Predictable Behavior**: 2-second delay for typing, immediate save on blur
4. **Better Performance**: Eliminates redundant state updates and race conditions
5. **Clear Visual Feedback**: Users can see exactly when their work is saved

## Testing the Implementation

1. **Type in the editor**: You should see "Unsaved changes" appear
2. **Stop typing for 2 seconds**: The status should change to "Saving..." then "Saved at [time]"
3. **Click outside the editor**: Any pending changes should save immediately
4. **Type continuously**: Saves should only trigger after you pause for 2 seconds

## Configuration

The debounce delay can be adjusted in `TiptapPatentEditor.tsx`:

```typescript
const debouncedUpdate = useDebouncedCallback(
  (newContent: string) => { /* ... */ },
  2000 // Change this value to adjust the delay (in milliseconds)
);
```

## Migration Notes

If you were previously using a different autosave implementation:
1. The double-debouncing has been removed
2. The typing detection logic has been simplified
3. The save mechanism is now more direct and predictable

## Troubleshooting

If autosave isn't working:
1. Check the browser console for any errors
2. Verify that draft documents are being created/updated
3. Ensure the `projectId` is correctly passed to the autosave hook
4. Check that the API endpoints for draft document updates are working 