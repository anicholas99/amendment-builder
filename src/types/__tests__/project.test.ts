import { transformProject, ProjectData, ProjectStatus } from '../project';
import { ProjectBasicInfo } from '@/repositories/project/types';
import { SavedPriorArt } from '@/features/search/types';

describe('transformProject', () => {
  const mockDate = new Date('2024-01-01T00:00:00.000Z');

  const basicProject: ProjectBasicInfo = {
    id: 'project-1',
    name: 'Test Project',
    userId: 'user-1',
    tenantId: 'tenant-1',
    status: 'draft' as ProjectStatus,
    createdAt: mockDate,
    updatedAt: mockDate,
    invention: null,
  };

  it('transforms basic project info with empty arrays for optional fields', () => {
    const result = transformProject(basicProject);

    expect(result).toMatchObject({
      id: 'project-1',
      name: 'Test Project',
      status: 'draft',
      documents: [],
      savedPriorArtItems: [],
    });
  });

  it('preserves savedPriorArtItems when provided', () => {
    const projectWithPriorArt = {
      ...basicProject,
      savedPriorArtItems: [
        {
          id: 'prior-art-1',
          projectId: 'project-1',
          patentNumber: 'US12345678',
          title: 'Test Patent',
          abstract: 'Test abstract',
          savedAt: mockDate.toISOString(),
        },
      ] as SavedPriorArt[],
    };

    const result = transformProject(projectWithPriorArt);

    expect(result.savedPriorArtItems).toHaveLength(1);
    expect(result.savedPriorArtItems[0]).toMatchObject({
      id: 'prior-art-1',
      patentNumber: 'US12345678',
      title: 'Test Patent',
    });
  });

  it('handles empty savedPriorArtItems array', () => {
    const projectWithEmptyPriorArt = {
      ...basicProject,
      savedPriorArtItems: [] as SavedPriorArt[],
    };

    const result = transformProject(projectWithEmptyPriorArt);

    expect(result.savedPriorArtItems).toEqual([]);
  });

  it('transforms documents with proper date conversion', () => {
    const projectWithDocuments = {
      ...basicProject,
      documents: [
        {
          id: 'doc-1',
          projectId: 'project-1',
          type: 'patent' as const,
          content: '{"test": true}',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: mockDate,
        },
      ],
    };

    const result = transformProject(projectWithDocuments);

    expect(result.documents).toHaveLength(1);
    expect(result.documents[0].createdAt).toBeInstanceOf(Date);
    expect(result.documents[0].updatedAt).toBeInstanceOf(Date);
  });

  it('handles missing optional fields gracefully', () => {
    const minimalProject = {
      id: 'project-1',
      name: 'Test',
      userId: 'user-1',
      tenantId: 'tenant-1',
      status: 'draft' as ProjectStatus,
      createdAt: mockDate,
      updatedAt: mockDate,
    };

    const result = transformProject(minimalProject as ProjectBasicInfo);

    expect(result).toBeDefined();
    expect(result.documents).toEqual([]);
    expect(result.savedPriorArtItems).toEqual([]);
  });
});
