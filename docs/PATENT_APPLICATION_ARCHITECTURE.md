# Patent Application Architecture & Single Source of Truth

## Current Architecture Issues

### Problem: No Single Source of Truth

The patent application currently has a fragmented state management approach:

1. **Local Component State**: Patent content is managed locally in `usePatentAutosave` hook
2. **Context Fragmentation**: `ProjectAutosaveContext` only manages `inventionData` and `textInput`, not patent content
3. **Data Loss on Navigation**: When switching views, components unmount and local state is lost

### Root Causes

1. **Component Keys Force Unmount**:
   ```tsx
   // In [documentType].tsx
   <PatentApplicationViewClean key={componentKey} />
   ```
   The key changes when switching views, forcing React to destroy and recreate components.

2. **No Persistent Storage**: Patent content isn't stored in a context that survives view switches.

3. **Incomplete Save on Unmount**: Previously, the autosave hook only logged warnings instead of saving.

## Recommended Architecture

### Option 1: Patent Content in ProjectAutosaveContext (Recommended)

Add patent content to the existing `ProjectAutosaveContext`:

```typescript
interface ProjectAutosaveContextValue {
  inventionData: InventionData | null;
  textInput: string;
  patentContent: string; // NEW
  isSaving: boolean;
  setInventionData: React.Dispatch<React.SetStateAction<InventionData | null>>;
  setTextInput: React.Dispatch<React.SetStateAction<string>>;
  setPatentContent: React.Dispatch<React.SetStateAction<string>>; // NEW
  forceSave: () => Promise<boolean>;
}
```

Benefits:
- Single source of truth for all project data
- Content persists across view switches
- Consistent autosave behavior
- No data loss when navigating

### Option 2: Separate PatentContentContext

Create a dedicated context for patent content:

```typescript
interface PatentContentContextValue {
  content: string;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  updateContent: (content: string) => void;
  forceSave: () => Promise<void>;
}
```

Benefits:
- Separation of concerns
- Patent-specific logic isolated
- Can be loaded only when needed

### Option 3: Remove Component Keys (Quick Fix)

Remove the key prop to prevent unmounting:

```tsx
// Instead of:
<PatentApplicationViewClean key={componentKey} />

// Use:
<PatentApplicationViewClean />
```

Drawbacks:
- May cause stale props issues
- Not a complete solution
- Still no true single source of truth

## Implementation Plan

### Phase 1: Immediate Fix (Completed)
✅ Add save on unmount to prevent data loss
✅ Use refs to capture current values in cleanup

### Phase 2: Single Source of Truth
1. Extend `ProjectAutosaveContext` to include patent content
2. Move patent content state from local hook to context
3. Update `usePatentAutosave` to use context instead of local state
4. Remove component keys or make them stable

### Phase 3: Optimization
1. Add selective re-rendering optimization
2. Implement proper memoization
3. Add telemetry for autosave performance

## Migration Guide

### Step 1: Update ProjectAutosaveContext

```typescript
// In ProjectAutosaveContext.tsx
const [patentContent, setPatentContent] = useState('');

// Load patent content when project changes
useEffect(() => {
  if (activeProjectId) {
    // Load from draft documents
    const fullContentDoc = await loadDraftDocument(activeProjectId, 'FULL_CONTENT');
    setPatentContent(fullContentDoc?.content || '');
  }
}, [activeProjectId]);
```

### Step 2: Update usePatentAutosave

```typescript
// Instead of local state:
const { patentContent, setPatentContent } = useProjectAutosave();

// Use context content instead of local
```

### Step 3: Remove Unstable Keys

```typescript
// In [documentType].tsx
// Use stable keys or no keys
<PatentApplicationViewClean />
```

## Benefits of Single Source of Truth

1. **Data Persistence**: Content survives view switches
2. **Consistent State**: One place to check for unsaved changes
3. **Better Performance**: No redundant loads on view switch
4. **Easier Debugging**: Clear data flow
5. **Future Proof**: Ready for collaborative editing, offline support

## Timeline

- **Immediate**: Save on unmount fix prevents data loss
- **Next Sprint**: Implement single source of truth
- **Future**: Add optimizations and telemetry 