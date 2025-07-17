# State Management Guide

This guide documents the patterns used for managing complex state in the Patent Drafter AI application.

## When to Use useReducer

Use `useReducer` instead of multiple `useState` hooks when:
- You have more than 4-5 pieces of related state
- State updates depend on previous state
- State logic is complex with multiple update patterns
- You want better type safety for state updates

## Pattern: Grouped State with useReducer

### Structure

1. **Group related state** into logical categories:
```typescript
interface ComponentState {
  // Group by concern
  modals: {
    isOpen: boolean;
    data: ModalData | null;
  };
  
  loading: {
    isLoading: boolean;
    error: Error | null;
  };
  
  data: {
    items: Item[];
    selectedId: string | null;
  };
}
```

2. **Define type-safe actions** using discriminated unions:
```typescript
type ComponentAction =
  | { type: 'OPEN_MODAL'; payload: ModalData }
  | { type: 'CLOSE_MODAL' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: Error | null };
```

3. **Create a reducer** with clear action handling:
```typescript
function componentReducer(
  state: ComponentState,
  action: ComponentAction
): ComponentState {
  switch (action.type) {
    case 'OPEN_MODAL':
      return {
        ...state,
        modals: { isOpen: true, data: action.payload }
      };
    // ... other cases
    default:
      return state;
  }
}
```

4. **Maintain backward compatibility** by flattening state in the return:
```typescript
export function useComponent() {
  const [state, dispatch] = useReducer(componentReducer, initialState);
  
  // Memoize action creators
  const openModal = useCallback((data: ModalData) => 
    dispatch({ type: 'OPEN_MODAL', payload: data }), []);
    
  // Return flattened for backward compatibility
  return {
    // State
    isModalOpen: state.modals.isOpen,
    modalData: state.modals.data,
    isLoading: state.loading.isLoading,
    error: state.loading.error,
    
    // Actions
    openModal,
    closeModal,
  };
}
```

## Examples of Refactored Components

### 1. useClaimViewState (23 useState → 1 useReducer)
- Groups: modals, view, selections, data, loading
- Benefits: Clear state organization, type-safe actions

### 2. usePatentApplication (18 useState → 1 useReducer)
- Groups: status, generation, content, editor, versions, verification, ui
- Benefits: Simplified autosave logic, clearer state flow

### 3. ModalManager (16 useState → 1 useReducer)
- Groups: modals, modalData, view, data, loading
- Benefits: Centralized modal management, predictable updates

## Best Practices

1. **Always memoize action creators** with `useCallback`:
```typescript
const setLoading = useCallback((isLoading: boolean) => 
  dispatch({ type: 'SET_LOADING', payload: isLoading }), []);
```

2. **Keep backward compatibility** when refactoring existing hooks:
- Return the same property names
- Maintain the same function signatures
- Don't change the public API

3. **Use descriptive action names**:
- ✅ `OPEN_PRIOR_ART_MODAL`
- ❌ `SET_MODAL`

4. **Group related actions**:
```typescript
// Modal actions together
case 'OPEN_MODAL':
case 'CLOSE_MODAL':
// Loading actions together  
case 'SET_LOADING':
case 'SET_ERROR':
```

5. **Handle all state updates atomically**:
```typescript
case 'CLOSE_PRIOR_ART_MODAL':
  return {
    ...state,
    modals: { ...state.modals, isPriorArtOpen: false },
    modalData: { ...state.modalData, viewingPriorArt: null }, // Clear data too
  };
```

## When NOT to Use useReducer

- Simple boolean toggles (1-2 pieces of state)
- State that's already managed by React Query
- Form state (consider react-hook-form instead)
- State that rarely changes together

## Migration Checklist

When refactoring from useState to useReducer:

- [ ] Identify all related state pieces
- [ ] Group state logically
- [ ] Define all possible actions
- [ ] Create type-safe action types
- [ ] Implement reducer with all cases
- [ ] Memoize action creators
- [ ] Maintain backward compatibility
- [ ] Test all state transitions
- [ ] Update component to use new hook
- [ ] Verify no breaking changes

## Performance Considerations

- useReducer can be more performant for complex state
- Dispatch function is stable (never changes)
- Easier to optimize with React.memo
- Better for preventing unnecessary re-renders

## Debugging Tips

1. Add logging to your reducer during development:
```typescript
function reducer(state: State, action: Action): State {
  console.log('Action:', action.type, action.payload);
  // ... reducer logic
}
```

2. Use Redux DevTools with useReducer:
```typescript
const [state, dispatch] = useReducer(
  process.env.NODE_ENV === 'development' 
    ? withDevTools(reducer) 
    : reducer,
  initialState
);
```

3. Keep actions simple and predictable
4. Avoid side effects in reducers