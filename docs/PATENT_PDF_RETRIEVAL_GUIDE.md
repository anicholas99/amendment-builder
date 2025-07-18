# Patent PDF Retrieval System

This guide explains how to retrieve patent PDFs for examiner-cited prior art using the new Patent PDF Retrieval System.

## Overview

The Patent PDF Retrieval System automatically downloads and caches patent PDFs from multiple sources, making them available for inline viewing in your application. This is especially useful for reviewing examiner-cited prior art during office action responses.

## Architecture

### Multi-Source Retrieval
The system tries multiple sources in order:
1. **Cache Check**: First checks if PDF already exists in Azure Blob Storage
2. **PatBase API**: Enhanced integration with your existing PatBase subscription
3. **USPTO Public APIs**: Direct access to USPTO patent database
4. **Google Patents**: Fallback for broad patent coverage

### Storage & Security
- PDFs stored securely in Azure Blob Storage with tenant isolation
- Full text extraction for searchability
- Metadata extraction for enhanced organization
- Existing viewing infrastructure via `/api/projects/[projectId]/prior-art/[priorArtId]/view`

## Usage Examples

### Frontend: React Hooks

#### Single Patent PDF Retrieval
```tsx
import { useSinglePatentPdfRetrieval } from '@/hooks/api/usePatentPdfRetrieval';

function ExaminerCitationViewer({ projectId, patentNumber }) {
  const { retrieveSinglePatentPdf, isLoading } = useSinglePatentPdfRetrieval();

  const handleViewPdf = async () => {
    try {
      const result = await retrieveSinglePatentPdf(projectId, patentNumber, {
        fileType: 'examiner-citation',
        forceRefresh: false, // Use cached version if available
      });

      if (result.success && result.priorArtId) {
        // PDF is now available - redirect to viewer
        window.open(`/api/projects/${projectId}/prior-art/${result.priorArtId}/view`, '_blank');
      } else {
        console.error('Failed to retrieve PDF:', result.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <button onClick={handleViewPdf} disabled={isLoading}>
      {isLoading ? 'Retrieving PDF...' : 'View Patent PDF'}
    </button>
  );
}
```

#### Bulk Patent PDF Retrieval (Office Actions)
```tsx
import { useBulkPatentPdfRetrieval } from '@/hooks/api/usePatentPdfRetrieval';

function OfficeActionPdfRetrieval({ projectId, citedPatents }) {
  const { retrieveBulkPatentPdfs, isLoading } = useBulkPatentPdfRetrieval();

  const handleRetrieveAllPdfs = async () => {
    try {
      const result = await retrieveBulkPatentPdfs(projectId, citedPatents, {
        fileType: 'examiner-citation',
      });

      console.log(`Retrieved ${result.summary.successful} out of ${result.summary.total} PDFs`);
      
      // Show results summary
      result.results.forEach(patent => {
        if (patent.success) {
          console.log(`✓ ${patent.patentNumber} - Available for viewing`);
        } else {
          console.log(`✗ ${patent.patentNumber} - ${patent.error}`);
        }
      });
    } catch (error) {
      console.error('Bulk retrieval failed:', error);
    }
  };

  return (
    <div>
      <button onClick={handleRetrieveAllPdfs} disabled={isLoading}>
        {isLoading ? 'Retrieving PDFs...' : `Retrieve All ${citedPatents.length} Patent PDFs`}
      </button>
      
      {isLoading && (
        <p>This may take a few minutes for multiple patents...</p>
      )}
    </div>
  );
}
```

### Backend: Direct Service Usage

```typescript
import { PatentPdfRetrievalService } from '@/server/services/patent-pdf-retrieval.server-service';

// Single patent retrieval
const result = await PatentPdfRetrievalService.retrievePatentPdf(
  'US1234567B2',
  projectId,
  tenantId,
  userId,
  {
    fileType: 'examiner-citation',
    forceRefresh: false,
  }
);

if (result.success) {
  console.log(`PDF retrieved from ${result.source}, stored as ${result.priorArtId}`);
}

// Bulk retrieval for office actions
const bulkResults = await PatentPdfRetrievalService.bulkRetrievePatentPdfs(
  ['US1234567B2', 'US7890123B1', 'US5555555B2'],
  projectId,
  tenantId,
  userId,
  {
    fileType: 'examiner-citation',
    maxConcurrent: 3, // Process 3 at a time
  }
);

console.log(`Bulk retrieval: ${bulkResults.filter(r => r.success).length} successful`);
```

### API Endpoint Usage

```bash
# Retrieve multiple patent PDFs
curl -X POST "/api/projects/{projectId}/retrieve-patent-pdf" \
  -H "Content-Type: application/json" \
  -d '{
    "patentNumbers": ["US1234567B2", "US7890123B1"],
    "fileType": "examiner-citation",
    "forceRefresh": false
  }'

# Response:
{
  "success": true,
  "results": [
    {
      "patentNumber": "US1234567B2",
      "success": true,
      "priorArtId": "uuid-123",
      "source": "cache"
    },
    {
      "patentNumber": "US7890123B1", 
      "success": true,
      "priorArtId": "uuid-456",
      "source": "uspto"
    }
  ],
  "summary": {
    "total": 2,
    "successful": 2,
    "failed": 0,
    "fromCache": 1,
    "fromUSPTO": 1,
    "fromPatbase": 0,
    "fromGooglePatents": 0
  }
}
```

## Integration Points

### Office Action Processing
When processing office actions, extract cited patent numbers and use bulk retrieval:

```typescript
// After parsing office action and extracting cited patents
const citedPatents = ['US1234567B2', 'US7890123B1', 'US5555555B2'];

const pdfResults = await PatentPdfRetrievalService.bulkRetrievePatentPdfs(
  citedPatents,
  projectId,
  tenantId,
  userId,
  { fileType: 'examiner-citation' }
);

// PDFs are now available in the project's prior art collection
// Users can view them via the existing prior art viewer
```

### Search Results Enhancement
Enhance search results with "View PDF" buttons:

```tsx
function SearchResultItem({ result, projectId }) {
  const { retrieveSinglePatentPdf, isLoading } = useSinglePatentPdfRetrieval();

  const handleViewPdf = async () => {
    const pdfResult = await retrieveSinglePatentPdf(projectId, result.patentNumber);
    if (pdfResult.success) {
      // Open in existing PDF viewer
      window.open(`/api/projects/${projectId}/prior-art/${pdfResult.priorArtId}/view`);
    }
  };

  return (
    <div className="search-result">
      <h3>{result.title}</h3>
      <p>{result.abstract}</p>
      <button onClick={handleViewPdf} disabled={isLoading}>
        {isLoading ? 'Getting PDF...' : 'View Full Patent'}
      </button>
    </div>
  );
}
```

## Configuration

### Environment Variables
Make sure these are configured in your `.env.local`:

```bash
# PatBase API (for enhanced retrieval)
PATBASE_USER=your_patbase_username
PATBASE_PASS=your_patbase_password

# Azure Storage (for PDF caching)
AZURE_STORAGE_CONNECTION_STRING=your_azure_connection_string
```

### Rate Limiting
The system includes built-in rate limiting:
- 3 concurrent requests by default for bulk operations
- 2-second delays between batches
- Respectful to external APIs

## Error Handling

The system gracefully handles various error scenarios:

```typescript
const result = await retrieveSinglePatentPdf(projectId, patentNumber);

if (!result.success) {
  switch (result.error) {
    case 'Patent PDF not found in any available source':
      // Patent may not be publicly available
      break;
    case 'Database connection unavailable':
      // Temporary database issue
      break;
    default:
      // Other errors
      console.error('Unexpected error:', result.error);
  }
}
```

## Performance Considerations

### Caching Strategy
- PDFs are cached indefinitely once retrieved
- Use `forceRefresh: true` only when necessary
- Cache is shared across all projects in the same tenant

### Bulk Operations
- Process patents in chunks of 10 for bulk operations
- Sequential processing prevents API rate limiting
- Progress feedback available through loading states

### Storage Optimization
- PDFs stored with compression
- Duplicate detection prevents redundant storage
- Tenant isolation ensures security

## Troubleshooting

### Common Issues

1. **PDF Not Found**: Some patents may not be available in PDF format from public sources
2. **Rate Limiting**: Too many concurrent requests may be throttled
3. **Storage Quota**: Monitor Azure Blob Storage usage for large patent collections

### Debugging

Enable detailed logging:
```typescript
// Check service logs for retrieval details
logger.info('[PatentPdfRetrieval] Processing status', { 
  source: 'patbase|uspto|google_patents',
  success: true|false 
});
```

### Support

- PatBase API issues: Check your subscription status
- USPTO API issues: Usually temporary, retry after a delay  
- Azure Storage issues: Verify connection string and permissions

## Future Enhancements

Planned improvements:
- European Patent Office (EPO) integration
- OCR for scanned patent documents
- Automatic text extraction and indexing
- Bulk download as ZIP archives
- Integration with citation analysis workflows 