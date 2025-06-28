# Patent Application Sections-Only Architecture

## Overview

The patent application system has been refactored to store **only individual sections** without duplicating content in a FULL_CONTENT document. This eliminates data redundancy, improves performance, and simplifies the codebase.

## Key Changes

### Before (Redundant Storage)
- Stored both FULL_CONTENT and individual sections
- Sections were extracted from FULL_CONTENT on save
- Reading primarily used FULL_CONTENT, ignoring saved sections
- Data duplication caused sync issues and storage overhead

### After (Sections-Only)
- Store only individual sections (TITLE, FIELD, BACKGROUND, etc.)
- Content is rebuilt from sections when needed for display
- No data duplication or sync issues
- Smaller, more efficient storage and updates

## Implementation Details

### 1. Storage Structure

```typescript
// Draft documents now contain only sections:
DraftDocument {
  type: 'TITLE' | 'FIELD' | 'BACKGROUND' | 'SUMMARY' | ...
  content: string
}
// No more FULL_CONTENT type
```

### 2. Reading Content

```typescript
// usePatentDraftManager.ts
const contentFromDrafts = useMemo(() => {
  // Always rebuild from sections
  const sectionDocuments: Record<string, string> = {};
  draftDocuments.forEach((doc) => {
    if (doc.type && doc.content != null && doc.type !== 'FULL_CONTENT') {
      sectionDocuments[doc.type] = doc.content;
    }
  });
  
  return rebuildHtmlContent(sectionDocuments);
}, [draftDocuments]);
```

### 3. Saving Content

```typescript
// Only save individual sections
const sections = extractSections(content);
const updates = Object.entries(sections).map(([type, content]) => ({
  type: type.toUpperCase().replace(/\s+/g, '_'),
  content,
}));
// No FULL_CONTENT in updates
```

## Benefits

1. **No Data Redundancy**: Single source of truth for each section
2. **Better Performance**: Only save/load changed sections
3. **Simpler Code**: No complex sync logic between FULL_CONTENT and sections
4. **Future Ready**: Easy to add section-level features (permissions, collaboration)
5. **Patent Native**: Matches how patents are actually structured

## Migration

Run the migration script to remove existing FULL_CONTENT documents:

```bash
npm run tsx scripts/migrate-remove-full-content.ts
```

## Section Types

Standard patent sections stored in the database:

- `TITLE` - Patent title
- `FIELD` - Field of the invention
- `BACKGROUND` - Background of the invention
- `SUMMARY` - Summary of the invention
- `BRIEF_DESCRIPTION_OF_THE_DRAWINGS` - Brief description of drawings
- `DETAILED_DESCRIPTION` - Detailed description
- `CLAIMS` or `CLAIM_SET` - Patent claims
- `ABSTRACT` - Patent abstract

## Rebuilding Content

The `rebuildHtmlContent` function in `patent-sections/rebuildContent.ts` handles combining sections in the correct order with proper formatting.

## API Changes

- No changes to API contracts
- Backend automatically rebuilds content from sections when needed
- Frontend continues to work with full HTML content for editing

## Testing

Ensure these scenarios work correctly:
1. Creating new patent applications
2. Editing existing patents
3. Saving and loading versions
4. Exporting to DOCX
5. AI section enhancement

## Future Enhancements

With sections as the primary storage:
- Section-level permissions
- Concurrent section editing
- Section-specific AI models
- Granular change tracking
- Section templates 