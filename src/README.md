# Source Code Directory Structure

This directory contains all the application source code for Patent Drafter AI. The codebase follows modern React/Next.js patterns with a clear separation of concerns.

## 📁 Directory Overview

```
src/
├── components/      # Reusable UI components
├── features/        # Feature-specific modules (recommended entry point)
├── pages/           # Next.js pages and API routes
├── repositories/    # Data access layer (database queries)
├── services/        # Business logic and external integrations
├── lib/             # Core libraries and utilities
├── middleware/      # API middleware (auth, validation, etc.)
├── contexts/        # React context providers
├── hooks/           # Custom React hooks
├── types/           # TypeScript type definitions
├── utils/           # Helper functions and utilities
├── ui/              # Design system components
└── styles/          # Global styles and themes
```

## 🏗️ Architecture Patterns

### 1. **Feature-Based Organization** (`/features`)
We organize code by feature rather than by file type. Each feature contains:
- Components specific to that feature
- Hooks for that feature's logic
- Utils for feature-specific helpers
- Types for feature-specific types

Example:
```
features/
├── claim-refinement/
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── types/
```

### 2. **Repository Pattern** (`/repositories`)
All database access goes through repositories:
- Centralized query logic
- Type-safe database operations
- Consistent error handling
- Easy to mock for testing

Example:
```typescript
// ✅ Good: Using repository
const project = await projectRepository.findById(id);

// ❌ Bad: Direct database access
const project = await prisma.project.findUnique({ where: { id } });
```

### 3. **Service Layer** (`/services`)
Business logic is encapsulated in services:
- AI integrations (OpenAI, Claude)
- External API calls
- Complex business operations
- Data transformations

### 4. **Middleware Composition** (`/middleware`)
API routes use composable middleware:
```typescript
export default composeApiMiddleware(handler, {
  schema: requestSchema,      // Input validation
  resolveTenantId,           // Tenant security
  requireAuth: true,         // Authentication
});
```

## 🚀 Getting Started

### For New Features
1. Start in `/features` - look for existing features similar to what you're building
2. Check `/components` for reusable UI elements
3. Use `/hooks` for shared React logic
4. Follow patterns in `/repositories` for data access

### For API Development
1. API routes live in `/pages/api`
2. Use middleware from `/middleware` for common concerns
3. Access data through `/repositories`
4. Business logic goes in `/services`

### For UI Development
1. Design system components are in `/ui`
2. Feature-specific components in `/features/[feature]/components`
3. Shared components in `/components`
4. Use Chakra UI as the base component library

## 📋 Best Practices

### Import Organization
```typescript
// 1. External imports
import React from 'react';
import { Box } from '@chakra-ui/react';

// 2. Internal absolute imports
import { useAuth } from '@/hooks/useAuth';
import { projectRepository } from '@/repositories';

// 3. Relative imports
import { LocalComponent } from './LocalComponent';
```

### File Naming
- Components: `PascalCase.tsx` (e.g., `ProjectCard.tsx`)
- Hooks: `camelCase.ts` starting with 'use' (e.g., `useProject.ts`)
- Utils: `camelCase.ts` (e.g., `formatDate.ts`)
- Types: `camelCase.ts` or within component files

### Type Safety
- No `any` types - use `unknown` and type guards
- Define interfaces for all data structures
- Use Zod schemas for runtime validation

## 🧪 Testing

Tests are co-located with their source files:
```
components/
├── ProjectCard.tsx
└── __tests__/
    └── ProjectCard.test.tsx
```

## 🔍 Where to Find Things

- **Authentication Logic**: `/lib/auth`, `/contexts/AuthContext.tsx`
- **Database Models**: `/repositories` and Prisma schema
- **API Validation**: `/lib/validation/schemas`
- **Error Handling**: `/utils/error-handling`
- **Logging**: `/lib/monitoring`
- **AI Integrations**: `/services/aiService.ts`
- **Patent Logic**: `/domain` and `/features/patent-application`

## 📚 Further Reading

- [Architecture Overview](../docs/architecture/README.md)
- [API Documentation](./pages/api/README.md)
- [Repository Pattern](./repositories/README.md)
- [Feature Development](./features/README.md) 