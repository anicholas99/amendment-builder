// Add these to your existing project types

import { ParsedElement } from './api';
import { SavedPriorArt } from './domain/priorArt';

export interface ProjectExclusion {
  id: string;
  projectId: string;
  patentNumber: string;
  reason?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
