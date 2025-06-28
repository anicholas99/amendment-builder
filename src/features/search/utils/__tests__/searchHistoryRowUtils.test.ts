/**
 * Unit tests for search history row utilities
 */
import {
  isReferenceSavedLocally,
  isReferenceExcludedLocally,
  processReferenceExclusion,
  processPriorArtSave,
  generatePaginationText,
} from '../searchHistoryRowUtils';

// Mock dependencies
jest.mock('@/lib/monitoring/logger', () => ({
  logger: {
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('Search History Row Utils', () => {
  describe('isReferenceSavedLocally', () => {
    it('should return true for saved references', () => {
      const savedNumbers = new Set(['US123', 'US456', 'EP789']);
      
      expect(isReferenceSavedLocally('US123', savedNumbers)).toBe(true);
      expect(isReferenceSavedLocally('US456', savedNumbers)).toBe(true);
    });

    it('should return false for unsaved references', () => {
      const savedNumbers = new Set(['US123', 'US456']);
      
      expect(isReferenceSavedLocally('US999', savedNumbers)).toBe(false);
      expect(isReferenceSavedLocally('EP789', savedNumbers)).toBe(false);
    });

    it('should handle empty saved numbers set', () => {
      const savedNumbers = new Set<string>();
      
      expect(isReferenceSavedLocally('US123', savedNumbers)).toBe(false);
    });

    it('should handle case sensitivity', () => {
      const savedNumbers = new Set(['US123']);
      
      expect(isReferenceSavedLocally('us123', savedNumbers)).toBe(false);
      expect(isReferenceSavedLocally('US123', savedNumbers)).toBe(true);
    });
  });

  describe('isReferenceExcludedLocally', () => {
    it('should return true for excluded references', () => {
      const excludedNumbers = new Set(['US123', 'US456']);
      
      expect(isReferenceExcludedLocally('US123', excludedNumbers)).toBe(true);
      expect(isReferenceExcludedLocally('US456', excludedNumbers)).toBe(true);
    });

    it('should return false for non-excluded references', () => {
      const excludedNumbers = new Set(['US123']);
      
      expect(isReferenceExcludedLocally('US456', excludedNumbers)).toBe(false);
    });

    it('should handle empty excluded numbers set', () => {
      const excludedNumbers = new Set<string>();
      
      expect(isReferenceExcludedLocally('US123', excludedNumbers)).toBe(false);
    });
  });

  describe('generatePaginationText', () => {
    it('should generate correct pagination text for partial results', () => {
      const text = generatePaginationText(10, 50);
      expect(text).toBe('Showing 10 of 50 results');
    });

    it('should generate correct pagination text for all results', () => {
      const text = generatePaginationText(25, 25);
      expect(text).toBe('Showing all 25 results');
    });

    it('should handle zero results', () => {
      const text = generatePaginationText(0, 0);
      expect(text).toBe('Showing all 0 results');
    });

    it('should handle single result', () => {
      const text = generatePaginationText(1, 1);
      expect(text).toBe('Showing all 1 results');
    });

    it('should handle edge case where visible exceeds total', () => {
      // This shouldn't happen in normal usage, but test defensive behavior
      const text = generatePaginationText(30, 25);
      expect(text).toBe('Showing all 25 results');
    });
  });

  describe('processReferenceExclusion', () => {
    it('should process reference exclusion successfully', async () => {
      const mockReference = {
        referenceNumber: 'US123',
        title: 'Test Patent',
      };
      const mockAddExclusion = jest.fn().mockResolvedValue({ id: 'exclusion-1' });
      const mockUpdateLocalState = jest.fn();
      const mockToast = jest.fn();

      await processReferenceExclusion(
        mockReference,
        'project-123',
        mockAddExclusion,
        mockUpdateLocalState,
        mockToast
      );

      expect(mockAddExclusion).toHaveBeenCalledWith({
        projectId: 'project-123',
        patentNumber: 'US123',
      });
      expect(mockUpdateLocalState).toHaveBeenCalledWith('US123');
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Reference excluded',
          status: 'success',
        })
      );
    });

    it('should handle exclusion errors gracefully', async () => {
      const mockReference = {
        referenceNumber: 'US123',
        title: 'Test Patent',
      };
      const mockAddExclusion = jest.fn().mockRejectedValue(new Error('Network error'));
      const mockUpdateLocalState = jest.fn();
      const mockToast = jest.fn();

      await processReferenceExclusion(
        mockReference,
        'project-123',
        mockAddExclusion,
        mockUpdateLocalState,
        mockToast
      );

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Failed to exclude reference',
          status: 'error',
        })
      );
      expect(mockUpdateLocalState).not.toHaveBeenCalled();
    });
  });

  describe('processPriorArtSave', () => {
    it('should process prior art save successfully', async () => {
      const mockReference = {
        referenceNumber: 'US123',
        title: 'Test Patent',
        abstract: 'Test abstract',
      };
      const mockOnSavePriorArt = jest.fn().mockResolvedValue(undefined);
      const mockUpdateOptimistic = jest.fn();
      const mockRefreshData = jest.fn();
      const mockToast = jest.fn();

      await processPriorArtSave(
        mockReference,
        mockOnSavePriorArt,
        mockUpdateOptimistic,
        mockRefreshData,
        mockToast
      );

      expect(mockOnSavePriorArt).toHaveBeenCalledWith(mockReference);
      expect(mockUpdateOptimistic).toHaveBeenCalledWith('US123');
      expect(mockRefreshData).toHaveBeenCalled();
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Reference saved',
          status: 'success',
        })
      );
    });

    it('should handle save errors gracefully', async () => {
      const mockReference = {
        referenceNumber: 'US123',
        title: 'Test Patent',
      };
      const mockOnSavePriorArt = jest.fn().mockRejectedValue(new Error('Save failed'));
      const mockUpdateOptimistic = jest.fn();
      const mockRefreshData = jest.fn();
      const mockToast = jest.fn();

      await processPriorArtSave(
        mockReference,
        mockOnSavePriorArt,
        mockUpdateOptimistic,
        mockRefreshData,
        mockToast
      );

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Failed to save reference',
          status: 'error',
        })
      );
      expect(mockRefreshData).not.toHaveBeenCalled();
    });

    it('should handle references without title', async () => {
      const mockReference = {
        referenceNumber: 'US123',
      };
      const mockOnSavePriorArt = jest.fn().mockResolvedValue(undefined);
      const mockUpdateOptimistic = jest.fn();
      const mockRefreshData = jest.fn();
      const mockToast = jest.fn();

      await processPriorArtSave(
        mockReference,
        mockOnSavePriorArt,
        mockUpdateOptimistic,
        mockRefreshData,
        mockToast
      );

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Reference saved',
          description: expect.stringContaining('US123'),
        })
      );
    });
  });
});