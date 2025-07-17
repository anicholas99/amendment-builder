# Patent Drafter AI - Style Guide

This guide provides comprehensive styling and component usage patterns for the Patent Drafter AI application using shadcn/ui and Tailwind CSS.

## Table of Contents
- [Component Usage](#component-usage)
- [Styling Best Practices](#styling-best-practices)
- [Color System](#color-system)
- [Typography](#typography)
- [Spacing and Layout](#spacing-and-layout)
- [Component Patterns](#component-patterns)
- [Dark Mode](#dark-mode)
- [Animations](#animations)

## Component Usage

### Using shadcn/ui Components

All UI components are imported from `@/components/ui/*`:

```typescript
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
```

### Component Customization

Use the `cn()` utility from `@/lib/utils` to merge classes:

```typescript
import { cn } from '@/lib/utils'

// Example usage
<Button 
  className={cn(
    "custom-class",
    isActive && "bg-primary text-primary-foreground"
  )}
>
  Click me
</Button>
```

## Styling Best Practices

### 1. Use Tailwind Utility Classes

Prefer Tailwind utility classes over custom CSS:

```typescript
// ✅ Good
<div className="flex items-center justify-between p-4 bg-background border rounded-lg">

// ❌ Avoid
<div style={{ display: 'flex', alignItems: 'center' }}>
```

### 2. Responsive Design

Use Tailwind's responsive prefixes:

```typescript
<div className="p-4 md:p-6 lg:p-8">
  <h1 className="text-xl md:text-2xl lg:text-3xl">
    Responsive Heading
  </h1>
</div>
```

### 3. State Modifiers

Use Tailwind's state modifiers for interactive elements:

```typescript
<button className="bg-primary hover:bg-primary/90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
  Interactive Button
</button>
```

## Color System

Our application uses CSS variables for theming, defined in `globals.css`:

### Primary Colors
- `bg-background` - Main background color
- `bg-card` - Card background color
- `text-foreground` - Primary text color
- `text-muted-foreground` - Secondary text color

### Semantic Colors
- `bg-primary` / `text-primary` - Primary brand color
- `bg-secondary` / `text-secondary` - Secondary brand color
- `bg-destructive` / `text-destructive` - Error/danger color
- `border` - Default border color

### Usage Example
```typescript
<div className="bg-card text-card-foreground border border-border rounded-lg p-4">
  <h2 className="text-primary font-semibold">Card Title</h2>
  <p className="text-muted-foreground">Card description</p>
</div>
```

## Typography

### Font Sizes
Use Tailwind's typography scale:
- `text-xs` - 12px
- `text-sm` - 14px
- `text-base` - 16px (default)
- `text-lg` - 18px
- `text-xl` - 20px
- `text-2xl` - 24px
- `text-3xl` - 30px
- `text-4xl` - 36px

### Font Weights
- `font-normal` - 400
- `font-medium` - 500
- `font-semibold` - 600
- `font-bold` - 700

### Example Typography Patterns
```typescript
// Page title
<h1 className="text-3xl font-bold tracking-tight">Page Title</h1>

// Section header
<h2 className="text-xl font-semibold mb-4">Section Header</h2>

// Body text
<p className="text-base text-muted-foreground">Body content</p>

// Small text
<span className="text-sm text-muted-foreground">Helper text</span>
```

## Spacing and Layout

### Padding/Margin Scale
Use consistent spacing scale:
- `p-1` / `m-1` - 4px
- `p-2` / `m-2` - 8px
- `p-3` / `m-3` - 12px
- `p-4` / `m-4` - 16px
- `p-6` / `m-6` - 24px
- `p-8` / `m-8` - 32px

### Common Layout Patterns

#### Flex Container
```typescript
<div className="flex items-center justify-between gap-4">
  <div>Left content</div>
  <div>Right content</div>
</div>
```

#### Grid Layout
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</div>
```

#### Container with Max Width
```typescript
<div className="container mx-auto max-w-7xl px-4 py-8">
  <div>Content</div>
</div>
```

## Component Patterns

### Buttons

```typescript
// Primary button
<Button>Primary Action</Button>

// Secondary button
<Button variant="secondary">Secondary Action</Button>

// Destructive button
<Button variant="destructive">Delete</Button>

// Ghost button
<Button variant="ghost">Cancel</Button>

// Outline button
<Button variant="outline">Outline</Button>

// With icon
<Button>
  <Plus className="mr-2 h-4 w-4" />
  Add Item
</Button>

// Loading state
<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Loading...
</Button>
```

### Cards

```typescript
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter className="flex justify-between">
    <Button variant="ghost">Cancel</Button>
    <Button>Save</Button>
  </CardFooter>
</Card>
```

### Forms

```typescript
<form className="space-y-4">
  <div className="space-y-2">
    <Label htmlFor="email">Email</Label>
    <Input 
      id="email" 
      type="email" 
      placeholder="john@example.com"
      className="w-full"
    />
  </div>
  
  <div className="space-y-2">
    <Label htmlFor="role">Role</Label>
    <Select>
      <SelectTrigger id="role">
        <SelectValue placeholder="Select a role" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="admin">Admin</SelectItem>
        <SelectItem value="user">User</SelectItem>
      </SelectContent>
    </Select>
  </div>
  
  <Button type="submit" className="w-full">
    Submit
  </Button>
</form>
```

### Dialogs/Modals

```typescript
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>
        Dialog description goes here.
      </DialogDescription>
    </DialogHeader>
    <div className="py-4">
      {/* Dialog content */}
    </div>
    <DialogFooter>
      <Button variant="ghost">Cancel</Button>
      <Button>Continue</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## Dark Mode

The application supports dark mode using Tailwind's dark mode class strategy:

```typescript
// Components automatically adapt to dark mode
<div className="bg-background text-foreground">
  Content adapts to theme
</div>

// Explicit dark mode overrides if needed
<div className="bg-white dark:bg-gray-900">
  Custom dark mode styling
</div>
```

## Animations

### Using Tailwind Animations

```typescript
// Fade in
<div className="animate-in fade-in duration-300">
  Fading content
</div>

// Slide in
<div className="animate-in slide-in-from-bottom-2 duration-300">
  Sliding content
</div>

// Spin animation
<Loader2 className="h-4 w-4 animate-spin" />

// Pulse animation
<div className="animate-pulse bg-muted rounded-md h-20 w-full" />
```

### Custom Transitions

```typescript
<div className="transition-all duration-200 hover:scale-105 hover:shadow-lg">
  Hover me
</div>
```

## Best Practices Summary

1. **Use semantic color variables** - Always use `bg-background`, `text-foreground`, etc. instead of hardcoded colors
2. **Maintain consistent spacing** - Use the standard spacing scale (p-2, p-4, etc.)
3. **Leverage component variants** - Use the built-in variants in shadcn/ui components
4. **Keep it responsive** - Always consider mobile, tablet, and desktop views
5. **Use the cn() utility** - For conditional classes and merging classNames
6. **Avoid inline styles** - Use Tailwind classes instead
7. **Follow accessibility guidelines** - Ensure proper contrast, focus states, and ARIA labels