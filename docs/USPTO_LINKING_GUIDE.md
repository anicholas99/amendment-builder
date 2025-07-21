# USPTO Application Linking Guide

This guide explains how to link USPTO applications to projects in Amendment Builder, enabling automatic download and OCR of essential patent documents for AI-powered amendment drafting.

## Overview

The USPTO linking feature allows you to:
- Connect a USPTO application number to a project
- Automatically download essential documents (office actions, claims, specifications, responses)
- OCR all documents for full-text search and AI context
- Store documents securely in Azure blob storage
- Provide AI agents with comprehensive prosecution history

## Essential Documents Downloaded

When you link a USPTO application, the system automatically downloads and processes these core documents:

1. **Latest Office Action** (CTNF, CTFR, CTAV)
   - Primary rejection document containing 102/103 analysis
   - Stored in `OfficeAction` table

2. **Current Claims** (CLM)
   - The claim set being rejected
   - Used for amendment comparison

3. **Specification** (SPEC)
   - Full patent specification (largest version selected)
   - Provides support basis to avoid new matter rejections

4. **Last Response** (REM, A..., A.NE)
   - Previous attorney arguments
   - Helps AI avoid repeating failed strategies

5. **Search Notes** (SRNT, SRFW) - Optional but recommended
   - Examiner's search strategy
   - Helps assess rejection strength

6. **Interview Summary** (EXIN) - Optional
   - Captures verbal agreements with examiner

## How to Link USPTO Application

### Via API

```typescript
// Using the React Query hook
import { useLinkUSPTOToProject } from '@/hooks/api/useUSPTO';

const { mutate: linkUSPTO } = useLinkUSPTOToProject();

// Link application
linkUSPTO({
  projectId: 'project-id-here',
  applicationNumber: '16/123,456'  // Accepts various formats
});
```

### Via REST API

```bash
POST /api/projects/{projectId}/link-uspto
Content-Type: application/json

{
  "applicationNumber": "16123456"
}
```

### Response Format

```json
{
  "success": true,
  "data": {
    "applicationNumber": "16123456",
    "documentsProcessed": 6,
    "documentsStored": 6,
    "essentialDocuments": {
      "officeAction": "doc-id-1",
      "claims": "doc-id-2",
      "specification": "doc-id-3",
      "lastResponse": "doc-id-4",
      "searchNotes": "doc-id-5",
      "interview": "doc-id-6"
    },
    "errors": []
  }
}
```

## Accessing USPTO Documents for AI

### In AI Prompts

```typescript
import { getEssentialUSPTODocuments } from '@/repositories/fileHistoryRepository';

// Get OCR'd text for AI context
const documents = await getEssentialUSPTODocuments(projectId, tenantId);

// documents contains:
{
  officeAction?: string,    // Full text of latest OA
  claims?: string,          // Current claim text
  specification?: string,   // Full specification
  lastResponse?: string,    // Previous arguments
  searchNotes?: string,     // Examiner search
  interview?: string        // Interview notes
}
```

### In File History Context

The USPTO documents are automatically included when building file history context:

```typescript
import { buildFileHistoryContext } from '@/repositories/fileHistoryRepository';

const context = await buildFileHistoryContext(projectId, {
  tenantId,
  includeClaimEvolution: true,
  includeExaminerAnalysis: true,
});
```

## Storage Architecture

### Document Storage Locations

- **Office Actions**: `office-actions-private` container
- **Specifications**: `patent-files-private` container  
- **Other Documents**: `uspto-documents-private` container

### Database Tables

- **OfficeAction**: Stores office action documents with metadata
- **SavedPriorArt**: Stores other USPTO documents (claims, responses, etc.)
  - `isEssentialDoc`: Marks core documents for AI retrieval
  - `usptoDocumentCode`: Original USPTO document code
  - `extractedText`: Full OCR'd text content

## Error Handling

The system handles various error scenarios:

- **Missing Documents**: Continues processing if some documents are unavailable
- **OCR Failures**: Falls back to multiple OCR providers
- **Network Issues**: Implements retry logic for downloads
- **Large Files**: 60-second timeout for PDF downloads

## Security Considerations

- All documents are virus-scanned before storage
- Documents stored in private Azure containers
- Tenant isolation enforced at all levels
- Full audit logging of document access

## Performance Notes

- Documents are processed asynchronously
- OCR can take 10-30 seconds per document
- Results are cached for fast retrieval
- Rate limited to prevent API abuse

## Common Issues

### Application Already Linked
If an application is already linked, the API returns success without reprocessing.

### Document Not Available
Some older applications may not have all document types available. The system continues with available documents.

### OCR Quality
Scanned documents may have varying OCR quality. The system uses multiple OCR providers to maximize success.

## Example Integration

```typescript
// Complete example of linking and using USPTO documents
async function processUSPTOAmendment(projectId: string, applicationNumber: string) {
  // 1. Link USPTO application
  const linkResult = await USPTOService.linkUSPTOToProject(
    projectId, 
    applicationNumber
  );
  
  // 2. Wait for processing to complete
  console.log(`Processed ${linkResult.documentsStored} documents`);
  
  // 3. Get documents for AI
  const documents = await getEssentialUSPTODocuments(
    projectId, 
    tenantId
  );
  
  // 4. Use in AI prompt
  const prompt = `
    Based on the following USPTO documents:
    
    OFFICE ACTION:
    ${documents.officeAction}
    
    CURRENT CLAIMS:
    ${documents.claims}
    
    SPECIFICATION:
    ${documents.specification}
    
    LAST RESPONSE:
    ${documents.lastResponse || 'No previous response'}
    
    Please draft an amendment...
  `;
  
  return prompt;
}
```

## Database Migration

Run the following to update your database schema:

```bash
npm run db:migrate-dev  # Development
npm run db:generate     # Generate Prisma client
```

## Future Enhancements

- Real-time sync status updates
- Incremental document updates
- Batch linking for multiple applications
- Webhook notifications on completion