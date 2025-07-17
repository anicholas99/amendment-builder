# Patent Application Section Sync Feature

## Overview

The Section Sync feature allows users to selectively regenerate patent application sections when underlying data changes. Instead of regenerating the entire patent application, users can:

1. See which sections are affected by their changes
2. Preview the differences before applying
3. Selectively accept or reject changes per section
4. Maintain their manual edits where desired

## How Claims Sync Works

When you modify claims in the claim refinement view:
1. Your refined claims are saved to the database
2. The sync system can update the static CLAIMS section in your patent application
3. The system pulls claims directly from the database and formats them properly
4. Other sections (Summary, Detailed Description) are also updated to reference the new claims

## How It Works

### 1. Change Detection

The system tracks different types of data changes:
- **Figures**: When figures are added, removed, or modified
- **Invention Details**: When technology details, summary, or technical implementation changes
- **Claims**: When claims are added, modified, or removed in the claim refinement view
  - Syncs the CLAIMS section directly from database
  - Updates Summary and Detailed Description to reference the new claims
- **Prior Art**: When prior art references are updated
- **Title**: When the invention title changes

### 2. Section Dependencies

Each patent section depends on specific data types:

| Section | Depends On |
|---------|------------|
| TITLE | Title |
| FIELD | Invention Details |
| BACKGROUND | Invention Details, Prior Art |
| SUMMARY | Invention Details |
| BRIEF DESCRIPTION OF DRAWINGS | Figures |
| DETAILED DESCRIPTION | Invention Details, Figures |
| CLAIMS | Claims |
| ABSTRACT | Invention Details |

### 3. Regeneration Process

1. **Detection**: System identifies which data has changed
2. **Preview**: Generates new content for affected sections
3. **Comparison**: Shows diff between current and new content
4. **Selection**: User chooses which sections to update
5. **Application**: Selected sections are updated in the draft

## Usage

### Basic Integration

```typescript
import { useSectionSync } from '@/features/patent-application/hooks/useSectionSync';
import { SectionSyncDialog } from '@/features/patent-application/components/SectionSyncDialog';

function PatentApplicationView({ projectId }) {
  const sectionSync = useSectionSync();

  // After making changes
  const handleFigureAdded = () => {
    // ... add figure logic ...
    sectionSync.syncAfterFigureChange();
  };

  return (
    <>
      {/* Your UI */}
      <SectionSyncDialog
        isOpen={sectionSync.isOpen}
        onClose={sectionSync.closeSync}
        projectId={projectId}
        changeTypes={sectionSync.changeTypes}
        onSync={handleSyncComplete}
      />
    </>
  );
}
```

### Triggering Sync

```typescript
// After specific changes
sectionSync.syncAfterFigureChange();
sectionSync.syncAfterInventionUpdate();
sectionSync.syncAfterClaimsUpdate();
sectionSync.syncAfterPriorArtUpdate();

// For multiple change types
sectionSync.syncAfterMultipleChanges(['figures', 'claims']);
```

### API Endpoint

The feature uses the `/api/projects/[projectId]/regenerate-section` endpoint:

```typescript
POST /api/projects/[projectId]/regenerate-section
{
  "section": "BRIEF_DESCRIPTION_OF_THE_DRAWINGS",  // Optional: specific section
  "changeTypes": ["figures"],                      // Optional: types of changes
  "preview": true,                                 // true = preview only, false = apply
  "selectedRefs": ["ref1", "ref2"]                // Optional: prior art refs
}
```

Response:
```typescript
{
  "success": true,
  "preview": true,
  "sections": [
    {
      "section": "BRIEF_DESCRIPTION_OF_THE_DRAWINGS",
      "oldContent": "Previous content...",
      "newContent": "Updated content...",
      "hasChanged": true,
      "usage": { /* token usage */ }
    }
  ],
  "summary": {
    "total": 2,
    "changed": 1,
    "unchanged": 1
  }
}
```

## UI Components

### SectionSyncDialog

Main dialog component that shows:
- List of affected sections
- Change indicators (has changes / up to date)
- Diff viewer for each section
- Checkboxes to select sections for update

### DiffViewer

Shows differences between old and new content:
- Unified view: Shows additions/removals inline
- Split view: Shows old and new side-by-side
- Color coding: Green for additions, red for removals

## Best Practices

1. **Automatic Triggers**: Consider triggering sync automatically after significant changes
2. **Batch Changes**: Group related changes before triggering sync to minimize API calls
3. **User Notification**: Always notify users when sections need updating
4. **Manual Override**: Allow users to skip sync if they prefer manual control

## Performance Considerations

- Section regeneration uses AI and can take 10-30 seconds
- Preview mode allows checking changes without committing
- Only affected sections are regenerated, not the entire document
- Token usage is tracked per section for cost monitoring

## Future Enhancements

1. **Auto-sync Mode**: Automatically sync sections on save
2. **Conflict Resolution**: Better handling when manual edits conflict with regeneration
3. **History Tracking**: Keep history of section changes
4. **Partial Section Updates**: Update only specific paragraphs within sections
5. **Smart Diff**: AI-powered diff that understands semantic changes 