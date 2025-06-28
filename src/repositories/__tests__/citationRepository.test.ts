/**
 * Unit tests for Citation Repository
 */
import { PrismaClient } from '@prisma/client';
import { CitationRepository } from '../citationRepository';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

// Mock logger
jest.mock('@/lib/monitoring/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('CitationRepository', () => {
  let mockPrisma: DeepMockProxy<PrismaClient>;
  let repository: CitationRepository;

  beforeAll(() => {
    mockPrisma = require('@/lib/prisma').default as DeepMockProxy<PrismaClient>;
    repository = new CitationRepository();
  });

  beforeEach(() => {
    mockReset(mockPrisma);
  });

  describe('findMatchesByJobId', () => {
    it('should find citation matches by job ID', async () => {
      const mockMatches = [
        {
          id: 'match-1',
          citationJobId: 'job-123',
          referenceNumber: 'US123',
          parsedElementText: 'processor',
          citation: 'The processor comprises...',
        },
        {
          id: 'match-2',
          citationJobId: 'job-123',
          referenceNumber: 'US456',
          parsedElementText: 'memory',
          citation: 'The memory stores...',
        },
      ];

      mockPrisma.citationMatch.findMany.mockResolvedValue(mockMatches as any);

      const result = await repository.findMatchesByJobId('job-123');

      expect(mockPrisma.citationMatch.findMany).toHaveBeenCalledWith({
        where: { citationJobId: 'job-123' },
        orderBy: { createdAt: 'asc' },
      });
      expect(result).toEqual(mockMatches);
    });

    it('should handle empty results', async () => {
      mockPrisma.citationMatch.findMany.mockResolvedValue([]);

      const result = await repository.findMatchesByJobId('nonexistent-job');

      expect(result).toEqual([]);
    });
  });

  describe('createCitationMatches', () => {
    it('should create multiple citation matches', async () => {
      const matchesData = [
        {
          citationJobId: 'job-123',
          referenceNumber: 'US123',
          parsedElementText: 'processor',
          citation: 'Citation text 1',
        },
        {
          citationJobId: 'job-123',
          referenceNumber: 'US456',
          parsedElementText: 'memory',
          citation: 'Citation text 2',
        },
      ];

      const mockCreatedMatches = matchesData.map((data, index) => ({
        id: `match-${index + 1}`,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      mockPrisma.citationMatch.createMany.mockResolvedValue({ count: 2 });
      mockPrisma.citationMatch.findMany.mockResolvedValue(mockCreatedMatches as any);

      const result = await repository.createCitationMatches(matchesData);

      expect(mockPrisma.citationMatch.createMany).toHaveBeenCalledWith({
        data: matchesData,
      });
      expect(result).toEqual(mockCreatedMatches);
    });

    it('should handle creation failures', async () => {
      const matchesData = [
        {
          citationJobId: 'job-123',
          referenceNumber: 'US123',
          parsedElementText: 'processor',
          citation: 'Citation text',
        },
      ];

      mockPrisma.citationMatch.createMany.mockRejectedValue(new Error('Database error'));

      await expect(
        repository.createCitationMatches(matchesData)
      ).rejects.toThrow('Database error');
    });
  });

  describe('updateCitationMatch', () => {
    it('should update a citation match', async () => {
      const matchId = 'match-123';
      const updateData = {
        citation: 'Updated citation text',
        relevanceScore: 0.95,
      };

      const mockUpdatedMatch = {
        id: matchId,
        citationJobId: 'job-123',
        referenceNumber: 'US123',
        parsedElementText: 'processor',
        ...updateData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.citationMatch.update.mockResolvedValue(mockUpdatedMatch as any);

      const result = await repository.updateCitationMatch(matchId, updateData);

      expect(mockPrisma.citationMatch.update).toHaveBeenCalledWith({
        where: { id: matchId },
        data: updateData,
      });
      expect(result).toEqual(mockUpdatedMatch);
    });
  });

  describe('deleteCitationMatch', () => {
    it('should delete a citation match', async () => {
      const matchId = 'match-123';

      mockPrisma.citationMatch.delete.mockResolvedValue({
        id: matchId,
      } as any);

      await repository.deleteCitationMatch(matchId);

      expect(mockPrisma.citationMatch.delete).toHaveBeenCalledWith({
        where: { id: matchId },
      });
    });

    it('should handle deletion of non-existent match', async () => {
      const matchId = 'nonexistent-match';

      mockPrisma.citationMatch.delete.mockRejectedValue(
        new Error('Record not found')
      );

      await expect(
        repository.deleteCitationMatch(matchId)
      ).rejects.toThrow('Record not found');
    });
  });

  describe('findByReferenceAndSearchHistory', () => {
    it('should find matches by reference number and search history', async () => {
      const referenceNumber = 'US123';
      const searchHistoryId = 'search-456';

      const mockMatches = [
        {
          id: 'match-1',
          referenceNumber,
          citationJob: {
            searchHistoryId,
          },
        },
      ];

      mockPrisma.citationMatch.findMany.mockResolvedValue(mockMatches as any);

      const result = await repository.findByReferenceAndSearchHistory(
        referenceNumber,
        searchHistoryId
      );

      expect(mockPrisma.citationMatch.findMany).toHaveBeenCalledWith({
        where: {
          referenceNumber,
          citationJob: {
            searchHistoryId,
          },
        },
        include: {
          citationJob: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockMatches);
    });
  });

  describe('findWithPagination', () => {
    it('should find matches with pagination', async () => {
      const filters = {
        referenceNumber: 'US123',
        citationJobId: 'job-456',
      };
      const pagination = {
        skip: 0,
        take: 10,
      };

      const mockMatches = [
        { id: 'match-1', referenceNumber: 'US123' },
        { id: 'match-2', referenceNumber: 'US123' },
      ];
      const mockCount = 25;

      mockPrisma.citationMatch.findMany.mockResolvedValue(mockMatches as any);
      mockPrisma.citationMatch.count.mockResolvedValue(mockCount);

      const result = await repository.findWithPagination(filters, pagination);

      expect(mockPrisma.citationMatch.findMany).toHaveBeenCalledWith({
        where: filters,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      });
      expect(mockPrisma.citationMatch.count).toHaveBeenCalledWith({
        where: filters,
      });
      expect(result).toEqual({
        matches: mockMatches,
        total: mockCount,
      });
    });
  });

  describe('getMatchStatistics', () => {
    it('should get match statistics for a job', async () => {
      const jobId = 'job-123';

      const mockStats = [
        {
          _count: { id: 5 },
          referenceNumber: 'US123',
        },
        {
          _count: { id: 3 },
          referenceNumber: 'US456',
        },
      ];

      mockPrisma.citationMatch.groupBy.mockResolvedValue(mockStats as any);

      const result = await repository.getMatchStatistics(jobId);

      expect(mockPrisma.citationMatch.groupBy).toHaveBeenCalledWith({
        by: ['referenceNumber'],
        where: { citationJobId: jobId },
        _count: { id: true },
      });
      expect(result).toEqual(mockStats);
    });
  });
});