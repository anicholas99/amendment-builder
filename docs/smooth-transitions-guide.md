# Smooth Project Transitions Guide

This guide explains how to use the smooth yet snappy transitions implemented for navigating between projects using shadcn/tailwind.

## Overview

The transition system provides a delightful user experience with:
- **Smooth animations** that feel natural and polished
- **Snappy performance** that keeps the UI responsive
- **Progressive enhancement** with loading states
- **Accessibility** with reduced motion support

## Core Components

### 1. PageTransition Component
Wraps page content to provide smooth enter/exit animations:

```tsx
import { PageTransition } from '@/components/common/PageTransition';

<PageTransition>
  <YourPageContent />
</PageTransition>
```

### 2. ProjectTransitionLoader
Displays during project navigation with contextual information:

```tsx
import { ProjectTransitionLoader } from '@/components/common/ProjectTransitionLoader';

{isAnimating && (
  <ProjectTransitionLoader
    projectName="My Project"
    targetView="Technology Details"
  />
)}
```

### 3. Enhanced ProjectCard
Project cards with smooth hover effects and staggered animations:

```tsx
<ProjectCard
  project={projectData}
  index={index} // For staggered animation delays
  // ... other props
/>
```

## Animation Utilities

### Tailwind Animation Classes

```css
/* Smooth transitions */
.animate-slide-in-right    /* Slides in from right */
.animate-slide-out-left    /* Slides out to left */
.animate-fade-in-scale     /* Fades in with scale */
.animate-content-show      /* Content reveal animation */

/* Quick animations */
.animate-fade-in-fast      /* Fast fade in (150ms) */
.animate-slide-up-fast     /* Fast slide up (200ms) */
.animate-bounce-subtle     /* Subtle bounce effect */

/* Transition timing functions */
.ease-smooth-out           /* Smooth deceleration */
.ease-smooth-in-out        /* Smooth acceleration/deceleration */
```

### Custom CSS Properties

```css
/* Duration controls */
.duration-250              /* 250ms duration */
.duration-350              /* 350ms duration */
.duration-400              /* 400ms duration */
```

## Implementation Examples

### 1. Staggered List Animation
```tsx
{projects.map((project, index) => (
  <ProjectCard
    key={project.id}
    project={project}
    index={index} // Stagger delay: index * 50ms
  />
))}
```

### 2. Button Hover Effects
```tsx
<Button
  className={cn(
    "transition-all duration-200 ease-smooth-out",
    "transform hover:scale-105 active:scale-95"
  )}
>
  Click Me
</Button>
```

### 3. Loading Skeletons
```tsx
<div className="space-y-4">
  {[0, 1, 2].map((i) => (
    <div
      key={i}
      className="h-[180px] rounded-lg skeleton-shimmer animate-fade-in-scale"
      style={{
        animationDelay: `${i * 100}ms`,
        animationFillMode: 'backwards',
      }}
    />
  ))}
</div>
```

### 4. Badge Micro-interactions
```tsx
<Badge
  className={cn(
    "cursor-pointer transition-all duration-200",
    "transform-gpu hover:scale-105 active:scale-95",
    "hover:shadow-md"
  )}
  onClick={handleClick}
>
  Technology
</Badge>
```

## Performance Optimizations

### 1. GPU Acceleration
Use `transform-gpu` class for smooth animations:
```tsx
className="transform-gpu will-change-transform"
```

### 2. Reduced Motion Support
Animations automatically respect user preferences:
```css
@media (prefers-reduced-motion: reduce) {
  /* Animations are minimized */
}
```

### 3. Optimistic Updates
Show immediate feedback while loading:
```tsx
const [isClicking, setIsClicking] = useState(false);

const handleClick = () => {
  setIsClicking(true);
  setTimeout(() => {
    navigate();
  }, 150); // Small delay for animation
};
```

## Best Practices

### 1. Consistent Timing
- **Fast actions**: 150-200ms
- **Normal transitions**: 250-300ms
- **Complex animations**: 400-500ms

### 2. Easing Functions
- **ease-smooth-out**: For elements entering the screen
- **ease-smooth-in-out**: For state changes
- **cubic-bezier(0.68, -0.55, 0.265, 1.55)**: For playful bounces

### 3. Loading States
Always provide visual feedback during transitions:
```tsx
{isAnimating ? (
  <ProjectTransitionLoader />
) : (
  <YourContent />
)}
```

### 4. Progressive Enhancement
Start with basic functionality, enhance with animations:
```tsx
className={cn(
  "base-styles",
  isMounted && "animate-content-show"
)}
```

## Common Patterns

### 1. Page Enter Animation
```tsx
<div className="animate-content-show">
  <h1>Page Title</h1>
</div>
```

### 2. Hover State Transitions
```tsx
<Card
  className={cn(
    "transition-all duration-250",
    "hover:shadow-xl hover:-translate-y-1"
  )}
/>
```

### 3. Click Feedback
```tsx
<Button
  className="active:scale-95 active:transition-transform active:duration-100"
/>
```

### 4. Sequential Reveals
```tsx
<div style={{ animationDelay: '100ms' }}>First</div>
<div style={{ animationDelay: '200ms' }}>Second</div>
<div style={{ animationDelay: '300ms' }}>Third</div>
```

## Troubleshooting

### Animations feel sluggish
- Check for unnecessary re-renders
- Use `React.memo` for complex components
- Ensure GPU acceleration with `transform-gpu`

### Animations are jerky
- Avoid animating layout properties (width, height)
- Use transform and opacity instead
- Check for competing CSS transitions

### Animations don't play
- Verify animation CSS is imported
- Check for conflicting styles
- Ensure component is mounted before animating

## Future Enhancements

Consider implementing:
- View Transitions API for seamless page transitions
- Gesture-based interactions with react-spring
- Parallax effects for depth
- Custom loading animations per project type 