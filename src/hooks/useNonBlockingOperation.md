# useNonBlockingOperation Hook

## Purpose
Defers heavy operations to prevent blocking UI animations during critical user interactions.

## Problem Solved
When users switch projects or perform other UI-intensive actions, heavy operations like:
- React Query cache invalidation
- Large data processing
- Multiple context updates

Can block the main thread and freeze animations (like skeleton loading states).

## Solution
This hook uses `requestIdleCallback` (with `setTimeout` fallback) to defer operations until the browser has spare cycles.

## Usage

```typescript
import { useNonBlockingOperation } from '@/hooks/useNonBlockingOperation';

function MyComponent() {
  const deferOperation = useNonBlockingOperation();
  
  const handleUserAction = () => {
    // Immediate UI updates happen synchronously
    setLoadingState(true);
    
    // Heavy operations are deferred
    deferOperation(() => {
      queryClient.invalidateQueries(['heavy-query']);
      processLargeDataset();
    }, 'my-operation');
  };
}
```

## Current Usage

### Project Cleanup (`useProjectCleanup.ts`)
- Defers cache invalidation when switching projects
- Allows skeleton animations to run smoothly

### Navigation Manager (`NavigationManager.tsx`)
- Defers project-specific query invalidation
- Prevents blocking during navigation

### Project Autosave (`ProjectAutosaveContext.tsx`)
- Defers invention data loading
- Prevents blocking during project context updates

## Best Practices

1. **Use for heavy operations only** - Don't defer lightweight operations
2. **Provide operation names** - Helps with debugging and logging
3. **Keep immediate operations synchronous** - Only defer what's truly heavy
4. **Test the user experience** - Ensure operations still complete in reasonable time

## Browser Support
- Modern browsers: Uses `requestIdleCallback`
- Legacy browsers: Falls back to `setTimeout(100ms)`
- Timeout protection: Operations complete within 1 second maximum 