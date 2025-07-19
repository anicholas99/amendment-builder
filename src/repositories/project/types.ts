import { Prisma, Project } from '@prisma/client';

// Type definitions for metadata and prior art
export interface ProjectExclusionMetadata {
  title?: string | null;
  abstract?: string | null;
  url?: string | null;
  authors?: string | null;
  publicationDate?: string | null;
  [key: string]: unknown; // Allow additional fields but maintain type safety
}

export interface PriorArtInput {
  patentNumber: string;
  title?: string;
  abstract?: string;
  url?: string;
  notes?: string;
  authors?: string;
  publicationDate?: string;
  savedCitationsData?: string;
  claim1?: string;
  summary?: string;
}

// Type for saved prior art with all fields
export type SavedPriorArtWithFields = Prisma.SavedPriorArtGetPayload<{
  select: {
    id: true;
    patentNumber: true;
    title: true;
    abstract: true;
    url: true;
    notes: true;
    authors: true;
    publicationDate: true;
    savedCitationsData: true;
    claim1: true;
    summary: true;
    savedAt: true;
    projectId: true;
  };
}>;

// Define a reusable select object for basic project info
export const basicProjectSelect = Prisma.validator<Prisma.ProjectSelect>()({
  id: true,
  name: true,
  status: true,
  userId: true,
  tenantId: true,
  hasPatentContent: true,
  hasProcessedInvention: true,
  createdAt: true,
  updatedAt: true,
  textInput: false, // Exclude large fields from list view
  patentApplication: {
    select: {
      id: true,
      applicationNumber: true,
      filingDate: true,
      title: true,
      status: true,
    },
  },
  invention: {
    select: {
      id: true,
      title: true,
      summary: true,
      abstract: true,
      technicalField: true,
      patentCategory: true,
      noveltyStatement: true,
      advantagesJson: true,
      featuresJson: true,
      useCasesJson: true,
      processStepsJson: true,
      futureDirectionsJson: true,
      backgroundJson: true,
      definitionsJson: true,
      technicalImplementationJson: true,
      priorArtJson: true,
      claimsJson: true,
      parsedClaimElementsJson: true,
      searchQueriesJson: true,
      claimSyncedAt: true,
      lastSyncedClaim: true,
      applicationType: true,
      parentApplicationsJson: true,
      linkedFileIdsJson: true,
      claim1Hash: true,
      claim1ParsedAt: true,
      parserVersion: true,
      createdAt: true,
      updatedAt: true,
    }
  }, // Include normalized invention data with proper field selection
  // documents: true, // REMOVED: Documents are now linked via ApplicationVersion
});

// Update the type definition based on the basic select
export type ProjectBasicInfo = Prisma.ProjectGetPayload<{
  select: typeof basicProjectSelect;
}>;

// Keep the select object for fetching a project WITH its full details
// This one might need further updates later when fetching a specific project
// to include the LATEST ApplicationVersion and its Documents, but it's not used by findProjectsByTenant
export const projectSelectWithDetails =
  Prisma.validator<Prisma.ProjectSelect>()({
    id: true,
    name: true,
    status: true,
    userId: true,
    tenantId: true,
    hasPatentContent: true,
    hasProcessedInvention: true,
    createdAt: true,
    updatedAt: true,
    textInput: true,
    invention: {
      select: {
        id: true,
        title: true,
        summary: true,
        abstract: true,
        technicalField: true,
        patentCategory: true,
        noveltyStatement: true,
        advantagesJson: true,
        featuresJson: true,
        useCasesJson: true,
        processStepsJson: true,
        futureDirectionsJson: true,
        backgroundJson: true,
        definitionsJson: true,
        technicalImplementationJson: true,
        priorArtJson: true,
        claimsJson: true,
        parsedClaimElementsJson: true,
        searchQueriesJson: true,
        claimSyncedAt: true,
        lastSyncedClaim: true,
        applicationType: true,
        parentApplicationsJson: true,
        linkedFileIdsJson: true,
        claim1Hash: true,
        claim1ParsedAt: true,
        parserVersion: true,
        createdAt: true,
        updatedAt: true,
      }
    }, // Include normalized invention data with proper field selection
    // documents: true, // REMOVED
    savedPriorArtItems: true, // Keep this if needed when loading a single project
    patentApplication: {
      select: {
        id: true,
        applicationNumber: true,
        filingDate: true,
        title: true,
        status: true,
      },
    },
    // applicationVersions: {} // We'll add logic here later when fetching a single project
  });

// Type for the detailed project view (adjust as needed later)
export type ProjectWithDetails = Prisma.ProjectGetPayload<{
  select: typeof projectSelectWithDetails;
}>;
