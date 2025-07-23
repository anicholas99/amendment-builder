# Editable Tiptap Preview Components

This directory contains editable USPTO-compliant preview components that allow users to edit document content directly within the preview interface.

## Overview

The editable preview components convert the previous read-only preview system into a fully interactive editing experience while maintaining USPTO compliance and existing save patterns.

## Components

### Core Components

#### `TiptapPreviewEditor`
- **Base component** for all editable previews
- USPTO-compliant styling (Times New Roman, proper margins)
- Auto-save functionality with debounced updates
- Edit/View mode toggle
- Consistent toolbar with essential formatting
- Integration with existing draft document patterns

#### `TiptapClaimsPreview`
- **Editable Claims Document Preview** (CLM format)
- Replaces `ClaimsDocumentPreview` with full editing capability
- Maintains claim amendment structure and formatting
- Auto-saves to `CLAIMS_AMENDMENTS` draft document type
- Parses between HTML and claim data structures

#### `TiptapRemarksPreview`  
- **Editable Remarks Document Preview** (REM format)
- Replaces `RemarksDocumentPreview` with full editing capability
- Maintains argument section structure and legal formatting
- Auto-saves to `ARGUMENTS` draft document type
- Preserves USPTO-compliant legal document structure

#### `TiptapPreviewModal`
- **Editable Claims Modal** for quick claim editing
- Replaces `PreviewModal` with Tiptap editing capability
- Compact modal design with edit/view mode toggle
- Optional save callback for integration with parent components

## Integration

### Amendment Workspace Tabs

The preview tab in `AmendmentWorkspaceTabs` now uses the editable components:

```tsx
// Before (read-only)
<ClaimsDocumentPreview 
  claimAmendments={claimsData}
  applicationNumber={selectedOfficeAction?.metadata?.applicationNumber}
  // ... other props
/>

// After (editable)
<TiptapClaimsPreview 
  projectId={projectId}
  claimAmendments={claimsData}
  applicationNumber={selectedOfficeAction?.metadata?.applicationNumber}
  onExport={handleExportClaims}
  className="h-full"
  // ... other props
/>
```

### Modal Integration

The claim preview modal is now editable:

```tsx
// Before (read-only)
<PreviewModal
  isOpen={isPreviewModalOpen}
  onClose={() => setIsPreviewModalOpen(false)}
  claims={normalizedClaims}
/>

// After (editable)
<TiptapPreviewModal
  isOpen={isPreviewModalOpen}
  onClose={() => setIsPreviewModalOpen(false)}
  claims={normalizedClaims}
  onSave={handleClaimsSave} // Optional callback
  projectId={projectId}     // Optional for logging
/>
```

## Features

### Auto-Save Functionality
- **Debounced auto-save** (default: 3 seconds after stopping typing)
- Integrates with existing React Query mutation patterns
- Uses established draft document types (`CLAIMS_AMENDMENTS`, `ARGUMENTS`)
- Maintains data consistency with rest of application

### USPTO Compliance
- **Times New Roman 12pt font** with proper line spacing
- **Correct margins**: top/bottom/right ≥0.75", left ≥1" 
- Responsive adjustments for different screen sizes
- Print-ready formatting for official USPTO submissions

### Edit/View Mode Toggle
- **Seamless switching** between edit and view modes
- Toolbar automatically shows/hides based on edit state
- Visual indicators for current mode and unsaved changes
- Consistent with existing application UX patterns

### Content Structure Preservation
- **Maintains document structure** during editing
- Preserves claim numbering and amendment status
- Keeps argument section organization intact
- Handles complex nested content properly

## Data Flow

### Claims Preview
1. **Load**: Claims data from `CLAIMS_AMENDMENTS` draft document or props
2. **Convert**: Claim data structures to HTML for Tiptap editor
3. **Edit**: User edits content in USPTO-compliant format
4. **Parse**: HTML content back to claim data structures
5. **Save**: Updated claims to draft document via React Query mutation

### Remarks Preview  
1. **Load**: Arguments data from `ARGUMENTS` draft document or props
2. **Convert**: Argument sections to HTML for Tiptap editor
3. **Edit**: User edits content maintaining legal document structure
4. **Parse**: HTML content back to argument data structures
5. **Save**: Updated arguments to draft document with timestamp

## Error Handling

- **Graceful degradation** when parsing fails
- **Fallback to original data** on conversion errors
- **User-friendly error messages** via toast notifications
- **Comprehensive logging** for debugging and monitoring

## Performance Considerations

- **Lazy loading** for large documents
- **Debounced auto-save** to prevent excessive API calls
- **Efficient HTML parsing** using native DOMParser
- **Memory management** for editor instances

## Future Enhancements

### Planned Features
- **Real-time collaboration** support
- **Version history** integration
- **Advanced formatting** options (tables, citations)
- **Export format selection** (DOCX, PDF)

### Extensibility
- **Modular design** allows easy addition of new preview types
- **Plugin architecture** for custom Tiptap extensions
- **Theme support** for different visual styles
- **API flexibility** for different backend integrations

## Migration Guide

### From Read-Only Previews

1. **Replace imports**:
   ```tsx
   // Old
   import { ClaimsDocumentPreview } from './ClaimsDocumentPreview';
   
   // New  
   import TiptapClaimsPreview from './TiptapClaimsPreview';
   ```

2. **Update component usage**:
   ```tsx
   // Add required props
   <TiptapClaimsPreview 
     projectId={projectId}        // Required for save functionality
     onExport={handleExport}      // Optional export callback
     className="h-full"           // Layout styling
     // ... existing props
   />
   ```

3. **Handle new capabilities**:
   - Users can now edit content directly in previews
   - Auto-save will trigger draft document updates
   - Export functions are integrated into component headers

### Integration Testing

- **Verify auto-save** functionality with draft documents
- **Test edit/view mode** transitions
- **Confirm USPTO compliance** in generated documents
- **Validate export** functionality with edited content

## Architecture Benefits

### Improved User Experience
- **Direct editing** eliminates context switching
- **Live preview** shows changes immediately
- **Consistent interface** across all preview types
- **Reduced friction** in amendment workflows

### Maintainability
- **Consistent patterns** across preview components
- **Shared base component** reduces code duplication
- **Type-safe integration** with existing systems
- **Clear separation** of concerns

### Security & Reliability
- **Input validation** and sanitization
- **Error boundaries** prevent crashes
- **Audit trail** through logging
- **Data consistency** checks 