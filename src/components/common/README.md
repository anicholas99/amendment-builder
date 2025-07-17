# Common Components

This directory contains reusable UI components used throughout the Patent Drafter AI application. All components are built using shadcn/ui and Tailwind CSS.

## Component Structure

```
common/
├── layout/              # Layout components (headers, footers, containers)
├── navigation/          # Navigation components (menus, breadcrumbs)
├── forms/              # Form-related components
├── feedback/           # User feedback components (toasts, loading states)
└── data-display/       # Data presentation components (tables, lists)
```

## Key Components

### Layout Components

- **AppLayout** - Main application layout wrapper
- **ViewLayout** - Standard view container with consistent padding
- **Header** - Application header with user menu
- **SimpleMainPanel** - Basic content panel wrapper

### Navigation Components

- **ProjectSidebar** - Project navigation sidebar
- **NavigationButton** - Consistent navigation button styling
- **NavigationLink** - Next.js Link wrapper with active states
- **TenantSwitcher** - Multi-tenant organization switcher

### Form Components

- **EditableField** - Inline editable text fields
- **ContentEditableList** - Editable list items
- **CustomEditable** - Advanced editable components

### Feedback Components

- **LoadingState** - Consistent loading indicators
- **ProfessionalLoadingModal** - Full-screen loading overlay
- **ToastWrapper** - Toast notification system

### Data Display Components

- **FiguresTab** - Figure management interface
- **BadgeV2** - Status badges and labels
- **DeleteConfirmationDialogV2** - Confirmation dialogs

## Usage Guidelines

### Importing Components

All common components should be imported from the index file:

```typescript
import { 
  Header, 
  LoadingState, 
  NavigationButton,
  TenantSwitcher 
} from '@/components/common'
```

### Component Patterns

#### Loading States
```typescript
if (isLoading) {
  return <LoadingState message="Loading data..." />
}
```

#### Editable Fields
```typescript
<EditableField
  value={title}
  onSave={handleSave}
  placeholder="Enter title"
  className="text-xl font-semibold"
/>
```

#### Navigation
```typescript
<NavigationLink 
  href="/projects" 
  isActive={pathname === '/projects'}
>
  Projects
</NavigationLink>
```

## Styling Conventions

All components follow these styling patterns:

1. **Use Tailwind classes** - No inline styles or CSS modules
2. **Support dark mode** - Use semantic color classes (bg-background, text-foreground)
3. **Responsive by default** - Mobile-first approach
4. **Accessible** - Proper ARIA labels and keyboard navigation

## Component Props

Most components accept these common props:

```typescript
interface CommonProps {
  className?: string      // Additional Tailwind classes
  children?: ReactNode    // Child content
  disabled?: boolean      // Disabled state
  loading?: boolean       // Loading state
}
```

## Best Practices

1. **Keep components focused** - Single responsibility principle
2. **Use composition** - Build complex UIs from simple components
3. **Avoid prop drilling** - Use context for deeply nested data
4. **Document complex logic** - Add comments for non-obvious behavior
5. **Test edge cases** - Handle loading, error, and empty states