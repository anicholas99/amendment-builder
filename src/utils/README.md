/\*\*

- Utility Functions
-
- This directory contains utility functions used throughout the application.
  \*/

## Core Utilities

- `auth.ts`: Authentication-related utilities
- `validation.ts`: Form and data validation functions
- `network.ts`: Network request helpers
- `logging.ts`: Logging utilities

## Feature-Specific Utilities

### Suggestions Module (`suggestions/`)

- `core.ts`: Basic suggestion filtering and sorting
- `management.ts`: Suggestion state management
- `enhanced.ts`: Advanced suggestion processing
- `claim.ts`: Claim-specific suggestion utilities

### Claims

- `claims/`: Claim processing and analysis utilities
- `generatePatent.ts`: Patent document generation
- `patentVerification.ts`: Patent verification utilities
- `patentStyles.ts`: Patent document styling

### Storage and Performance

- `storage/`: Local storage and IndexedDB utilities
- `performance/`: Performance monitoring utilities
- `versionManagement.ts`: Version control utilities

## Usage Examples

### Suggestion Management

```typescript
import {
  filterSuggestions,
  sortSuggestions,
  applySuggestion,
  dismissSuggestion,
} from './suggestions';

// Filter suggestions
const activeSuggestions = filterSuggestions(suggestions, {
  type: 'narrowing',
  applied: false,
  dismissed: false,
});

// Sort suggestions by priority
const sortedSuggestions = sortSuggestions(suggestions, 'priority');

// Apply a suggestion
const updatedSuggestion = applySuggestion(suggestion);

// Dismiss a suggestion
const dismissedSuggestion = dismissSuggestion(suggestion);
```

### Claim Processing

```typescript
import { generateElementSuggestions } from './suggestions/claim';

// Generate suggestions from claim elements
const suggestions = generateElementSuggestions(claimNumber, elements);
```

## Directory Structure

```
utils/
├── suggestions/           # Suggestion utilities
│   ├── index.ts          # Main exports
│   ├── core.ts           # Basic utilities
│   ├── management.ts     # State management
│   ├── enhanced.ts       # Advanced processing
│   └── claim.ts          # Claim-specific utilities
├── claims/               # Claim utilities
├── storage/              # Storage utilities
├── performance/          # Performance utilities
├── auth.ts              # Authentication
├── validation.ts        # Validation
├── network.ts           # Network
├── logging.ts           # Logging
└── README.md            # This file
```

## Best Practices

1. Keep utility functions pure and stateless
2. Use TypeScript for type safety
3. Document function parameters and return types
4. Add usage examples for complex utilities
5. Group related utilities in subdirectories
6. Export commonly used types with utilities
