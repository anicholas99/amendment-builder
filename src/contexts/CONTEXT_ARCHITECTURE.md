# Context Architecture Guide

This document describes the current context architecture and best practices for the Patent Drafter AI application.

## Current Context Structure

The application uses focused, single-responsibility contexts:

### 1. **AuthContext** / **AuthProvider**
- **Purpose**: Authentication state and user session management
- **Location**: `src/contexts/AuthContext.tsx` & `src/contexts/AuthProvider.tsx`
- **Key Features**:
  - Uses React Query for session management
  - Provides normalized auth data (user, tenants, current tenant)
  - Handles tenant switching
- **Usage**: `const { user, isAuthenticated, currentTenant } = useAuth()`

### 2. **TenantContext**
- **Purpose**: Current tenant selection and tenant-specific operations
- **Location**: `src/contexts/TenantContext.tsx`
- **Key Features**:
  - Manages active tenant selection
  - Uses React Query hooks internally
  - Provides tenant validation utilities
- **Usage**: `const { currentTenant, switchTenant } = useTenantContext()`

### 3. **ProjectDataContext**
- **Purpose**: Active project ID management (NOT the data itself)
- **Location**: `src/contexts/ProjectDataContext.tsx`
- **Key Features**:
  - Only stores the active project ID
  - Project data is fetched via React Query hooks
  - Lightweight and focused
- **Usage**: `const { activeProjectId, setActiveProjectId } = useProjectData()`

### 4. **ProjectAutosaveContext**
- **Purpose**: Autosave functionality for project data
- **Location**: `src/contexts/ProjectAutosaveContext.tsx`
- **Key Features**:
  - Manages autosave state and timers
  - Uses React Query mutations
  - Handles invention and project updates
- **Usage**: `const { saveProject, isSaving } = useProjectAutosave()`

### 5. **UI State Contexts**
These contexts manage pure UI state:
- **ThemeContext**: Dark/light mode toggle
- **SidebarContext**: Sidebar open/closed state
- **LayoutContext**: Layout preferences
- **ActiveDocumentContext**: Currently active document in editor

## Best Practices

### ✅ DO:
1. **Keep contexts focused** - Each context should have a single responsibility
2. **Use React Query for server state** - Don't store server data in context
3. **Store only UI state in contexts** - Active selections, preferences, etc.
4. **Use the provided hooks** - Don't access context directly
5. **Compose contexts** - Use `ProjectProviders` for nested providers

### ❌ DON'T:
1. **Store server data in context** - Use React Query instead
2. **Create "god contexts"** - Avoid contexts that do everything
3. **Mix concerns** - Keep auth, data, and UI state separate
4. **Use context for derived state** - Calculate it in components/hooks
5. **Bypass the service layer** - Always use hooks → services → API

## Migration History

The codebase previously used a monolithic `UnifiedProjectContext` that combined multiple concerns. This has been successfully split into focused contexts for better maintainability.

## Adding New Contexts

When adding a new context:

1. **Determine if it's really needed** - Can this be component state or React Query?
2. **Keep it focused** - Single responsibility principle
3. **Follow the pattern**:
   ```typescript
   // Context definition
   interface MyContextValue {
     // Only UI state, not server data
   }
   
   const MyContext = createContext<MyContextValue | undefined>(undefined);
   
   // Provider with error boundaries
   export function MyProvider({ children }: { children: React.ReactNode }) {
     // Implementation
   }
   
   // Custom hook with error handling
   export function useMyContext() {
     const context = useContext(MyContext);
     if (!context) {
       throw new Error('useMyContext must be used within MyProvider');
     }
     return context;
   }
   ```

4. **Add to ProjectProviders** if it's project-related
5. **Document in this file**

## Common Patterns

### Server State Management
```typescript
// ❌ BAD: Storing server data in context
const [projects, setProjects] = useState([]);
useEffect(() => {
  fetchProjects().then(setProjects);
}, []);

// ✅ GOOD: Using React Query
const { data: projects } = useProjects();
```

### Active Selection Management
```typescript
// ✅ GOOD: Context stores only the ID
const { activeProjectId } = useProjectData();
const { data: project } = useProject(activeProjectId);
```

### Computed State
```typescript
// ❌ BAD: Storing derived state in context
const [projectCount, setProjectCount] = useState(0);

// ✅ GOOD: Computing in component
const { data: projects } = useProjects();
const projectCount = projects?.length ?? 0;
```

## Testing Contexts

All contexts should be tested with:
1. Provider renders without errors
2. Hook throws when used outside provider
3. State updates work correctly
4. Error boundaries catch errors

See existing context tests for examples. 