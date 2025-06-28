/**
 * ModalManager - Handles all modal state and operations
 * Focused component following the architectural blueprint
 */
import React from 'react';
import NewProjectModal from '../NewProjectModal';
import ManageProjectsModal from '../ManageProjectsModal';
import { ProjectSwitchModal } from '../project-list/ProjectSwitchModal';
import { LoadingOverlay } from '@/components/common/LoadingOverlay';
import { ModalManagerProps } from '../../types/projectSidebar';

const ModalManager: React.FC<ModalManagerProps> = ({
  modalStates,
  projects,
  targetProject,
  loadingState,
  onCreateProject,
  onDeleteProject,
  onConfirmSwitch,
  onCancelSwitch,
  onCloseNewProject,
  onCloseManageProjects,
  children,
}) => {
  return (
    <>
      {children}

      {/* Loading Overlay */}
      {loadingState.isAnimating && (
        <LoadingOverlay
          title={loadingState.title}
          subtitle={loadingState.subtitle}
        />
      )}

      {/* Project Creation Modal */}
      <NewProjectModal
        isOpen={modalStates.isNewProjectOpen}
        onClose={onCloseNewProject}
        handleCreateProject={onCreateProject}
      />

      {/* Manage Projects Modal */}
      <ManageProjectsModal
        isOpen={modalStates.isManageProjectsOpen}
        onClose={onCloseManageProjects}
        projects={projects}
        handleDeleteProject={onDeleteProject}
      />

      {/* Project Switch Confirmation Modal */}
      <ProjectSwitchModal
        isOpen={modalStates.isSwitchModalOpen}
        onClose={onCancelSwitch}
        onConfirm={onConfirmSwitch}
        targetProject={targetProject as any} // Type compatibility with existing modal
        isLoading={loadingState.isAnimating}
      />
    </>
  );
};

export default ModalManager;
