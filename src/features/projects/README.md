# Project Sidebar Components

This directory contains all the components related to the project sidebar in the Patent Drafter AI application.

## Component Structure

### Main Component

- **ProjectSidebar.tsx** - The main container component that orchestrates all the sidebar functionality and renders the appropriate sub-components based on state.

### UI Components

- **SidebarHeader.tsx** - Renders the top header of the sidebar with controls for creating projects, hiding/showing, and collapsing/expanding the sidebar.
- **SidebarFooter.tsx** - Renders the footer controls shown in expanded view, including the auto-expand toggle and manage projects button.
- **CollapsedProjectView.tsx** - Renders the compact view of projects when the sidebar is collapsed.
- **ExpandedProjectView.tsx** - Renders the detailed view of projects when the sidebar is expanded.

### Modals

- **NewProjectModal.tsx** - Modal for creating a new project.
- **ManageProjectsModal.tsx** - Modal for managing (viewing and deleting) existing projects.

## Supporting Hooks

- **useProjectSidebarExpansion.ts** - Custom hook (in the hooks directory) that handles the logic for expanding/collapsing projects, auto-expand functionality, and animations.

## Key Features Preserved

- Dark themed sidebar with all styling intact
- Smooth transitions and animations when expanding/collapsing projects
- Ability to toggle between collapsed and expanded views
- Auto-expand functionality with localStorage persistence
- Project creation and management
- Document type navigation within projects

## UI States

1. **Normal Expanded View** - Shows full project names and document types
2. **Collapsed View** - Shows only project icons with popup navigation for the active project
3. **Hidden View** - Sidebar is completely hidden (toggled via the X button)

## Event Handling

The components preserve all the original event handling functionality:

- Single-click on project: Select project
- Toggle project expansion
- Navigate to document types
- Create, view, and delete projects

## Theming

All components maintain the original theme colors, spacing, and visual design, including:

- Gray background with white text
- Blue accents for active items
- Hover effects and animations
- Consistent sizing and padding
