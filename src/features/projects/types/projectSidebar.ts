/**
 * Type definitions for ProjectSidebar component
 * Centralized types following the architectural blueprint
 */
import React, { ReactNode } from 'react';

// Core interfaces for project sidebar
export interface ProjectSidebarProject {
  id: string;
  name: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  documents?: any[];
  invention?: {
    id?: string;
    title?: string;
    summary?: string;
    abstract?: string;
    description?: string;
    components?: any[];
    features?: any[];
    advantages?: any[];
    use_cases?: any[];
    background?: any;
  } | null;
}

export interface ActiveDocument {
  projectId?: string;
  documentType?: 'technology' | 'claim-refinement' | 'patent' | null;
  content?: string;
}

export interface LoadingState {
  isAnimating: boolean;
  title?: string;
  subtitle?: string;
}

export interface ModalStates {
  isNewProjectOpen: boolean;
  isManageProjectsOpen: boolean;
  isSwitchModalOpen: boolean;
}

// Component props interfaces
export interface ProjectListManagerProps {
  projects: ProjectSidebarProject[];
  activeProject: string | null;
  activeDocument: ActiveDocument | null;
  expandedIndices: number[];
  isSidebarCollapsed: boolean;
  isLoading?: boolean;
  error?: Error | null;
  onProjectClick: (
    projectId: string,
    index: number,
    e?: React.MouseEvent
  ) => void;
  onDocumentSelect: (projectId: string, documentType: string) => void;
  onDocumentHover?: (projectId: string, documentType: string) => void;
  onExpandedChange?: (indices: number[]) => void;
  onLoadMore?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  children?: ReactNode;
}

export interface NavigationManagerProps {
  activeProject: string | null;
  projects: ProjectSidebarProject[];
  onProjectSwitch: (targetProjectId: string) => void;
  onDocumentNavigation: (projectId: string, documentType: string) => void;
  children: (handlers: NavigationHandlers) => ReactNode;
}

export interface NavigationHandlers {
  handleDocumentSelect: (
    projectId: string,
    documentType: string
  ) => Promise<void>;
  handleProjectSwitch: (targetProjectId: string) => Promise<void>;
  navigateToProjects: () => Promise<void>;
}

export interface ModalManagerProps {
  modalStates: ModalStates;
  projects: ProjectSidebarProject[];
  targetProject: ProjectSidebarProject | null;
  loadingState: LoadingState;
  onCreateProject: (projectName: string) => Promise<void>;
  onDeleteProject: (projectId: string, e: React.MouseEvent) => void;
  onConfirmSwitch: () => Promise<void>;
  onCancelSwitch: () => void;
  onCloseNewProject: () => void;
  onCloseManageProjects: () => void;
  children?: ReactNode;
}

export interface LoadingManagerProps {
  loadingState: LoadingState;
  children?: ReactNode;
}

// Utility type for project sidebar state
export interface ProjectSidebarState {
  loadingState: LoadingState;
  modalStates: ModalStates;
  targetProjectId: string | null;
  expandedIndices: number[];
}

// Event handler types
export type ProjectClickHandler = (
  projectId: string,
  index: number,
  e?: React.MouseEvent
) => void;

export type DocumentSelectHandler = (
  projectId: string,
  documentType: string
) => void;

export type ProjectDeleteHandler = (
  projectId: string,
  e: React.MouseEvent
) => void;

// Navigation types
export type DocumentType = 'technology' | 'claim-refinement' | 'patent';

export interface NavigationTarget {
  projectId: string;
  documentType: DocumentType;
  tenant?: string;
}
