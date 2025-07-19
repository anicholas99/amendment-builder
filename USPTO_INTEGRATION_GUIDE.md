# USPTO Open Data Portal Integration Guide

This guide documents the integration of USPTO ODP API into the Amendment Builder application.

## Overview

The USPTO integration allows users to:
- Search for Office Actions by application number
- View and download Office Actions directly from USPTO
- Automatically import and process Office Actions for amendment drafting

## Implementation Details

### 1. Environment Configuration

Add your USPTO API key to `.env.local`:
```env
USPTO_ODP_API_KEY=your-api-key-here
```

The API key is configured in:
- `.env.example` - Template with all environment variables
- `src/config/environment.ts` - Environment configuration module

### 2. Server-Side Components

#### USPTO API Client (`src/lib/api/uspto/`)
- **client.ts** - Low-level API client with authentication and error handling
- **types.ts** - TypeScript interfaces for USPTO API
- **services/officeActionService.ts** - High-level service for Office Actions

#### API Endpoints (`src/pages/api/uspto/`)
- **applications/[applicationNumber]/office-actions.ts** - Fetch Office Actions
- **applications/[applicationNumber]/status.ts** - Check application status
- **documents/[documentId]/download.ts** - Download documents
- **documents/process.ts** - Process documents for OA analysis

All endpoints use SecurePresets for authentication and rate limiting.

### 3. Client-Side Components

#### Client Service (`src/client/services/uspto.client-service.ts`)
Provides typed API methods with response validation using Zod schemas.

#### React Query Hooks (`src/hooks/api/useUSPTO.ts`)
- `useUSPTOOfficeActions` - Fetch Office Actions for an application
- `useMostRecentOfficeAction` - Get the latest Office Action
- `useUSPTOStatus` - Check if application has Office Actions
- `useDownloadOfficeAction` - Download a specific document
- `useProcessUSPTODocument` - Import and process a document
- `useRefreshUSPTOData` - Refresh data from USPTO

#### UI Components (`src/features/office-actions/components/`)
- **USPTOOfficeActionFetcher.tsx** - Search and import from USPTO
- **EnhancedOfficeActionUpload.tsx** - Tabbed interface for upload/fetch

## Usage Example

```tsx
import { EnhancedOfficeActionUpload } from '@/features/office-actions/components';

// In your component
<EnhancedOfficeActionUpload
  projectId={projectId}
  onUploadComplete={(officeAction) => {
    console.log('Office Action imported:', officeAction);
  }}
/>
```

## Security Considerations

1. **API Key Protection**: USPTO API key is stored as environment variable and never exposed to client
2. **Authentication**: All endpoints require user authentication
3. **Rate Limiting**: USPTO endpoints use 'search' rate limit category
4. **Tenant Isolation**: Document processing uses tenant context from project
5. **Input Validation**: All inputs validated with Zod schemas
6. **Error Handling**: Comprehensive error handling with proper status codes

## Integration Flow

1. User enters application number in UI
2. Frontend calls USPTO API to search for Office Actions
3. User selects an Office Action to import
4. System downloads PDF from USPTO
5. PDF is stored in Azure Blob Storage
6. Office Action record created in database
7. Async processing extracts text and parses rejections
8. User can view and respond to the Office Action

## Testing

To test the integration:

1. Set up your USPTO API key in `.env.local`
2. Navigate to a project's amendments page
3. Click "Fetch from USPTO" tab
4. Enter an application number (e.g., 13/937,148)
5. Select an Office Action to import

## Error Handling

The integration handles various error scenarios:
- Invalid application numbers
- USPTO API downtime
- Rate limiting
- Network timeouts
- Invalid document formats

All errors are logged and user-friendly messages are displayed.

## Future Enhancements

- Automatic polling for new Office Actions
- Batch import of multiple Office Actions
- Integration with prosecution timeline
- Smart rejection parsing using AI
- Webhook notifications for new Office Actions