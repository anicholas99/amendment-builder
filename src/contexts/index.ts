/**
 * Central export point for all context providers and hooks
 * This makes it easier to import contexts throughout the application
 */

// Core contexts
export { ProjectProviders } from './ProjectProviders';
export { AuthProvider } from './AuthProvider';
export { useAuth } from './AuthContext';
export { TenantProvider, useTenant } from './TenantContext';
export {
  ThemeProvider as ThemeContextProvider,
  useTheme,
  useThemeContext,
} from './ThemeContext';

// App-specific contexts
// Project contexts (primary)
export { ProjectDataProvider, useProjectData } from './ProjectDataContext';
export {
  ProjectAutosaveProvider,
  useProjectAutosave,
} from './ProjectAutosaveContext';

// Project contexts (secondary, might be deprecated or refactored)

// Other contexts
export {
  ActiveDocumentProvider,
  useActiveDocument,
} from './ActiveDocumentContext';

// Layout contexts
export { SidebarProvider, useSidebar } from './SidebarContext';
export { LayoutProvider, useLayout } from './LayoutContext';

// Export types
export type { ProjectData, ActiveDocument } from '@/types/project';
