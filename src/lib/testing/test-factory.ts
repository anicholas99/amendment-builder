import { v4 as uuidv4 } from 'uuid';

// Mock types for testing - matching the expected test interfaces
interface MockUser {
  id: string;
  auth0Id: string;
  email: string;
  name: string | null;
  role: string;
  tenantId: string;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

interface MockTenant {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  settings: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

interface MockProject {
  id: string;
  name: string;
  textInput: string | null;
  userId: string;
  tenantId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

interface MockInvention {
  id: string;
  projectId: string;
  title: string | null;
  summary: string | null;
  abstract: string | null;
  patentCategory: string | null;
  technicalField: string | null;
  noveltyStatement: string | null;
  backgroundJson: string | null;
  advantagesJson: string | null;
  featuresJson: string | null;
  useCasesJson: string | null;
  claimsJson: string | null;
  priorArtJson: string | null;
  technicalImplementationJson: string | null;
  processStepsJson: string | null;
  definitionsJson: string | null;
  futureDirectionsJson: string | null;
  parsedClaimElementsJson: string | null;
  searchQueriesJson: string | null;
  claimSyncedAt: Date | null;
  lastSyncedClaim: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface MockClaim {
  id: string;
  inventionId: string;
  number: number;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

interface MockProjectFigure {
  id: string;
  projectId: string;
  status: string;
  fileName: string | null;
  originalName: string | null;
  blobName: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  figureKey: string | null;
  title: string | null;
  description: string | null;
  displayOrder: number;
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

interface MockCitationJob {
  id: string;
  searchHistoryId: string;
  status: string;
  externalJobId: number | null;
  referenceNumber: string | null;
  createdAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  error: string | null;
  rawResultData: string | null;
  errorMessage: string | null;
  lastCheckedAt: Date | null;
  deepAnalysisJson: string | null;
  examinerAnalysisJson: string | null;
}

interface MockCitationMatch {
  id: string;
  searchHistoryId: string;
  citationJobId: string;
  referenceNumber: string;
  citation: string;
  paragraph: string | null;
  score: number | null;
  elementOrder: number | null;
  locationJobId: number | null;
  locationStatus: string | null;
  locationData: string | null;
  createdAt: Date;
  updatedAt: Date;
  locationErrorMessage: string | null;
  parsedElementText: string | null;
  referenceApplicant: string | null;
  referenceAssignee: string | null;
  referencePublicationDate: string | null;
  referenceTitle: string | null;
  reasoningErrorMessage: string | null;
  reasoningJobId: number | null;
  reasoningScore: number | null;
  reasoningStatus: string | null;
  reasoningSummary: string | null;
  analysisSource: string;
  isTopResult: boolean;
}

interface MockSavedPriorArt {
  id: string;
  projectId: string;
  patentNumber: string;
  title: string | null;
  abstract: string | null;
  url: string | null;
  notes: string | null;
  authors: string | null;
  publicationDate: string | null;
  savedAt: Date;
  savedCitationsData: string | null;
  claim1: string | null;
  summary: string | null;
}

interface MockSearchHistory {
  id: string;
  query: string;
  timestamp: Date;
  results: string | null;
  projectId: string | null;
  userId: string | null;
  citationExtractionStatus: string | null;
}

/**
 * Test data factory for creating consistent mock data across tests
 */
export class TestDataFactory {
  private static counter = 0;

  static reset() {
    this.counter = 0;
  }

  static generateId(prefix: string): string {
    return `${prefix}-${++this.counter}`;
  }

  static createMockUser(overrides?: Partial<MockUser>): MockUser {
    return {
      id: this.generateId('user'),
      auth0Id: `auth0|${this.generateId('auth')}`,
      email: `test${this.counter}@example.com`,
      name: `Test User ${this.counter}`,
      role: 'USER',
      tenantId: this.generateId('tenant'),
      lastLogin: new Date('2024-01-01T00:00:00Z'),
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
      deletedAt: null,
      ...overrides,
    };
  }

  static createMockTenant(overrides?: Partial<MockTenant>): MockTenant {
    return {
      id: this.generateId('tenant'),
      name: `Test Tenant ${this.counter}`,
      slug: `test-tenant-${this.counter}`,
      description: 'Test tenant description',
      settings: null,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
      deletedAt: null,
      ...overrides,
    };
  }

  static createMockProject(overrides?: Partial<MockProject>): MockProject {
    const extendedOverrides = overrides as any;

    // Map test properties to actual properties
    const mappedOverrides: Partial<MockProject> = {
      ...overrides,
    };

    // Handle title -> name
    if (extendedOverrides?.title) {
      mappedOverrides.name = extendedOverrides.title;
      delete extendedOverrides.title;
    }

    // Handle createdBy -> userId
    if (extendedOverrides?.createdBy) {
      mappedOverrides.userId = extendedOverrides.createdBy;
      delete extendedOverrides.createdBy;
    }

    // Clean up extended properties that don't belong in the base type
    delete extendedOverrides?.description;
    delete extendedOverrides?.attorneyDocketNumber;
    delete extendedOverrides?.inventorNames;
    delete extendedOverrides?.lastModifiedBy;

    const tenantId = mappedOverrides?.tenantId || this.generateId('tenant');
    const userId = mappedOverrides?.userId || this.generateId('user');

    return {
      id: this.generateId('project'),
      name: `Test Project ${this.counter}`,
      textInput: null,
      userId,
      tenantId,
      status: 'DRAFT',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
      deletedAt: null,
      ...mappedOverrides,
    };
  }

  static createMockInvention(
    overrides?: Partial<MockInvention>
  ): MockInvention {
    return {
      id: this.generateId('invention'),
      projectId: this.generateId('project'),
      title: `Test Invention ${this.counter}`,
      summary: 'This is a test invention summary',
      abstract: 'Test invention abstract',
      patentCategory: 'Software',
      technicalField: 'Computer Science',
      noveltyStatement: 'This invention is novel because...',
      backgroundJson: JSON.stringify({
        technicalField: 'Software',
        problemsSolved: ['Problem 1', 'Problem 2'],
        existingSolutions: ['Solution 1', 'Solution 2'],
      }),
      advantagesJson: JSON.stringify(['Advantage 1', 'Advantage 2']),
      featuresJson: JSON.stringify(['Feature 1', 'Feature 2']),
      useCasesJson: JSON.stringify(['Use case 1', 'Use case 2']),
      claimsJson: null, // Deprecated - use Claim model
      priorArtJson: JSON.stringify([]),
      technicalImplementationJson: JSON.stringify({
        preferred_embodiment: 'Preferred implementation',
        alternative_embodiments: ['Alt 1', 'Alt 2'],
        manufacturing_methods: ['Method 1'],
      }),
      processStepsJson: JSON.stringify(['Step 1', 'Step 2']),
      definitionsJson: JSON.stringify({ term1: 'Definition 1' }),
      futureDirectionsJson: JSON.stringify(['Future direction 1']),
      parsedClaimElementsJson: null,
      searchQueriesJson: null,
      claimSyncedAt: null,
      lastSyncedClaim: null,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
      ...overrides,
    };
  }

  static createMockClaim(overrides?: Partial<MockClaim>): MockClaim {
    // Handle extended properties from tests
    const extendedOverrides = overrides as any;

    // Map test properties to actual properties
    const mappedOverrides: Partial<MockClaim> = {
      ...overrides,
    };

    // Handle projectId -> need to create/use appropriate inventionId
    if (extendedOverrides?.projectId && !overrides?.inventionId) {
      const invention = this.createMockInvention({
        projectId: extendedOverrides.projectId,
      });
      mappedOverrides.inventionId = invention.id;
      delete extendedOverrides.projectId;
    }

    // Handle claimText -> text
    if (extendedOverrides?.claimText) {
      mappedOverrides.text = extendedOverrides.claimText;
      delete extendedOverrides.claimText;
    }

    // Handle claimNumber -> number
    if (extendedOverrides?.claimNumber !== undefined) {
      mappedOverrides.number = extendedOverrides.claimNumber;
      delete extendedOverrides.claimNumber;
    }

    // Clean up extended properties that don't belong in the base type
    delete extendedOverrides?.version;
    delete extendedOverrides?.isActive;

    return {
      id: this.generateId('claim'),
      inventionId: this.generateId('invention'),
      number: this.counter,
      text: `A method comprising: test claim text ${this.counter}`,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
      ...mappedOverrides,
    };
  }

  static createMockProjectFigure(
    overrides?: Partial<MockProjectFigure>
  ): MockProjectFigure {
    return {
      id: this.generateId('figure'),
      projectId: this.generateId('project'),
      status: 'UPLOADED',
      fileName: `test-figure-${this.counter}.png`,
      originalName: `test-figure-${this.counter}.png`,
      blobName: `blob-${this.generateId('blob')}`,
      mimeType: 'image/png',
      sizeBytes: 1024,
      figureKey: `FIG. ${this.counter}`,
      title: `Test Figure ${this.counter}`,
      description: 'Test figure description',
      displayOrder: this.counter,
      uploadedBy: this.generateId('user'),
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
      deletedAt: null,
      ...overrides,
    };
  }

  static createMockCitationJob(
    overrides?: Partial<MockCitationJob>
  ): MockCitationJob {
    return {
      id: this.generateId('citation-job'),
      searchHistoryId: this.generateId('search-history'),
      status: 'PENDING',
      externalJobId: null,
      referenceNumber: null,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      startedAt: null,
      completedAt: null,
      error: null,
      rawResultData: null,
      errorMessage: null,
      lastCheckedAt: null,
      deepAnalysisJson: null,
      examinerAnalysisJson: null,
      ...overrides,
    };
  }

  static createMockCitationMatch(
    overrides?: Partial<MockCitationMatch>
  ): MockCitationMatch {
    return {
      id: this.generateId('citation-match'),
      searchHistoryId: this.generateId('search-history'),
      citationJobId: this.generateId('citation-job'),
      referenceNumber: `US${1000000 + this.counter}`,
      citation: 'Test citation text',
      paragraph: 'Test paragraph',
      score: 0.85,
      elementOrder: 1,
      locationJobId: null,
      locationStatus: null,
      locationData: null,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
      locationErrorMessage: null,
      parsedElementText: 'parsed test element',
      referenceApplicant: null,
      referenceAssignee: null,
      referencePublicationDate: null,
      referenceTitle: null,
      reasoningErrorMessage: null,
      reasoningJobId: null,
      reasoningScore: null,
      reasoningStatus: null,
      reasoningSummary: null,
      analysisSource: 'LEGACY_RELEVANCE',
      isTopResult: false,
      ...overrides,
    };
  }

  static createMockSavedPriorArt(
    overrides?: Partial<MockSavedPriorArt>
  ): MockSavedPriorArt {
    return {
      id: this.generateId('prior-art'),
      projectId: this.generateId('project'),
      patentNumber: `US${1000000 + this.counter}`,
      title: `Prior Art ${this.counter}`,
      abstract: 'Prior art abstract',
      url: null,
      notes: null,
      authors: 'Inventor 1',
      publicationDate: '2023-01-01',
      savedAt: new Date('2024-01-01T00:00:00Z'),
      savedCitationsData: null,
      claim1: 'A method comprising...',
      summary: 'Prior art summary',
      ...overrides,
    };
  }

  static createMockSearchHistory(
    overrides?: Partial<MockSearchHistory>
  ): MockSearchHistory {
    return {
      id: this.generateId('search-history'),
      query: 'test search query',
      timestamp: new Date('2024-01-01T00:00:00Z'),
      results: null,
      projectId: this.generateId('project'),
      userId: this.generateId('user'),
      citationExtractionStatus: null,
      ...overrides,
    };
  }

  static createMockSession(
    user?: Partial<MockUser>,
    tenant?: Partial<MockTenant>
  ) {
    const mockUser = this.createMockUser(user);
    const mockTenant = this.createMockTenant(tenant);

    return {
      user: {
        sub: mockUser.auth0Id,
        email: mockUser.email,
        name: mockUser.name,
        tenantId: mockUser.tenantId,
        role: mockUser.role,
      },
      accessToken: 'mock-access-token',
      idToken: 'mock-id-token',
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  static createMockRequest(overrides?: any) {
    return {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
      },
      query: {},
      body: {},
      cookies: {},
      ...overrides,
    };
  }

  static createMockResponse() {
    const res: any = {
      statusCode: 200,
      headers: {},
    };

    res.status = (code: number) => {
      res.statusCode = code;
      return res;
    };

    res.json = (data: any) => {
      res.body = data;
      return res;
    };

    res.setHeader = (name: string, value: string) => {
      res.headers[name] = value;
      return res;
    };

    res.end = () => res;

    return res;
  }

  static createMockApiResponse<T>(data: T, status = 'success') {
    return {
      status,
      data,
      message:
        status === 'success' ? 'Operation successful' : 'Operation failed',
    };
  }

  static createApiResponse<T>(data: T, status = 'success') {
    return this.createMockApiResponse(data, status);
  }

  static createMockApiError(message: string, code = 'ERROR') {
    return {
      status: 'error',
      error: {
        code,
        message,
      },
    };
  }

  static createPrismaError(code: string, meta?: any) {
    const error = new Error('Prisma error') as any;
    error.code = code;
    error.meta = meta;
    error.clientVersion = '4.0.0';
    return error;
  }

  static createMockPrismaClient(): any {
    return {
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      tenant: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      project: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      invention: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      claim: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        createMany: jest.fn(),
      },
      figure: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      citationJob: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      citationMatch: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        createMany: jest.fn(),
      },
      priorArt: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      searchHistory: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      $transaction: jest.fn((cb: any) =>
        cb(TestDataFactory.createMockPrismaClient())
      ),
      $connect: jest.fn(),
      $disconnect: jest.fn(),
    };
  }

  // Helper methods for creating related objects
  static createMockClaimForProject(
    projectId: string,
    overrides?: Partial<MockClaim>
  ): MockClaim {
    // First create an invention for the project
    const invention = this.createMockInvention({ projectId });

    return this.createMockClaim({
      inventionId: invention.id,
      ...overrides,
    });
  }

  static createMockProjectWithInvention(overrides?: {
    project?: Partial<MockProject>;
    invention?: Partial<MockInvention>;
  }): { project: MockProject; invention: MockInvention } {
    const project = this.createMockProject(overrides?.project);
    const invention = this.createMockInvention({
      projectId: project.id,
      ...overrides?.invention,
    });

    return { project, invention };
  }

  static createMockClaimWithInventionAndProject(overrides?: {
    project?: Partial<MockProject>;
    invention?: Partial<MockInvention>;
    claim?: Partial<MockClaim>;
  }): { project: MockProject; invention: MockInvention; claim: MockClaim } {
    const { project, invention } = this.createMockProjectWithInvention({
      project: overrides?.project,
      invention: overrides?.invention,
    });

    const claim = this.createMockClaim({
      inventionId: invention.id,
      ...overrides?.claim,
    });

    return { project, invention, claim };
  }

  // Legacy compatibility methods - these map old field names to new ones
  static createMockProjectLegacy(overrides?: any): MockProject {
    const mapped: Partial<MockProject> = {
      ...overrides,
      name: overrides?.title || overrides?.name,
      userId: overrides?.createdBy || overrides?.userId,
    };

    // Remove legacy fields
    delete (mapped as any).title;
    delete (mapped as any).description;
    delete (mapped as any).attorneyDocketNumber;
    delete (mapped as any).inventorNames;
    delete (mapped as any).createdBy;
    delete (mapped as any).lastModifiedBy;

    return this.createMockProject(mapped);
  }

  static createMockClaimLegacy(overrides?: any): MockClaim {
    // If projectId is provided, create through invention
    if (overrides?.projectId) {
      const invention = this.createMockInvention({
        projectId: overrides.projectId,
      });
      overrides.inventionId = invention.id;
    }

    const mapped: Partial<MockClaim> = {
      ...overrides,
      number: overrides?.claimNumber ?? overrides?.number ?? this.counter,
      text:
        overrides?.claimText ||
        overrides?.text ||
        `A method comprising: test claim text ${this.counter}`,
    };

    // Remove legacy fields
    delete (mapped as any).projectId;
    delete (mapped as any).claimNumber;
    delete (mapped as any).claimText;
    delete (mapped as any).claimType;
    delete (mapped as any).dependsOn;
    delete (mapped as any).isActive;
    delete (mapped as any).version;
    delete (mapped as any).parentId;
    delete (mapped as any).createdBy;

    return this.createMockClaim(mapped);
  }

  // Backwards compatibility aliases
  static createMockFigure = TestDataFactory.createMockProjectFigure;
  static createMockPriorArt = TestDataFactory.createMockSavedPriorArt;

  static createMockProjectDocument(overrides?: any): any {
    return {
      id: this.generateId('doc'),
      projectId: this.generateId('project'),
      type: 'technology',
      content: 'Test document content',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
      ...overrides,
    };
  }

  static createMockDraftDocument(overrides?: any): any {
    return {
      id: this.generateId('draft'),
      projectId: this.generateId('project'),
      type: 'SPECIFICATION',
      name: `Draft Document ${this.counter}`,
      content: {
        sections: ['Background', 'Summary', 'Description'],
        metadata: {
          version: 1,
          lastModified: new Date('2024-01-01T00:00:00Z'),
        },
      },
      status: 'DRAFT',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
      createdBy: this.generateId('user'),
      ...overrides,
    };
  }

  static createMockClaimElement(overrides?: any): any {
    return {
      id: this.generateId('element'),
      elementNumber: this.counter,
      text: `element ${this.counter}`,
      type: 'component',
      ...overrides,
    };
  }

  static createMockFigureElements(overrides?: any): any {
    return {
      elements: [
        {
          id: this.generateId('fig-elem'),
          referenceNumeral: `${100 + this.counter}`,
          label: `Element ${this.counter}`,
          description: `Description of element ${this.counter}`,
          boundingBox: {
            x: 10,
            y: 10,
            width: 100,
            height: 100,
          },
        },
      ],
      figureId: this.generateId('figure'),
      ...overrides,
    };
  }

  static createMockSavedCitation(overrides?: any): any {
    return {
      id: this.generateId('citation'),
      citationMatchId: this.generateId('citation-match'),
      projectId: this.generateId('project'),
      relevanceScore: 0.85,
      notes: null,
      isActive: true,
      savedBy: this.generateId('user'),
      savedAt: new Date('2024-01-01T00:00:00Z'),
      metadata: {
        claimNumber: 1,
        elementMatched: 'a processing unit',
      },
      ...overrides,
    };
  }
}
