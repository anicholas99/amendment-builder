# Unified Structured Data Serialization

## Overview

This directory contains the **ONLY** system for serializing and deserializing `structuredData` in the application. It replaces three competing systems that were causing confusion and data corruption.

## Why This Exists

Previously, we had three different serialization systems:
1. `lib/structuredData/index.ts` - Basic serialization
2. `utils/projectStructuredData.ts` - Complex with migrations  
3. `lib/validation/schemas/db/structuredData.schema.ts` - Zod validation

This led to:
- The infamous "string 'null'" bug that required monitoring
- Developers not knowing which system to use
- Data corruption when systems were mixed
- Complex workarounds in repository code

## What This System Does

The unified system automatically handles:

### 1. String "null" Issues
```typescript
// Before: String "null" stored in DB
project.structuredData = "null" // Bad!

// After: Automatically converted to null
deserializeStructuredData("null") // Returns null
```

### 2. Empty Objects
```typescript
// Before: Empty objects stored as "{}"
project.structuredData = "{}" // Bad!

// After: Automatically converted to null
deserializeStructuredData({}) // Returns null
```

### 3. Data Migrations
- Array claims → Object claims
- uploadedFigures → pendingFigures
- Figure elements arrays → objects
- Single values → arrays for list fields

### 4. Validation
- Zod schema validation with lenient fallback
- Safe JSON parsing that never throws
- Comprehensive error logging

## API Reference

### Core Functions

```typescript
// Deserialize from database
deserializeStructuredData(data: unknown): StructuredInventionData | null

// Serialize for database
serializeStructuredData(data: StructuredInventionData | null): string | null

// Process entire project
processProject(project: ProjectWithStructuredData): ProcessedProject

// Prepare project for storage
prepareProjectForStorage(project: ProcessedProject): ProjectWithStructuredData
```

### Utility Functions

```typescript
// Check if data is healthy (not corrupted)
isHealthyStructuredData(data: unknown): boolean

// Merge data objects
mergeStructuredData(existing: StructuredInventionData | null, updates: Partial<StructuredInventionData>): StructuredInventionData

// Create empty data
createEmptyStructuredData(): StructuredInventionData

// Check if has content
hasStructuredDataContent(data: StructuredInventionData | null): boolean
```

## Do We Still Need Monitoring?

**NO!** The monitoring in `lib/structuredData/monitor.ts` is no longer needed because:

1. **String "null" is automatically fixed** during deserialization
2. **Empty objects are automatically converted to null**
3. **Invalid JSON is handled gracefully** with logging
4. **All legacy formats are migrated** automatically

The `isHealthyStructuredData()` function is built into the new system for any remaining health checks.

## Migration Status

✅ Core repository migrated
⏳ API routes need migration
⏳ React components need migration
⏳ Old systems can be deleted after full migration

## Example: Simple Repository Usage

**Before (Complex):**
```typescript
// 100+ lines of complex logic handling edge cases
if (updateData.structuredData !== undefined) {
  // Check for empty objects
  // Fetch existing data
  // Multiple serialization attempts
  // Fallback logic
  // etc...
}
```

**After (Simple):**
```typescript
if (updateData.structuredData !== undefined) {
  updateData.structuredData = serializeStructuredData(
    updateData.structuredData as StructuredInventionData
  );
}
```

That's it! All edge cases are handled automatically. 