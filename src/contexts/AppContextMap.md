# App Context Map

This document provides a comprehensive mapping of all contexts in the application.

## Context Overview

The application uses focused, single-responsibility contexts for better maintainability and performance.

## Active Contexts

### 1. AuthContext / AuthProvider
**Purpose**: Authentication state and user session management

**Provides**:
```typescript
{
  // User & Auth State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  
  // Tenant Management
  currentTenant: Tenant | null;
  tenants: Tenant[];
  
  // Operations
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  switchTenant: (tenantId: string) => Promise<boolean>;
}
```

**Use for**: 
- Authentication status
- User information
- Tenant switching
- Login/logout operations

### 2. TenantContext
**Purpose**: Current tenant selection and tenant-specific operations

**Provides**:
```typescript
{
  // Current tenant from auth context
  currentTenant: Tenant | null;
  tenants: Tenant[];
  isLoading: boolean;
  
  // Operations
  switchTenant: (tenantId: string) => Promise<void>;
}
```

**Use for**:
- Getting current tenant information
- Switching between tenants
- Tenant-specific UI/logic

### 3. ProjectDataContext
**Purpose**: Manages active project ID (NOT the data itself)

**Provides**:
```typescript
{
  // Active Project ID only
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;
}
```

**Use for**: 
- Getting/setting the active project ID
- Project data should be fetched via React Query hooks

### 4. ProjectAutosaveContext
**Purpose**: Handles autosave functionality for project data

**Provides**:
```typescript
{
  // Autosave State
  analyzedInvention: StructuredData | null;
  textInput: string;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  lastSaveTime: Date | null;
  
  // Operations
  setAnalyzedInvention: (data: StructuredData | null) => void;
  setTextInput: (text: string) => void;
  saveProject: () => Promise<void>;
  resetChanges: () => void;
}
```

**Use for**:
- Managing project content during editing
- Autosave functionality
- Tracking unsaved changes

### 5. UI State Contexts

#### ThemeContext
**Purpose**: Dark/light mode management
**Hook**: `useTheme()`
**Provides**: Theme state and toggle function

#### SidebarContext
**Purpose**: Sidebar open/closed state
**Hook**: `useSidebar()`
**Provides**: Sidebar state and toggle function

#### LayoutContext
**Purpose**: Layout preferences
**Hook**: `useLayout()`
**Provides**: Layout configuration

#### ActiveDocumentContext
**Purpose**: Currently active document in editor
**Hook**: `useActiveDocument()`
**Provides**: Active document type and navigation

## Best Practices

### ✅ DO:
1. **Import from specific context files**:
   ```typescript
   import { useProjectData } from '@/contexts/ProjectDataContext';
   ```

2. **Use React Query for server data**:
   ```typescript
   // Context stores only the ID
   const { activeProjectId } = useProjectData();
   // Fetch data with React Query
   const { data: project } = useProject(activeProjectId);
   ```

3. **Keep contexts focused**: Each context should have one clear purpose

### ❌ DON'T:
1. **Store server data in context**: Use React Query instead
2. **Create large contexts**: Split by concern
3. **Mix UI and data state**: Keep them separate

## Common Patterns

### Getting Project Data
```typescript
import { useProjectData } from '@/contexts/ProjectDataContext';
import { useProject } from '@/hooks/api/useProjects';

function MyComponent() {
  const { activeProjectId } = useProjectData();
  const { data: project, isLoading } = useProject(activeProjectId);
  
  if (isLoading) return <Spinner />;
  if (!project) return <NoProjectSelected />;
  
  return <ProjectView project={project} />;
}
```

### Managing Autosave
```typescript
import { useProjectAutosave } from '@/contexts/ProjectAutosaveContext';

function Editor() {
  const {
    textInput,
    setTextInput,
    hasUnsavedChanges,
    isSaving,
    saveProject
  } = useProjectAutosave();
  
  const handleChange = (newText: string) => {
    setTextInput(newText);
    // Autosave happens automatically via the context
  };
  
  return (
    <div>
      {hasUnsavedChanges && <UnsavedIndicator />}
      {isSaving && <SavingSpinner />}
      <textarea value={textInput} onChange={e => handleChange(e.target.value)} />
    </div>
  );
}
```

### Using Multiple Contexts
```typescript
import { useAuth } from '@/hooks/useAuth';
import { useProjectData } from '@/contexts/ProjectDataContext';
import { useProjects } from '@/hooks/api/useProjects';

function ProjectList() {
  const { currentTenant } = useAuth();
  const { activeProjectId, setActiveProjectId } = useProjectData();
  const { data: projects } = useProjects(currentTenant?.id);
  
  return (
    <ul>
      {projects?.map(project => (
        <li 
          key={project.id}
          className={project.id === activeProjectId ? 'active' : ''}
          onClick={() => setActiveProjectId(project.id)}
        >
          {project.name}
        </li>
      ))}
    </ul>
  );
}
```

## Adding New Contexts

Before adding a new context, ask:
1. Is this truly global state? Could it be component state?
2. Is this server data? Use React Query instead
3. Is this derived state? Calculate it where needed

If you do need a new context:
1. Keep it focused on one concern
2. Follow the existing patterns
3. Document it in this file
4. Add it to `ProjectProviders` if project-related

## Testing Contexts

All contexts should have tests that verify:
1. Provider renders without errors
2. Hook throws when used outside provider
3. State updates work correctly
4. Error states are handled

See existing context tests for examples 