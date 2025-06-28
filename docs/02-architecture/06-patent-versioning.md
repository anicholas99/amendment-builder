# Patent Application Versioning System

## Overview

The patent application system implements a clean separation between working drafts and saved versions:

- **Working Draft**: Always-editable document that users actively work with
- **Saved Versions**: Immutable snapshots created at specific points in time

This architecture ensures users never lose work and always have a clear version history.

## Architecture

### Database Schema

```prisma
// Working draft documents - always editable
model DraftDocument {
  id        String   @id @default(uuid())
  projectId String
  type      String   // e.g., 'TITLE', 'BACKGROUND', 'FULL_CONTENT'
  content   String?  @db.NVarChar(Max)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  @@unique([projectId, type])
  @@index([projectId])
  @@map("draft_documents")
}

// Immutable version snapshots
model ApplicationVersion {
  id        String   @id @default(uuid())
  projectId String
  userId    String
  name      String?
  createdAt DateTime @default(now())
  
  documents Document[] // Immutable document copies
  // ... other relations
}
```

### Key Concepts

1. **Working Draft is Primary**
   - Users always edit the draft documents
   - Draft is persisted continuously (with optimistic updates)
   - No concept of "current version" - draft is always the working copy

2. **Versions are Snapshots**
   - Created from draft documents at a specific point
   - Like git commits - immutable historical records
   - Can be restored but never edited directly

3. **Clear Mental Model**
   - Draft = Canvas you're painting on
   - Versions = Photos of the canvas at different times
   - Restoration = Loading a photo back onto the canvas

## Implementation Details

### Draft Document Management

The system maintains draft documents with individual sections:

```typescript
// Draft document types
- FULL_CONTENT: Complete HTML content
- TITLE: Patent title
- FIELD: Field of invention
- BACKGROUND: Background section
- SUMMARY: Summary section
- DETAILED_DESCRIPTION: Detailed description
- ABSTRACT: Abstract section
- CLAIM_SET: Claims section
- BRIEF_DESCRIPTION_OF_THE_DRAWINGS: Drawings description
```

### API Endpoints

#### Draft Documents
- `GET /api/projects/[projectId]/draft` - Get all draft documents
- `PUT /api/projects/[projectId]/draft` - Update single document
- `POST /api/projects/[projectId]/draft` - Batch update documents

#### Versions
- `GET /api/projects/[projectId]/versions` - List all versions
- `POST /api/projects/[projectId]/versions` - Create version from draft
- `GET /api/projects/[projectId]/versions/[versionId]` - Get specific version

### Frontend Architecture

#### Draft Manager Hook
```typescript
const draftManager = usePatentDraftManager({ projectId });

// Available operations
draftManager.queueContentUpdate(content);    // Queue changes
draftManager.forceSave();                    // Save to draft
draftManager.handleSaveNewVersion(name);     // Create version
draftManager.handleLoadVersion(versionId);   // Restore version
```

#### Optimistic Updates
- Changes are displayed immediately in the UI
- Saved to draft documents in the background
- Batched to reduce API calls

### Version Operations

#### Creating a Version
1. User clicks "Save Version"
2. System ensures draft is saved
3. Creates immutable snapshot from draft documents
4. Version appears in history

#### Restoring a Version
1. User selects version from history
2. If unsaved changes exist, prompt user:
   - Save current draft as new version
   - Discard changes and restore
   - Cancel operation
3. Version content copied to draft documents
4. User continues editing the draft

## User Experience

### Editing Flow
1. User opens patent application
2. System loads draft documents (or initializes empty)
3. User edits content - changes save automatically
4. "Save Version" creates checkpoint
5. Version history shows all saved snapshots

### Version History Modal
- Lists all versions with metadata
- Shows version name, date, author
- Allows comparison between versions
- Restore button with unsaved changes protection

### Clear Terminology
- Never use "current version" 
- Always refer to "working draft" vs "saved versions"
- UI language emphasizes draft is for editing, versions for history

## Benefits

1. **No Lost Work**: Draft persists continuously
2. **Clear History**: Versions provide audit trail
3. **Safe Restoration**: Can't accidentally overwrite work
4. **Simple Mental Model**: Draft for work, versions for history
5. **Performance**: Only draft needs to be mutable

## Migration Path

For existing projects:
1. Latest version documents copied to draft on first access
2. Future edits happen in draft
3. Old versions remain accessible as history

## Security Considerations

- Draft documents respect tenant isolation
- Version creation requires project write access
- Restoration requires confirmation to prevent accidents
- All operations logged for audit trail 