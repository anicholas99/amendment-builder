# API Response Types Organization

This directory contains domain-specific API response schemas and types, organized for better maintainability and code organization.

## Structure

```
responses/
├── base.ts              - Shared base schemas (Pagination, etc.)
├── project.ts           - Project, document, and version schemas
├── search-citation.ts   - Search history and citation matching schemas
├── prior-art.ts         - Prior art analysis and management schemas
├── claim.ts             - Claim parsing, generation, and refinement schemas
├── invention-figure.ts  - Invention data and figure management schemas
├── citation-extraction.ts - Citation extraction job schemas
├── ai-analysis.ts       - AI-powered analysis and suggestion schemas
├── misc.ts              - Chat history, exclusions, and other schemas
└── index.ts             - Re-exports all schemas
```

## Usage

### Import from specific domain (Recommended)

```typescript
// Import only what you need from specific domains
import { ProjectData, ProjectStatus } from '@/types/api/responses/project';
import { CitationMatch } from '@/types/api/responses/search-citation';
import { CombinedAnalysisResult } from '@/types/api/responses/ai-analysis';
```

### Import from index (Backward compatible)

```typescript
// Still works for backward compatibility
import { ProjectData, CitationMatch, CombinedAnalysisResult } from '@/types/api/responses';
```

## Benefits

1. **Better Organization**: Related schemas are grouped together
2. **Smaller Bundle Size**: Import only what you need
3. **Easier Navigation**: Find schemas by domain instead of scrolling through 600+ lines
4. **Better IntelliSense**: IDE can suggest imports from specific domains
5. **Maintainability**: Easier to add new schemas without making the file larger

## Migration Guide

No migration needed! The old import paths still work. However, for new code, prefer importing from specific domain files for better tree-shaking and clarity.

## Schema Naming Conventions

- **Request schemas**: `[Feature]RequestSchema` (e.g., `ParseClaimRequestSchema`)
- **Response schemas**: `[Feature]ResponseSchema` (e.g., `ParseClaimResponseSchema`)
- **Data schemas**: `[Entity]Schema` (e.g., `ProjectDataSchema`)
- **Inferred types**: Same name without "Schema" suffix (e.g., `ProjectData`)

## Adding New Schemas

1. Identify the domain (or create a new file if needed)
2. Add the Zod schema with proper naming
3. Export the inferred TypeScript type
4. Re-export from `index.ts` if it should be available at the root