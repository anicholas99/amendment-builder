# Feature-Based Architecture

This directory contains feature modules - self-contained units of functionality that encapsulate all code related to specific business features.

## 🎯 Why Feature-Based Organization?

Traditional organization by file type (components/, hooks/, utils/) leads to:
- Related files scattered across the codebase
- Difficulty understanding feature boundaries
- Challenges in code ownership and maintenance

Feature-based organization provides:
- **Cohesion**: All code for a feature lives together
- **Encapsulation**: Clear boundaries between features
- **Scalability**: Easy to add, modify, or remove features
- **Ownership**: Teams can own entire features

## 📁 Feature Structure

Each feature follows this structure:

```
feature-name/
├── components/          # UI components for this feature
│   ├── FeatureMain.tsx
│   ├── FeatureModal.tsx
│   └── __tests__/
├── hooks/              # Feature-specific hooks
│   ├── useFeatureData.ts
│   └── useFeatureLogic.ts
├── utils/              # Feature-specific utilities
│   ├── featureHelpers.ts
│   └── __tests__/
├── types/              # Feature-specific types
│   └── feature.types.ts
├── services/           # Feature-specific API calls
│   └── featureService.ts
└── index.ts           # Public API exports
```

## 🏗️ Current Features

### `/claim-refinement`
Handles patent claim editing and refinement:
- Claim parsing and element extraction
- AI-powered claim suggestions
- Version management
- Claim validation

### `/search`
Prior art search functionality:
- Search interface and results
- Citation management
- Search history tracking
- Result analysis

### `/patent-application`
Patent document generation:
- Application drafting
- Section management
- Export functionality
- Template handling

### `/technology-details`
Technology disclosure management:
- Invention details capture
- Figure management
- Technical implementation tracking
- Consistency checking

### `/chat`
AI chat interface:
- Contextual conversations
- Project-aware responses
- Chat history
- AI model selection

### `/projects`
Project management:
- Project creation/editing
- Dashboard views
- Project listing
- Status tracking

### `/verification`
Content verification workflows:
- Claim verification
- Prior art verification
- Consistency checks
- Validation reports

## 📋 Best Practices

### 1. **Feature Independence**

Features should be as independent as possible:

```typescript
// ✅ Good: Feature uses its own types
import { ClaimData } from './types/claim.types';

// ❌ Bad: Feature depends on another feature's internals
import { ClaimData } from '../search/components/SearchResults';
```

### 2. **Public API via index.ts**

Export only what other parts of the app need:

```typescript
// feature/index.ts
export { ClaimEditor } from './components/ClaimEditor';
export { useClaimData } from './hooks/useClaimData';
export type { ClaimData } from './types/claim.types';

// Don't export internal components or utilities
```

### 3. **Feature-Specific Hooks**

Keep business logic in custom hooks:

```typescript
// hooks/useClaimValidation.ts
export function useClaimValidation(claimId: string) {
  const [isValid, setIsValid] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  
  useEffect(() => {
    // Validation logic specific to claims
  }, [claimId]);
  
  return { isValid, errors };
}
```

### 4. **Shared Dependencies**

Use shared code from common locations:

```typescript
// ✅ Good: Using shared components
import { Button } from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/utils/dateHelpers';

// ❌ Bad: Duplicating shared functionality
import { Button } from './components/Button'; // Don't recreate
```

### 5. **Testing Within Features**

Keep tests close to the code:

```
components/
├── ClaimEditor.tsx
└── __tests__/
    └── ClaimEditor.test.tsx
```

## 🔧 Creating a New Feature

1. **Create the directory structure**:
   ```bash
   mkdir -p src/features/new-feature/{components,hooks,utils,types}
   ```

2. **Add the index.ts file**:
   ```typescript
   // src/features/new-feature/index.ts
   export { NewFeatureMain } from './components/NewFeatureMain';
   ```

3. **Implement components**:
   ```typescript
   // src/features/new-feature/components/NewFeatureMain.tsx
   import React from 'react';
   import { useNewFeatureData } from '../hooks/useNewFeatureData';
   
   export const NewFeatureMain: React.FC = () => {
     const { data, loading } = useNewFeatureData();
     // Component implementation
   };
   ```

## 🚀 Feature Development Workflow

1. **Start with types**: Define the data structures
2. **Create hooks**: Implement business logic
3. **Build components**: Create UI using the hooks
4. **Add utilities**: Extract reusable functions
5. **Write tests**: Test components and hooks
6. **Document**: Add JSDoc comments and README if complex

## 🔗 Inter-Feature Communication

When features need to communicate:

1. **Via Props**: Pass data through parent components
2. **Via Context**: Use React Context for shared state
3. **Via Events**: Use event emitters for loose coupling
4. **Via Routes**: Navigate between features

Example using context:

```typescript
// contexts/ProjectContext.tsx
export const ProjectContext = createContext<ProjectContextType>(null);

// features/claims/components/ClaimEditor.tsx
const { projectId } = useContext(ProjectContext);

// features/search/components/SearchPanel.tsx
const { projectId } = useContext(ProjectContext);
```

## ⚠️ Common Pitfalls

1. **Tight Coupling**: Avoid direct imports between features
2. **Shared State**: Use contexts or state management carefully
3. **Circular Dependencies**: Watch for import cycles
4. **Over-Engineering**: Not everything needs to be a feature
5. **Under-Organizing**: Keep related code together

## 📚 When to Create a Feature

Create a new feature when:
- It represents a distinct business capability
- It has multiple components working together
- It could be developed by a separate team
- It has clear boundaries and minimal dependencies

Keep in shared directories when:
- It's used across multiple features
- It's a generic UI component
- It's a utility function with no business logic
- It's part of the app infrastructure

## 🔍 Feature Examples

### Simple Feature (Chat)
```
chat/
├── components/
│   └── ChatInterface.tsx
├── hooks/
│   └── useChat.ts
└── index.ts
```

### Complex Feature (Citation Extraction)
```
citation-extraction/
├── components/
│   ├── CitationList.tsx
│   ├── CitationDetails.tsx
│   └── ExtractionProgress.tsx
├── hooks/
│   ├── useCitationJobs.ts
│   └── useExtractionStatus.ts
├── utils/
│   └── citationParser.ts
├── types/
│   └── citation.types.ts
└── index.ts
```

## 🎯 Success Metrics

A well-organized feature:
- Can be understood in isolation
- Has clear entry points
- Minimizes external dependencies
- Is easy to test
- Can be modified without affecting other features 