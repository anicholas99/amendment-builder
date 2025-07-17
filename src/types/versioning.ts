import type { ApplicationVersion, Document } from '@prisma/client';

// Represents a Document record's data
export type DocumentData = Pick<
  Document,
  'id' | 'type' | 'content' | 'applicationVersionId' | 'createdAt' | 'updatedAt'
>;

// Represents an ApplicationVersion with its associated documents included
export type ApplicationVersionWithDocuments = ApplicationVersion & {
  documents: DocumentData[];
};

// You might also want a simpler type for the version list
export type ApplicationVersionBasic = Pick<
  ApplicationVersion,
  'id' | 'name' | 'createdAt' | 'projectId' | 'userId'
>;
