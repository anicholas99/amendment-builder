# Search History Utilities

This directory contains all utilities related to search functionality. The utilities are organized by their specific responsibilities to maintain clarity and prevent confusion.

## Architecture Overview

```
Database → Repository → Transformation → API → Client → UI
```

### Data Flow

1. **Database**: Stores search results as JSON strings
2. **Repository Layer** (`src/repositories/search/`): Raw database operations only
3. **Transformation Layer** (`searchHistory.ts`): All data transformation logic
4. **API Layer**: Uses transformation utilities to normalize data
5. **Client Layer**: Receives normalized `ProcessedSearchHistoryEntry` objects
6. **UI Layer**: Displays data using UI utilities

## File Organization

### Core Data Transformation (`searchHistory.ts`)
**Purpose**: Single source of truth for all search history data transformation

Key functions:
- `normalizeSearchResult()` - Ensures results have both `number` and `patentNumber` fields
- `normalizeSearchResults()` - Batch normalization of results
- `processSearchHistory()` - Converts database format to application format
- `serializeForDatabase()` - Converts application format to database format

**When to use**: Any time you need to transform search history data between formats

### UI Utilities (`searchHistoryUtils.ts`)
**Purpose**: UI-specific formatting and display logic

Key functions:
- `formatDate()` - Format dates for display
- `getRelevancyColor()` - Determine badge colors based on relevance scores
- `parseSearchResults()` - Extract results from processed entries
- `hasCitationJobId()` - Check if entry has citation extraction

**When to use**: When displaying search history data in the UI

### Component-Specific Utils (`searchHistoryRowUtils.ts`)
**Purpose**: Logic specific to the SearchHistoryRow component

**When to use**: Only within the SearchHistoryRow component and its sub-components

## Best Practices

1. **Never duplicate normalization logic** - Always use `normalizeSearchResults()` from `searchHistory.ts`
2. **Keep transformation separate from display** - Data transformation in `searchHistory.ts`, display logic in `searchHistoryUtils.ts`
3. **Type safety** - Use `NormalizedSearchResult` type for normalized results
4. **Consistent data flow** - Always transform data at the repository/API boundary, not in components

## Common Patterns

### Normalizing search results in an API endpoint:
```typescript
import { normalizeSearchResults } from '@/features/search/utils/searchHistory';

const normalizedResults = normalizeSearchResults(rawResults);
```

### Processing search history from database:
```typescript
import { processSearchHistory } from '@/features/search/utils/searchHistory';

const processed = await processSearchHistory(rawEntry);
```

### Displaying search results in UI:
```typescript
import { formatDate, getRelevancyColor } from '@/features/search/utils/searchHistoryUtils';

const dateStr = formatDate(entry.timestamp);
const badgeColor = getRelevancyColor(result.relevance);
```

## Security Considerations

- Always validate and normalize data at API boundaries
- Use proper typing to prevent injection attacks
- Sanitize any user-generated content before display

## Future Improvements

- Consider creating a `SearchResult` class with built-in normalization
- Add unit tests for all transformation functions
- Consider moving to a more robust serialization library for database storage 