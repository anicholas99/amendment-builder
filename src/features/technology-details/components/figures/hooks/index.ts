/**
 * Figure hooks module
 *
 * This module provides a collection of focused hooks for managing figure operations
 * in the technology details feature. Each hook has a single responsibility:
 *
 * - useFigureUpload: Handles file uploads and image replacement
 * - useFigureDelete: Manages figure deletion and cleanup
 * - useFigureCreate: Creates new figures with proper numbering
 * - useFigureRename: Handles figure renaming with validation
 * - useFigureFileHandlers: Main orchestrator that combines all functionality
 */

export { useFigureUpload } from './useFigureUpload';
export { useFigureDelete } from './useFigureDelete';
export { useFigureCreate } from './useFigureCreate';
export { useFigureRename } from './useFigureRename';
export { useFigureFileHandlers } from './useFigureFileHandlers';

// Re-export types for convenience
export type { FiguresWithIds, FigureWithId } from '@/hooks/api/useFigures';
