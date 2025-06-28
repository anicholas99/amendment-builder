# Figure & Element Update Architecture Guide

## Overview

This document defines the SINGLE correct pattern for updating figures and elements in the application. Following this pattern ensures consistency, type safety, and maintainability.

## Core Architecture Principles

### 1. **Frontend sends OBJECTS**
- The frontend ALWAYS sends clean JavaScript objects
- Never pre-stringify JSON in components or hooks
- Let TypeScript provide type safety through interfaces

### 2. **Service layer handles JSON stringification**
- Only `inventionDataService.ts` converts objects to JSON strings
- This happens in ONE place for consistency
- Database-specific formatting is isolated from business logic

### 3. **Type safety through interfaces**
- Use `UpdateInventionRequest` interface for all updates
- TypeScript will catch errors at compile time
- No runtime surprises from mismatched data formats

## Implementation Pattern

### ✅ CORRECT Pattern

```typescript
// In your component/hook
const handleFigureUpdate = (newFigures: Figures) => {
  updateInventionMutation.mutate({
    projectId,
    updates: {
      figures: newFigures,  // Send as object
      elements: newElements // Send as object
    }
  });
};
```

### ❌ INCORRECT Pattern

```typescript
// NEVER do this in components/hooks
const handleFigureUpdate = (newFigures: Figures) => {
  updateInventionMutation.mutate({
    projectId,
    updates: {
      figuresJson: JSON.stringify(newFigures),  // Wrong!
      elementsJson: JSON.stringify(newElements) // Wrong!
    }
  });
};
```

## Data Flow

```
1. User Action (Edit Figure/Element)
    ↓
2. Component State Update
    ↓
3. Hook Handler (usePatentSidebar)
    ↓
4. API Service Call
    - Sends OBJECTS via UpdateInventionRequest
    ↓
5. inventionDataService.updateInventionData()
    - Validates request format
    - Converts objects to JSON strings
    ↓
6. Repository Layer
    - Saves to database with proper JSON fields
```

## Benefits of This Pattern

1. **Type Safety**: TypeScript catches errors before runtime
2. **Single Responsibility**: JSON handling in one place
3. **Testability**: Easy to unit test with mock objects
4. **Maintainability**: Clear separation of concerns
5. **Consistency**: One pattern across the entire codebase

## Migration Checklist

If you find code that sends pre-stringified JSON:

1. Remove `JSON.stringify()` calls from the component/hook
2. Change field names from `*Json` to base names (e.g., `figuresJson` → `figures`)
3. Ensure the data matches `UpdateInventionRequest` interface
4. Test that updates still persist correctly

## Common Mistakes to Avoid

1. **Stringifying in multiple places**: This creates inconsistency
2. **Mixed patterns**: Some updates as objects, others as strings
3. **Bypassing the type system**: Using `any` types or ignoring TypeScript errors
4. **Direct database field names**: Using `figuresJson` in frontend code

## For New Developers

When working with invention data updates:

1. Always check `UpdateInventionRequest` interface first
2. Never call `JSON.stringify()` in frontend code
3. Use the existing patterns in `usePatentSidebar` as reference
4. If unsure, the service will throw clear error messages

Remember: The goal is a clean, predictable architecture where each layer has a clear responsibility. 