// Amendment-related types following existing codebase patterns

import { Project, Tenant, User, DraftDocument } from '@prisma/client';

// Base OfficeAction type following existing model patterns
export interface OfficeAction {
  id: string;
  projectId: string;
  tenantId: string;
  oaNumber?: string | null;
  dateIssued?: Date | null;
  examinerId?: string | null;
  artUnit?: string | null;
  applicationNumber?: string | null;
  blobName?: string | null;
  originalFileName?: string | null;
  mimeType?: string | null;
  sizeBytes?: number | null;
  extractedText?: string | null;
  parsedJson?: string | null;
  examinerRemarks?: string | null; // AI-generated user-friendly summary
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

// OfficeAction with relations (follows existing pattern like ProjectWithRelations)
export interface OfficeActionWithRelations extends OfficeAction {
  project: Project;
  tenant: Tenant;
  rejections: Rejection[];
  amendmentProjects: AmendmentProject[];
}

// Enhanced summary structures
export interface DetailedRejectionBreakdown {
  type: string;
  title: string;
  claims: string[];
  issues: string[];
}

export interface DetailedObjection {
  type: string;
  claims: string[];
  issues: string[];
}

export interface WithdrawnItem {
  type: string;
  claims: string[];
  reason: string;
}

export interface StrategicImplications {
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeToRespond: string;
  recommendedApproach: string;
  positives: string[];
  concerns: string[];
}

export interface DetailedAnalysis {
  overview: string;
  rejectionBreakdown: DetailedRejectionBreakdown[];
  objections: DetailedObjection[];
  withdrawn: WithdrawnItem[];
  strategicImplications: StrategicImplications;
}

// Parsed Office Action data structure
export interface ParsedOfficeActionData {
  applicationNumber?: string;
  examiner?: {
    name?: string;
    id?: string;
    artUnit?: string;
  };
  dateIssued?: string;
  responseDeadline?: string;
  rejections: ParsedRejection[];
  citedReferences: CitedReference[];
  examinerRemarks?: string;
  detailedAnalysis?: DetailedAnalysis;
}

export interface ParsedRejection {
  type: '102' | '103' | '101' | '112';
  claimNumbers: string[];
  reasoning: string;
  citedReferences: string[];
  elements?: string[];
}

export interface CitedReference {
  patentNumber: string;
  title?: string;
  inventors?: string;
  assignee?: string;
  publicationDate?: string;
  relevantClaims?: string[];
}

// Rejection model type
export interface Rejection {
  id: string;
  officeActionId: string;
  type: string;
  claimNumbers: string; // JSON array stored as string
  citedPriorArt?: string | null; // JSON array stored as string
  examinerText: string;
  parsedElements?: string | null; // JSON stored as string
  status: string;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// Rejection with relations
export interface RejectionWithRelations extends Rejection {
  officeAction: OfficeAction;
}

// AmendmentProject model type
export interface AmendmentProject {
  id: string;
  officeActionId: string;
  projectId: string;
  tenantId: string;
  userId: string;
  name: string;
  status: string;
  dueDate?: Date | null;
  filedDate?: Date | null;
  responseType?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

// AmendmentProject with relations
export interface AmendmentProjectWithRelations extends AmendmentProject {
  officeAction: OfficeAction;
  project: Project;
  tenant: Tenant;
  user: User;
  draftDocuments: DraftDocument[];
  amendmentFiles: AmendmentProjectFile[]; // New: file history
}

// New: Amendment Project File model type
export interface AmendmentProjectFile {
  id: string;
  amendmentProjectId: string;
  tenantId: string;
  fileType: string;
  fileName: string;
  originalName: string;
  blobName?: string | null;
  storageUrl?: string | null;
  mimeType?: string | null;
  sizeBytes?: number | null;
  version: number;
  status: string;
  tags?: string | null; // JSON array stored as string
  description?: string | null;
  extractedText?: string | null;
  extractedMetadata?: string | null;
  uploadedBy: string;
  linkedDraftId?: string | null;
  parentFileId?: string | null;
  exportedAt?: Date | null;
  filedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

// AmendmentProjectFile with relations
export interface AmendmentProjectFileWithRelations extends AmendmentProjectFile {
  amendmentProject: AmendmentProject;
  tenant: Tenant;
  uploader: User;
  linkedDraft?: DraftDocument | null;
  parentFile?: AmendmentProjectFile | null;
  childFiles: AmendmentProjectFile[];
}

// New: File type constants
export enum AmendmentFileType {
  OFFICE_ACTION = 'office_action',
  DRAFT_RESPONSE = 'draft_response',
  FILED_RESPONSE = 'filed_response',
  PRIOR_ART = 'prior_art',
  REFERENCE_DOC = 'reference_doc',
  EXPORT_VERSION = 'export_version',
  AMENDED_CLAIMS = 'amended_claims',
  ARGUMENT_SECTION = 'argument_section',
  FINAL_PACKAGE = 'final_package'
}

// New: File status constants
export enum AmendmentFileStatus {
  ACTIVE = 'ACTIVE',
  SUPERSEDED = 'SUPERSEDED',
  ARCHIVED = 'ARCHIVED',
  FILED = 'FILED',
  EXPORTED = 'EXPORTED',
  DRAFT = 'DRAFT'
}

// Data transfer objects for API requests (following existing DTO patterns)
export interface CreateOfficeActionRequest {
  projectId: string;
  oaNumber?: string;
  dateIssued?: string;
  examinerId?: string;
  artUnit?: string;
  applicationNumber?: string;
}

export interface CreateAmendmentProjectRequest {
  officeActionId: string;
  name: string;
  dueDate?: string;
  responseType?: string;
}

export interface UpdateAmendmentProjectRequest {
  name?: string;
  status?: string;
  dueDate?: string;
  filedDate?: string;
  responseType?: string;
}

// Amendment response document types (extends existing DraftDocument pattern)
export type AmendmentDocumentType =
  | 'AMENDMENT_COVER'
  | 'CLAIM_AMENDMENTS'
  | 'RESPONSE_ARGUMENTS'
  | 'DECLARATION'
  | 'SUPPLEMENTAL_MATERIALS';

export interface AmendmentDraftDocument extends DraftDocument {
  amendmentProjectId: string;
  type: AmendmentDocumentType;
}

// Status enums following existing patterns
export enum OfficeActionStatus {
  UPLOADED = 'UPLOADED',
  PARSED = 'PARSED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export enum AmendmentProjectStatus {
  DRAFT = 'DRAFT',
  IN_REVIEW = 'IN_REVIEW',
  READY_TO_FILE = 'READY_TO_FILE',
  FILED = 'FILED',
  CANCELLED = 'CANCELLED'
}

export enum RejectionType {
  ANTICIPATION = '102',
  OBVIOUSNESS = '103',
  ELIGIBILITY = '101',
  WRITTEN_DESCRIPTION = '112'
}

export enum RejectionStatus {
  PENDING = 'PENDING',
  ADDRESSED = 'ADDRESSED',
  RESOLVED = 'RESOLVED'
}

// Export type for component props (following existing patterns)
export interface AmendmentProjectCardProps {
  amendmentProject: AmendmentProjectWithRelations;
  onSelect?: (amendmentProject: AmendmentProject) => void;
  isSelected?: boolean;
}

export interface OfficeActionViewProps {
  officeAction: OfficeActionWithRelations;
  projectId: string;
}

export interface RejectionCardProps {
  rejection: RejectionWithRelations;
  onAddressRejection?: (rejectionId: string) => void;
} 