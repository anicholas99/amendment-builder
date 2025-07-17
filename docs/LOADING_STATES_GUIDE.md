# Loading States Standardization Guide

This guide provides patterns and best practices for implementing consistent loading states across the application.

## Core Components

### 1. LoadingState Component

The `LoadingState` component provides a unified interface for all loading UI:

```tsx
import { LoadingState } from '@/components/common/LoadingState';

// Simple spinner
<LoadingState 
  isLoading={isLoading} 
  message="Loading data..." 
/>

// Skeleton loader for tables
<LoadingState 
  isLoading={isLoading} 
  variant="skeleton" 
  skeletonType="table" 
/>

// Progress bar
<LoadingState 
  isLoading={isLoading} 
  variant="progress" 
  progress={uploadProgress} 
  message="Uploading file..."
/>

// With error handling
<LoadingState 
  isLoading={isLoading} 
  error={error} 
  onRetry={refetch}
  message="Loading projects..."
/>
```

### 2. useLoadingState Hook

For managing loading states in components:

```tsx
import { useLoadingState } from '@/hooks/useLoadingState';

function MyComponent() {
  const loadingState = useLoadingState();
  
  const handleSave = async () => {
    loadingState.startLoading({
      operation: 'save',
      message: 'Saving changes...',
      timeout: 30000,
      onTimeout: () => toast({ title: 'Save is taking longer than expected' })
    });
    
    try {
      await saveData();
      loadingState.stopLoading();
    } catch (error) {
      loadingState.stopLoading(error);
    }
  };
  
  return (
    <LoadingState
      isLoading={loadingState.isLoading}
      message={loadingState.message}
      error={loadingState.error}
      onRetry={handleSave}
    />
  );
}
```

## Loading State Patterns

### Pattern 1: View Loading (Full Page)

For main views like Technology Details, Patent Application, etc:

```tsx
// Use skeleton loader for initial view load
if (isLoading || !data) {
  return (
    <ViewLayout
      header={<Header />}
      mainContent={
        <LoadingState 
          variant="skeleton" 
          skeletonType="document" 
        />
      }
      sidebarContent={
        <LoadingState 
          variant="skeleton" 
          skeletonType="sidebar" 
        />
      }
    />
  );
}
```

### Pattern 2: Component Loading (Inline)

For components that load data independently:

```tsx
function MyComponent() {
  const { data, isLoading, error, refetch } = useQuery(...);
  
  return (
    <Box>
      <LoadingState
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        variant="spinner"
        size="sm"
        minHeight="100px"
      >
        {/* Content shown when not loading */}
        {data && <DataDisplay data={data} />}
      </LoadingState>
    </Box>
  );
}
```

### Pattern 3: Table/List Loading

For tables and lists, use skeleton variants:

```tsx
// Reference Numerals Editor example
if (isLoading) {
  return (
    <Box mt={4}>
      <HStack justify="space-between" mb={2}>
        <Text fontSize="md" fontWeight="semibold">Reference Numerals</Text>
        <Skeleton height="20px" width="150px" />
      </HStack>
      <LoadingState 
        variant="skeleton" 
        skeletonType="table"
        skeletonRows={4}
      />
    </Box>
  );
}
```

### Pattern 4: Operation Progress

For long-running operations with progress:

```tsx
function FileUpload() {
  const [progress, setProgress] = useState(0);
  const loadingState = useLoadingState();
  
  const handleUpload = async (file: File) => {
    loadingState.startLoading({
      operation: 'upload',
      message: `Uploading ${file.name}...`,
      submessage: 'This may take a few minutes'
    });
    
    await uploadFile(file, (progress) => {
      setProgress(progress);
    });
    
    loadingState.stopLoading();
  };
  
  return (
    <LoadingState
      isLoading={loadingState.isLoading}
      variant="progress"
      progress={progress}
      message={loadingState.message}
      submessage={loadingState.submessage}
    />
  );
}
```

### Pattern 5: Multiple Concurrent Operations

For components with multiple loading states:

```tsx
function ComplexComponent() {
  const loadingStates = useMultipleLoadingStates();
  
  const fetchData = async () => {
    loadingStates.start('projects', 'Loading projects...');
    loadingStates.start('users', 'Loading users...');
    
    const [projects, users] = await Promise.all([
      fetchProjects().finally(() => loadingStates.stop('projects')),
      fetchUsers().finally(() => loadingStates.stop('users'))
    ]);
  };
  
  if (loadingStates.isAnyLoading()) {
    const operations = loadingStates.getLoadingOperations();
    return (
      <VStack>
        {operations.map(op => (
          <LoadingState
            key={op.key}
            variant="minimal"
            message={op.message}
          />
        ))}
      </VStack>
    );
  }
}
```

## Best Practices

### 1. Choose the Right Variant

- **Spinner**: Quick operations (< 3 seconds), modals, buttons
- **Skeleton**: Initial page loads, content that maintains layout
- **Progress**: File uploads, long operations with known progress
- **Minimal**: Inline loading indicators, small components

### 2. Always Provide Context

```tsx
// ❌ Bad - no context
<LoadingState isLoading={isLoading} />

// ✅ Good - clear context
<LoadingState 
  isLoading={isLoading} 
  message="Loading project details..."
/>
```

### 3. Handle Errors Gracefully

```tsx
// Always provide error handling and retry
<LoadingState
  isLoading={isLoading}
  error={error}
  onRetry={refetch}
  message="Loading data..."
/>
```

### 4. Use Appropriate Sizes

```tsx
// Full page
<LoadingState size="lg" minHeight="400px" />

// Component
<LoadingState size="md" minHeight="200px" />

// Inline
<LoadingState size="sm" minHeight="50px" />
```

### 5. Maintain Layout Stability

Use skeleton loaders to prevent layout shift:

```tsx
// Maintains table structure while loading
<LoadingState 
  variant="skeleton" 
  skeletonType="table"
  skeletonRows={estimatedRows}
/>
```

## Migration Checklist

When updating existing loading states:

1. **Replace simple loading text**:
   ```tsx
   // Before
   {isLoading && <Text>Loading...</Text>}
   
   // After
   <LoadingState isLoading={isLoading} message="Loading..." />
   ```

2. **Update spinner implementations**:
   ```tsx
   // Before
   {isLoading && (
     <Center>
       <Spinner />
     </Center>
   )}
   
   // After
   <LoadingState isLoading={isLoading} variant="spinner" />
   ```

3. **Standardize loading state management**:
   ```tsx
   // Before
   const [isLoading, setIsLoading] = useState(false);
   const [loadingMessage, setLoadingMessage] = useState('');
   
   // After
   const loadingState = useLoadingState();
   ```

4. **Add error handling**:
   ```tsx
   // Before
   {error && <Alert status="error">{error.message}</Alert>}
   
   // After
   <LoadingState 
     isLoading={false} 
     error={error} 
     onRetry={handleRetry}
   />
   ```

## Component-Specific Guidelines

### Tables
- Use `variant="skeleton"` with `skeletonType="table"`
- Show estimated number of rows
- Maintain header structure

### Forms
- Use `variant="spinner"` with size="sm"
- Disable form controls while loading
- Show specific operation messages

### Cards/Lists
- Use custom skeleton with appropriate spacing
- Maintain card dimensions
- Show placeholder for images

### Modals
- Use `variant="spinner"` centered
- Provide operation-specific messages
- Consider progress variant for multi-step operations

### File Operations
- Always use `variant="progress"`
- Show file name and size
- Provide time estimates when possible

## Performance Considerations

1. **Lazy load heavy skeletons**: For complex skeleton layouts, consider lazy loading
2. **Debounce quick operations**: Don't show loading for operations < 200ms
3. **Cache loading states**: Use React Query's background refetch indicators
4. **Optimize re-renders**: Memoize loading components when appropriate

## Accessibility

- Loading states automatically include appropriate ARIA labels
- Screen readers announce loading start/completion
- Focus management is handled automatically
- Keyboard navigation is preserved during loading

## Examples by Feature

### Citation Extraction
```tsx
<LoadingState
  isLoading={isExtractingCitations}
  variant="progress"
  message="Extracting citations..."
  submessage="Analyzing claim elements and prior art"
  isIndeterminate={true}
/>
```

### Project List
```tsx
<LoadingState
  isLoading={isLoadingProjects}
  variant="skeleton"
  skeletonType="projects-dashboard"
  count={6}
/>
```

### Figure Upload
```tsx
<LoadingState
  isLoading={isUploading}
  variant="progress"
  progress={uploadProgress}
  message={`Uploading ${fileName}...`}
  submessage={`${uploadedSize}MB of ${totalSize}MB`}
/>
``` 