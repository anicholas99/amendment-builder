# Data Fetching Standards Guide

## Overview

This document defines the standard patterns for data fetching in the application. All new code should follow these patterns, and existing code should be migrated gradually.

## ❌ What NOT to Do

```typescript
// ❌ DON'T: Direct fetch() calls
const response = await fetch('/api/projects');

// ❌ DON'T: Using axios directly
import axios from 'axios';
const response = await axios.get('/api/projects');

// ❌ DON'T: Mixing patterns in the same component
const data1 = await fetch('/api/endpoint1');
const data2 = await apiFetch('/api/endpoint2');
const data3 = await axios.get('/api/endpoint3');
```

## ✅ Standard Pattern: React Query + apiFetch

### 1. For API Routes (Frontend → Backend)

Always use `apiFetch` wrapper + React Query:

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/apiClient';

// Read operations - use useQuery
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await apiFetch('/api/projects');
      if (!response.ok) throw new Error('Failed to fetch projects');
      return response.json();
    }
  });
}

// Write operations - use useMutation
export function useCreateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (projectData: CreateProjectData) => {
      const response = await apiFetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });
      if (!response.ok) throw new Error('Failed to create project');
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });
}
```

### 2. For External APIs (Backend → External Services)

In backend/service code, use the standard `fetch` API:

```typescript
// In API routes or service files
export async function fetchExternalData() {
  const response = await fetch('https://external-api.com/data', {
    headers: {
      'Authorization': `Bearer ${process.env.EXTERNAL_API_KEY}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`External API error: ${response.statusText}`);
  }
  
  return response.json();
}
```

### 3. Custom Hooks Pattern

Create domain-specific hooks that encapsulate data fetching logic:

```typescript
// hooks/useProjectOperations.ts
export function useProjectOperations(projectId: string) {
  // Queries
  const projectQuery = useProject(projectId);
  const searchHistoryQuery = useSearchHistory(projectId);
  
  // Mutations
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  
  return {
    // Data
    project: projectQuery.data,
    searchHistory: searchHistoryQuery.data,
    
    // Loading states
    isLoading: projectQuery.isLoading || searchHistoryQuery.isLoading,
    
    // Operations
    updateProject: updateProject.mutate,
    deleteProject: deleteProject.mutate,
    
    // Refresh
    refresh: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    }
  };
}
```

## Query Key Conventions

Use hierarchical query keys for better cache management:

```typescript
// ✅ Good query keys
['projects']                          // All projects
['project', projectId]                // Single project
['project', projectId, 'versions']    // Project versions
['searchHistory', projectId]          // Search history for project

// ❌ Bad query keys
['getProjects']                       // Don't use verbs
['project-123']                       // Don't embed IDs in strings
[`project_${id}`]                     // Don't use template literals
```

## Error Handling

### 1. In Hooks

```typescript
export function useProject(id: string) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const response = await apiFetch(`/api/projects/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Project not found');
        }
        throw new Error(`Failed to fetch project: ${response.statusText}`);
      }
      
      return response.json();
    },
    retry: (failureCount, error) => {
      // Don't retry on 404s
      if (error.message.includes('not found')) return false;
      return failureCount < 3;
    }
  });
}
```

### 2. In Components

```typescript
function ProjectDetails({ projectId }: Props) {
  const { data, error, isLoading } = useProject(projectId);
  
  if (isLoading) return <Spinner />;
  
  if (error) {
    return <ErrorMessage message={error.message} />;
  }
  
  return <div>{/* Render project data */}</div>;
}
```

## Optimistic Updates

For better UX, implement optimistic updates:

```typescript
export function useUpdateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateProjectApi,
    onMutate: async (newData) => {
      // Cancel in-flight queries
      await queryClient.cancelQueries({ queryKey: ['project', newData.id] });
      
      // Snapshot previous value
      const previousProject = queryClient.getQueryData(['project', newData.id]);
      
      // Optimistically update
      queryClient.setQueryData(['project', newData.id], newData);
      
      // Return context for rollback
      return { previousProject };
    },
    onError: (err, newData, context) => {
      // Rollback on error
      if (context?.previousProject) {
        queryClient.setQueryData(['project', newData.id], context.previousProject);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['project'] });
    }
  });
}
```

## Migration Guide

### Step 1: Identify Current Pattern

```typescript
// Direct fetch
const response = await fetch('/api/endpoint');

// Axios
const response = await axios.get('/api/endpoint');

// Already using apiFetch (good start)
const response = await apiFetch('/api/endpoint');
```

### Step 2: Create React Query Hook

```typescript
// Before (in component)
useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await axios.get('/api/projects');
      setProjects(response.data);
    } catch (error) {
      setError(error);
    }
  };
  fetchData();
}, []);

// After (custom hook)
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await apiFetch('/api/projects');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    }
  });
}

// In component
const { data: projects, error } = useProjects();
```

### Step 3: Remove Local State

```typescript
// Before
const [projects, setProjects] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

// After
const { data: projects, isLoading, error } = useProjects();
```

## Testing

Mock apiFetch in tests:

```typescript
// __tests__/useProjects.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useProjects } from '../useProjects';

jest.mock('@/lib/api/apiClient', () => ({
  apiFetch: jest.fn()
}));

test('fetches projects successfully', async () => {
  const mockProjects = [{ id: '1', name: 'Test' }];
  
  (apiFetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => mockProjects
  });
  
  const { result } = renderHook(() => useProjects(), {
    wrapper: createWrapper()
  });
  
  await waitFor(() => {
    expect(result.current.data).toEqual(mockProjects);
  });
});
```

## Common Patterns

### 1. Dependent Queries

```typescript
function useProjectWithDetails(projectId: string) {
  const projectQuery = useProject(projectId);
  
  const detailsQuery = useQuery({
    queryKey: ['projectDetails', projectId],
    queryFn: fetchProjectDetails,
    enabled: !!projectQuery.data, // Only run after project loads
  });
  
  return {
    project: projectQuery.data,
    details: detailsQuery.data,
    isLoading: projectQuery.isLoading || detailsQuery.isLoading
  };
}
```

### 2. Pagination

```typescript
function useProjectsPaginated(page: number, limit: number) {
  return useQuery({
    queryKey: ['projects', 'paginated', page, limit],
    queryFn: async () => {
      const response = await apiFetch(
        `/api/projects?page=${page}&limit=${limit}`
      );
      return response.json();
    },
    keepPreviousData: true, // Smooth pagination
  });
}
```

### 3. Real-time Updates

```typescript
function useRealtimeProject(projectId: string) {
  const queryClient = useQueryClient();
  
  const query = useProject(projectId);
  
  useEffect(() => {
    const ws = new WebSocket(`/api/projects/${projectId}/subscribe`);
    
    ws.onmessage = (event) => {
      const updatedProject = JSON.parse(event.data);
      queryClient.setQueryData(['project', projectId], updatedProject);
    };
    
    return () => ws.close();
  }, [projectId, queryClient]);
  
  return query;
}
```

## Enforcement

### 1. ESLint Rule (to be added)

```json
{
  "rules": {
    "no-restricted-imports": [
      "error",
      {
        "name": "axios",
        "message": "Use apiFetch + React Query instead. See DATA_FETCHING_STANDARDS.md"
      }
    ],
    "no-restricted-globals": [
      "error",
      {
        "name": "fetch",
        "message": "Use apiFetch for API calls. Direct fetch only in backend services."
      }
    ]
  }
}
```

### 2. Pre-commit Hook

Add a check to prevent direct axios/fetch usage in frontend code.

## Resources

- [React Query Documentation](https://tanstack.com/query/latest)
- [apiFetch Implementation](./apiClient.ts)
- [Example Hooks](../../hooks/)

---

**Remember**: Consistency is key. When in doubt, follow the existing patterns in recently updated hooks. 