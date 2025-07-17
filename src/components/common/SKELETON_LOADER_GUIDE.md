# Enhanced Skeleton Loader Guide

## Overview

The enhanced skeleton loader provides modern, visually appealing loading states with multiple animation variants and pre-built patterns. It's built on top of shadcn/ui and uses CSS animations for smooth performance.

## Key Features

### 🎨 Multiple Animation Variants
- **Shimmer**: Gradient-based shimmer effect (default)
- **Wave**: Moving wave animation
- **Pulse**: Subtle pulsing with scaling
- **Glow**: Animated shadow effects
- **Default**: Simple opacity animation

### 📱 Responsive Design
- Mobile-first approach
- Consistent spacing and proportions
- Proper breakpoint handling

### ♿ Accessibility
- Proper ARIA labels
- Respects `prefers-reduced-motion`
- Screen reader compatible
- Keyboard navigation support

### 🎯 Pre-built Patterns
- Document views
- Project dashboards
- Data tables
- Forms
- Chat interfaces
- Navigation sidebars
- Search results
- Cards and lists

## Usage

### Basic Usage

```tsx
import { SkeletonLoader } from '@/components/common';

// Simple document skeleton
<SkeletonLoader type="document" />

// Projects dashboard with shimmer animation
<SkeletonLoader 
  type="projects-dashboard" 
  variant="shimmer"
  count={3}
/>

// Custom styling
<SkeletonLoader 
  type="table"
  variant="wave"
  className="my-custom-class"
/>
```

### Available Props

```tsx
interface SkeletonLoaderProps {
  type?: 'document' | 'project' | 'sidebar' | 'projects-dashboard' | 
         'table' | 'list' | 'search-history' | 'project-list' | 
         'card' | 'form' | 'chat' | 'detailed-card';
  count?: number;
  variant?: 'default' | 'shimmer' | 'wave' | 'pulse' | 'glow';
  className?: string;
  showAvatar?: boolean;
  showActions?: boolean;
}
```

### Animation Variants

#### Shimmer (Recommended)
```tsx
<SkeletonLoader type="document" variant="shimmer" />
```
- Smooth gradient animation
- Best for general loading states
- Modern and polished appearance

#### Wave
```tsx
<SkeletonLoader type="table" variant="wave" />
```
- Moving wave effect
- Great for data-heavy components
- Dynamic feel

#### Pulse
```tsx
<SkeletonLoader type="form" variant="pulse" />
```
- Subtle pulsing animation
- Good for forms and input fields
- Less distracting

#### Glow
```tsx
<SkeletonLoader type="card" variant="glow" />
```
- Animated shadow effects
- Eye-catching for important content
- Use sparingly

## Pattern Examples

### Document View
```tsx
// Technology details, patent application, etc.
<SkeletonLoader 
  type="document"
  variant="shimmer"
/>
```

### Projects Dashboard
```tsx
// Project listing with cards
<SkeletonLoader 
  type="projects-dashboard"
  variant="shimmer"
  count={6}
  showAvatar={true}
  showActions={true}
/>
```

### Data Table
```tsx
// Citation tables, search results, etc.
<SkeletonLoader 
  type="table"
  variant="wave"
  count={10}
/>
```

### Form Fields
```tsx
// Settings forms, input dialogs, etc.
<SkeletonLoader 
  type="form"
  variant="pulse"
  count={5}
/>
```

### Chat Interface
```tsx
// Message conversations
<SkeletonLoader 
  type="chat"
  variant="shimmer"
  count={4}
/>
```

### Navigation Sidebar
```tsx
// Project navigation, menu items, etc.
<SkeletonLoader 
  type="sidebar"
  variant="shimmer"
/>
```

## Using Individual Skeleton Components

For custom layouts, you can use the individual skeleton components:

```tsx
import { 
  Skeleton, 
  SkeletonText, 
  SkeletonAvatar, 
  SkeletonButton, 
  SkeletonCard 
} from '@/components/ui/skeleton';

// Custom skeleton layout
<div className="space-y-4">
  <div className="flex items-center space-x-3">
    <SkeletonAvatar variant="shimmer" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-32" variant="shimmer" />
      <Skeleton className="h-3 w-24" variant="shimmer" />
    </div>
  </div>
  <SkeletonText lines={3} variant="shimmer" />
  <div className="flex space-x-2">
    <SkeletonButton variant="shimmer" />
    <SkeletonButton className="w-20" variant="shimmer" />
  </div>
</div>
```

## Best Practices

### 1. Choose the Right Pattern
- Use `document` for full page loads
- Use `projects-dashboard` for card-based layouts
- Use `table` for data tables
- Use `form` for input forms

### 2. Match Animation to Content
- `shimmer`: General purpose, modern look
- `wave`: Data-heavy content
- `pulse`: Forms and inputs
- `glow`: Important content (use sparingly)

### 3. Consistent Timing
- All animations use optimized durations
- Respects user motion preferences
- Smooth performance on all devices

### 4. Accessibility
- Always include proper ARIA labels
- Test with screen readers
- Ensure keyboard navigation works
- Respect reduced motion preferences

### 5. Performance
- Use CSS animations for smooth performance
- Minimal JavaScript overhead
- Optimized for modern browsers

## Migration from Old Skeleton

### Before
```tsx
// Old implementation
<Skeleton className="h-4 w-full" />
<Skeleton className="h-4 w-3/4" />
```

### After
```tsx
// New implementation
<SkeletonText lines={2} variant="shimmer" />
```

### Gradual Migration
1. Start with new patterns for new components
2. Replace old skeletons during feature updates
3. Use the showcase component for testing
4. Maintain backward compatibility

## Testing

Use the `SkeletonShowcase` component to test all patterns:

```tsx
import { SkeletonShowcase } from '@/components/common';

// In your development environment
<SkeletonShowcase />
```

This provides an interactive playground to test all skeleton patterns and animations.

## Troubleshooting

### Animations Not Working
- Ensure CSS animations are loaded
- Check for CSP restrictions
- Verify Tailwind config includes custom animations

### Performance Issues
- Reduce animation count for heavy pages
- Use `default` variant for better performance
- Consider lazy loading for complex skeletons

### Accessibility Issues
- Test with screen readers
- Ensure proper ARIA labels
- Verify reduced motion support

## Contributing

When adding new skeleton patterns:
1. Follow existing naming conventions
2. Include proper TypeScript types
3. Add accessibility features
4. Test with multiple variants
5. Update this documentation
6. Add examples to the showcase

## Related Components

- `LoadingState`: Higher-level loading component
- `SimpleMainPanel`: Layout wrapper with skeleton support
- Individual skeleton components in `@/components/ui/skeleton` 