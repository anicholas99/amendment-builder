/**
 * Shared Components Index
 *
 * Exports commonly used shared components for easy importing across the application.
 * These are business components that are shared across multiple features.
 */

// Auth Components
export { AuthGuard } from './AuthGuard';
export { TenantGuard } from './common/TenantGuard';
export { NavigationButton } from './common/NavigationButton';
export { NavigationLink } from './common/NavigationLink';

// Layout Components
export { default as ViewLayout } from './layouts/ViewLayout';
export { default as AppLayout } from './layouts/AppLayout';

// Shared Components
// Note: FiguresPanel moved to features - import directly from there if needed

// Re-export from subdirectories that have index files
// Note: Common components are imported directly - no barrel export needed

// Common UI components
export * from './common/ErrorBoundary';
export { FiguresTab } from './common/FiguresTab';

// Loading components
export * from './common/LoadingState';
export { default as SkeletonLoader } from './common/SkeletonLoader';
export { LoadingOverlay } from './common/LoadingOverlay';
