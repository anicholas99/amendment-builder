# 3.1 Coding Style & Conventions

This document outlines the coding style, formatting, and type-safety conventions for the application. Adhering to these standards is crucial for maintaining a clean, readable, and robust codebase.

## Table of Contents
- [Formatting & Linting](#-formatting--linting)
- [TypeScript Best Practices](#-typescript-best-practices)
- [React & Component Guidelines](#-react--component-guidelines)
- [Styling with Tailwind CSS](#-styling-with-tailwind-css)
- [Naming Conventions](#-naming-conventions)
- [General Best Practices](#-general-best-practices)

---

## 🖌️ Formatting & Linting

Code consistency is enforced automatically using a combination of tools.

-   **Formatting**: [Prettier](https://prettier.io/) is used for all code formatting. It is run automatically via a pre-commit hook, so you don't need to worry about manual formatting.
-   **Linting**: [ESLint](https://eslint.org/) is used to catch common errors and enforce stylistic rules. Like Prettier, it is run automatically before commits.

You can manually run these tools using the following npm scripts:
-   `npm run format`: Formats the entire codebase with Prettier.
-   `npm run lint`: Checks for linting errors.
-   `npm run lint:fix`: Attempts to automatically fix linting errors.

---

## 🔷 TypeScript Best Practices

We use TypeScript in `strict` mode to ensure maximum type safety.

### The `any` Type is Forbidden
The use of the `any` type is strongly discouraged. It undermines the benefits of TypeScript and should be avoided.

-   **Instead of `any`, use `unknown`**: `unknown` is the type-safe counterpart to `any`. It forces you to perform explicit type-checking before you can use the variable.
-   **Instead of `any[]`, use `unknown[]` or a properly typed array**: `const items: MyType[] = [];`
-   **Instead of `error: any`, use `error: unknown`**: Always check the type of the error in a `catch` block.

    ```typescript
    // ✅ Good: Use `unknown` and perform a type check
    try {
      // ...
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error('Operation failed', { errorMessage: error.message });
      } else {
        logger.error('An unknown error occurred', { error });
      }
    }
    ```

### Use Specific, Explicit Types
-   Always prefer a specific interface or type over a generic one (e.g., `User` over `Record<string, unknown>`).
-   Define types for all function parameters and return values. Let TypeScript infer types only for local variables where the type is obvious.

### Use Type Guards for External Data
When working with data from an external source (like an API response or `JSON.parse`), use a type guard to validate its structure at runtime before using it.

```typescript
// Example of a type guard
function isProject(data: unknown): data is Project {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data
  );
}
```

### Naming
-   Interfaces should be named in PascalCase (e.g., `interface ProjectData { ... }`).
-   Avoid prefixing interfaces with `I` (e.g., use `Project` not `IProject`).

---

## 🎨 React & Component Guidelines

### Component Structure
Components should follow a consistent structure for readability:

```typescript
// 1. Imports
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { ProjectData } from '@/types'

// 2. Type definitions
interface ProjectCardProps {
  project: ProjectData
  onEdit: (id: string) => void
}

// 3. Component definition
export function ProjectCard({ project, onEdit }: ProjectCardProps) {
  // 4. State and hooks
  const [isExpanded, setIsExpanded] = useState(false)
  
  // 5. Event handlers
  const handleToggle = () => setIsExpanded(!isExpanded)
  
  // 6. Render
  return (
    <div className="p-4 border rounded-lg">
      {/* Component JSX */}
    </div>
  )
}
```

### Component Best Practices
- **One component per file** - Makes testing and maintenance easier
- **Use function components** - Prefer function components with hooks over class components
- **Extract custom hooks** - Move complex logic into custom hooks for reusability
- **Memoization** - Use `React.memo`, `useMemo`, and `useCallback` judiciously for performance

---

## 💅 Styling with Tailwind CSS

### Class Organization
Order Tailwind classes consistently for better readability:

1. **Layout** (display, position, float)
2. **Spacing** (padding, margin)
3. **Sizing** (width, height)
4. **Typography** (font-size, font-weight, text-align)
5. **Colors** (background, text, border)
6. **Effects** (shadow, opacity, transform)
7. **Transitions/Animations**
8. **State modifiers** (hover:, focus:, disabled:)

```typescript
<div className="
  flex items-center justify-between
  p-4 mb-2
  w-full h-16
  text-lg font-semibold
  bg-card text-card-foreground border border-border
  shadow-sm
  transition-colors duration-200
  hover:bg-accent hover:text-accent-foreground
">
```

### Using the cn() Utility
Use the `cn()` utility from `@/lib/utils` for conditional classes:

```typescript
import { cn } from '@/lib/utils'

<Button
  className={cn(
    "w-full",
    isActive && "bg-primary text-primary-foreground",
    isDisabled && "opacity-50 cursor-not-allowed"
  )}
/>
```

### Responsive Design
Follow a mobile-first approach:

```typescript
<div className="
  grid grid-cols-1 gap-4 p-4
  md:grid-cols-2 md:gap-6 md:p-6
  lg:grid-cols-3 lg:gap-8 lg:p-8
">
```

### Dark Mode
Use semantic color classes that automatically adapt to dark mode:

```typescript
// ✅ Good - Uses semantic colors
<div className="bg-background text-foreground">

// ❌ Avoid - Hardcoded colors
<div className="bg-white text-black dark:bg-gray-900 dark:text-white">
```

---

## 📛 Naming Conventions

-   **Files**: Use `kebab-case.ts` (e.g., `project.repository.ts`). React components use `PascalCase.tsx` (e.g., `ProjectCard.tsx`).
-   **Variables & Functions**: Use `camelCase`.
-   **Classes & Interfaces**: Use `PascalCase`.
-   **Constants**: Use `UPPER_SNAKE_CASE` for global, unchanging constants (e.g., `MAX_RETRIES`).
-   **React Hooks**: Must start with `use` (e.g., `useProjects`).
-   **Repositories & Services**: Name files and classes based on the entity they manage (e.g., `project.repository.ts`, `ProjectRepository`).

---

## ✨ General Best Practices

-   **No `console.log`**: Use the structured logger (`import { logger } from '@/lib/monitoring/logger'`) instead of `console.log`. The logger provides leveled logging and is disabled in production environments.
-   **Unused Variables**: If a function parameter is intentionally unused, prefix it with an underscore (`_`) to satisfy the linter (e.g., `(req, _res) => { ... }`).
-   **React Hook Dependencies**: Ensure the dependency arrays of `useEffect`, `useCallback`, and `useMemo` are always correct. The ESLint plugin for React Hooks will help enforce this.
-   **Prefer `const` over `let`**: Use `let` only when you need to reassign a variable.
-   **Avoid Default Exports (Except for Pages)**: For all regular components and modules, prefer named exports. This improves discoverability and consistency. Default exports should only be used for Next.js pages in `src/pages/`.
-   **Import Organization**: Maintain a consistent import order:
    1. React/Next.js imports
    2. Third-party libraries
    3. UI components (`@/components/ui/*`)
    4. Internal components
    5. Hooks
    6. Utils/Helpers
    7. Types
-   **Component Imports**: Import UI components from shadcn/ui:
    ```typescript
    import { Button } from '@/components/ui/button'
    import { Card, CardContent, CardHeader } from '@/components/ui/card'
    ```
-   **Icons**: Use Lucide React for icons:
    ```typescript
    import { Plus, Edit, Trash2 } from 'lucide-react'
    ``` 