/**
 * Unit tests for Claims Client Service
 */
import { ClaimsClientService } from '../claims.client-service';
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

describe('ClaimsClientService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('parseClaimElements', () => {
    it('should parse claim elements successfully', async () => {
      const claimText = 'A system comprising: a processor; and a memory';
      const projectId = 'project-123';
      const mockResponse = {
        parsedElements: ['a processor', 'a memory'],
      };

      mockApiFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await ClaimsClientService.parseClaimElements(
        claimText,
        projectId
      );

      expect(mockApiFetch).toHaveBeenCalledWith(
        API_ROUTES.PROJECTS.CLAIMS.PARSE(projectId),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            claimOneText: claimText,
            claimSetVersionId: undefined,
            allClaims: undefined,
            background: true,
          }),
        })
      );
      expect(result).toEqual(['a processor', 'a memory']);
    });

    it('should throw error when project ID is missing', async () => {
      await expect(
        ClaimsClientService.parseClaimElements('claim text', '')
      ).rejects.toThrow(ApplicationError);
    });

    it('should throw error when claim text is empty', async () => {
      await expect(
        ClaimsClientService.parseClaimElements('', 'project-123')
      ).rejects.toThrow(ApplicationError);
    });

    it('should throw error when response has no parsed elements', async () => {
      mockApiFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      } as any);

      await expect(
        ClaimsClientService.parseClaimElements('claim text', 'project-123')
      ).rejects.toThrow(ApplicationError);
    });
  });

  describe('generateSearchQueries', () => {
    it('should generate search queries successfully', async () => {
      const parsedElements = ['processor', 'memory', 'database'];
      const projectId = 'project-123';
      const mockInventionData = { title: 'Test Invention' };
      const mockResponse = {
        searchQueries: ['processor memory', 'database system', 'computer architecture'],
      };

      // Mock invention data fetch
      mockApiFetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockInventionData),
        } as any)
        // Mock query generation
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockResponse),
        } as any);

      const result = await ClaimsClientService.generateSearchQueries(
        parsedElements,
        projectId
      );

      expect(result).toEqual(['processor memory', 'database system', 'computer architecture']);
    });

    it('should handle missing invention data gracefully', async () => {
      const parsedElements = ['processor', 'memory'];
      const projectId = 'project-123';
      const mockResponse = {
        searchQueries: ['processor memory'],
      };

      // Mock invention data fetch failure
      mockApiFetch
        .mockRejectedValueOnce(new Error('Invention not found'))
        // Mock query generation
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockResponse),
        } as any);

      const result = await ClaimsClientService.generateSearchQueries(
        parsedElements,
        projectId
      );

      expect(result).toEqual(['processor memory']);
    });

    it('should throw error when no parsed elements provided', async () => {
      await expect(
        ClaimsClientService.generateSearchQueries([], 'project-123')
      ).rejects.toThrow('Parsed elements and project ID are required');
    });
  });

  describe('generateClaim1', () => {
    it('should generate claim 1 successfully', async () => {
      const projectId = 'project-123';
      const inventionData = { title: 'Test Invention' };
      const mockResponse = {
        claim: 'A system comprising: a processor configured to execute instructions; and a memory operatively connected to the processor.',
      };

      mockApiFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await ClaimsClientService.generateClaim1(projectId, inventionData);

      expect(mockApiFetch).toHaveBeenCalledWith(
        API_ROUTES.PROJECTS.CLAIMS.GENERATE_CLAIM1(projectId),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when project ID is missing', async () => {
      await expect(
        ClaimsClientService.generateClaim1('', {})
      ).rejects.toThrow('Project ID is required');
    });
  });

  describe('parseClaimElementsV2', () => {
    it('should parse claim elements using V2 API', async () => {
      const claimText = 'A method comprising: step 1; and step 2.';
      const projectId = 'project-123';
      const mockResponse = {
        elements: ['step 1', 'step 2'],
        version: '2.0.0',
      };

      mockApiFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await ClaimsClientService.parseClaimElementsV2(
        claimText,
        projectId
      );

      expect(mockApiFetch).toHaveBeenCalledWith(
        API_ROUTES.PROJECTS.CLAIMS.V2.PARSE(projectId),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            claimText,
            projectId,
          }),
        })
      );
      expect(result).toEqual(['step 1', 'step 2']);
    });

    it('should validate V2 response structure', async () => {
      const mockResponse = { invalidResponse: true };

      mockApiFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      await expect(
        ClaimsClientService.parseClaimElementsV2('claim text', 'project-123')
      ).rejects.toThrow(ApplicationError);
    });
  });

  describe('generateSearchQueriesV2', () => {
    it('should generate queries using V2 API', async () => {
      const elements = ['element1', 'element2'];
      const projectId = 'project-123';
      const mockInventionData = { title: 'Test' };
      const mockResponse = {
        searchQueries: ['query1', 'query2'],
      };

      // Mock invention data fetch
      mockApiFetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockInventionData),
        } as any)
        // Mock query generation
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockResponse),
        } as any);

      const result = await ClaimsClientService.generateSearchQueriesV2(
        elements,
        projectId
      );

      expect(result).toEqual(['query1', 'query2']);
    });
  });
});