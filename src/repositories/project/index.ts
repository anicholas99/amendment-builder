/**
 * Project Repository Index
 *
 * This file re-exports all functionality from the modular project sub-repositories.
 * It provides a centralized access point for all project-related data operations.
 */

// Export all types
export * from './types';

// Export core CRUD operations
export {
  findProjectById,
  findProjectsByTenant,
  findAccessibleProjectsForUser,
  findProjectsByTenantPaginated,
  findAccessibleProjectsForUserPaginated,
  createProject,
  findMostRecentProjectIdForTenantUser,
  findProjectByIdForTenantUser,
  findProjectByIdAndTenant,
  getProjectWorkspace,
  resetPatentApplicationContent,
} from './core.repository';

// Export prior art operations
export {
  addProjectPriorArt,
  findProjectPriorArt,
  removeProjectPriorArt,
  removeProjectPriorArtById,
} from './priorArt.repository';

// Export exclusions operations
export {
  findProjectExclusions,
  findProjectExclusionsMinimal,
  addProjectExclusions,
  removeProjectExclusion,
  removeProjectExclusionById,
} from './exclusions.repository';

// Export version operations
export {
  createApplicationVersionWithDocuments,
  createApplicationVersionFromDraft,
  findApplicationVersionById,
  findApplicationVersionsByProject,
  findLatestApplicationVersionWithDocuments,
} from './versions.repository';

// Export draft operations
export {
  findDraftDocumentsByProject,
  findDraftDocumentByType,
  upsertDraftDocument,
  upsertDraftDocumentWithAmendmentProject,
  batchUpdateDraftDocuments,
  deleteDraftDocumentsByProject,
  copyDraftDocumentsToVersion,
  initializeDraftDocumentsFromVersion,
  initializeDraftDocumentsWithSections,
  initializeEmptyDraftDocuments,
} from './draft.repository';

// Export security operations
export {
  secureUpdateProject,
  secureDeleteProject,
  getProjectTenantId,
  findProjectForAccess,
  checkUserProjectAccess,
} from './security.repository';

// Export admin operations
export { getAllProjectsForAdmin } from './admin.repository';

// Export sharing operations
export {
  checkProjectAccess,
  getProjectCollaborators,
  addProjectCollaborator,
  removeProjectCollaborator,
  updateCollaboratorRole,
  getUserProjectRole,
} from './sharing.repository';
