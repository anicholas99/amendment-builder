# Layout Components

This directory contains the layout components used throughout the application to ensure consistent UI structure.

## Overview

The layout system provides a consistent way to structure views with:
- A header section
- A main content area
- An optional sidebar
- Optional bottom content
- Consistent spacing and styling
- Island mode for floating panel effect
- Resizable panels with persisted width
- Automatic height adjustment for nested components

## Main Components

### ViewLayout

The primary layout component that all views should use.

```tsx
import ViewLayout from '@/components/layouts/ViewLayout';
import { VIEW_LAYOUT_CONFIG } from '@/constants/layout';

// Basic usage with recommended defaults
<ViewLayout
  header={<MyHeader />}
  mainContent={<MyMainContent />}
  sidebarContent={<MySidebar />}
  {...VIEW_LAYOUT_CONFIG.DEFAULT_PROPS}
/>
```

### Automatic Island Mode Detection

When ViewLayout is configured with `islandMode={true}`, all ViewPanel components inside will automatically adjust their height calculation to fill their container properly. This means:

- No need to manually pass `fillContainer={true}` to ViewPanel components
- ViewPanel automatically detects when it's inside an island mode container
- Scrolling works correctly regardless of container height
- Less props to manage and maintain

This is achieved through the ViewLayoutContext which provides layout information to child components.

### ContentPanel

Internal component that wraps content with consistent styling, shadows, and hover effects.

### ResizablePanel

Internal component that handles the resizable functionality for the main panel.

## Configuration

All layout configuration is centralized in `src/constants/layout.ts`:

- `VIEW_LAYOUT_CONFIG.DEFAULT_PROPS` - Default props for ViewLayout
- `VIEW_LAYOUT_CONFIG.ISLAND_MODE` - Island mode specific settings
- `VIEW_LAYOUT_CONFIG.SHADOWS` - Shadow configurations for light/dark themes
- Panel sizing, spacing, and other constants

## Usage Guidelines

1. **Always use ViewLayout** for main application views
2. **Use the default configuration** for consistency:
   ```tsx
   {...VIEW_LAYOUT_CONFIG.DEFAULT_PROPS}
   ```
3. **Island mode is enabled by default** - panels float with gray background
4. **Panels are resizable by default** - width is persisted across sessions
5. **Dark mode is automatically handled** - no additional configuration needed

## Examples

See `ViewLayoutExample.tsx` for comprehensive examples of different configurations.

## File Structure

```
layouts/
├── ViewLayout.tsx          # Main layout component
├── ViewLayoutExample.tsx   # Usage examples
├── README.md              # This file
└── containers/
    ├── ContentPanel.tsx   # Content wrapper with shadows
    └── ResizablePanel.tsx # Resizable container wrapper
```

## Customization

While the default configuration should work for most cases, you can customize:

- `islandMode` - Toggle floating panel effect
- `isResizable` - Enable/disable panel resizing
- `defaultMainPanelWidth` - Initial width of main panel
- `minMainPanelWidth` - Minimum width for main panel
- `maxMainPanelWidth` - Maximum width for main panel

## Best Practices

1. Use the spread operator with `VIEW_LAYOUT_CONFIG.DEFAULT_PROPS` for consistency
2. Keep header components simple and focused on navigation/title
3. Main content should handle its own scrolling if needed
4. Sidebar content should be secondary/supplementary
5. Use bottom content sparingly for actions that apply to the whole view 