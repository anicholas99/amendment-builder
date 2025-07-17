/**
 * Example component showing how to use ViewLayout
 * This file serves as documentation for developers
 */

import React from 'react';
import ViewLayout from './ViewLayout';
import { VIEW_LAYOUT_CONFIG } from '@/constants/layout';

// Example header component
const ExampleHeader = () => (
  <div className="p-4">
    <h1 className="text-2xl font-bold">My View Title</h1>
  </div>
);

// Example main content component
const ExampleMainContent = () => (
  <div className="p-4">
    <h2 className="text-xl font-semibold mb-4">Main Content Area</h2>
    <p>
      This is where your main content goes. It will be displayed in the larger
      panel on the left side of the layout.
    </p>
  </div>
);

// Example sidebar component
const ExampleSidebar = () => (
  <div className="p-4">
    <h2 className="text-xl font-semibold mb-4">Sidebar</h2>
    <p>
      This is the sidebar area. It's perfect for secondary controls, navigation,
      or supplementary information.
    </p>
  </div>
);

/**
 * Example 1: Basic usage with default settings
 * This will create a resizable layout with island mode enabled
 */
export const BasicExample = () => (
  <ViewLayout
    header={<ExampleHeader />}
    mainContent={<ExampleMainContent />}
    sidebarContent={<ExampleSidebar />}
  />
);

/**
 * Example 2: Using the default configuration
 * This is the recommended approach for consistency
 */
export const RecommendedExample = () => (
  <ViewLayout
    header={<ExampleHeader />}
    mainContent={<ExampleMainContent />}
    sidebarContent={<ExampleSidebar />}
    {...VIEW_LAYOUT_CONFIG.DEFAULT_PROPS}
  />
);

/**
 * Example 3: Fixed layout (non-resizable)
 * Use this when you don't want users to resize panels
 */
export const FixedLayoutExample = () => (
  <ViewLayout
    header={<ExampleHeader />}
    mainContent={<ExampleMainContent />}
    sidebarContent={<ExampleSidebar />}
    isResizable={false}
    islandMode={true}
  />
);

/**
 * Example 4: Standard mode (no island effect)
 * Use this if you want panels to fill the entire height
 */
export const StandardModeExample = () => (
  <ViewLayout
    header={<ExampleHeader />}
    mainContent={<ExampleMainContent />}
    sidebarContent={<ExampleSidebar />}
    islandMode={false}
    isResizable={true}
  />
);

/**
 * Example 5: No sidebar
 * The main content will take full width
 */
export const NoSidebarExample = () => (
  <ViewLayout
    header={<ExampleHeader />}
    mainContent={<ExampleMainContent />}
    sidebarContent={null}
    islandMode={true}
  />
);

/**
 * Example 6: With bottom content
 * Additional content below the main panels
 */
export const WithBottomContentExample = () => (
  <ViewLayout
    header={<ExampleHeader />}
    mainContent={<ExampleMainContent />}
    sidebarContent={<ExampleSidebar />}
    bottomContent={
      <div className="p-4 bg-muted rounded-md">
        <p>
          This is optional bottom content that appears below the main panels.
        </p>
      </div>
    }
    islandMode={true}
  />
);
