# Layout Containers

This directory contains standardized container components that provide consistent layout and styling across the application.

## Available Containers

### SidebarContainer

A standardized sidebar container that ensures consistent styling across all views.

#### Basic Usage

```tsx
import { SidebarContainer } from '@/components/layouts/containers';

const YourComponent = () => {
  return (
    <SidebarContainer>
      <YourContent />
    </SidebarContainer>
  );
};
```

#### With Tabs

```tsx
import { SidebarContainer } from '@/components/layouts/containers';
import { Icon } from 'lucide-react';
import { FiZap } from 'react-icons/fi';

const YourComponent = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <SidebarContainer
      activeTab={activeTab}
      onTabChange={setActiveTab}
      tabTitles={['Tab 1', 'Tab 2']}
      tabIcons={[<Icon as={FiZap} key="icon1" />, null]}
      tabContents={[
        <YourFirstTabContent key="tab1" />,
        <YourSecondTabContent key="tab2" />,
      ]}
    />
  );
};
```

## Design Guidelines

All container components in this directory should:

1. Support consistent styling across all views
2. Be reusable across different features
3. Have sensible defaults
4. Support customization through props
5. Be well-documented

## Adding New Containers

When adding a new container component:

1. Create the component file (e.g., `MainPanelContainer.tsx`)
2. Export it in the `index.ts` file
3. Update this README with usage examples
