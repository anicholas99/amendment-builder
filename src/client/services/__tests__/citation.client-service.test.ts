/**
 * Unit tests for Citation Client Service
 */
import { CitationClientService } from '../citation.client-service';
import { apiFetch } from '@/lib/api/apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import { ApplicationError, ErrorCode } from '@/lib/error';

// Mock dependencies
jest.mock('@/lib/api/apiClient');
jest.mock('@/lib/monitoring/logger', () => ({
  logger: {
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

describe('CitationClientService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCitationMatches', () => {
    it('should fetch citation matches successfully', async () => {
      const mockMatches = [
        { id: '1', referenceNumber: 'US123', title: 'Test Patent' },
        { id: '2', referenceNumber: 'US456', title: 'Another Patent' },
      ];

      mockApiFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockMatches),
      } as any);

      const result = await CitationClientService.getCitationMatches('search-123');

      expect(mockApiFetch).toHaveBeenCalledWith(
        API_ROUTES.SEARCH_HISTORY.CITATION_MATCHES('search-123'),
        { method: 'GET' }
      );
      expect(result).toEqual(mockMatches);
    });

    it('should throw error when API fails', async () => {
      mockApiFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        CitationClientService.getCitationMatches('search-123')
      ).rejects.toThrow('Failed to fetch citation matches: Network error');
    });
  });

  describe('createCitationJob', () => {
    it('should create citation job with parsed elements', async () => {
      const mockResponse = { success: true, jobId: 'job-123' };
      const parsedElements = ['element1', 'element2'];

      mockApiFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await CitationClientService.createCitationJob(
        'search-123',
        'US123',
        parsedElements,
        30
      );

      expect(mockApiFetch).toHaveBeenCalledWith(
        API_ROUTES.CITATION_JOBS.CREATE,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            searchInputs: parsedElements,
            filterReferenceNumber: 'US123',
            searchHistoryId: 'search-123',
            threshold: 30,
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when no claim elements found', async () => {
      await expect(
        CitationClientService.createCitationJob('search-123', undefined, [])
      ).rejects.toThrow(/No claim elements found/);
    });
  });

  describe('getParsedClaimElements', () => {
    it('should fetch parsed claim elements successfully', async () => {
      const mockData = {
        parsedElements: ['element1', 'element2', 'element3'],
      };

      mockApiFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockData),
      } as any);

      const result = await CitationClientService.getParsedClaimElements('project-123');

      expect(mockApiFetch).toHaveBeenCalledWith('/api/projects/project-123/claim-sync');
      expect(result).toEqual(['element1', 'element2', 'element3']);
    });

    it('should return empty array when no elements found', async () => {
      mockApiFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as any);

      const result = await CitationClientService.getParsedClaimElements('project-123');

      expect(result).toEqual([]);
    });

    it('should filter out empty elements', async () => {
      const mockData = {
        parsedElements: ['element1', '', ' ', 'element2', null, 'element3'],
      };

      mockApiFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockData),
      } as any);

      const result = await CitationClientService.getParsedClaimElements('project-123');

      expect(result).toEqual(['element1', 'element2', 'element3']);
    });
  });

  describe('getReferenceMetadata', () => {
    it('should fetch reference metadata successfully', async () => {
      const mockMetadata = {
        referenceNumber: 'US123',
        title: 'Test Patent',
        abstract: 'Abstract text',
        inventors: ['John Doe'],
        assignee: 'Test Corp',
      };

      mockApiFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockMetadata),
      } as any);

      const result = await CitationClientService.getReferenceMetadata('US123');

      expect(mockApiFetch).toHaveBeenCalledWith(
        API_ROUTES.CITATIONS.METADATA('US123')
      );
      expect(result).toEqual(mockMetadata);
    });

    it('should return null for 404 responses', async () => {
      mockApiFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as any);

      const result = await CitationClientService.getReferenceMetadata('US123');

      expect(result).toBeNull();
    });

    it('should throw ApplicationError for other HTTP errors', async () => {
      mockApiFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as any);

      await expect(
        CitationClientService.getReferenceMetadata('US123')
      ).rejects.toThrow(ApplicationError);
    });
  });

  describe('getReferenceMetadataBatch', () => {
    it('should fetch metadata for multiple references', async () => {
      const referenceNumbers = ['US123', 'US456'];
      const mockResponse = {
        'US123': { referenceNumber: 'US123', title: 'Patent 1' },
        'US456': { referenceNumber: 'US456', title: 'Patent 2' },
      };

      mockApiFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await CitationClientService.getReferenceMetadataBatch(referenceNumbers);

      expect(mockApiFetch).toHaveBeenCalledWith(
        API_ROUTES.CITATIONS.METADATA_BATCH,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ referenceNumbers }),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('syncJobStatus', () => {
    it('should sync job status successfully', async () => {
      const mockResponse = { success: true };

      mockApiFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await CitationClientService.syncJobStatus('job-123');

      expect(mockApiFetch).toHaveBeenCalledWith(
        API_ROUTES.CITATION_JOBS.BY_ID('job-123'),
        { method: 'POST' }
      );
      expect(result).toEqual(mockResponse);
    });
  });
});