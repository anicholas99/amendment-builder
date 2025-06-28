# Services Directory Structure

This directory contains all business logic services organized by domain for better maintainability and consistency.

## Directory Organization

### `/ai/` - AI and Machine Learning Services
- `aiService.ts` - Core AI service wrapper
- `deepAnalysisService.ts` - Deep analysis processing
- `reasoningService.ts` - AI reasoning logic
- `examinerAnalysisService.ts` - Patent examiner analysis
- `aiAnalysisService.ts` - General AI analysis utilities
- `langchain/` - LangChain integration and agent services

### `/patent/` - Patent-Related Business Logic
- `claimGenerationService.ts` - Patent claim generation
- `claimParsingService.ts` - Claim parsing and analysis
- `citationProcessingService.ts` - Citation processing logic
- `citationExtractionService.ts` - Citation extraction workflows
- `inventionDataService.ts` - Invention data management
- `projectService.ts` - Project management logic
- `priorArtExtractionService.ts` - Prior art extraction
- `multiElementSnippetExtractorService.ts` - Multi-element snippet extraction
- `patentability/` - Patentability analysis services

### `/search/` - Search and Discovery Services
- `semanticSearchService.ts` - Semantic search functionality
- `cachedSemanticSearchService.ts` - Cached search optimization
- `searchDataService.ts` - Search data management
- `searchHistoryService.ts` - Search history tracking
- `priorArtAnalysisCacheService.ts` - Prior art analysis caching

### `/storage/` - Storage and Infrastructure Services
- `blobStorage.ts` - Blob storage management

### `/api/` - API Service Layer
- Contains services that handle API interactions following the established service layer pattern
- `patbaseService.ts` - Patbase API integration
- Other API service files...

### `/backend/` - Backend Infrastructure Services
- Contains backend-specific services and utilities

## Import Guidelines

When importing services, use the new organized paths:

```typescript
// AI services
import { deepAnalysisService } from '@/services/ai/deepAnalysisService';

// Patent services  
import { claimParsingService } from '@/services/patent/claimParsingService';

// Search services
import { SearchDataService } from '@/services/search/searchDataService';

// Storage services
import blobStorageService from '@/services/storage/blobStorage';

// API services (unchanged)
import { CitationApiService } from '@/services/api/citationApiService';
```

## Migration Notes

This structure consolidates services that were previously split between `src/services` and `src/lib/services`, providing:

- **Clear domain separation** - Related services are co-located
- **Improved discoverability** - Easier to find relevant services
- **Better maintainability** - Logical grouping reduces cognitive load
- **Consistent architecture** - Single source of truth for service organization

All import statements throughout the codebase have been updated to reflect the new structure.

## Purpose
- **Server-side only**: Code that runs in Node.js/API routes
- **Database operations**: Services that interact with databases
- **External APIs**: Integration with third-party services
- **Business logic**: Core application logic that doesn't depend on React
- **Async processing**: Background jobs using `setImmediate()` pattern

## Key Services

### Async Services (Non-blocking)
See [async-services.md](./async-services.md) for detailed documentation.

- `citationExtractionService.ts` - Processes citation extraction (~25s) 
- `semanticSearchService.ts` - Executes patent searches (~5-10s)

Both use `setImmediate()` for background processing without external workers.

### Synchronous Services
- `deepAnalysisService.ts` - Server-side AI analysis processing
- `patbaseService.ts` - Integration with Patbase API
- `blobStorage.ts` - Azure blob storage operations
- `projectRepository.ts` - Server-side project data operations

## When to use this directory
- Creating services for API routes (`src/pages/api/`)
- Building server-only business logic
- Integrating with external services or databases
- Creating reusable backend logic
- Implementing async/background processing

## Async Service Pattern

For long-running operations (>2 seconds), use the async pattern:

```typescript
// In your API endpoint
setImmediate(async () => {
  try {
    await longRunningProcess();
    await updateStatus('completed');
  } catch (error) {
    await updateStatus('failed', error);
  }
});

// Return immediately
res.status(202).json({ jobId, status: 'processing' });
```

## Related Directories
- `src/services/` - **Client-side services** (React components, frontend logic)
- `src/repositories/` - Database access layer (Prisma operations)
- `src/lib/api/` - API client functions (for frontend)
- `src/workers/` - External worker processes (legacy, being phased out)

## Architecture Note
This follows the **"lib for backend, src for frontend"** pattern where `lib/` contains server-side infrastructure and `src/` contains application code. 