# Patent Editor Simplification

## Overview

This document describes the simplification of the patent editor architecture from a complex state management system to a clean, React Query-based approach.

## Problem

The original implementation had:
- 1124 lines in `usePatentAutosave.ts` with complex state management
- Manual content syncing with "passive mode" workarounds
- Race conditions between autosave and version restore
- Session storage for crash recovery
- Complex sync keys and manual editor updates
- Multiple sources of truth competing for control

## Solution

### 1. Server-Side Version Restore

Created a dedicated API endpoint that handles version restore server-side:

```typescript
// POST /api/projects/{projectId}/draft/restore-version
{
  versionId: string
}

// Returns
{
  success: true,
  content: "<fully rebuilt HTML>",
  versionName: string,
  documentCount: number
}
```

Key benefits:
- No client-side HTML rebuilding
- Atomic operation prevents race conditions
- Single API call instead of multiple updates

### 2. Simplified Autosave Hook

Reduced from 1124 lines to ~140 lines:

```typescript
export const useSimplifiedPatentAutosave = ({ projectId, enabled }) => {
  const { data: draftData } = useDraftDocumentsWithContent(projectId);
  const batchUpdateMutation = useBatchUpdateDraftDocuments();
  
  const debouncedSave = useDebouncedCallback(
    (content: string) => {
      const sections = extractSections(content);
      batchUpdateMutation.mutate({ projectId, updates: sections });
    },
    2000
  );
  
  return {
    content: draftData?.content || '',
    isLoading: false,
    updateContent: debouncedSave,
    forceSave: async () => { /* ... */ },
  };
};
```

Key improvements:
- React Query is the single source of truth
- No manual state management
- No session storage needed
- No passive mode or sync workarounds

### 3. Simplified Version Restore

Version restore is now a simple mutation:

```typescript
const restoreVersionMutation = useRestoreDraftFromVersion();

// To restore:
await restoreVersionMutation.mutateAsync({ projectId, versionId });
// React Query automatically updates the cache and UI
```

### 4. Data Flow

Before:
```
User → Editor → Manual State → Debounce → API → Manual Cache Update → Sync → Editor
         ↑                                                                      ↓
         ←────────────────── Complex Synchronization ──────────────────────────
```

After:
```
User → Editor → Debounce → Mutation → API → React Query Cache → UI
```

## Migration Guide

1. **Update imports:**
```typescript
// Old
import { usePatentAutosave } from './usePatentAutosave';
import { usePatentVersioning } from './usePatentVersioning';
import { usePatentApplicationManagerV3 } from './usePatentApplicationManagerV3';

// New
import { useSimplifiedPatentAutosave } from './useSimplifiedPatentAutosave';
import { useSimplifiedPatentVersioning } from './useSimplifiedPatentVersioning';
import { useSimplifiedPatentApplicationManager } from './useSimplifiedPatentApplicationManager';
```

2. **Remove workarounds:**
- Remove all passive mode logic
- Remove session storage usage
- Remove manual sync keys
- Remove force sync methods

3. **Trust React Query:**
- Let React Query handle all caching
- Use mutations for all updates
- Don't manually update content

## Performance Improvements

- **Reduced bundle size**: ~90% less code
- **Fewer re-renders**: React Query optimizes updates
- **No race conditions**: Server-side operations are atomic
- **Better error handling**: Mutations handle retries automatically
- **Cleaner component lifecycle**: No complex cleanup logic

## Security Improvements

- No session storage of sensitive patent content
- Server-side validation on all operations
- Tenant security maintained throughout
- Atomic operations prevent partial updates

## Maintenance Benefits

- **90% less code** to maintain
- Standard React patterns throughout
- No custom state management to debug
- Clear, unidirectional data flow
- Easy to test with React Query utilities

## Future Improvements

1. Make the editor purely controlled (remove internal state)
2. Add optimistic updates for instant feedback
3. Add offline support with React Query persistence
4. Implement collaborative editing with WebSockets

## Summary

This simplification removes ~1000 lines of complex workaround code and returns to React fundamentals. The result is more reliable, more performant, and much easier to maintain. 