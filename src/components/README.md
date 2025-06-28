# Components Organization

This directory contains **application-specific React components** used throughout the application.

## Important Distinction
- **`src/components/`** - Application components (business logic, feature-specific)  
- **`src/ui/`** - **Design system components** (atoms, molecules, organisms - pure UI)

## Directory Structure

- **common/**: Shared application components (ProcessingAnimation, LoadingSpinner, etc.)
- **domain/**: Business domain components (FiguresPanel, etc.)
- **layouts/**: Page layout components
- **modals/**: Application-specific modals
  - claims/: Components for the claims feature
  - patent/: Components for patent application
  - projects/: Project management components
  - technical/: Technology details components
  - etc.
- **layouts/**: Page layout components
  - AppLayout.tsx: Main application layout
  - ViewLayout.tsx: Layout for feature views
  - Sidebar.tsx: Navigation sidebar

## Relationship with src/features

There are two directories related to features in the codebase:

1. **src/components/features/**: Contains UI components for specific features

   - These are primarily presentational components
   - They're organized by feature for easy discovery
   - Example: ClaimsPanel.tsx, TechnologyDetailsForm.tsx

2. **src/features/**: Contains higher-level feature modules
   - These represent complete feature modules
   - May include domain logic, hooks, and utilities specific to a feature
   - Focus on feature architecture rather than just UI components
   - Example: claim-refinement/, patent-application/

This separation follows a clean architecture approach where UI components are separated from business logic and domain concerns.

## Main Views

The application has three main views:

1. **PatentApplicationView** - For viewing and editing the patent application
2. **ClaimRefinementView** - For refining and analyzing patent claims
3. **TechnologyDetailsView** - For entering and managing technology details

## Component Organization

Components are organized by feature/functionality rather than by view. This promotes reusability and separation of concerns.

### Directory Structure

```
src/components/
├── common/           # Reusable components used across multiple views
├── features/         # Feature-specific components
│   ├── chat/         # Chat-related components
│   ├── claims/       # Claim-related components
│   ├── elements/     # Element-related components
│   ├── figures/      # Figure-related components
│   ├── patent/       # Patent-related components
│   ├── references/   # Reference-related components
│   ├── technical/    # Technical implementation components
│   ├── verification/ # Verification-related components
│   └── version/      # Version-related components
└── views/            # Main view components
    ├── patentApplication/  # Index file for PatentApplicationView components
    ├── claimRefinement/    # Index file for ClaimRefinementView components
    └── technologyDetails/  # Index file for TechnologyDetailsView components
```

## Modular Component Design

Each main view is broken down into smaller, more focused components:

### ClaimRefinementView Components

- **ClaimHeader** - Header with title and main actions
- **ClaimList** - List of claims with editing capabilities
- **PriorArtSection** - Section for managing prior art references
- **SuggestionPanel** - Panel for AI-generated suggestions

### TechnologyDetailsView Components

- **TechnologyHeader** - Header with title and main actions
- **TechnologyDetailsForm** - Form for entering technology details
- **FigureSection** - Section for managing figures and diagrams

## Component Imports

To make it easier to import components for each view, we've created index files that export all components used in that view:

```typescript
// Example: Importing components for ClaimRefinementView
import {
  ClaimHeader,
  ClaimList,
  PriorArtSection,
} from '../components/views/claimRefinement';
```

## Shared Components

Some components are shared across multiple views:

- **ReferenceNumerals** - Used in PatentApplicationView and TechnologyDetailsView
- **FigureCarousel** - Used in PatentApplicationView and TechnologyDetailsView
- **MermaidDiagram** - Used in PatentApplicationView and TechnologyDetailsView
- **ReactFlowDiagram** - Used in PatentApplicationView and TechnologyDetailsView
- **VersionHistoryModal** - Used in PatentApplicationView and ClaimRefinementView
- **PageHeader** - Used in ClaimRefinementView and TechnologyDetailsView

## Component Documentation

Each main view has a dedicated documentation file that lists all components used in that view:

- [PatentApplicationComponents.md](./views/PatentApplicationComponents.md)
- [ClaimRefinementComponents.md](./views/ClaimRefinementComponents.md)
- [TechnologyDetailsComponents.md](./views/TechnologyDetailsComponents.md)

## Component Visualization

You can generate visualizations of component dependencies by running:

```bash
node scripts/visualize-components.js
```

This will create the following files in the `docs` directory:

- `component-dependencies-patentapplicationview.md` - Mermaid diagram of PatentApplicationView components
- `component-dependencies-claimrefinementview.md` - Mermaid diagram of ClaimRefinementView components
- `component-dependencies-technologydetailsview.md` - Mermaid diagram of TechnologyDetailsView components
- `component-list-patentapplicationview.md` - List of PatentApplicationView components
- `component-list-claimrefinementview.md` - List of ClaimRefinementView components
- `component-list-technologydetailsview.md` - List of TechnologyDetailsView components
- `component-summary.md` - Summary of all components used in the application

## Best Practices

1. **Keep Components Small and Focused**: Each component should have a single responsibility.
2. **Use Index Files**: Import components from the corresponding index file to keep imports clean.
3. **Document New Components**: When adding new components, update the corresponding documentation files.
4. **Run the Visualization Script**: Periodically run the visualization script to keep documentation up-to-date.
5. **Reuse Shared Components**: Use shared components from the common directory when possible.
