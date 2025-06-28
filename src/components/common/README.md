# Common Components

This directory contains common components that are shared across multiple views in the application.

## ViewHeader

The `ViewHeader` component is a standardized header used across all main views in the application. It provides a consistent layout with a title on the left and action buttons on the right.

### Usage

```tsx
import ViewHeader from '../common/ViewHeader';
import { buttonStyles } from '../../styles/buttonStyles';

<ViewHeader
  title="My View Title"
  actions={
    <>
      <Button
        leftIcon={<Icon as={FiSave} />}
        onClick={handleSave}
        {...buttonStyles.secondary}
      >
        Save
      </Button>
      <Button
        leftIcon={<Icon as={FiDownload} />}
        onClick={handleExport}
        {...buttonStyles.primary}
      >
        Export
      </Button>
    </>
  }
/>;
```

### Props

| Prop      | Type      | Description                             |
| --------- | --------- | --------------------------------------- |
| `title`   | string    | The title to display in the header      |
| `actions` | ReactNode | Action buttons to display in the header |

## View-Specific Headers

Each main view has its own header component that uses the `ViewHeader` component internally:

- **PatentHeader** - `src/components/features/patent/PatentHeader.tsx`

  - Used in the Patent Application view
  - Provides buttons for Export DOCX, Version History, etc.

- **ClaimHeader** - `src/components/features/claims/ClaimHeader.tsx`

  - Used in the Claim Refinement view
  - Provides buttons for Preview Claims, Version History, Prior Art, etc.

- **TechnologyHeader** - `src/components/features/technical/TechnologyHeader.tsx`
  - Used in the Technology Details view
  - Provides buttons for Check Consistency, Version History, Export JSON, etc.

## Button Styles

All buttons in the headers use standardized styles from `src/styles/buttonStyles.ts`:

- `buttonStyles.primary` - Used for the main action in each view
- `buttonStyles.secondary` - Used for supporting actions
- `buttonStyles.danger` - Used for destructive actions
- `buttonStyles.success` - Used for confirmation actions
